export const freshState = () => ({
  wallets: [],
  invoices: [],
  producers: [],
  lots: [],
  splits: [],
  endpoints: {},
});
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export async function readState(db, owner) {
  await db
    .prepare(
      "INSERT OR IGNORE INTO workspaces (owner, revision, data) VALUES (?, 0, ?)",
    )
    .bind(owner, JSON.stringify(freshState()))
    .run();
  const row = await db
    .prepare("SELECT revision, data FROM workspaces WHERE owner = ?")
    .bind(owner)
    .first();
  return { revision: row.revision, state: JSON.parse(row.data) };
}
export async function writeState(db, owner, expected, state, action) {
  const data = JSON.stringify(state);
  if (new TextEncoder().encode(data).length > 2_000_000)
    throw new HttpError(
      413,
      "Limite de registros atingido. Exporte os dados e contate o suporte.",
    );
  const digest = Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  try {
    // The unique (owner, revision) audit key serializes competing writers in one transaction.
    await db.batch([
      db
        .prepare(
          "INSERT INTO events (owner, revision, action, at, digest) VALUES (?, ?, ?, ?, ?)",
        )
        .bind(owner, expected + 1, action, new Date().toISOString(), digest),
      db
        .prepare(
          "UPDATE workspaces SET data = ?, revision = ? WHERE owner = ? AND revision = ?",
        )
        .bind(data, expected + 1, owner, expected),
      db
        .prepare(
          "INSERT INTO snapshots (owner, revision, at, data) VALUES (?, ?, ?, ?)",
        )
        .bind(owner, expected + 1, new Date().toISOString(), data),
      db
        .prepare("DELETE FROM snapshots WHERE owner = ? AND revision <= ?")
        .bind(owner, expected - 19),
    ]);
  } catch (error) {
    if (String(error).includes("UNIQUE"))
      throw new HttpError(
        409,
        "Os registros mudaram em outra sessão. Atualize os dados e tente novamente.",
      );
    throw error;
  }
  return { revision: expected + 1, state };
}
export async function rateLimit(db, owner) {
  const window = Math.floor(Date.now() / 60000);
  const row = await db
    .prepare(
      "INSERT INTO request_limits (owner, window, count) VALUES (?, ?, 1) ON CONFLICT(owner) DO UPDATE SET count = CASE WHEN window = excluded.window THEN count + 1 ELSE 1 END, window = excluded.window RETURNING count",
    )
    .bind(owner, window)
    .first();
  if (row.count > 120)
    throw new HttpError(429, "Muitas solicitações. Aguarde um minuto.");
}
