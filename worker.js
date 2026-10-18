/** A2A commercial negotiation discovery probe. No payments accepted; zero external dependencies. */
const MAX=0.01, FLOOR=0.001;
function json(body,status=200,headers={}) {return new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*',...headers}})}
function parseAmount(v){if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1000) return null;return Math.round(v*1e6)/1e6}
export default {async fetch(request,env){const url=new URL(request.url);if(request.method==='OPTIONS')return new Response(null,{headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});
if(request.method==='GET'&&url.pathname==='/health')return json({ok:true,service:'Agent Connection Negotiator',livePayment:false,marketStatus:'not_registered'});
if(request.method==='GET'&&url.pathname==='/.well-known/agent-card.json')return json({name:'Agent Connection Negotiator',description:'Negotiate fees for potentially useful seller-agent introductions. Experimental; no live payment or verified seller directory yet.',url:url.origin+'/negotiate',version:'0.3',capabilities:{streaming:false,pushNotifications:false},skills:[{id:'negotiate-seller-agent-introduction',name:'Negotiate seller agent introduction',description:'Submit a price offer and receive acceptance or counteroffer before any payment.'}],commercial:{currency:'USDC',ask:MAX,floor:FLOOR,paymentEnabled:false}});
if(request.method==='GET'&&url.pathname==='/')return json({name:'Agent Connection Negotiator',offerEndpoint:url.origin+'/negotiate',discovery:url.origin+'/.well-known/agent-card.json',notice:'No money accepted; no seller connections delivered; experiment only.'});
if(request.method==='POST'&&url.pathname==='/negotiate'){
 if(Number(request.headers.get('content-length')||0)>8192)return json({error:'body_too_large'},413);
 let data;try{data=await request.json()}catch{return json({error:'invalid_json'},400)}
 let capability=typeof data.capability==='string'?data.capability.trim():'';let offer=parseAmount(data.offerUsdc), budget=data.buyerMaxUsdc===undefined?null:parseAmount(data.buyerMaxUsdc);
 if(!capability||capability.length>150||offer===null|| (budget===null&&data.buyerMaxUsdc!==undefined))return json({error:'invalid_request'},400);
 if(budget!==null&&offer>budget)return json({status:'rejected',reason:'offer_exceeds_buyer_budget',noCharge:true});
 if(budget!==null&&budget<FLOOR)return json({status:'rejected',reason:'budget_below_minimum',noCharge:true});
 const price=offer>=FLOOR?offer:FLOOR;
 return json({status:offer>=FLOOR?'accepted':'counteroffer',capability,offeredPriceUsdc:offer,quotedPriceUsdc:price,currency:'USDC',expirySeconds:120,payment:{available:false,reason:'Business receiving address and real settlement not configured'},sellerMatch:{available:false,reason:'No verified seller catalog configured'},noCharge:true,notice:'Agreement is nonbinding; no paid introduction available yet.'});
}
return json({error:'not_found'},404);
}};
