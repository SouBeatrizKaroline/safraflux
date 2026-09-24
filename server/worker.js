import { HttpError, readState, writeState, rateLimit } from './store.js';
import { applyAction } from './actions.js';

const headers={
  'Cache-Control':'private, no-store',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self' https:; object-src 'none'; base-uri 'none'; form-action 'self'",
};
function json(data,status=200) { return new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json; charset=utf-8'}}); }
export async function boundedJson(request) {
  if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Use JSON.');
  if(Number(request.headers.get('content-length'))>2_100_000)throw new HttpError(413,'Arquivo muito grande.');
  const reader=request.body?.getReader();if(!reader)throw new HttpError(400,'Dados ausentes.');
  let size=0,parts=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2_100_000){await reader.cancel();throw new HttpError(413,'Arquivo muito grande.');}parts.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new HttpError(400,'JSON inválido.');}
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/api/')) {
      if(!env.ASSETS)return new Response('Assets unavailable',{status:503});
      const response=await env.ASSETS.fetch(request);
      const h=new Headers(response.headers);for(const [key,value] of Object.entries(headers))h.set(key,value);
      return new Response(response.body,{status:response.status,headers:h});
    }
    try {
      // Sites dispatch authenticates visitors and supplies these headers. Never expose this Worker directly.
      const owner=request.headers.get('oai-authenticated-user-id');
      if(!owner||owner.length>200)throw new HttpError(401,'Entre na sua conta para acessar os registros.');
      if(!env.DB)throw new HttpError(503,'Armazenamento indisponível. Nenhum registro foi salvo.');
      if(!['GET','POST'].includes(request.method))throw new HttpError(405,'Método não permitido.');
      if(request.method==='POST') {
        if(request.headers.get('Origin')!==url.origin||request.headers.get('X-SafraFlux-Request')!=='1'||request.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Origem da solicitação recusada.');
      }
      await rateLimit(env.DB,owner);
      if(url.pathname==='/api/state'&&request.method==='GET')return json(await readState(env.DB,owner));
      if(url.pathname==='/api/history'&&request.method==='GET') {
        const result=await env.DB.prepare('SELECT revision, action, at, digest FROM events WHERE owner = ? ORDER BY revision DESC LIMIT 100').bind(owner).all();
        return json({events:result.results});
      }
      if(url.pathname==='/api/action'&&request.method==='POST') {
        const body=await boundedJson(request);
        if(!body||!Number.isSafeInteger(body.revision)||body.revision<0||typeof body.action!=='string')throw new HttpError(400,'Revisão ou operação inválida.');
        const current=await readState(env.DB,owner);
        if(current.revision!==body.revision)throw new HttpError(409,'Os registros mudaram em outra sessão. Atualize os dados antes de salvar.');
        const next=await applyAction(current.state,body.action,body.payload);
        return json(await writeState(env.DB,owner,body.revision,next,body.action));
      }
      throw new HttpError(404,'Recurso não encontrado.');
    } catch(error) {
      const status=error.status??(error instanceof TypeError?400:503);
      if(status===503)console.error('safraflux_request_failed',error.name);
      return json({error:status===503?'Serviço indisponível. Seus dados anteriores foram preservados. Tente novamente.':error.message},status);
    }
  },
};
