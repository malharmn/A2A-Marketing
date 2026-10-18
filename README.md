# A2A Negotiation Probe — Render free tier

Zero dependency Node server for deployment to Render Web Service.

- Build command: `npm install` (no third party dependencies)
- Start command: `npm start`
- Plan: `free` only
- GET `/health`, GET `/.well-known/agent-card.json`, POST `/negotiate`
- `npm test` for basic tests.

**Not a paid service:** No verified seller connections, payment processor, or third-party buyer. Do not claim it earns revenue. It performs only nonbinding price conversations. Never send confidential bank or wallet secrets to the repository.

**No state persistence**: this probe is deliberately stateless. The public internet endpoint could receive spam; it limits request size to 8KB. No personal data should be sent.
