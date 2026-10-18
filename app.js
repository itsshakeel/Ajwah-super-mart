/* ============ Ajwah Super Mart — app ============ */

const PRODUCTS = [
  { id: 1,  name: "Fresh Cow Milk",        unit: "1 litre",      price: 190,  cat: "dairy",     img: "images/cat-dairy.webp",    tag: "Dairy" },
  { id: 2,  name: "Farm Fresh Eggs",       unit: "dozen",        price: 340,  cat: "dairy",     img: "images/cat-dairy.webp",    tag: "Dairy" },
  { id: 3,  name: "Ripe Red Tomatoes",     unit: "1 kg",         price: 120,  cat: "produce",   img: "images/cat-produce.webp",  tag: "Produce" },
  { id: 4,  name: "Sweet Bananas",         unit: "dozen",        price: 180,  cat: "produce",   img: "images/cat-produce.webp",  tag: "Produce" },
  { id: 5,  name: "Soft White Bread",      unit: "large loaf",   price: 140,  cat: "bakery",    img: "images/cat-bakery.webp",   tag: "Bakery" },
  { id: 6,  name: "Butter Croissants",     unit: "pack of 4",    price: 220,  cat: "bakery",    img: "images/cat-bakery.webp",   tag: "Bakery" },
  { id: 7,  name: "Fresh Orange Juice",    unit: "1 litre",      price: 260,  cat: "beverages", img: "images/cat-beverages.webp",tag: "Beverages" },
  { id: 8,  name: "Mineral Water",         unit: "1.5L × 6 pack",price: 420,  cat: "beverages", img: "images/cat-beverages.webp",tag: "Beverages" },
  { id: 9,  name: "Whole Wheat Flour",     unit: "5 kg bag",     price: 720,  cat: "pantry",    img: "images/cat-snacks.webp",   tag: "Pantry" },
  { id: 10, name: "Premium Basmati Rice",  unit: "5 kg bag",     price: 1850, cat: "pantry",    img: "images/cat-snacks.webp",   tag: "Pantry" },
  { id: 11, name: "Crispy Potato Chips",   unit: "pack of 6",    price: 300,  cat: "pantry",    img: "images/cat-snacks.webp",   tag: "Pantry" },
  { id: 12, name: "Laundry Detergent",     unit: "1 kg pack",    price: 480,  cat: "household", img: "images/cat-household.webp",tag: "Household" },
];

const grid       = document.getElementById("productGrid");
const searchBox  = document.getElementById("productSearch");
const chips      = document.getElementById("filterChips");
let activeFilter = "all";

function fmt(n){ return "Rs " + n.toLocaleString("en-PK"); }

function renderProducts(){
  const q = searchBox.value.trim().toLowerCase();
  const list = PRODUCTS.filter(p =>
    (activeFilter === "all" || p.cat === activeFilter) &&
    (q === "" || (p.name + " " + p.unit + " " + p.tag).toLowerCase().includes(q))
  );
  if(!list.length){
    grid.innerHTML = '<div class="empty-state">No products found — try another search.</div>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <span class="product-tag">${p.tag}</span>
      </div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <span class="product-unit">${p.unit}</span>
        <div class="product-row">
          <span class="price">${fmt(p.price)}<span class="sample-pill">SAMPLE</span></span>
          <button class="add-btn" data-add="${p.id}">Add</button>
        </div>
      </div>
    </article>`).join("");
}
renderProducts();

searchBox.addEventListener("input", renderProducts);
chips.addEventListener("click", e => {
  const b = e.target.closest(".fchip");
  if(!b) return;
  chips.querySelectorAll(".fchip").forEach(c => c.classList.remove("active"));
  b.classList.add("active");
  activeFilter = b.dataset.filter;
  renderProducts();
});
// Category cards jump to filtered products
document.querySelectorAll(".cat-card").forEach(card => {
  card.addEventListener("click", () => {
    const cat = card.dataset.cat;
    const chip = chips.querySelector(`[data-filter="${cat}"]`);
    if(chip) chip.click();
  });
});

/* ---------- Cart ---------- */
const cart = new Map(); // id -> qty
const drawer   = document.getElementById("cartDrawer");
const overlay  = document.getElementById("cartOverlay");
const itemsEl  = document.getElementById("cartItems");
const countEl  = document.getElementById("cartCount");
const headCount= document.getElementById("cartHeadCount");
const totalEl  = document.getElementById("cartTotal");
const toast    = document.getElementById("toast");
let toastTimer;

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
function cartQty(){ let n = 0; cart.forEach(q => n += q); return n; }
function cartTotal(){ let t = 0; cart.forEach((q,id) => t += PRODUCTS.find(p=>p.id===id).price * q); return t; }

function renderCart(){
  const n = cartQty();
  countEl.textContent = n;
  headCount.textContent = `(${n})`;
  totalEl.textContent = fmt(cartTotal());
  if(!cart.size){
    itemsEl.innerHTML = '<div class="cart-empty"><span class="big">🧺</span>Your basket is empty.<br>Add some fresh picks!</div>';
    return;
  }
  itemsEl.innerHTML = [...cart.entries()].map(([id,qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    return `
    <div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-item-info">
        <strong>${p.name}</strong>
        <small>${fmt(p.price)} × ${qty} = ${fmt(p.price*qty)}</small>
      </div>
      <div class="qty">
        <button data-dec="${id}" aria-label="Decrease">−</button>
        <span>${qty}</span>
        <button data-inc="${id}" aria-label="Increase">+</button>
      </div>
    </div>`;
  }).join("");
}
renderCart();

function openCart(){ drawer.classList.add("open"); overlay.classList.add("show"); document.body.style.overflow = "hidden"; }
function closeCart(){ drawer.classList.remove("open"); overlay.classList.remove("show"); document.body.style.overflow = ""; }
document.getElementById("cartOpen").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

grid.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if(!btn) return;
  const id = +btn.dataset.add;
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  btn.classList.add("added"); btn.textContent = "Added ✓";
  setTimeout(() => { btn.classList.remove("added"); btn.textContent = "Add"; }, 1200);
  showToast("Added to basket ✓");
});

itemsEl.addEventListener("click", e => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  if(inc){ const id = +inc.dataset.inc; cart.set(id, cart.get(id) + 1); }
  if(dec){ const id = +dec.dataset.dec; const q = cart.get(id) - 1; q <= 0 ? cart.delete(id) : cart.set(id, q); }
  renderCart();
});

document.getElementById("clearCart").addEventListener("click", () => { cart.clear(); renderCart(); });

document.getElementById("whatsappOrder").addEventListener("click", () => {
  if(!cart.size){ showToast("Your basket is empty"); return; }
  const lines = [...cart.entries()].map(([id,qty]) => {
    const p = PRODUCTS.find(p => p.id === id);
    return `• ${p.name} (${p.unit}) × ${qty} = Rs ${(p.price*qty).toLocaleString("en-PK")}`;
  });
  const msg = `Assalam-o-Alaikum! I would like to order from Ajwah Super Mart:\n\n${lines.join("\n")}\n\nTotal (sample prices): Rs ${cartTotal().toLocaleString("en-PK")}\n\nName:\nAddress:`;
  window.open("https://wa.me/923000000000?text=" + encodeURIComponent(msg), "_blank");
});

/* ---------- Header / nav / reveal ---------- */
const header = document.getElementById("siteHeader");
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 10), { passive: true });

const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if(en.isIntersecting){ en.target.classList.add("visible"); io.unobserve(en.target); } });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
