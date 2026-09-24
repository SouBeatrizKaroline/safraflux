import { DatabaseSync } from 'node:sqlite';
export function sqliteAdapter(path=':memory:') {
  const db=new DatabaseSync(path);
  return {
    exec:sql=>db.exec(sql),close:()=>db.close(),
    prepare(sql) {
      const statement=db.prepare(sql);
      const prepared=(args=[])=>({
        bind:(...values)=>prepared(values),
        first:async()=>statement.get(...args)??null,
        all:async()=>({results:statement.all(...args)}),
        run:async()=>({meta:statement.run(...args)}),
      });return prepared();
    },
    async batch(statements) {
      db.exec('BEGIN IMMEDIATE');
      try{const results=[];for(const statement of statements)results.push(await statement.run());db.exec('COMMIT');return results;}
      catch(error){db.exec('ROLLBACK');throw error;}
    },
  };
}
