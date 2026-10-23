/* ===== KONFIGURASI (ubah di sini) ===== */
const WHATSAPP_NUMBER = "6289509949994";
// Isi harga jika sudah tersedia, contoh: cuciSepatu: "Mulai Rp XX.000". Kosong = tampil "Tanyakan Harga".
// Ulasan asli dari Google Maps: salin nama, bintang, isi, dan waktunya apa adanya.
// Contoh: { name: "Nama Pelanggan", rating: 5, text: "Isi ulasan.", date: "2 bulan lalu" }
const TESTIMONIALS = [];
const PRICES = { cuciSepatu: "", semirSepatu: "", cuciTas: "" };

const root = document.documentElement;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowEnd = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
if (lowEnd) root.classList.add("lite");

const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
const numberReady = () => /^\d{8,15}$/.test(WHATSAPP_NUMBER);

/* Tautan WhatsApp */
document.querySelectorAll("[data-wa]").forEach((a) => (a.href = waLink(a.dataset.wa)));

/* Harga (opsional) */
document.querySelectorAll("[data-price]").forEach((el) => {
  const p = PRICES[el.dataset.price];
  if (p) { el.textContent = p; }
});

/* Tahun */
document.getElementById("year").textContent = new Date().getFullYear();

/* Opening: berjalan sekali per sesi, bisa dilewati */
const intro = document.getElementById("intro");
function endIntro() {
  root.classList.add("no-intro");
  try { sessionStorage.setItem("ccIntro", "1"); } catch (e) {}
  if (intro) intro.remove();
}
if (intro && !root.classList.contains("no-intro") && !reduced) {
  intro.addEventListener("animationend", (e) => { if (e.animationName === "introOut") endIntro(); });
  document.addEventListener("keydown", endIntro, { once: true });
  intro.addEventListener("click", endIntro);
  setTimeout(endIntro, 2400); // cadangan
} else if (intro) { intro.remove(); }

/* Navbar saat scroll + parallax ringan hero (desktop) + active link */
const nav = document.getElementById("nav");
const toTop = document.getElementById("toTop");
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
const heroImg = document.querySelector(".hero-img img");
const canParallax = !reduced && !lowEnd && window.matchMedia("(min-width: 992px)").matches;
let ticking = false;
function onScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 24);
  toTop.classList.toggle("show", window.scrollY > 600);
  if (canParallax && window.scrollY < 900) heroImg.style.transform = `translateY(${-window.scrollY * 0.05}px)`;
  ticking = false;
}
window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

const links = document.querySelectorAll(".nav-link");
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
["beranda", "layanan", "proses", "galeri", "lokasi"].forEach((id) => spy.observe(document.getElementById(id)));

/* Tutup menu mobile setelah klik link */
document.querySelectorAll("#menu a").forEach((a) => a.addEventListener("click", () => {
  const m = bootstrap.Collapse.getInstance(document.getElementById("menu"));
  if (m) m.hide();
}));

/* Ulasan Google Maps (dirender dari TESTIMONIALS) */
(function () {
  const box = document.getElementById("reviews");
  if (!box || !TESTIMONIALS.length) return;
  box.innerHTML = "";
  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement("figure");
    card.className = "review rv";
    card.style.setProperty("--d", i * 0.08 + "s");
    const stars = document.createElement("div");
    stars.className = "stars";
    const r = Math.max(1, Math.min(5, Math.round(t.rating || 5)));
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `Rating ${r} dari 5`);
    stars.innerHTML = '<i class="bi bi-star-fill"></i>'.repeat(r);
    const q = document.createElement("blockquote");
    q.textContent = t.text;
    const cap = document.createElement("figcaption");
    const av = document.createElement("span");
    av.className = "avatar";
    av.textContent = (t.name || "?").trim().charAt(0).toUpperCase();
    const who = document.createElement("span");
    who.className = "who";
    const nm = document.createElement("strong");
    nm.textContent = t.name;
    const meta = document.createElement("small");
    meta.textContent = (t.date ? t.date + " · " : "") + "Google Maps";
    who.append(nm, meta);
    cap.append(av, who);
    card.append(stars, q, cap);
    box.append(card);
  });
})();

/* Scroll reveal (IntersectionObserver, sekali jalan) */
const items = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window && !reduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  items.forEach((el) => io.observe(el));
} else { items.forEach((el) => el.classList.add("in")); }

/* Lightbox */
const lbEl = document.getElementById("lightbox");
const lb = new bootstrap.Modal(lbEl);
document.querySelectorAll(".g").forEach((b) => b.addEventListener("click", () => {
  const img = document.getElementById("lbImg");
  img.src = b.dataset.full; img.alt = b.dataset.alt;
  lb.show();
}));

/* Formulir booking */
const form = document.getElementById("bookingForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const note = document.getElementById("formNote");
  note.textContent = "";
  const fields = form.querySelectorAll("[required]");
  let ok = true;
  fields.forEach((f) => { const bad = !f.value.trim(); f.classList.toggle("is-invalid", bad); if (bad) ok = false; });
  if (!ok) { form.querySelector(".is-invalid").focus(); return; }
  if (!numberReady()) { note.textContent = "Nomor WhatsApp belum diatur di script.js (WHATSAPP_NUMBER)."; return; }
  const v = (id) => document.getElementById(id).value.trim();
  const msg = `Halo The Clean Club Tebet, saya ingin bertanya mengenai layanan perawatan.\n\nNama: ${v("bName")}\nLayanan: ${v("bService")}\nJenis barang: ${v("bItem")}\nCatatan: ${v("bNote")}\n\nMohon informasi harga dan proses pengerjaannya. Terima kasih.`;
  window.open(waLink(msg), "_blank", "noopener");
});
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
