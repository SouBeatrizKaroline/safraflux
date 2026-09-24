import test from 'node:test';
import assert from 'node:assert/strict';
import bs58 from 'bs58';
import { mergeBackup, MAX_BACKUP_BYTES } from '../src/backup.js';
import { invoiceStatus } from '../src/domain.js';

const address = '11111111111111111111111111111111';
const sig = bs58.encode(new Uint8Array(64).fill(2));
const invoice = () => ({id:'untrusted',chain:'solana-devnet',recipient:address,reference:address,amount:'10',lot:'Lote 1',contract:'C1',createdAt:'2026-09-24T10:00:00.000Z',receipts:[{signature:sig,amount:'10000000'}]});
const empty = () => ({wallets:[],invoices:[],endpoints:{base:'https://example.org'}});
const backup = (invoices=[invoice()],wallets=[]) => JSON.stringify({version:1,invoices,wallets,endpoints:{base:'https://malicious.example'}});

test('pagamentos importados nunca entram no total recebido', () => {
  const result=mergeBackup(empty(),backup());
  assert.equal(invoiceStatus(result.state.invoices[0]).received,'0');
  assert.deepEqual(result.state.invoices[0].pendingSignatures,[sig]);
  assert.deepEqual(result.state.invoices[0].receipts,[]);
  assert.notEqual(result.state.invoices[0].id,'untrusted');
  assert.equal(result.state.endpoints.base,'https://example.org');
});
test('saldo e identificador de carteira são descartados; importação é idempotente', () => {
  const raw=backup([], [{id:'fake',name:'Teste',chain:'solana-devnet',address,balance:{usdc:'999'}}]);
  const first=mergeBackup(empty(),raw);
  assert.equal(first.state.wallets[0].balance,undefined);
  assert.equal(mergeBackup(first.state,raw).walletsAdded,0);
});
test('conflito de referência rejeita todo o arquivo sem mutar o estado', () => {
  const original=mergeBackup(empty(),backup()).state;
  const before=structuredClone(original);
  assert.throws(()=>mergeBackup(original,backup([{...invoice(),amount:'11'}])));
  assert.deepEqual(original,before);
});
test('comprovantes locais são preservados e não viram pendência', () => {
  const original={...empty(),invoices:[invoice()]};
  const result=mergeBackup(original,backup());
  assert.equal(result.state.invoices[0].receipts.length,1);
  assert.deepEqual(result.state.invoices[0].pendingSignatures,[]);
  assert.equal(result.invoicesAdded,0);
});
test('rejeita versões, redes, valores, assinaturas e arquivos inválidos', () => {
  for(const raw of ['null','{}','{',JSON.stringify({version:2,wallets:[],invoices:[]}), ' '.repeat(MAX_BACKUP_BYTES+1)]) assert.throws(()=>mergeBackup(empty(),raw));
  for(const patch of [{chain:'__proto__'},{chain:'base'},{amount:'-1'},{amount:'0'},{amount:'1e9'},{recipient:'fake'},{createdAt:'bad'},{receipts:[{signature:'invalid'}]}]) assert.throws(()=>mergeBackup(empty(),backup([{...invoice(),...patch}])));
});
test('referências duplicadas idênticas mesclam assinaturas sem duplicar cobrança', () => {
  const result=mergeBackup(empty(),backup([invoice(),invoice()]));
  assert.equal(result.invoicesAdded,1);
  assert.equal(result.signaturesAdded,1);
});
test('limite de carteiras se aplica ao resultado da mesclagem', () => {
  const wallets=Array.from({length:30},(_,i)=>({id:String(i),name:'Existente',chain:'base',address:'0x'+i.toString(16).padStart(40,'0')}));
  assert.throws(()=>mergeBackup({...empty(),wallets},backup([],[{name:'Nova',chain:'solana-devnet',address}])));
});
