export function receiptPayment(order:any,payments:any[],settings:any={},requestedAmount?:number){
 const shop=order.shop||{},bankSource=order.status==='open'&&settings.account?settings:shop.account?shop:settings,account=String(bankSource.account||'').trim(),accountName=String(bankSource.accountName||'');
 const total=Number(order.total)||0,received=payments.filter(p=>p.orderId===order.id).reduce((v,p)=>v+(Number(p.amount)||0),0),remaining=Math.max(0,total-received);
 const settled=order.status==='completed'&&remaining===0,allowed=!['cancelled','merged'].includes(order.status);
 const amount=typeof requestedAmount==='number'&&Number.isSafeInteger(requestedAmount)&&requestedAmount>0?requestedAmount:remaining>0?remaining:total;
 const qr=allowed&&/^\d{6,30}$/.test(account)&&amount>0?'https://img.vietqr.io/image/MB-'+encodeURIComponent(account)+'-compact2.png?amount='+amount+'&addInfo='+encodeURIComponent(order.code)+'&accountName='+encodeURIComponent(accountName):'';
 return {total,received,remaining,settled,amount,account,accountName,qr};
}
export async function waitForPrintImages(root:{querySelectorAll:(s:string)=>ArrayLike<any>},timeoutMs=12000){
 await Promise.all(Array.from(root.querySelectorAll('img')).map(img=>new Promise<void>((resolve,reject)=>{
  let timer:any;const clear=()=>{clearTimeout(timer);img.removeEventListener('load',loaded);img.removeEventListener('error',failed)};
  const loaded=()=>{clear();img.naturalWidth>0?resolve():reject(Error('Ảnh QR chưa tải được'))};
  const failed=()=>{clear();reject(Error('Không tải được QR. Hãy kiểm tra Internet và thử lại.'))};
  img.addEventListener('load',loaded);img.addEventListener('error',failed);timer=setTimeout(()=>{clear();reject(Error('QR tải quá lâu. Hãy thử lại trước khi in.'))},timeoutMs);
  if(img.complete){if(img.naturalWidth>0)loaded();else failed()}
 })));
}
