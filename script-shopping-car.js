// ---------------- Acordeón ----------------
const acordeones = document.querySelectorAll(".acordeon");
acordeones.forEach((acordeon) => {
  let fila = acordeon.parentElement.nextElementSibling;
  while (fila && !fila.classList.contains("variedad")) {
    fila.style.display = "none";
    fila = fila.nextElementSibling;
  }

  acordeon.addEventListener("click", () => {
    acordeon.classList.toggle("expanded");

    let _fila = acordeon.parentElement.nextElementSibling;
    while (_fila && !_fila.classList.contains("variedad")) {
      if (_fila.style.display === "none") {
        _fila.style.display = "table-row";
      } else {
        _fila.style.display = "none";
      }
      _fila = _fila.nextElementSibling;
    }
  });
});

const closeCartWithConfirmation = () => {
  const cartModal = document.getElementById("shopping-modal");
  const allItems = document.querySelectorAll("#cart-items li");

  if (allItems.length === 0) {
    cartModal.classList.remove("active");
    document.body.classList.remove("carrito-abierto");
    return;
  }
  const confirmClose = confirm("¿Deseas vaciar el carrito?");
  if (confirmClose) {
    allItems.forEach((item) => item.remove());
    cartModal.classList.remove("active");
    document.body.classList.remove("carrito-abierto");
  }
};

// Evento para el botón “X”
document
  .getElementById("close-cart-btn")
  .addEventListener("click", closeCartWithConfirmation);

const openModalPrice = () => {
  const carContainer = document.getElementById("shopping-modal");
  carContainer.classList.add("active");
  document.body.classList.add("carrito-abierto");
};

const closeModalPrice = () => {
  const carContainer = document.getElementById("shopping-modal");
  carContainer.classList.remove("active");
  document.body.classList.remove("carrito-abierto");
};

const updateTotal = () => {
  const allItems = document.querySelectorAll("#cart-items li");
  let total = 0;

  allItems.forEach((item) => {
    const price = parseFloat(item.querySelector(".price").dataset.price);
    const quantity = parseInt(item.querySelector(".quantity").textContent);
    total += price * quantity;
  });
  document.getElementById("cart-total").textContent = total.toFixed(2);
};

const createList = (product, price) => {
  const cartItems = document.getElementById("cart-items");
  const item = document.createElement("li");
  let quantity = 1;
  item.innerHTML = `
    <span class="product">${product}</span>
    <span class="price" data-price="${price}"> $${price.toFixed(2)}</span>
    <button class="btn-less">-</button>
    <span class="quantity">${quantity}</span>
    <button class="btn-add">+</button>
  `;

  const btnAdd = item.querySelector(".btn-add");
  const btnLess = item.querySelector(".btn-less");
  const quantitySpan = item.querySelector(".quantity");

  btnAdd.addEventListener("click", () => {
    quantity++;
    quantitySpan.textContent = quantity;
    updateTotal();
  });

  btnLess.addEventListener("click", () => {
    quantity--;
    if (quantity <= 0) {
      item.remove();

      const allItems = document.querySelectorAll("#cart-items li");
      if (allItems.length === 0) {
        document.getElementById("shopping-modal").classList.remove("active");
      }
    } else {
      quantitySpan.textContent = quantity;
    }
    updateTotal();
  });

  cartItems.appendChild(item);
  updateTotal();
};

const addProduct = (product, price) => {
  //llamo a mi lista y agrego producto
  createList(product, price);
};
const funcionCompleja = (product, price) => {
  openModalPrice();
  // addProduct(); añadir elemento
  addProduct(product, price);
  //  sumar y eliminar productos dentro del carrito

  // que salga el precio total de los productos
  // un input donde se coloque el nombre y que este sea conjuntamente enviado al whats con el pedido
};

function addToCart(button) {
  const row = button.closest("tr");

  const product = row.querySelector('th[scope="row"]').textContent.trim();

  const price = parseFloat(row.querySelector(".td-price p").dataset.price);

  funcionCompleja(product, price);
}
    
// Enviar pedido por WhatsApp
const sendOrderBtn = document.getElementById('send-order');

sendOrderBtn.addEventListener("click", () => {
  const cartData = [];
  const allItems = document.querySelectorAll("#cart-items li");
  const nameInput = document.getElementById("customer-name");
  allItems.forEach((item) => {
    const name = item.querySelector(".product").textContent;
    const price = parseFloat(item.querySelector(".price").dataset.price);
    const quantity = parseInt(item.querySelector(".quantity").textContent);
    cartData.push({ name, price, quantity });
  });
  if (cartData.length === 0) return alert("No hay productos en el carrito");
  if(nameInput.value.trim() === "") return alert("Por favor ingresa tu nombre para enviar el pedido");
  let message = `Hola! Soy ${nameInput.value.trim()}. Quiero pedir:\n`;
  cartData.forEach((item) => {
    message += `${item.quantity} x ${item.name} - $${(
      item.price * item.quantity
    ).toFixed(2)}\n`;
  });
  const url = `https://wa.me/593959221166?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

