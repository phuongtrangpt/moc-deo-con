export type PaymentFields={cash:string;bank:string;received:string;field:'cash'|'bank'|'received';replace:boolean};
export function updatePayment(p:PaymentFields,field:PaymentFields['field'],value:string,total:number):PaymentFields{
 const clean=value.replace(/\D/g,'').slice(0,10)||'0',n=Number(clean);const next={...p,[field]:clean,field,replace:false};
 if(field==='received')next.cash=String(Math.min(n,Math.max(0,total-Number(p.bank))));
 if(field==='cash')next.received=String(n);
 if(field==='bank')next.cash=String(Math.max(0,total-n));
 return next;
}
export function pressPayment(p:PaymentFields,key:string,total:number){let value=p[p.field];if(key==='clear')value='0';else if(key==='back')value=value.slice(0,-1)||'0';else value=(p.replace?'':value==='0'?'':value)+key;return updatePayment(p,p.field,value,total)}
