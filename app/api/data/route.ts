import {normalizePermissions} from '../../../lib/permissions';
import {VERSION} from '../../../lib/version';
import {env} from 'cloudflare:workers';
import {initial,defaultTables,apply,visible,type State,type User} from '../../../lib/domain';
const json=(x:any,status=200,headers:any={})=>Response.json(x,{status,headers:{'Cache-Control':'no-store',...headers}});
const collections=['tables','items','customers','orders','payments','expenses','users','audit','requests','closings'] as const;
async function read(){
 const result=await env.DB!.prepare('SELECT id,revision,data FROM store ORDER BY rowid').all<any>();const records=new Map<string,string>();let rev=-1,s=initial(),tablesInitialized=false;s.tables=[];
 for(const row of result.results){records.set(row.id,row.data);if(row.id==='shop'){rev=row.revision;const meta=JSON.parse(row.data);s.settings=meta.settings;s.sequence=meta.sequence;tablesInitialized=meta.tablesInitialized===true;if(Array.isArray(meta.orders))s=meta}else{const name=row.id.split(':')[0] as typeof collections[number];if(collections.includes(name))(s[name] as any[]).push(JSON.parse(row.data))}}
 for(const u of s.users)if(!u.permissions)u.permissions=normalizePermissions({editPrice:!!s.settings.allowStaffPrice});
 s.tables??=[];if(!tablesInitialized&&!s.tables.length)s.tables=defaultTables();
 return {rev,s,records};
}
async function save(s:State,rev:number,records:Map<string,string>){
 const token=crypto.randomUUID();const meta=JSON.stringify({settings:s.settings,sequence:s.sequence,tablesInitialized:true,writeToken:token});
 const header=rev<0?env.DB!.prepare('INSERT OR IGNORE INTO store(id,revision,data) VALUES(?,0,?)').bind('shop',meta):env.DB!.prepare('UPDATE store SET data=?,revision=revision+1 WHERE id=? AND revision=?').bind(meta,'shop',rev);
 const queries=[header],keys=new Set(['shop']);
 for(const name of collections)for(const x of s[name] as any[]){if(name==='audit'&&!x.id)x.id=crypto.randomUUID();const key=name+':'+(typeof x==='string'?x:x.id),value=JSON.stringify(x);keys.add(key);if(records.get(key)!==value)queries.push(env.DB!.prepare("INSERT INTO store(id,revision,data) SELECT ?,0,? WHERE EXISTS(SELECT 1 FROM store WHERE id='shop' AND json_extract(data,'$.writeToken')=?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").bind(key,value,token))}
 for(const key of records.keys())if(!keys.has(key))queries.push(env.DB!.prepare("DELETE FROM store WHERE id=? AND EXISTS(SELECT 1 FROM store WHERE id='shop' AND json_extract(data,'$.writeToken')=?)").bind(key,token));
 const result=await env.DB!.batch(queries);return !!result[0].meta.changes;
}
async function user(req:Request,s:State){
// Local QA fixture only; never active in the production build.
if(process.env.NODE_ENV==='development' && s.users[0]?.id==='local-admin')return s.users[0];
const token=req.headers.get('cookie')?.match(/(?:^|;\s*)moc_session=([^;]+)/)?.[1];if(!token)return null;const row=await env.DB!.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').bind(token,Date.now()).first<any>();const u=row?s.users.find(u=>u.id===row.user_id&&u.active):null;if(!u)return null;const generation=token.includes('.')?token.split('.')[0]:'0';if(generation!==(u.sessionVersion||'0'))return null;return u}
async function hash(password:string,salt:string){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256);return Array.from(new Uint8Array(bits)).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function session(u:User,req:Request){const token=(u.sessionVersion||'0')+'.'+crypto.randomUUID()+crypto.randomUUID();await env.DB!.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)').bind(token,u.id,Date.now()+12*3600_000).run();return {'Set-Cookie':`moc_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200${new URL(req.url).protocol==='https:'?'; Secure':''}`}}
export async function GET(req:Request){try{const {s,rev}=await read();if(!s.users.length)return json({setup:true,version:VERSION});const u=await user(req,s);if(!u)return json({login:true,version:VERSION});return json({state:visible(s,u),revision:rev,version:VERSION})}catch{return json({error:'Không kết nối được dữ liệu. Hãy thử lại.'},503)}}
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return json({error:'Nguồn yêu cầu không hợp lệ'},403);
 if(Number(req.headers.get('content-length')||0)>200000)return json({error:'Yêu cầu quá lớn'},413);
 const a:any=await req.json();let {s,rev,records}=await read();
 if(a.type==='setup'){
  if(s.users.length)return json({error:'Quán đã được thiết lập'},409);
  if(typeof a.password!=='string'||a.password.length<8||a.password.length>100)return json({error:'Mật khẩu cần từ 8 đến 100 ký tự'},400);
  const salt=crypto.randomUUID();const u:User={id:crypto.randomUUID(),name:'Chủ quán',username:'admin',role:'admin',hash:await hash(a.password,salt),salt,active:true};s.users.push(u);
  if(!await save(s,rev,records))return json({error:'Đã có người thiết lập. Hãy đăng nhập.'},409);
  return json({ok:true},200,await session(u,req));
 }
 if(a.type==='login'){
  const u=s.users.find(u=>u.active&&u.username===a.username);if(!u||typeof a.password!=='string'||a.password.length>100||await hash(a.password,u.salt)!==u.hash)return json({error:'Tên đăng nhập hoặc mật khẩu không đúng'},401);
  return json({ok:true},200,await session(u,req));
 }
 const u=await user(req,s);if(!u)return json({error:'Phiên đăng nhập đã hết. Hãy đăng nhập lại.'},401);
 if(a.type==='logout'){const token=req.headers.get('cookie')?.match(/(?:^|;\s*)moc_session=([^;]+)/)?.[1];await env.DB!.prepare('DELETE FROM sessions WHERE token=?').bind(token||'').run();return json({ok:true},200,{'Set-Cookie':'moc_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'})}
 if(a.type==='password'){
  if(typeof a.currentPassword!=='string'||a.currentPassword.length>100||await hash(a.currentPassword,u.salt)!==u.hash)return json({error:'Mật khẩu hiện tại chưa đúng'},400);
  if(typeof a.newPassword!=='string'||a.newPassword.length<8||a.newPassword.length>100)return json({error:'Mật khẩu mới cần từ 8 đến 100 ký tự'},400);
  if(a.newPassword!==a.confirmPassword)return json({error:'Hai lần nhập mật khẩu mới chưa khớp'},400);
  if(a.newPassword===a.currentPassword)return json({error:'Mật khẩu mới cần khác mật khẩu hiện tại'},400);
  const salt=crypto.randomUUID();u.salt=salt;u.hash=await hash(a.newPassword,salt);u.sessionVersion=crypto.randomUUID();s.audit.push({id:crypto.randomUUID(),at:new Date().toISOString(),by:u.name,type:'password'});
  if(!await save(s,rev,records))return json({error:'Dữ liệu vừa thay đổi. Hãy thử lại.'},409);
  return json({state:visible(s,u),revision:rev+1,passwordChanged:true},200,await session(u,req));
 }
 if(a.type==='user'){
  if(u.role!=='admin')return json({error:'Chỉ chủ quán được quản lý tài khoản'},403);
  const x=a.user;if(!x||!String(x.name).trim()||!/^[a-z0-9_.-]{3,30}$/.test(x.username))throw Error('Tên đăng nhập chỉ gồm chữ thường, số, dấu chấm hoặc gạch; dài 3–30 ký tự');
  const old=s.users.find(z=>z.id===x.id);if(old?.id===u.id&&x.password)throw Error('Đổi mật khẩu của mình tại mục Đổi mật khẩu, cần xác nhận mật khẩu hiện tại');if(s.users.some(z=>z.username===x.username&&z.id!==x.id))throw Error('Tên đăng nhập đã có');
  if(old?.id===u.id&&(!x.active||x.role!=='admin'))throw Error('Không thể vô hiệu hóa tài khoản đang dùng');
  let salt=old?.salt||crypto.randomUUID(),h=old?.hash||'';if(x.password){if(x.password.length<8||x.password.length>100)throw Error('Mật khẩu cần 8–100 ký tự');h=await hash(x.password,salt)}if(!h)throw Error('Nhập mật khẩu');
  s.users=[...s.users.filter(z=>z.id!==x.id),{permissions:normalizePermissions(x.permissions??old?.permissions),sessionVersion:x.password||old?.active!==!!x.active?crypto.randomUUID():old?.sessionVersion,id:old?.id||crypto.randomUUID(),name:String(x.name).slice(0,100),username:x.username,role:x.role==='admin'?'admin':'staff',active:!!x.active,salt,hash:h}];s.audit.push({at:new Date().toISOString(),by:u.name,type:'user'});
 }else{if(a.type==='close'&&(!Number.isSafeInteger(a.expected)))throw Error('Số dư không hợp lệ');s=apply(s,a,u)}
 if(!await save(s,rev,records))return json({error:'Dữ liệu vừa thay đổi trên thiết bị khác. Hãy tải lại và thử lại.'},409);
 return json({state:visible(s,u),revision:rev+1});
 }catch(e:any){return json({error:e.message||'Không thể thực hiện thao tác'},400)}}

export async function authorizeAdmin(req:Request){const {s}=await read();const u=await user(req,s);return !!u&&u.role==='admin'}
export async function hasOpenOrders(){const {s}=await read();return s.orders.some(o=>o.status==='open')}
