# Legal content (source of truth)

On-site policy pages are served at `/legal/terms`, `/legal/privacy`, and `/legal/refund`.

## Adding or updating policies

1. Drop client `.docx` files in this folder (same names as below).
2. Run from `web/`: `npm run import:legal-docx`
3. Review generated `terms.md`, `privacy.md`, `refund.md`, then deploy.

| DOCX | Generated page |
|------|----------------|
| `Whobrey_Studios_Terms_of_Service.docx` | `/legal/terms` |
| `Whobrey_Studios_Privacy_Policy.docx` | `/legal/privacy` |
| `Whobrey_Studios_Refund_and_Cancellation_Policy.docx` | `/legal/refund` |

`Whobrey_Studios_Website_Legal_Policies_Packet.docx` is reference only (not imported).

Optional: **Admin → Policies** external URL fields still work as overrides that redirect away from the portal (use only for hosted PDFs on the main marketing site).

## Do not

- Link production clients to OneDrive sharing URLs (auth walls, link rot).
- Auto-scrape URLs — content must be committed or pasted here intentionally.
