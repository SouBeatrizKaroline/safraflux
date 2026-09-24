import { mergeBackup } from '../src/backup.js';
import { CHAINS, validateAddress, createReference, verifyReceipt } from '../src/chains.js';
import { units, decimal, invoiceStatus, calculateSplit, appendReceipt } from '../src/domain.js';
import { HttpError } from './store.js';

export function text(value,max=120,optional=false) {
  if(typeof value!=='string'||value.length>max||(!optional&&!value.trim())||/[\u0000-\u001f]/.test(value)) throw new HttpError(400,'Texto inválido ou acima do limite.');
  return value.trim();
}
const find=(items,id)=>{const item=items.find(x=>x.id===id);if(!item)throw new HttpError(404,'Registro não encontrado.');return item;};
const cap=(items,max)=>{if(items.length>=max)throw new HttpError(400,'Limite de registros atingido.');};
const network=(chain,solana=false)=>{if(!Object.hasOwn(CHAINS,chain)||(solana&&CHAINS[chain].family!=='solana'))throw new HttpError(400,'Rede inválida.');return chain;};
const positive=value=>{const n=units(text(value,40));if(n<=0n)throw new HttpError(400,'O valor deve ser positivo.');return decimal(n);};
export async function applyAction(current, action, payload, verify=verifyReceipt) {
  const s=structuredClone(current), p=payload;
  if(!p||typeof p!=='object'||Array.isArray(p))throw new HttpError(400,'Dados inválidos.');
  const now=new Date().toISOString();
  switch(action) {
    case 'wallet.add': {
      cap(s.wallets,30);const chain=network(p.chain),address=validateAddress(chain,text(p.address,64));
      if(s.wallets.some(w=>w.chain===chain&&w.address===address))throw new HttpError(409,'Carteira já cadastrada.');
      s.wallets.push({id:crypto.randomUUID(),name:text(p.name,60),chain,address});break;
    }
    case 'wallet.remove': find(s.wallets,p.id);s.wallets=s.wallets.filter(w=>w.id!==p.id);break;
    case 'invoice.add': {
      cap(s.invoices,500);const chain=network(p.chain,true);
      s.invoices.unshift({id:crypto.randomUUID(),lot:text(p.lot,60),contract:text(p.contract??'',80,true),chain,recipient:validateAddress(chain,text(p.recipient,64)),amount:positive(p.amount),reference:createReference(),createdAt:now,receipts:[],pendingSignatures:[]});break;
    }
    case 'invoice.verify': {
      const invoice=find(s.invoices,p.id),signature=text(p.signature,88);
      const receipt=await verify(invoice,signature,{});
      appendReceipt(s.invoices,invoice.id,receipt);
      for(const i of s.invoices) if(i.chain===invoice.chain)i.pendingSignatures=(i.pendingSignatures||[]).filter(x=>x!==signature);
      break;
    }
    case 'backup.import': {
      const result=mergeBackup(s,JSON.stringify(p));
      s.wallets=result.state.wallets;s.invoices=result.state.invoices;
      // Operational snapshots are restored as declared records, never as verified funds.
      for(const producer of p.producers??[]) {
        if(!s.producers.some(x=>x.code===producer.code)) {
          cap(s.producers,500);s.producers.push({id:crypto.randomUUID(),code:text(producer.code,60),name:text(producer.name,120),createdAt:now,archived:false});
        }
      }
      for(const lot of p.lots??[]) {
        if(!s.lots.some(x=>x.code===lot.code)) {
          cap(s.lots,500);s.lots.push({id:crypto.randomUUID(),code:text(lot.code,60),crop:text(lot.crop,80),harvest:text(lot.harvest,30),kg:positive(lot.kg),status:'cadastrado',createdAt:now});
        }
      }
      for(const split of p.splits??[]) {
        cap(s.splits,500);
        const restored=await applyAction({...s,splits:[]},'split.save',{...split,source:'manual'},verify);
        s.splits.push({...restored.splits[0],sourceLabel:'Restaurado / valor declarado, sem comprovação'});
      }
      break;
    }
    case 'producer.add':
      cap(s.producers,500);
      if(s.producers.some(x=>x.code===p.code))throw new HttpError(409,'Código de produtor já cadastrado.');
      s.producers.push({id:crypto.randomUUID(),code:text(p.code,60),name:text(p.name,120),createdAt:now,archived:false});break;
    case 'producer.archive': find(s.producers,p.id).archived=true;break;
    case 'lot.add':
      cap(s.lots,500);
      if(s.lots.some(x=>x.code===p.code))throw new HttpError(409,'Código de lote já cadastrado.');
      s.lots.push({id:crypto.randomUUID(),code:text(p.code,60),crop:text(p.crop,80),harvest:text(p.harvest,30),kg:positive(p.kg),status:'cadastrado',createdAt:now});break;
    case 'lot.status': {
      const lot=find(s.lots,p.id);
      const transitions={cadastrado:['beneficiamento','cancelado'],beneficiamento:['pronto','cancelado'],pronto:['expedido','cancelado'],expedido:['entregue'],entregue:[],cancelado:[]};
      if(!transitions[lot.status]?.includes(p.status))throw new HttpError(400,'Mudança de etapa inválida.');
      lot.status=p.status;lot.updatedAt=now;break;
    }
    case 'split.save': {
      cap(s.splits,500);
      if(!Array.isArray(p.producers)||!p.producers.length||p.producers.length>200)throw new HttpError(400,'Informe entre 1 e 200 produtores.');
      const producers=p.producers.map(x=>({name:text(x.name,60),kg:positive(x.kg),points:text(x.points,10)}));
      if(new Set(producers.map(x=>x.name.toLowerCase())).size!==producers.length)throw new HttpError(400,'Produtores duplicados.');
      const invoice=p.source==='manual'?null:find(s.invoices,p.source);
      const total=invoice?invoiceStatus(invoice).received:positive(p.total),premium=text(p.premium,10);
      const rows=calculateSplit(total,producers,premium);
      s.splits.unshift({id:crypto.randomUUID(),lot:text(p.lot??'Avulso',60),source:invoice?.id??'manual',sourceLabel:invoice?`${invoice.lot} / ${CHAINS[invoice.chain].name}`:'Valor declarado / sem comprovação',total,premium,producers,rows,createdAt:now,rule:'kg-quality-v1'});break;
    }
    default: throw new HttpError(400,'Operação não reconhecida.');
  }
  return s;
}
