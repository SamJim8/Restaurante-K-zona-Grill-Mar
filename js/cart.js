/**
 * Shopping cart (full menu) and menu accordion.
 * Depends on menu.js (addToCart and table already rendered).
 * Accordion: first category open by default; headers keyboard-accessible (Enter/Space), aria-expanded.
 */
const accordions = document.querySelectorAll(".accordion");

function getCategoryRows(accordion) {
  const rows = [];
  let row = accordion.parentElement.nextElementSibling;
  while (row && !row.querySelector(".accordion")) {
    rows.push(row);
    row = row.nextElementSibling;
  }
  return rows;
}

function setAccordionExpanded(accordion, expanded) {
  const rows = getCategoryRows(accordion);
  const display = expanded ? "table-row" : "none";
  rows.forEach((r) => { r.style.display = display; });
  accordion.setAttribute("aria-expanded", String(expanded));
  accordion.classList.toggle("expanded", expanded);
}

function applyAccordionInitialState() {
  accordions.forEach((accordion, index) => {
    setAccordionExpanded(accordion, index === 0);
  });
}

function updateTableMenuBackgroundMode() {
  const section = document.getElementById("ourmenu");
  const card = document.querySelector(".table-menu .style-card");
  if (!section || !card) return;

  const viewportHeight = window.innerHeight;
  const contentHeight = card.scrollHeight;

  if (contentHeight > viewportHeight) {
    section.classList.add("table-menu--tall");
  } else {
    section.classList.remove("table-menu--tall");
  }
}

accordions.forEach((accordion) => {
  accordion.addEventListener("click", () => {
    const expanded = accordion.getAttribute("aria-expanded") !== "true";
    setAccordionExpanded(accordion, expanded);
    requestAnimationFrame(updateTableMenuBackgroundMode);
  });

  accordion.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    const expanded = accordion.getAttribute("aria-expanded") !== "true";
    setAccordionExpanded(accordion, expanded);
    requestAnimationFrame(updateTableMenuBackgroundMode);
  });
});

applyAccordionInitialState();

function scheduleUpdateTableMenuBackground() {
  requestAnimationFrame(updateTableMenuBackgroundMode);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scheduleUpdateTableMenuBackground);
} else {
  scheduleUpdateTableMenuBackground();
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(scheduleUpdateTableMenuBackground, 150);
});

const openCartModal = () => {
  const modal = document.getElementById("shopping-modal");
  if (modal) {
    modal.classList.add("active");
    document.body.classList.add("open-cart");
  }
};

const closeCartModal = () => {
  const modal = document.getElementById("shopping-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.classList.remove("open-cart");
  }
};

const closeCartWithConfirmation = () => {
  const items = document.querySelectorAll("#cart-items li");
  if (items.length === 0) return closeCartModal();
  if (confirm("¿Deseas vaciar el carrito?")) {
    items.forEach((item) => item.remove());
    closeCartModal();
  }
};

const closeCartBtn = document.getElementById("close-cart-btn");
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartWithConfirmation);

const DISPOSABLE_PRICE_PER_PLATE = 0.5;

const updateTotal = () => {
  const items = document.querySelectorAll("#cart-items li");
  let subtotal = 0;
  let totalPlates = 0;

  items.forEach(item => {
    const price = parseFloat(item.querySelector(".price").dataset.price);
    const quantity = parseInt(item.querySelector(".quantity").textContent, 10);
    subtotal += price * quantity;
    totalPlates += quantity;
  });

  const takeawayCheckbox = document.getElementById("cart-takeaway");
  const disposablesLine = document.getElementById("cart-disposables-line");
  const isTakeaway = takeawayCheckbox && takeawayCheckbox.checked;

  let total = subtotal;
  if (isTakeaway && totalPlates > 0) {
    const disposablesAmount = totalPlates * DISPOSABLE_PRICE_PER_PLATE;
    total += disposablesAmount;
    disposablesLine.textContent = `Desechables (${totalPlates} plato${totalPlates !== 1 ? "s" : ""}): $${disposablesAmount.toFixed(2)}`;
  } else {
    disposablesLine.textContent = "";
  }

  document.getElementById("cart-total").textContent = total.toFixed(2);
};

const cartTakeawayCheckbox = document.getElementById("cart-takeaway");
if (cartTakeawayCheckbox) {
  cartTakeawayCheckbox.addEventListener("change", updateTotal);
}

