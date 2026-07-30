# AI-assisted Marketplace Risk Analysis

Christian Listings uses a provider-neutral, asynchronous trust-and-safety workflow. The initial provider is Gemini and the initial scope is public marketplace listing text only.

## Safety boundary

- The feature always runs in `SHADOW` mode.
- It never hides, removes, rejects, or changes a listing.
- It never warns, suspends, or bans an account.
- A human moderator remains responsible for every platform action.
- CVs, verification documents, private messages, member profiles, and authentication data are excluded.
- Listing text is treated as untrusted data; prompt instructions inside a listing are ignored.
- Results include evidence, model identity, confidence, and a human-review verdict for quality measurement.

## Runtime flow

1. Classifieds commits a marketplace listing create or edit.
2. A non-blocking internal request submits the public text snapshot to Admin.
3. Admin hashes and deduplicates the snapshot, stores a durable `ContentRiskAnalysis`, and adds a BullMQ job.
4. The worker calls Gemini with a structured JSON schema.
5. Admin stores the advisory score, level, explanation, signals, and recommended action.
6. Trust-and-safety staff review results at `/risk-signals`. Existing report cases also show analyses for the same listing.
7. Human feedback (`ACCURATE`, `FALSE_POSITIVE`, or `NEEDS_MORE_INFO`) is audited and does not change listing state.

Provider instructions are sent as a Gemini system instruction, while the listing snapshot is isolated as untrusted user data. Evidence excerpts are displayed only when they can be matched back to the submitted public listing text; invented or altered quotes are discarded.

Failed jobs use bounded exponential retries. After attempts are exhausted, a trust-and-safety administrator can use **Retry analysis** to replace the terminal BullMQ job safely. The retry is audited and remains advisory.

## Local activation

Keep analysis disabled unless Redis is running and the key is configured:

```dotenv
AI_RISK_ENABLED=true
AI_RISK_PROVIDER=gemini
GEMINI_API_KEY=<server-only-key>
GEMINI_MODEL=gemini-2.5-flash
```

Start classifieds, admin, worker, Redis, gateway and the admin frontend. Create or edit a marketplace listing, then inspect Admin → AI risk signals.

## Production activation

1. Restrict and store the Gemini key only in the Hetzner `.env` file.
2. Deploy with `AI_RISK_ENABLED=false` and verify Redis, Admin, Classifieds, and Worker health.
3. Set `AI_RISK_ENABLED=true` and recreate `classifieds`, `admin`, and `worker`.
4. Submit one controlled benign listing and one controlled test listing containing an obvious scam pattern.
5. Confirm both listings remain publicly unchanged and only advisory records appear in Admin.
6. Review signals and monitor latency, failures, cost, and false-positive rate before expanding scope.

Never enable automatic enforcement without a separately approved policy, measured shadow-mode quality, rollback controls, and explicit product sign-off.
