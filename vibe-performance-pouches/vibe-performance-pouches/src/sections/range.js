import { PRODUCTS } from "../products.js";

const stim = (p) =>
  p.stimulant === "0mg" ? "Caffeine-free" : `${p.stimulant} ${p.stimulantLabel}`;

const subPrice = (p) =>
  "£" + (Number(p.price.replace(/[^0-9.]/g, "")) * 0.85).toFixed(2);

// Renders the "range" highlight cards + compare columns, plus a global
// One-time / Subscribe price toggle. onSelect(i) switches the hero tin.
export function setupRange(onSelect) {
  let mode = "one"; // "one" | "sub"
  const priceEls = []; // { el, p, kind }

  function renderPrices() {
    priceEls.forEach(({ el, p, kind }) => {
      if (kind === "card") {
        el.innerHTML =
          mode === "sub"
            ? `${subPrice(p)} <small>· every 4 weeks · cancel anytime</small>`
            : `${p.price} <small>· or subscribe &amp; save 15%</small>`;
      } else {
        el.textContent = mode === "sub" ? `${subPrice(p)} /4wks` : p.price;
      }
    });
  }

  const grid = document.getElementById("range-grid");
  if (grid) {
    PRODUCTS.forEach((p, i) => {
      const card = document.createElement("button");
      card.className = "sku-card";
      card.setAttribute("data-reveal", "");
      card.style.setProperty("--c", p.glow);
      card.innerHTML = `
        <span class="sku-dot"></span>
        <span class="sku-pos">${p.positioning}</span>
        <h3 class="sku-name">VIBE ${p.name}</h3>
        <p class="sku-blurb">${p.blurb}</p>
        <span class="sku-stim">${stim(p)}</span>
        <span class="sku-price"></span>
        <span class="sku-cta">Select</span>`;
      card.addEventListener("click", () => onSelect(i));
      grid.appendChild(card);
      priceEls.push({ el: card.querySelector(".sku-price"), p, kind: "card" });
    });
  }

  // price toggle in the range band header
  const head = document.querySelector("#range .band-head");
  if (head) {
    const tog = document.createElement("div");
    tog.className = "price-toggle";
    tog.setAttribute("role", "group");
    tog.setAttribute("aria-label", "Purchase option");
    tog.innerHTML = `
      <button class="pt active" data-mode="one">One-time</button>
      <button class="pt" data-mode="sub">Subscribe &middot; save 15%</button>`;
    head.appendChild(tog);
    tog.addEventListener("click", (e) => {
      const b = e.target.closest(".pt");
      if (!b) return;
      mode = b.dataset.mode;
      tog.querySelectorAll(".pt").forEach((x) => x.classList.toggle("active", x === b));
      renderPrices();
    });
  }

  const cmp = document.getElementById("compare-grid");
  if (cmp) {
    PRODUCTS.forEach((p, i) => {
      const col = document.createElement("button");
      col.className = "cmp-col";
      col.setAttribute("data-reveal", "");
      col.style.setProperty("--c", p.glow);
      col.innerHTML = `
        <span class="cmp-dot"></span>
        <h4>VIBE ${p.name}</h4>
        <span class="cmp-pos">${p.positioning}</span>
        <dl>
          <div><dt>Stimulant</dt><dd>${stim(p)}</dd></div>
          <div><dt>Payload</dt><dd>${p.payload}</dd></div>
          <div><dt>Wear time</dt><dd>${p.wear}</dd></div>
          <div><dt>Price</dt><dd class="cmp-price"></dd></div>
        </dl>
        <span class="cmp-cta">Select · subscribe &amp; save</span>`;
      col.addEventListener("click", () => onSelect(i));
      cmp.appendChild(col);
      priceEls.push({ el: col.querySelector(".cmp-price"), p, kind: "cmp" });
    });
  }

  renderPrices();
}
