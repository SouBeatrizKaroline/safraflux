import bs58 from 'bs58';
export const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export function units(value, decimals = 6) {
  const raw = String(value).trim().replace(',', '.');
  if (raw.length > 40) throw new Error('Valor acima do limite do protótipo.');
  if (!/^\d+(\.\d+)?$/.test(raw)) throw new Error('Use um valor positivo, sem separador de milhar.');
  const [integer, fraction = ''] = raw.split('.');
  if (fraction.length > decimals) throw new Error(`Use no máximo ${decimals} casas decimais.`);
  const n = BigInt(integer) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, '0'));
  if (n > 10n ** 24n) throw new Error('Valor acima do limite do protótipo.');
  return n;
}

export function decimal(value, decimals = 6) {
  const n = BigInt(value), sign = n < 0n ? '-' : '', abs = n < 0n ? -n : n;
  const base = 10n ** BigInt(decimals);
  const f = (abs % base).toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${sign}${abs / base}${f ? '.' + f : ''}`;
}

export function allocate(total, weights) {
  const amount = BigInt(total);
  const values = weights.map(BigInt);
  if (amount < 0n || !values.length || values.some(w => w < 0n)) throw new Error('Rateio inválido.');
  const sum = values.reduce((a, b) => a + b, 0n);
  if (sum === 0n) {
    if (amount !== 0n) throw new Error('Informe pesos para distribuir o valor.');
    return values.map(() => 0n);
  }
  const result = values.map(w => amount * w / sum);
  const order = values.map((w, i) => ({i, remainder: amount * w % sum})).sort((a, b) => a.remainder === b.remainder ? a.i - b.i : a.remainder > b.remainder ? -1 : 1);
  let leftover = amount - result.reduce((a, b) => a + b, 0n);
  for (const {i} of order) { if (leftover === 0n) break; result[i]++; leftover--; }
  return result;
}

export function calculateSplit(total, producers, premiumPercent = '0') {
  const amount = units(total);
  const percent = units(premiumPercent, 2);
  if (percent > 10000n) throw new Error('O prêmio deve ficar entre 0 e 100%.');
  if (!producers.length || producers.length > 100) throw new Error('Informe de 1 a 100 produtores.');
  const kg = producers.map(p => units(p.kg, 3));
  if (kg.some(k => k === 0n)) throw new Error('Cada produtor deve ter quantidade maior que zero.');
  const scores = producers.map(p => units(p.points, 2));
  if (scores.some(n => n > 10000n)) throw new Error('Pontos de qualidade: de 0 a 100.');
  const pool = amount * percent / 10000n;
  const base = allocate(amount - pool, kg);
  const premium = allocate(pool, kg.map((k, i) => k * scores[i]));
  return producers.map((p, i) => ({...p, base: decimal(base[i]), premium: decimal(premium[i]), total: decimal(base[i] + premium[i])}));
}

export function invoiceStatus(invoice) {
  const total = (invoice.receipts || []).reduce((sum, r) => sum + BigInt(r.amount), 0n);
  const expected = units(invoice.amount);
  return {received: decimal(total), outstanding: decimal(total < expected ? expected - total : 0n), excess: decimal(total > expected ? total - expected : 0n), status: total === 0n ? 'Pendente' : total < expected ? 'Parcial' : total === expected ? 'Recebido' : 'Acima do valor'};
}

export function appendReceipt(invoices, invoiceId, receipt) {
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) throw new Error('Cobrança não encontrada.');
  if (invoices.some(i => i.chain === invoice.chain && i.receipts.some(r => r.signature === receipt.signature))) throw new Error('Esta transação já foi conciliada neste navegador.');
  invoice.receipts.push(receipt);
}

export function formatAmount(value) {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return '—';
  const [integer, fraction] = normalized.split('.');
  return BigInt(integer).toLocaleString('pt-BR') + (fraction ? ',' + fraction : '');
}

// A reference binds the on-chain receipt to an invoice; it is not proof of goods or quality.
export function receiptFromTransaction(tx, invoice, signature, mint, destinationATA) {
  if (!tx || !tx.meta || tx.meta.err) throw new Error('Transação ausente ou sem execução bem-sucedida.');
  if (tx.transaction.signatures[0] !== signature) throw new Error('A assinatura retornada não corresponde à consulta.');
  const message = tx.transaction.message;
  const staticKeys = message.accountKeys;
  const loaded = tx.meta.loadedAddresses || {writable: [], readonly: []};
  const keys = [...staticKeys, ...loaded.writable, ...loaded.readonly];
  const referenceIndex = keys.indexOf(invoice.reference);
  if (referenceIndex < 0) throw new Error('A transação não contém a referência desta cobrança.');
  const header = message.header;
  const readOnly = referenceIndex < staticKeys.length
    ? referenceIndex >= header.numRequiredSignatures && referenceIndex >= staticKeys.length - header.numReadonlyUnsignedAccounts
    : referenceIndex >= staticKeys.length + loaded.writable.length;
  if (!readOnly) throw new Error('A referência precisa ser somente leitura e não assinante.');
  if (!tx.blockTime || tx.blockTime * 1000 < Date.parse(invoice.createdAt) - 300000) throw new Error('A transação é anterior à cobrança ou não possui data verificável.');
  const destinationIndex = keys.indexOf(destinationATA);
  if (destinationIndex < 0) throw new Error('A conta USDC de destino não está nesta transação.');
  let transferred = 0n;
  for (const instruction of message.instructions) {
    if (keys[instruction.programIdIndex] !== TOKEN_PROGRAM) continue;
    const data = bs58.decode(instruction.data);
    const checked = data[0] === 12 && data.length === 10;
    const transfer = data[0] === 3 && data.length === 9;
    if (!checked && !transfer) continue;
    const accounts = instruction.accounts;
    const to = accounts[checked ? 2 : 1];
    const refs = accounts.slice(checked ? 4 : 3);
    if (to !== destinationIndex || !refs.includes(referenceIndex)) continue;
    if (checked && (keys[accounts[1]] !== mint || data[9] !== 6)) throw new Error('Token ou precisão incorretos na transferência.');
    transferred += new DataView(data.buffer, data.byteOffset, data.byteLength).getBigUint64(1, true);
  }
  if (transferred <= 0n) throw new Error('Não há transferência SPL direta para o destino com a referência desta cobrança.');
  const balance = list => (list || []).filter(b => b.accountIndex === destinationIndex && b.mint === mint && b.owner === invoice.recipient).reduce((sum, b) => {
    if (b.uiTokenAmount.decimals !== 6) throw new Error('Precisão do token diferente do USDC esperado.');
    return sum + BigInt(b.uiTokenAmount.amount);
  }, 0n);
  const amount = balance(tx.meta.postTokenBalances) - balance(tx.meta.preTokenBalances);
  if (amount <= 0n) throw new Error('Não houve entrada líquida de USDC no destinatário desta cobrança.');
  if (amount !== transferred) throw new Error('A transação contém movimentações adicionais no destino. Use uma transferência direta por cobrança.');
  return {signature, amount: amount.toString(), blockTime: tx.blockTime, verifiedAt: new Date().toISOString()};
}

export function csv(rows) {
  const escape = v => { const raw = String(v ?? ''); return '"' + (/^\s*[=+@\-\t\r]/.test(raw) ? "'" : '') + raw.replaceAll('"', '""') + '"'; };
  return '\uFEFF' + rows.map(r => r.map(escape).join(';')).join('\r\n');
}
