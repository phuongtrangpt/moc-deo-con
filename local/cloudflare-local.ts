import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const root=resolve(process.env.MOC_DATA_DIR||'data');mkdirSync(root,{recursive:true});
export const database=new DatabaseSync(join(root,'moc-deo-con.sqlite'));
database.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
// First-start schema is applied before the HTTP server accepts requests.
database.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8').replaceAll('CREATE TABLE `','CREATE TABLE IF NOT EXISTS `'));
class Statement{sql:string;args:any[]=[];constructor(sql:string){this.sql=sql}bind(...args:any[]){this.args=args;return this}first(){return database.prepare(this.sql).get(...this.args)||null}all(){return {results:database.prepare(this.sql).all(...this.args)}}run(){const r=database.prepare(this.sql).run(...this.args);return {success:true,meta:{changes:Number(r.changes)}}}}
export const env={DB:{prepare:(sql:string)=>new Statement(sql),batch:(qs:Statement[])=>{database.exec('BEGIN IMMEDIATE');try{const results=qs.map(q=>q.run());database.exec('COMMIT');return results}catch(e){database.exec('ROLLBACK');throw e}}}};
