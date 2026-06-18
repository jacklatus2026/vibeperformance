# Deploying VIBE to www.vibeperformance.co.uk

## The setup (two hosts, one brand)

Because the 3D site is hosted **separately** from Shopify, two hostnames are involved:

| Hostname | Serves | Where it's hosted |
|----------|--------|-------------------|
| `www.vibeperformance.co.uk` | the 3D marketing site (this folder) | a static host (Vercel / Netlify / Cloudflare Pages) |
| `shop.vibeperformance.co.uk` *(recommended)* | cart + checkout | Shopify (`vibe-performance-2.myshopify.com`) |

You can't point `www` at both, so checkout lives on the `shop.` subdomain. (You could instead keep checkout on `vibe-performance-2.myshopify.com` — then skip step 3 and leave the code as-is.)

---

## Step 1 — Deploy the site

This folder is fully static (HTML/CSS/JS + CDN libraries + images). Any of these work:

- **Vercel:** `vercel deploy` in this folder, or drag-and-drop the folder at vercel.com/new.
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **Cloudflare Pages:** create a project and upload the folder.

No build step is required — it's served as-is. Confirm the deploy URL works (e.g. `vibe-xxxx.vercel.app`).

## Step 2 — Point `www.vibeperformance.co.uk` at the host

In your domain registrar's DNS:
- Add the record the host tells you to (typically a **CNAME** for `www` → the host's target, e.g. `cname.vercel-dns.com`), then add the domain in the host's dashboard so it issues the SSL certificate.
- Set the apex `vibeperformance.co.uk` to redirect to `www` (most hosts do this automatically once the domain is added).

## Step 3 — (recommended) Connect `shop.vibeperformance.co.uk` to Shopify

1. Shopify admin → **Settings → Domains → Connect existing domain**.
2. Enter `shop.vibeperformance.co.uk`.
3. In your registrar, add a **CNAME** `shop` → `shops.myshopify.com`.
4. Wait for Shopify to verify + issue SSL.
5. Then make the one-line code change below so all Buy links use the new checkout host.

### The single switch (do this only AFTER step 3 verifies)

In `src/main.js`:
```js
const SHOP = "shop.vibeperformance.co.uk";   // was: vibe-performance-2.myshopify.com
```
That one constant drives every cart link, the collection link, and the full-system link. Also update the host in `shopify-cart-links.md` if you use those links elsewhere.

> ⚠️ Don't change `SHOP` before the subdomain is verified in Shopify — the Buy buttons would 404 until DNS + SSL are live. Until then it correctly points at `vibe-performance-2.myshopify.com`, which works today.

---

## GoDaddy DNS — exact records

Domain is registered at **GoDaddy**. Manage these in: GoDaddy → **My Products → Domains → vibeperformance.co.uk → DNS / Manage DNS**.

> GoDaddy does **not** allow a CNAME on the root/apex (`@`). So the apex uses an **A record**, and `www` + `shop` use **CNAMEs**. Delete GoDaddy's default "Parked" `A @` record and the default `CNAME www → @` first, then add the rows below.

### If hosting the site on **Vercel** (recommended for static)
First add both `vibeperformance.co.uk` and `www.vibeperformance.co.uk` as domains in the Vercel project, then set in GoDaddy:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `216.198.79.1` | 600 |
| CNAME | `www` | `cname.vercel-dns.com` | 600 |
| CNAME | `shop` | `shops.myshopify.com` | 600 |

> **Delete any existing `A @` record first.** If the root currently has `A @ → 23.227.38.32` (a Shopify IP) or `A @ → 76.76.21.21` (Vercel's older IP), remove it and use `216.198.79.1` — Vercel's current apex IP. Vercel's Domains page always shows the exact value to use; match that. After updating, click **Refresh** on the Vercel Domains page; "Invalid Configuration" clears once DNS propagates.

Vercel then auto-issues SSL and redirects apex ↔ www. (Netlify equivalent: apex `A @ 75.2.60.5`, `CNAME www → <your-site>.netlify.app`. Cloudflare Pages: move the domain's nameservers to Cloudflare and add the domain in Pages.)

### Apex → www (alternative to the A record)
If you'd rather not manage the apex A record, use GoDaddy **Domain Settings → Forwarding → Forward domain**: `vibeperformance.co.uk` → `https://www.vibeperformance.co.uk` (301, forward only). Keep the `www` and `shop` CNAMEs above.

### The `shop` CNAME is for Shopify checkout (step 3)
After adding `CNAME shop → shops.myshopify.com`, go to Shopify → Settings → Domains → Connect existing domain → `shop.vibeperformance.co.uk` and let it verify + issue SSL. Then do the one-line `SHOP` switch above.

DNS changes on GoDaddy usually apply within minutes but can take up to a few hours.

## After go-live checklist
- [ ] Site loads at `https://www.vibeperformance.co.uk`
- [ ] "Add to bag" → reaches Shopify checkout with the right SKU
- [ ] "Try the full system" → 4-item checkout
- [ ] "Shop all on the store" → the collection
- [ ] (if step 3 done) `SHOP` updated + links re-tested
