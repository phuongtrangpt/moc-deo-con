import assert from 'node:assert/strict';import {receiptPayment,waitForPrintImages} from '../lib/receipt.ts';
const order={id:'o',code:'HD000123',status:'open',total:85000,shop:{account:'1234567890',accountName:'TEST ONLY'}};
const settings={account:'0987654321',accountName:'FALLBACK TEST'};
assert(receiptPayment(order,[],settings).qr.includes(settings.account),'Open bill must match current checkout bank account');
let data=receiptPayment(order,[],settings);assert(data.qr);assert.equal(new URL(data.qr).searchParams.get('amount'),'85000');assert.equal(new URL(data.qr).searchParams.get('addInfo'),'HD000123');
data=receiptPayment({...order,status:'completed'},[{orderId:'o',amount:85000}],settings);assert(data.qr,'Fully paid bill must keep its QR');assert.equal(data.settled,true);assert.equal(data.amount,85000);assert.equal(data.remaining,0);
data=receiptPayment({...order,status:'completed'},[{orderId:'o',amount:30000}],settings);assert.equal(data.amount,55000);assert.equal(data.settled,false);
data=receiptPayment({...order,shop:{account:''}},[],settings);assert(data.qr.includes('0987654321'),'Older drafts without bank snapshot use configured account');assert.equal(receiptPayment(order,[],{},40000).amount,40000);
assert.equal(receiptPayment({...order,status:'cancelled'},[],settings).qr,'');assert.equal(receiptPayment({...order,status:'merged'},[],settings).qr,'');assert.equal(receiptPayment({...order,total:0},[],settings).qr,'');
class FakeImage extends EventTarget{complete=false;naturalWidth=0}
const image=new FakeImage();let finished=false;const pending=waitForPrintImages({querySelectorAll:()=>[image]},100).then(()=>finished=true);await new Promise(r=>setTimeout(r,5));assert.equal(finished,false,'Print must wait for image');image.complete=true;image.naturalWidth=200;image.dispatchEvent(new Event('load'));await pending;assert(finished);
const broken=new FakeImage();broken.complete=true;await assert.rejects(()=>waitForPrintImages({querySelectorAll:()=>[broken]},30),/Không tải được QR/);await assert.rejects(()=>waitForPrintImages({querySelectorAll:()=>[new FakeImage()]},10),/tải quá lâu/);
console.log('PASS: QR before/after payment, partial debt amount, saved bank fallback, mixed transfer amount, cancelled bills, waits for image and blocks failed/timed out images');
