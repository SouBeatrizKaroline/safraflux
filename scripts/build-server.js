import { build } from "esbuild";
import { mkdir, cp, readdir, readFile } from "node:fs/promises";
const assets={};
for(const path of await readdir('dist/client',{recursive:true})) {
 if(!/\.(html|css|js|svg)$/.test(path))continue;
 const ext=path.split('.').at(-1);
 assets['/'+path.replaceAll('\\','/')]= {body:await readFile('dist/client/'+path,'utf8'),type:{html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml'}[ext]};
}
await build({
 define:{__SAFRAFLUX_ASSETS__:JSON.stringify(assets)},
  entryPoints: ["server/worker.js"],
  outfile: "dist/server/index.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
});
await mkdir("dist/.openai", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/.openai/drizzle", { recursive: true });
