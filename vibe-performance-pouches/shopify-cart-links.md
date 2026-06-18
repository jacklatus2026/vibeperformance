# VIBE — Shopify cart & collection links

Store: **shop.vibeperformance.co.uk** (currency GBP)

Cart permalinks add the item(s) and take the shopper **straight to checkout**.
Format: `https://{shop}/cart/{variantId}:{qty}` — chain items with commas.
Swap the `.myshopify.com` host for your checkout domain once it's connected —
planned: `shop.vibeperformance.co.uk` (see DEPLOY.md). Marketing site lives at
`www.vibeperformance.co.uk`.

## Single SKU (one pouch tin → checkout)

| SKU | Price | Cart link |
|-----|-------|-----------|
| VIBE PRO (Intensity) | £19.99 | https://shop.vibeperformance.co.uk/cart/53287109394765:1 |
| VIBE ENDURE (Endurance) | £19.99 | https://shop.vibeperformance.co.uk/cart/53287109329229:1 |
| VIBE FOCUS (Deep Work) | £19.99 | https://shop.vibeperformance.co.uk/cart/53287108706637:1 |
| VIBE CALM (Recovery) | £19.99 | https://shop.vibeperformance.co.uk/cart/53287108641101:1 |

## Full stack

**VIBE Performance System Stack** (single bundle product · £59.99)
`https://shop.vibeperformance.co.uk/cart/53308633710925:1`

**Build-your-own — one of each** (4 line items in one checkout)
`https://shop.vibeperformance.co.uk/cart/53287109394765:1,53287109329229:1,53287108706637:1,53287108641101:1`

## Collections

- The VIBE Performance System: https://shop.vibeperformance.co.uk/collections/the-vibe-performance-system
- Stacks & Bundles: https://shop.vibeperformance.co.uk/collections/stacks-amp-bundles

## Product variant IDs (reference)

| SKU | Product ID | Variant ID |
|-----|-----------|-----------|
| VIBE PRO | 10517099151693 | 53287109394765 |
| VIBE ENDURE | 10517099086157 | 53287109329229 |
| VIBE FOCUS | 10517099020621 | 53287108706637 |
| VIBE CALM | 10517098955085 | 53287108641101 |
| System Stack (bundle) | 10522605125965 | 53308633710925 |

> Tip: append `?step=contact_information` to skip straight into checkout, or leave as-is to land on the cart. Quantities are after the colon (`:2` = two units).
