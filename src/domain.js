export function units(value, decimals = 6) {
  const raw = String(value).trim().replace(',', '.');
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

// A reference binds the on-chain receipt to an invoice; it is not proof of goods or quality.
export function receiptFromTransaction(tx, invoice, signature, mint) {
  if (!tx || !tx.meta || tx.meta.err) throw new Error('Transação ausente ou sem execução bem-sucedida.');
  const keys = tx.transaction.message.accountKeys.map(k => typeof k === 'string' ? k : String(k.pubkey));
  if (!keys.includes(invoice.reference)) throw new Error('A transação não contém a referência desta cobrança.');
  if (!tx.blockTime || tx.blockTime * 1000 < Date.parse(invoice.createdAt) - 300000) throw new Error('A transação é anterior à cobrança ou não possui data verificável.');
  const balance = list => (list || []).filter(b => b.mint === mint && b.owner === invoice.recipient).reduce((sum, b) => {
    if (b.uiTokenAmount.decimals !== 6) throw new Error('Precisão do token diferente do USDC esperado.');
    return sum + BigInt(b.uiTokenAmount.amount);
  }, 0n);
  const amount = balance(tx.meta.postTokenBalances) - balance(tx.meta.preTokenBalances);
  if (amount <= 0n) throw new Error('Não houve entrada líquida de USDC no destinatário desta cobrança.');
  return {signature, amount: amount.toString(), blockTime: tx.blockTime, verifiedAt: new Date().toISOString()};
}

export function csv(rows) {
  const escape = v => '"' + String(v ?? '').replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"';
  return '\uFEFF' + rows.map(r => r.map(escape).join(';')).join('\r\n');
}
