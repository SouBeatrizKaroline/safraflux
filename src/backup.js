import { CHAINS, validateAddress } from "./chains.js";
import { units, decimal } from "./domain.js";
import bs58 from "bs58";

export const MAX_BACKUP_BYTES = 2_000_000;
const fail = () => {
  throw new Error(
    "Backup inválido ou incompatível. Nenhum registro foi alterado.",
  );
};
const field = (value, max, empty = false) => {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!empty && !value.trim())
  )
    fail();
  return value.trim();
};
const list = (value, max) => {
  if (!Array.isArray(value) || value.length > max) fail();
  return value;
};
const network = (value, solana = false) => {
  if (
    !Object.hasOwn(CHAINS, value) ||
    (solana && CHAINS[value].family !== "solana")
  )
    fail();
  return value;
};
const signature = (value) => {
  field(value, 88);
  try {
    if (bs58.decode(value).length !== 64) fail();
  } catch {
    fail();
  }
  return value;
};

// File values are hints only: receipt amounts and cached balances are never restored.
export function mergeBackup(current, raw) {
  if (
    typeof raw !== "string" ||
    new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES
  )
    fail();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    fail();
  }
  if (!data || data.version !== 1) fail();
  const next = structuredClone(current);
  let walletsAdded = 0,
    invoicesAdded = 0,
    signaturesAdded = 0;
  for (const w of list(data.wallets, 30)) {
    if (!w || typeof w !== "object") fail();
    const chain = network(w.chain);
    const address = validateAddress(chain, field(w.address, 64));
    const name = field(w.name, 120);
    if (
      !next.wallets.some(
        (x) =>
          x.chain === chain &&
          (CHAINS[chain].family === "evm"
            ? x.address.toLowerCase() === address
            : x.address === address),
      )
    ) {
      next.wallets.push({ id: crypto.randomUUID(), name, chain, address });
      walletsAdded++;
    }
  }
  for (const i of list(data.invoices, 500)) {
    if (!i || typeof i !== "object") fail();
    const chain = network(i.chain, true);
    const recipient = validateAddress(chain, field(i.recipient, 64));
    const reference = validateAddress(chain, field(i.reference, 64));
    const amount = decimal(units(field(i.amount, 40)));
    if (units(amount) <= 0n) fail();
    const lot = field(i.lot, 200),
      contract = field(i.contract ?? "", 500, true);
    const createdAt = field(i.createdAt, 40);
    if (
      !/^\d{4}-\d\d-\d\dT/.test(createdAt) ||
      !Number.isFinite(Date.parse(createdAt))
    )
      fail();
    const candidates = [
      ...list(i.receipts ?? [], 500).map((r) => signature(r?.signature)),
      ...list(i.pendingSignatures ?? [], 500).map(signature),
    ];
    let target = next.invoices.find(
      (x) => x.chain === chain && x.reference === reference,
    );
    if (target) {
      if (
        target.recipient !== recipient ||
        units(target.amount) !== units(amount) ||
        target.lot !== lot ||
        target.contract !== contract ||
        Date.parse(target.createdAt) !== Date.parse(createdAt)
      )
        throw new Error(
          "Uma cobrança existente usa esta referência com dados diferentes. Importação cancelada.",
        );
    } else {
      target = {
        id: crypto.randomUUID(),
        chain,
        recipient,
        reference,
        amount,
        lot,
        contract,
        createdAt,
        receipts: [],
        pendingSignatures: [],
      };
      next.invoices.push(target);
      invoicesAdded++;
    }
    target.pendingSignatures ??= [];
    for (const s of new Set(candidates)) {
      if (
        !target.pendingSignatures.includes(s) &&
        !next.invoices.some(
          (x) => x.chain === chain && x.receipts.some((r) => r.signature === s),
        )
      ) {
        target.pendingSignatures.push(s);
        signaturesAdded++;
      }
    }
    if (target.pendingSignatures.length > 500) fail();
  }
  if (next.wallets.length > 30 || next.invoices.length > 500) fail();
  return { state: next, walletsAdded, invoicesAdded, signaturesAdded };
}
