import { defineConfig } from 'vite';
import { localApi } from './scripts/dev-api.js';
export default defineConfig({plugins:[localApi()],build:{target:'es2022',outDir:'dist/client'},server:{host:'127.0.0.1',port:4173,strictPort:true}});
