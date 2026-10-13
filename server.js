// ListingLift — local-first listing writer for resellers, powered by a local
// open-weight vision model (Gemma via Ollama). No photos or product data ever
// leave the seller's machine.
const express = require("express");
const multer = require("multer");
const path = require("path");

const PORT = process.env.PORT || 4100;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "gemma4:e4b";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const SYSTEM_PROMPT = `You are ListingLift, an assistant that writes resale marketplace listings
(Etsy, eBay, Depop, Facebook Marketplace) from a single product photo.

Respond with ONLY valid JSON, no markdown fences, matching exactly this shape:
{
  "title": "string, <= 80 chars, keyword-rich",
  "description": "string, 2-4 short paragraphs, plain text, persuasive but honest",
  "tags": ["array", "of", "8-13", "lowercase", "search", "tags"],
  "suggestedPriceRange": "string like \\"$18 - $26\\"",
  "conditionNotes": "string, 1-2 sentences describing visible condition/wear",
  "platformTips": "string, 1-2 sentences of platform-specific advice for the chosen platform"
}`;

app.post("/api/generate-listing", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo uploaded." });

    const { category = "", platform = "Etsy", keywords = "", notes = "" } = req.body;
    const imageB64 = req.file.buffer.toString("base64");

    const userPrompt = `Platform: ${platform}
Category: ${category || "unspecified — infer from the photo"}
Seller notes: ${notes || "none"}
Seller keywords to weave in naturally: ${keywords || "none"}

Write the listing JSON for this product photo.`;

    const ollamaResp = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt, images: [imageB64] },
        ],
        options: { temperature: 0.6 },
      }),
    });

    if (!ollamaResp.ok) {
      const text = await ollamaResp.text();
      return res.status(502).json({ error: `Ollama error: ${text.slice(0, 300)}` });
    }

    const data = await ollamaResp.json();
    const raw = data.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: "Model did not return JSON.", raw });
    }

    let listing;
    try {
      listing = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(502).json({ error: "Could not parse model JSON.", raw });
    }

    res.json({ listing, model: MODEL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    const ok = r.ok;
    res.json({ ok, model: MODEL });
  } catch {
    res.json({ ok: false, model: MODEL });
  }
});

app.listen(PORT, () => {
  console.log(`ListingLift running at http://localhost:${PORT}`);
  console.log(`Using local model "${MODEL}" via Ollama at ${OLLAMA_URL}`);
});