const createList = (product, price) => {
  const cartItems = document.getElementById("cart-items");
  const li = document.createElement("li");
  let quantity = 1;

  li.innerHTML = `
  <span class="product">${product}</span>

  <div class="diary-qty-wrap">
      <button type="button" class="diary-qty-btn btn-less" aria-label="Reducir cantidad">−</button>
      <span class="quantity diary-qty-value">${quantity}</span>
      <button type="button" class="diary-qty-btn btn-add" aria-label="Aumentar cantidad">+</button>
  </div>

  <span class="price" data-price="${price}">$${price.toFixed(2)}</span>
`;


  const quantitySpan = li.querySelector(".quantity");

  li.querySelector(".btn-add").addEventListener("click", () => {
    quantity++;
    quantitySpan.textContent = quantity;
    updateTotal();
  });

  li.querySelector(".btn-less").addEventListener("click", () => {
    quantity--;
    if (quantity <= 0) {
      li.remove();
      if (!document.querySelector("#cart-items li")) closeCartModal();
    } else {
      quantitySpan.textContent = quantity;
    }
    updateTotal();
  });

  cartItems.appendChild(li);
  updateTotal();
};

function openCartAndAddItem(product, price) {
  openCartModal();
  createList(product, price);
}

function addToCart(button) {
  const row = button.closest("tr");
  if (!row) return;
  let product = row.querySelector('th[scope="row"]')?.textContent?.trim();
  const priceEl = row.querySelector(".td-price p");
  const price = priceEl ? parseFloat(priceEl.dataset.price) : 0;
  const tbody = row.closest("tbody");
  if (tbody && tbody.id === "menu-al-grill" && sessionStorage.getItem("asadoPromo")) {
    product = "Asados PROMO";
    sessionStorage.removeItem("asadoPromo");
  }
  if (product && !Number.isNaN(price)) openCartAndAddItem(product, price);
}

const sendOrderBtn = document.getElementById("send-order");
if (sendOrderBtn) {
  sendOrderBtn.addEventListener("click", () => {
    const nameInput = document.getElementById("customer-name");
    const items = document.querySelectorAll("#cart-items li");

    if (!items.length) return alert("No hay productos en el carrito");
    if (!nameInput || nameInput.value.trim() === "")
      return alert("Por favor ingresa tu nombre para enviar el pedido");

    const cartData = [...items].map((item) => ({
      name: item.querySelector(".product").textContent,
      price: parseFloat(item.querySelector(".price").dataset.price),
      quantity: parseInt(item.querySelector(".quantity").textContent, 10),
    }));

    const takeawayCheckbox = document.getElementById("cart-takeaway");
    const isTakeaway = takeawayCheckbox && takeawayCheckbox.checked;
    const totalPlates = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const disposablesAmount = isTakeaway ? totalPlates * DISPOSABLE_PRICE_PER_PLATE : 0;
    const subtotal = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + disposablesAmount;

    let message = `Hola! Soy ${nameInput.value.trim()}. Quiero pedir:\n`;
    cartData.forEach((item) => {
      message += `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    if (isTakeaway && totalPlates > 0) {
      message += `\nPara llevar. Desechables (${totalPlates} plato${totalPlates !== 1 ? "s" : ""}): $${disposablesAmount.toFixed(2)}\n`;
    }
    message += `\nTotal: $${total.toFixed(2)}`;

    const url = `https://wa.me/593979495354?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });
}

document.querySelectorAll(".promo-add-to-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-promo-name");
    const price = parseFloat(btn.getAttribute("data-promo-price"), 10);
    if (name && !Number.isNaN(price)) openCartAndAddItem(name, price);
  });
});

function scrollToAsadosAndExpand() {
  if (window.location.hash !== "#menu-al-grill") return;
  const section = document.getElementById("menu-al-grill");
  if (!section) return;
  sessionStorage.setItem("asadoPromo", "1");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
  const accordion = section.querySelector(".accordion");
  if (accordion && accordion.getAttribute("aria-expanded") !== "true") {
    setAccordionExpanded(accordion, true);
    requestAnimationFrame(updateTableMenuBackgroundMode);
  }
}

document.getElementById("promo-asado-link")?.addEventListener("click", () => {
  sessionStorage.setItem("asadoPromo", "1");
});

window.addEventListener("hashchange", scrollToAsadosAndExpand);
