import test from 'node:test';
import assert from 'node:assert/strict';
import {audit,parseTarget,publicIpv4} from './audit.js';
import worker from './worker.js';
test('reject unsafe targets',()=>{for(const u of ['http://example.com','https://127.0.0.1','https://localhost','https://user:pass@example.com','https://example.com:444'])assert.throws(()=>parseTarget(u));});
test('reject private and reserved IPs',()=>{for(const ip of ['127.0.0.1','10.0.0.1','192.168.1.1','169.254.169.254','172.16.0.1','100.64.0.1','203.0.113.1'])assert.equal(publicIpv4(ip),false);assert.equal(publicIpv4('8.8.8.8'),true)});
test('produces meaningful structured audit report without remote network',async()=>{const r=await audit('https://example.com/api',{resolve:async()=>[{address:'8.8.8.8',family:4}],probe:async()=>({status:200,latencyMs:35,headers:{'content-type':'application/json','strict-transport-security':'max-age=63072000','x-content-type-options':'nosniff'}})});assert.equal(r.status,200);assert.equal(r.checks.hsts,true);assert.equal(r.checks.contentSecurityPolicy,false);assert.equal(r.charged,false)});
test('reject DNS private target',async()=>{await assert.rejects(()=>audit('https://example.com',{resolve:async()=>[{address:'10.0.0.2',family:4}]}),/unsafe/)});
test('HTTP audit endpoint requires URL',async()=>{const r=await worker.fetch(new Request('https://test.example/audit'));assert.equal(r.status,400)});
