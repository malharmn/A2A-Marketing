import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';
const call=(path,body)=>worker.fetch(new Request('https://test.example'+path,body===undefined?{}:{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),{});
test('discovery', async()=>{const r=await call('/.well-known/agent-card.json');assert.equal(r.status,200);assert.equal((await r.json()).commercial.paymentEnabled,false)});
test('counter', async()=>{const r=await call('/negotiate',{capability:'supplier',offerUsdc:0.0001,buyerMaxUsdc:0.01});const x=await r.json();assert.equal(x.status,'counteroffer');assert.equal(x.quotedPriceUsdc,0.001)});
test('accept',async()=>{const x=await (await call('/negotiate',{capability:'supplier',offerUsdc:0.002})).json();assert.equal(x.status,'accepted');assert.equal(x.quotedPriceUsdc,0.002)});
test('no budget violation',async()=>{const x=await (await call('/negotiate',{capability:'supplier',offerUsdc:0.0001,buyerMaxUsdc:0.0005})).json();assert.equal(x.status,'rejected')});
test('bad input',async()=>{const r=await call('/negotiate',{capability:'',offerUsdc:-1});assert.equal(r.status,400)});
