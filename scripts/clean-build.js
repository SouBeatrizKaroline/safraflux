import { rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const root=resolve(process.cwd()); const target=resolve(root,'dist');
if(dirname(target)!==root || target===root)throw new Error('Unsafe build path');
await rm(target,{recursive:true,force:true});
