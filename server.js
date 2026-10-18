import http from 'node:http';
import worker from './worker.js';

const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
  try {
    const parts=[]; let count=0;
    for await (const part of req) {
      count += part.length;
      if (count > 8192) { res.writeHead(413, {'content-type':'application/json'}); res.end(JSON.stringify({error:'body_too_large'})); return; }
      parts.push(part);
    }
    const url = `https://${req.headers.host || 'localhost' }${req.url}`;
    const options = {method:req.method,headers:req.headers};
    if(!['GET','HEAD'].includes(req.method)) options.body=Buffer.concat(parts);
    const response = await worker.fetch(new Request(url,options),{});
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500,{'content-type':'application/json'});
    res.end(JSON.stringify({error:'internal_error'}));
  }
});
server.listen(port,'0.0.0.0',()=>console.log(`A2A probe on ${port}`));
