import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { sqliteAdapter } from './local-db.js';
import worker from '../server/worker.js';
export function localApi() {
  return {name:'safraflux-local-api',configureServer(server){
    mkdirSync('.local',{recursive:true});const db=sqliteAdapter('.local/safraflux.sqlite');
    db.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
    const ready=(async()=>{for(const name of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()) {
      if(!(await db.prepare('SELECT name FROM local_migrations WHERE name = ?').bind(name).first())) {
        db.exec(readFileSync('drizzle/'+name,'utf8'));
        await db.prepare('INSERT INTO local_migrations(name) VALUES (?)').bind(name).run();
      }
    }})();
    server.middlewares.use(async(req,res,next)=>{
      if(!req.url?.startsWith('/api/'))return next();
      try{
        await ready;
        const host=req.headers.host;
        if(host!== '127.0.0.1:4173' && host!=='localhost:4173'){res.statusCode=403;res.end();return;}
        const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v&&!k.startsWith('oai-'))headers.set(k,String(v));
        if(process.env.SAFRAFLUX_LOCAL_TEST==='1')headers.set('oai-authenticated-user-id','local-test-user');
        const request=new Request('http://'+host+req.url,{method:req.method,headers,...(req.method==='POST'?{body:req,duplex:'half'}:{})});
        const response=await worker.fetch(request,{DB:db});res.statusCode=response.status;
        response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(Buffer.from(await response.arrayBuffer()));
      }catch{res.statusCode=503;res.end('{"error":"Servidor local indisponível"}');}
    });
    server.httpServer?.on('close',()=>db.close());
  }};
}
