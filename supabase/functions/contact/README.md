# Portfolio contact

Public POST endpoint: `/functions/v1/contact`. Deploy with JWT verification off: visitors do not sign in.

Server-only secrets: `RESEND_API_KEY` (sending-only, restricted domain), `CONTACT_FROM`, `CONTACT_TO`. The Supabase service-role key and URL are injected by the Edge runtime. Never place these secrets in Vite variables or source control.

Apply `supabase/contact-rate-limit.sql` before deployment. The counters permit three attempts per IP/email each UTC hour and fifty total each UTC day. Identifiers are salted hashes that rotate daily; no message bodies are stored in this table. RLS intentionally has no public policies; only service_role can execute the rate-limit RPC. Expired counters are removed on the next request.

Only configured portfolio origins are accepted. The recipient and subject are fixed server-side; the submitted address is Reply-To. Resend idempotency keys prevent retries of an unchanged draft from duplicating delivery. Honeypot and size checks reject invalid requests. Email-service errors never return success or expose provider details.

Frontend: `src/contact.js` and `src/contact.css`. `VITE_CONTACT_ENDPOINT` can override the public endpoint for testing; it is not a secret. Validate delivery in Resend before publishing UI changes.
