# Revenue hypothesis test — free website/API audit
Drop-in update: upload **audit.js**, **worker.js**, and **audit.test.js** to the existing GitHub repository root. Preserve server.js and package.json.

The existing Render service is connected to the main branch. Once deployed, visit:
`https://a2a-negotiation-probe.onrender.com/audit?url=https%3A%2F%2Fexample.com`

This version **does not take payments**. It proves that a public user/agent can receive a useful structured report with no metered AI spend. The endpoint uses HTTPS HEAD only, DNS public-address checks, pinned IPv4 lookup, no redirects, 5-second timeout, and reports header-based signals only.

**Commercial gate:** track qualified third-party requests to `/audit`, obtain a real willingness-to-pay signal, configure a user-controlled receiving wallet through a validated x402 payment flow, then register a genuinely paid endpoint. No test request counts as earnings. Avoid using it as a vulnerability scanner.
