import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import worker from "../server/worker.js";
import { applyAction } from "../server/actions.js";
import { freshState, readState, writeState } from "../server/store.js";
import { sqliteAdapter } from "../scripts/local-db.js";

function setup() {
  const db = sqliteAdapter();
  for (const name of readdirSync("drizzle")
    .filter((x) => x.endsWith(".sql"))
    .sort())
    db.exec(readFileSync("drizzle/" + name, "utf8"));
  return db;
}
function req(path = "/api/state", owner = "alice", body, extra = {}) {
  const headers = {
    ...(owner ? { "oai-authenticated-user-id": owner } : {}),
    ...(body
      ? {
          "Content-Type": "application/json",
          Origin: "https://test.local",
          "X-SafraFlux-Request": "1",
        }
      : {}),
    ...extra,
  };
  return new Request("https://test.local" + path, {
    method: body ? "POST" : "GET",
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
test("API recusa anônimos e origem externa antes de acessar dados", async () => {
  const db = setup();
  try {
    assert.equal(
      (await worker.fetch(req("/api/state", null), { DB: db })).status,
      401,
    );
    assert.equal(
      (
        await worker.fetch(
          req(
            "/api/action",
            "alice",
            { revision: 0, action: "producer.add", payload: {} },
            { Origin: "https://evil.example" },
          ),
          { DB: db },
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await worker.fetch(
          req(
            "/api/action",
            "alice",
            { revision: 0, action: "producer.add", payload: {} },
            { "X-SafraFlux-Request": "" },
          ),
          { DB: db },
        )
      ).status,
      403,
    );
  } finally {
    db.close();
  }
});
test("dados e histórico são isolados por conta; conteúdo não injeta SQL", async () => {
  const db = setup();
  try {
    const body = {
      revision: 0,
      action: "producer.add",
      payload: { code: "P'; DROP TABLE events; --", name: "Produtor" },
    };
    const response = await worker.fetch(req("/api/action", "alice", body), {
      DB: db,
    });
    assert.equal(response.status, 200);
    const alice = await (
      await worker.fetch(req("/api/state", "alice"), { DB: db })
    ).json();
    const bob = await (
      await worker.fetch(req("/api/state", "bob"), { DB: db })
    ).json();
    assert.equal(alice.state.producers.length, 1);
    assert.equal(bob.state.producers.length, 0);
    assert.equal(
      (
        await (
          await worker.fetch(req("/api/history", "bob"), { DB: db })
        ).json()
      ).events.length,
      0,
    );
    assert.equal(
      (
        await (
          await worker.fetch(req("/api/history", "alice"), { DB: db })
        ).json()
      ).events.length,
      1,
    );
  } finally {
    db.close();
  }
});
test("gravação obsoleta é recusada e não sobrescreve o primeiro escritor", async () => {
  const db = setup();
  try {
    await readState(db, "a");
    const first = freshState();
    first.producers.push({ code: "A" });
    await writeState(db, "a", 0, first, "producer.add");
    await assert.rejects(writeState(db, "a", 0, freshState(), "producer.add"), {
      status: 409,
    });
    assert.equal((await readState(db, "a")).state.producers[0].code, "A");
    const stale = await worker.fetch(
      req("/api/action", "a", {
        revision: 0,
        action: "producer.add",
        payload: { code: "B", name: "B" },
      }),
      { DB: db },
    );
    assert.equal(stale.status, 409);
  } finally {
    db.close();
  }
});
test("cliente não pode fornecer recebido ou comprovante ao criar cobrança", async () => {
  const s = await applyAction(freshState(), "invoice.add", {
    lot: "L1",
    amount: "20",
    chain: "solana-devnet",
    recipient: "11111111111111111111111111111111",
    receipts: [{ amount: "20000000" }],
  });
  assert.deepEqual(s.invoices[0].receipts, []);
  await assert.rejects(applyAction(s, "state.replace", { invoices: [] }));
});
test("etapas agrícolas e rateios persistem com cálculo no servidor", async () => {
  let s = await applyAction(freshState(), "lot.add", {
    code: "L1",
    crop: "Café",
    harvest: "2026",
    kg: "1000",
  });
  await assert.rejects(
    applyAction(s, "lot.status", { id: s.lots[0].id, status: "entregue" }),
  );
  s = await applyAction(s, "lot.status", {
    id: s.lots[0].id,
    status: "beneficiamento",
  });
  s = await applyAction(s, "split.save", {
    lot: "L1",
    source: "manual",
    total: "1000",
    premium: "10",
    producers: [
      { name: "P1", kg: "600", points: "80" },
      { name: "P2", kg: "400", points: "90" },
    ],
    rows: [{ total: "99999" }],
  });
  assert.equal(s.splits[0].rows[0].total, "597.142857");
  assert.equal(s.lots[0].status, "beneficiamento");
});
test("API rejeita corpo excessivo e define cabeçalhos de segurança", async () => {
  const db = setup();
  try {
    const response = await worker.fetch(req("/api/state"), { DB: db });
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.ok(
      response.headers
        .get("content-security-policy")
        .includes("object-src 'none'"),
    );
    const large = await worker.fetch(
      req("/api/action", "alice", { a: "x".repeat(2_100_001) }),
      { DB: db },
    );
    assert.equal(large.status, 413);
  } finally {
    db.close();
  }
});
test("limite de frequência persiste no banco, sem depender do processo", async () => {
  const db = setup();
  try {
    for (let i = 0; i < 120; i++)
      assert.equal(
        (await worker.fetch(req("/api/state"), { DB: db })).status,
        200,
      );
    assert.equal(
      (await worker.fetch(req("/api/state"), { DB: db })).status,
      429,
    );
  } finally {
    db.close();
  }
});

test("cópias automáticas retêm vinte versões e isolam a recuperação", async () => {
  const db = setup();
  try {
    await readState(db, "alice");
    for (let rev = 0; rev < 23; rev++)
      await writeState(db, "alice", rev, freshState(), "backup.import");
    const copies = await (
      await worker.fetch(req("/api/backups", "alice"), { DB: db })
    ).json();
    assert.equal(copies.backups.length, 20);
    assert.equal(copies.backups.at(-1).revision, 4);
    assert.equal(
      (
        await worker.fetch(
          req("/api/action", "bob", {
            revision: 0,
            action: "backup.restore",
            payload: { revision: 23 },
          }),
          { DB: db },
        )
      ).status,
      404,
    );
    assert.equal(
      (
        await worker.fetch(
          req("/api/action", "alice", {
            revision: 23,
            action: "backup.restore",
            payload: { revision: 23 },
          }),
          { DB: db },
        )
      ).status,
      200,
    );
  } finally {
    db.close();
  }
});
test("restauração de rateio recalcula valores e não duplica importação", async () => {
  const original = await applyAction(freshState(), "split.save", {
    lot: "L1",
    source: "manual",
    total: "1",
    premium: "0",
    producers: [{ name: "P1", kg: "1", points: "0" }],
  });
  const copy = { ...original, version: 1 };
  let restored = await applyAction(freshState(), "backup.import", copy);
  restored = await applyAction(restored, "backup.import", copy);
  assert.equal(restored.splits.length, 1);
  assert.equal(restored.splits[0].rows[0].total, "1");
  assert.match(restored.splits[0].sourceLabel, /sem comprovação/);
});
