import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAINS,
  validateAddress,
  createReference,
  paymentURI,
  associatedTokenAddress,
  balances,
  verifyReceipt,
  rpc,
} from "../src/chains.js";
test("endereço Solana exige 32 bytes; EVM exige 20 bytes", () => {
  assert.equal(
    validateAddress("solana-mainnet", CHAINS["solana-mainnet"].mint),
    CHAINS["solana-mainnet"].mint,
  );
  assert.throws(() => validateAddress("solana-mainnet", "abc"));
  assert.throws(() => validateAddress("base", "0x1234"));
  assert.equal(
    validateAddress("base", CHAINS.base.mint),
    CHAINS.base.mint.toLowerCase(),
  );
});
test("referências são aleatórias e compatíveis com o padrão Solana Pay", () => {
  const refs = Array.from({ length: 40 }, createReference);
  assert.equal(new Set(refs).size, 40);
  refs.forEach((r) => assert.equal(validateAddress("solana-devnet", r), r));
});
test("pedido preserva seis casas, mint da rede e referência", () => {
  const reference = createReference();
  const recipient = createReference();
  const url = new URL(
    paymentURI({
      chain: "solana-devnet",
      recipient,
      reference,
      amount: "0.000001",
      lot: "CAF 01",
    }),
  );
  assert.equal(url.protocol, "solana:");
  assert.equal(url.pathname, recipient);
  assert.equal(url.searchParams.get("amount"), "0.000001");
  assert.equal(url.searchParams.get("reference"), reference);
  assert.equal(url.searchParams.get("spl-token"), CHAINS["solana-devnet"].mint);
});
test("ATA derivada separa destinatários e redes", async () => {
  const recipient = createReference();
  const a = await associatedTokenAddress(
    recipient,
    CHAINS["solana-mainnet"].mint,
  );
  const b = await associatedTokenAddress(
    recipient,
    CHAINS["solana-devnet"].mint,
  );
  assert.notEqual(a, b);
  assert.equal(validateAddress("solana-mainnet", a), a);
});
test("RPC com rede EVM trocada falha antes de mostrar saldo", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ result: "0x1" }),
  }));
  await assert.rejects(
    balances({ chain: "base", address: CHAINS.base.mint }),
    /rede diferente/,
  );
});
test("RPC indisponível permanece erro, sem saldo fictício", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ ok: false, status: 429 }));
  await assert.rejects(rpc("https://example.invalid", "getBalance", []), /429/);
});
test("confirmação pendente não quita cobrança", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => ({
    ok: true,
    json: async () => ({
      result:
        JSON.parse(options.body).method === "getGenesisHash"
          ? "EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG"
          : { value: [{ confirmationStatus: "confirmed", err: null }] },
    }),
  }));
  await assert.rejects(
    verifyReceipt({ chain: "solana-devnet" }, "1".repeat(88)),
    /finalizada/,
  );
});
test("rede Solana trocada não apresenta saldo de outro ambiente", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({
    ok: true,
    json: async () => ({ result: "wrong-genesis" }),
  }));
  await assert.rejects(
    balances({ chain: "solana-devnet", address: CHAINS["solana-devnet"].mint }),
    /rede Solana diferente/,
  );
});
