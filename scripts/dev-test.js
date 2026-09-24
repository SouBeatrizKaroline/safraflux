process.env.SAFRAFLUX_LOCAL_TEST='1';
const {createServer}=await import('vite');
const server=await createServer({server:{host:'127.0.0.1'}});
await server.listen();server.printUrls();
console.log('Identidade LOCAL DE TESTE habilitada. Nunca usar este servidor em produção.');
