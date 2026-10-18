import dns from 'node:dns/promises';
import https from 'node:https';
import net from 'node:net';

function publicIpv4(ip) {
  if(net.isIP(ip)!==4)return false;
  const [a,b,c]=ip.split('.').map(Number);
  return !(a===0 || a===10 || a===127 || a>=224 || a===169&&b===254 || a===172&&b>=16&&b<=31 || a===192&&b===168 || a===100&&b>=64&&b<=127 || a===192&&b===0&&c===0 || a===192&&b===0&&c===2 || a===198&&b===18 || a===198&&b===19 || a===198&&b===51&&c===100 || a===203&&b===0&&c===113 || a>=240);
}
export function parseTarget(value) {
  if(typeof value!=='string' || value.length>2048)throw new Error('invalid_url');
  let u;try{u=new URL(value)}catch{throw new Error('invalid_url')}
  if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||net.isIP(u.hostname)||!u.hostname.includes('.')||u.hostname==='localhost')throw new Error('public_https_domain_required');
  return u;
}
export async function audit(target,{resolve=dns.lookup,probe=probeHead}={}) {
  const u=parseTarget(target);
  const records=await resolve(u.hostname,{all:true,verbatim:true});
  if(!Array.isArray(records)||!records.length||records.some(r=>!publicIpv4(r.address)))throw new Error('unsafe_or_unavailable_dns');
  const ip=records.find(r=>net.isIP(r.address)===4).address;
  const result=await probe(u,ip);
  const h=result.headers;
  return {url:u.toString(),status:result.status,latencyMs:result.latencyMs,checks:{https:true,reachable:result.status>=200&&result.status<500,hsts:!!h['strict-transport-security'],contentSecurityPolicy:!!h['content-security-policy'],xContentTypeOptions:h['x-content-type-options']==='nosniff',referrerPolicy:!!h['referrer-policy']},contentType:h['content-type']||null,redirectNotFollowed:result.status>=300&&result.status<400,method:'HEAD',limitations:'Availability and response-header signals only. No body analysis, vulnerability scan, or third-party authorization claim.',charged:false};
}
function probeHead(u,ip){return new Promise((resolve,reject)=>{const start=performance.now();const request=https.request(u,{method:'HEAD',lookup:(_host,_opts,cb)=>cb(null,ip,4),timeout:5000,maxHeaderSize:16384,headers:{'user-agent':'PublicSiteCheck/0.1 (+nonintrusive HEAD only)','accept':'*/*'}},res=>{const headers=res.headers;res.resume();resolve({status:res.statusCode,headers,latencyMs:Math.round(performance.now()-start)});});request.on('timeout',()=>request.destroy(new Error('upstream_timeout')));request.on('error',reject);request.end()})}
export { publicIpv4 };
