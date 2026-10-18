# A2A buyer/seller discovery update

Replace **worker.js** in https://github.com/malharmn/A2A-Marketing with this file. The already-configured Render service deploys automatically from `main`.

No other files need to change. Existing server.js and package.json remain compatible.

The public agent now describes the actual classes of requests from buying and selling agents; it does **not** claim verified counterparties, payment capability, or completed introductions. It retains nonbinding POST /negotiate, GET /health, and a descriptive GET /.well-known/agent-card.json.

This is NOT yet a fully compliant A2A JSON-RPC server or a paid x402 endpoint. Do not list it as a live paid service until real matches and payment functionality exist.
