import test from "node:test";
import assert from "node:assert/strict";
import bs58 from "bs58";
import {
  units,
  decimal,
  allocate,
  calculateSplit,
  invoiceStatus,
  receiptFromTransaction,
  csv,
  TOKEN_PROGRAM,
  appendReceipt,
  formatAmount,
} from "../src/domain.js";

test("valores monetários mantêm as seis casas sem ponto flutuante", () => {
  assert.equal(units("1234,000001"), 1234000001n);
  assert.equal(decimal(1234000001n), "1234.000001");
  for (const input of ["-1", "1e3", "0.0000001", "1.000,30", "NaN", ""])
    assert.throws(() => units(input));
});
test("maiores restos preservam total e têm desempate determinístico", () => {
  assert.deepEqual(allocate(2n, [1n, 1n, 1n]), [1n, 1n, 0n]);
  for (let amount = 0n; amount < 90n; amount++) {
    const result = allocate(amount, [51n, 17n, 31n]);
    assert.equal(
      result.reduce((a, b) => a + b, 0n),
      amount,
    );
  }
  assert.throws(() => allocate(1n, [0n, 0n]));
  assert.throws(() => allocate(-1n, [1n]));
});
test("rateio separa base por kg de prêmio por kg × pontos", () => {
  const r = calculateSplit(
    "1000",
    [
      { name: "A", kg: "600", points: "80" },
      { name: "B", kg: "400", points: "90" },
    ],
    "10",
  );
  assert.equal(r[0].base, "540");
  assert.equal(r[1].base, "360");
  assert.equal(r[0].premium, "57.142857");
  assert.equal(r[1].premium, "42.857143");
  assert.equal(
    r.reduce((s, p) => s + units(p.total), 0n),
    units("1000"),
  );
});
test("rateio aceita prêmio zero sem pontos e recusa entradas impossíveis", () => {
  assert.equal(
    calculateSplit("1", [{ kg: "1", points: "0" }], "0")[0].total,
    "1",
  );
  assert.throws(() => calculateSplit("1", [{ kg: "1", points: "0" }], "1"));
  assert.throws(() => calculateSplit("1", [{ kg: "0", points: "1" }], "1"));
  assert.throws(() => calculateSplit("1", [{ kg: "1", points: "101" }], "1"));
  assert.throws(() => calculateSplit("1", [{ kg: "1", points: "1" }], "101"));
});
test("status distingue entrada parcial, completa e excedente", () => {
  assert.equal(
    invoiceStatus({ amount: "10", receipts: [] }).status,
    "Pendente",
  );
  assert.equal(
    invoiceStatus({ amount: "10", receipts: [{ amount: "3000000" }] })
      .outstanding,
    "7",
  );
  assert.equal(
    invoiceStatus({ amount: "10", receipts: [{ amount: "10000000" }] }).status,
    "Recebido",
  );
  assert.equal(
    invoiceStatus({ amount: "10", receipts: [{ amount: "11000000" }] }).excess,
    "1",
  );
});
test("formatação mantém valores acima da precisão de Number", () => {
  assert.equal(
    formatAmount("9007199254740993.000001"),
    "9.007.199.254.740.993,000001",
  );
});
test("a mesma assinatura não quita duas cobranças na mesma rede", () => {
  const invoices = [
    { id: "a", chain: "solana-devnet", receipts: [] },
    { id: "b", chain: "solana-devnet", receipts: [] },
  ];
  appendReceipt(invoices, "a", { signature: "sig", amount: "1000000" });
  assert.throws(
    () => appendReceipt(invoices, "a", { signature: "sig", amount: "1000000" }),
    /já foi/,
  );
  assert.throws(
    () => appendReceipt(invoices, "b", { signature: "sig", amount: "1000000" }),
    /já foi/,
  );
  assert.equal(invoices[1].receipts.length, 0);
});

