const dropzone = document.getElementById("dropzone");
const photoInput = document.getElementById("photo");
const dropzoneLabel = document.getElementById("dropzone-label");
const preview = document.getElementById("preview");
const form = document.getElementById("listing-form");
const generateBtn = document.getElementById("generate-btn");
const emptyState = document.getElementById("empty-state");
const loading = document.getElementById("loading");
const resultEl = document.getElementById("result");
const errorEl = document.getElementById("error");
const healthBadge = document.getElementById("health-badge");

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.hidden = false;
  dropzoneLabel.hidden = true;
});

dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    photoInput.files = e.dataTransfer.files;
    photoInput.dispatchEvent(new Event("change"));
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = photoInput.files[0];
  if (!file) return;

  emptyState.hidden = true;
  errorEl.hidden = true;
  resultEl.hidden = true;
  loading.hidden = false;
  generateBtn.disabled = true;

  const fd = new FormData();
  fd.append("photo", file);
  fd.append("platform", document.getElementById("platform").value);
  fd.append("category", document.getElementById("category").value);
  fd.append("keywords", document.getElementById("keywords").value);
  fd.append("notes", document.getElementById("notes").value);

  try {
    const resp = await fetch("/api/generate-listing", { method: "POST", body: fd });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || "Generation failed.");
    renderListing(data.listing, document.getElementById("platform").value);
  } catch (err) {
    errorEl.textContent = `⚠️ ${err.message}`;
    errorEl.hidden = false;
  } finally {
    loading.hidden = true;
    generateBtn.disabled = false;
  }
});

function renderListing(listing, platform) {
  document.getElementById("out-title").textContent = listing.title || "";
  document.getElementById("out-description").textContent = listing.description || "";
  document.getElementById("out-price").textContent = listing.suggestedPriceRange || "—";
  document.getElementById("out-condition").textContent = listing.conditionNotes || "—";
  document.getElementById("out-platform-name").textContent = platform;
  document.getElementById("out-tips").textContent = listing.platformTips || "—";

  const tagsEl = document.getElementById("out-tags");
  tagsEl.innerHTML = "";
  (listing.tags || []).forEach((t) => {
    const span = document.createElement("span");
    span.textContent = t;
    tagsEl.appendChild(span);
  });

  resultEl.hidden = false;
}

document.querySelectorAll("button.copy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    const text = target.tagName === "DIV" ? [...target.children].map((c) => c.textContent).join(", ") : target.textContent;
    navigator.clipboard.writeText(text);
    const old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = old), 1200);
  });
});

async function checkHealth() {
  try {
    const resp = await fetch("/api/health");
    const data = await resp.json();
    if (data.ok) {
      healthBadge.textContent = `🟢 ${data.model} ready`;
      healthBadge.className = "badge badge-ok";
    } else {
      healthBadge.textContent = "🔴 Ollama not reachable";
      healthBadge.className = "badge badge-bad";
    }
  } catch {
    healthBadge.textContent = "🔴 Ollama not reachable";
    healthBadge.className = "badge badge-bad";
  }
}
checkHealth();
