// Read-only integration smoke. Uses public token/system addresses, never a user's wallet.
import {CHAINS,balances,rpc} from '../src/chains.js';
const results=await Promise.all(Object.entries(CHAINS).map(async([id,c])=>{
  const address=c.family==='solana'?c.mint:'0x0000000000000000000000000000000000000000';
  try {const result=await balances({chain:id,address});return {chain:id,ok:true,checkedAt:result.at,addressType:'public token mint or zero address'};}
  catch(e){return {chain:id,ok:false,error:e.message};}
}));
console.log(JSON.stringify({checkedAt:new Date().toISOString(),purpose:'read-only RPC integration smoke, no transfer',results},null,2));
