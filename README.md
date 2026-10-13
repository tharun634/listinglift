# ListingLift 🛍️⬆️

**A local-first listing writer for resellers — built for the [Hacktoberfest Open-Source AI Challenge: Week 2 "Side Hustle"](https://dev.to/challenges/hf26).**

Snap one photo of whatever you're reselling (Etsy, eBay, Depop, Facebook
Marketplace…) and get a ready-to-paste **title, description, tags, price
range, condition notes, and a platform-specific tip** — generated entirely by
a local, open-weight vision model running on your own machine via
[Ollama](https://ollama.com).

No photo, no product, no sales data ever touches a cloud API.

## Why this is a side hustle people would pay for

Resellers list dozens of items a week. Writing a good title + SEO tags + a
description that doesn't sound like spam takes real time, and most
"AI listing writer" tools are subscriptions that upload your product photos
to someone else's servers and charge per listing.

ListingLift runs **Gemma (`gemma4:e4b`, multimodal, via Ollama)** fully
on-device:

- **Zero marginal cost per listing** — no OpenAI/Claude API bill, so it scales
  for free as a seller lists more items. That's the actual "side hustle"
  pitch: a one-time/local tool instead of a recurring per-listing fee.
- **Private by default** — unreleased inventory, home photos, and brand
  details never leave the seller's laptop, which matters a lot to people
  reselling for a living out of their house.
- **Works offline** — useful at estate sales, thrift stores, or storage units
  with no signal.

## Tech

- **Node.js + Express** backend, **vanilla HTML/CSS/JS** frontend (no build
  step, fast to run anywhere).
- **Ollama** local inference server, model: `gemma4:e4b` (Gemma, open-weight,
  multimodal — vision + text).
- The photo is sent to the model as part of a chat completion; the model
  returns structured JSON that renders straight into the UI.

## Running it locally

Prerequisites: [Node.js](https://nodejs.org) 18+, [Ollama](https://ollama.com)
with a vision-capable model pulled:

```bash
ollama pull gemma4:e4b
```

Then:

```bash
npm install
npm start
```

Open http://localhost:4100, upload a product photo, pick a platform, and hit
**Generate Listing**.

## Demo

See [`demo/demo.gif`](demo/demo.gif) for a walkthrough: upload → generate →
copy-ready listing.

## Challenge details

- Challenge: Hacktoberfest Open-Source AI Challenge: Week 2 — "Side Hustle"
- Tag: `#hf26challenge`
- Open-source AI used: [Ollama](https://ollama.com) running the open-weight
  **Gemma** model locally (entering the **Best Use of Gemma** category).

## License

MIT
