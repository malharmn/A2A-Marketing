/** Public buyer/seller discovery and nonbinding negotiation; no payment collection. */
const FLOOR = 0.001;
const headers = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*'};
const response = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
export default {async fetch(request) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null,{headers:{...headers,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}});
  if (request.method === 'GET' && url.pathname === '/health') return response({ok:true,paymentEnabled:false,verifiedMatches:0});
  if (request.method === 'GET' && url.pathname === '/.well-known/agent-card.json') return response({
    name:'Buyer and Seller Connection Discovery Probe',
    description:'For buying agents seeking products, suppliers, specialized API services, and selling agents offering inventory or capabilities. Experimental inquiry and nonbinding fee negotiation; no verified matches or payment collection yet.',
    url:url.origin+'/negotiate',version:'0.5',capabilities:{streaming:false,pushNotifications:false},
    skills:[
      {id:'find-products-suppliers-services',name:'Request products, suppliers or API services',description:'Declare product requirements, capabilities and price constraints to inquire about a future introduction.'},
      {id:'find-commercial-buyers',name:'Offer inventory or services to buyer agents',description:'Describe products, regions and supplier capabilities for potential discovery.'},
      {id:'negotiate-introduction',name:'Negotiate an introduction fee',description:'Submit a nonbinding offer; no payment or seller introduction is available yet.'}
    ], commercial:{currency:'USDC',paymentEnabled:false}
  });
  if (request.method === 'GET' && url.pathname === '/') return response({
    service:'Buyer and Seller Connection Discovery Probe',
    buyerIntentCategories:['products','specialized suppliers','agent tools and APIs','commercial services'],
    sellerIntentCategories:['qualified buyers','inventory','professional services','agent capabilities'],
    negotiateEndpoint:url.origin+'/negotiate',
    disclosure:'Experimental: no seller matches, paid transactions or ongoing request storage. Negotiation responses are nonbinding.'
  });
  if (request.method === 'POST' && url.pathname === '/negotiate') {
    const length = Number(request.headers.get('content-length') || 0);
    if(length > 8192) return response({error:'body_too_large'},413);
    let data; try { data = await request.json(); } catch { return response({error:'invalid_json'},400); }
    const capability = typeof data.capability === 'string' ? data.capability.trim() : '';
    const offer=data.offerUsdc, budget=data.buyerMaxUsdc;
    if (!capability || capability.length>150 || typeof offer!=='number' || !Number.isFinite(offer) || offer<0 || offer>1000 || (budget!==undefined && (typeof budget!=='number'|| !Number.isFinite(budget)||budget<0||budget>1000)))return response({error:'invalid_request'},400);
    if (budget!==undefined && (offer>budget || budget<FLOOR)) return response({status:'rejected',reason:'budget_constraint',noCharge:true,nonbinding:true});
    return response({status:offer>=FLOOR?'accepted':'counteroffer',capability,offeredPriceUsdc:offer,quotedPriceUsdc:Math.max(FLOOR,offer),currency:'USDC',nonbinding:true,noCharge:true,match:{available:false},payment:{available:false},notice:'No actual seller connections or payments are offered yet.'});
  }
  return response({error:'not_found'},404);
}};