const invoice = {
  recipient: "owner",
  reference: "reference",
  createdAt: "2026-09-23T12:00:00Z",
};
function fixture({ checked = true, amount = 1000000n } = {}) {
  const data = new Uint8Array(checked ? 10 : 9);
  data[0] = checked ? 12 : 3;
  new DataView(data.buffer).setBigUint64(1, amount, true);
  if (checked) data[9] = 6;
  return {
    blockTime: Math.floor(Date.parse("2026-09-23T12:01:00Z") / 1000),
    transaction: {
      signatures: ["signature"],
      message: {
        header: {
          numRequiredSignatures: 1,
          numReadonlySignedAccounts: 0,
          numReadonlyUnsignedAccounts: 3,
        },
        accountKeys: [
          "payer",
          "source",
          "ata",
          TOKEN_PROGRAM,
          "mint",
          "reference",
        ],
        instructions: [
          {
            programIdIndex: 3,
            accounts: checked ? [1, 4, 2, 0, 5] : [1, 2, 0, 5],
            data: bs58.encode(data),
          },
        ],
      },
    },
    meta: {
      err: null,
      preTokenBalances: [
        {
          accountIndex: 2,
          mint: "mint",
          owner: "owner",
          uiTokenAmount: { decimals: 6, amount: "0" },
        },
      ],
      postTokenBalances: [
        {
          accountIndex: 2,
          mint: "mint",
          owner: "owner",
          uiTokenAmount: { decimals: 6, amount: amount.toString() },
        },
      ],
    },
  };
}
const read = (tx) =>
  receiptFromTransaction(tx, invoice, "signature", "mint", "ata");
test("aceita transferência SPL direta identificada e mede o valor exato", () => {
  assert.equal(read(fixture()).amount, "1000000");
  assert.equal(read(fixture({ checked: false })).amount, "1000000");
});
test("não credita referência colocada em instrução alheia", () => {
  const tx = fixture();
  tx.transaction.message.instructions[0].accounts.pop();
  tx.transaction.message.instructions.push({
    programIdIndex: 0,
    accounts: [5],
    data: "1",
  });
  assert.throws(() => read(tx), /transferência SPL direta/);
});
test("rejeita destinatário, token, precisão, assinatura e programa diferentes", () => {
  for (const mutate of [
    (tx) => (tx.meta.postTokenBalances[0].owner = "other"),
    (tx) => (tx.meta.postTokenBalances[0].mint = "fake-mint"),
    (tx) => (tx.meta.postTokenBalances[0].uiTokenAmount.decimals = 9),
    (tx) => (tx.transaction.signatures[0] = "another-signature"),
    (tx) => (tx.transaction.message.accountKeys[3] = "another-program"),
  ]) {
    const tx = fixture();
    mutate(tx);
    assert.throws(() => read(tx));
  }
});
test("rejeita referência ausente ou gravável", () => {
  const missing = fixture();
  missing.transaction.message.accountKeys[5] = "another-ref";
  assert.throws(() => read(missing), /referência/);
  const writable = fixture();
  writable.transaction.message.header.numReadonlyUnsignedAccounts = 0;
  assert.throws(() => read(writable), /somente leitura/);
});
test("rejeita falha, falta de data e transação anterior", () => {
  const failed = fixture();
  failed.meta.err = { InstructionError: [0, "failed"] };
  assert.throws(() => read(failed));
  const old = fixture();
  old.blockTime -= 10000;
  assert.throws(() => read(old), /anterior/);
  const unknown = fixture();
  unknown.blockTime = null;
  assert.throws(() => read(unknown));
});
test("rejeita crédito não identificado adicional na mesma conta", () => {
  const tx = fixture();
  tx.meta.postTokenBalances[0].uiTokenAmount.amount = "2000000";
  assert.throws(() => read(tx), /movimentações adicionais/);
});
test("aceita ATA nova sem saldo anterior e referência readonly em address lookup", () => {
  const tx = fixture();
  tx.meta.preTokenBalances = [];
  assert.equal(read(tx).amount, "1000000");
  tx.transaction.message.accountKeys.pop();
  tx.transaction.message.header.numReadonlyUnsignedAccounts = 2;
  tx.meta.loadedAddresses = { writable: [], readonly: ["reference"] };
  assert.equal(read(tx).amount, "1000000");
});
test("exportação escapa aspas, separadores e fórmulas", () => {
  const output = csv([["A;B", '"quoted"', "=1+1", "  @SUM(A1)", "normal"]]);
  assert.match(output, /"A;B"/);
  assert.match(output, /""quoted""/);
  assert.match(output, /'=1\+1/);
  assert.match(output, /'  @SUM/);
});
