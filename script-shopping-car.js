// ------------------ ACORDEÓN ------------------
const acordeones = document.querySelectorAll(".acordeon");

acordeones.forEach(acordeon => {
  let fila = acordeon.parentElement.nextElementSibling;

  while (fila && !fila.classList.contains("variedad")) {
    fila.style.display = "none";
    fila = fila.nextElementSibling;
  }

  acordeon.addEventListener("click", () => {
    acordeon.classList.toggle("expanded");

    let nextRow = acordeon.parentElement.nextElementSibling;
    while (nextRow && !nextRow.classList.contains("variedad")) {
      nextRow.style.display = nextRow.style.display === "none" ? "table-row" : "none";
      nextRow = nextRow.nextElementSibling;
    }
  });
});

// ------------------ MODAL (CARRITO) ------------------
const openModalPrice = () => {
  const modal = document.getElementById("shopping-modal");
  modal.classList.add("active");
  document.body.classList.add("open-cart");
};

const closeModalPrice = () => {
  const modal = document.getElementById("shopping-modal");
  modal.classList.remove("active");
  document.body.classList.remove("open-cart");
};

const closeCartWithConfirmation = () => {
  const modal = document.getElementById("shopping-modal");
  const items = document.querySelectorAll("#cart-items li");

  if (items.length === 0) return closeModalPrice();

  if (confirm("¿Deseas vaciar el carrito?")) {
    items.forEach(item => item.remove());
    closeModalPrice();
  }
};

document.getElementById("close-cart-btn")
  .addEventListener("click", closeCartWithConfirmation);

// ------------------ UTILIDADES ------------------
const updateTotal = () => {
  const items = document.querySelectorAll("#cart-items li");
  let total = 0;

  items.forEach(item => {
    const price = parseFloat(item.querySelector(".price").dataset.price);
    const quantity = parseInt(item.querySelector(".quantity").textContent);
    total += price * quantity;
  });

  document.getElementById("cart-total").textContent = total.toFixed(2);
};

// Crear elemento del carrito
const createList = (product, price) => {
  const cartItems = document.getElementById("cart-items");
  const li = document.createElement("li");
  let quantity = 1;

  li.innerHTML = `
  <span class="product">${product}</span>

  <div class="qty-controls">
      <button class="btn-less">-</button>
      <span class="quantity">${quantity}</span>
      <button class="btn-add">+</button>
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
      if (!document.querySelector("#cart-items li")) {
        closeModalPrice();
      }
    } else {
      quantitySpan.textContent = quantity;
    }
    updateTotal();
  });

  cartItems.appendChild(li);
  updateTotal();
};

const addProduct = (product, price) => {
  createList(product, price);
};

const Completefunction = (product, price) => {
  openModalPrice();
  addProduct(product, price);
};

// Botón "Agregar al carrito"
function addToCart(button) {
  const row = button.closest("tr");
  const product = row.querySelector('th[scope="row"]').textContent.trim();
  const price = parseFloat(row.querySelector(".td-price p").dataset.price);
  Completefunction(product, price);
}

// ------------------ ENVIAR PEDIDO POR WHATSAPP ------------------
const sendOrderBtn = document.getElementById("send-order");

sendOrderBtn.addEventListener("click", () => {
  const nameInput = document.getElementById("customer-name");
  const items = document.querySelectorAll("#cart-items li");

  if (!items.length)
    return alert("No hay productos en el carrito");

  if (nameInput.value.trim() === "")
    return alert("Por favor ingresa tu nombre para enviar el pedido");

  const cartData = [...items].map(item => {
    return {
      name: item.querySelector(".product").textContent,
      price: parseFloat(item.querySelector(".price").dataset.price),
      quantity: parseInt(item.querySelector(".quantity").textContent)
    };
  });

  let message = `Hola! Soy ${nameInput.value.trim()}. Quiero pedir:\n`;
  cartData.forEach(item => {
    message += `${item.quantity} x ${item.name} - $${(item.price * item.quantity).toFixed(2)}\n`;
  });

  const url = `https://wa.me/593959221166?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});
