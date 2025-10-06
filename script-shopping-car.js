const closeCartWithConfirmation = () => {
  const cartModal=document.getElementById("shopping-modal")
  const allItems = document.querySelectorAll('#cart-items li');

  if (allItems.length === 0) {
    cartModal.classList.remove("active");
    return;
  }

  const confirmClose = confirm("¿Deseas vaciar el carrito?");
  if (confirmClose) {
    allItems.forEach(item => item.remove());
    cartModal.classList.remove("active")
  }
};

// Evento para el botón “X”
document.getElementById("close-cart-btn").addEventListener("click", closeCartWithConfirmation);


const openModalPrice = () => {
  const carContainer = document.getElementById("shopping-modal");
  carContainer.classList.add("active");
};

const closeModalPrice=()=>{
  const carContainer = document.getElementById("shopping-modal");
  carContainer.classList.remove('active');
};

const updateTotal=()=>{
  const allItems=document.querySelectorAll('#cart-items li');
  let total=0;

  allItems.forEach((item)=>{
    const price=parseFloat(item.querySelector(".price").dataset.price);
    const quantity=parseInt(item.querySelector(".quantity").textContent);
    total+=price*quantity;
  });
  document.getElementById("cart-total").textContent=total.toFixed(2);
};


const createList = (product, price) => {
  const cartItems = document.getElementById('cart-items');
  const item = document.createElement('li');
  let quantity=1;
  item.innerHTML=`
    <span class="product">${product}</span>
    <span class="price" data-price="${price}"> $${price.toFixed(2)}</span>
    <button class="btn-less">-</button>
    <span class="quantity">${quantity}</span>
    <button class="btn-add">+</button>
  `;

  const btnAdd=item.querySelector(".btn-add");
  const btnLess=item.querySelector(".btn-less");
  const quantitySpan=item.querySelector(".quantity");

  btnAdd.addEventListener("click",()=>{
    quantity++;
    quantitySpan.textContent=quantity;
    updateTotal();
  });

  btnLess.addEventListener("click",()=>{
    quantity--;
    if(quantity<=0){
      item.remove();

      const allItems = document.querySelectorAll('#cart-items li');
      if(allItems.length===0){
        document.getElementById("shopping-modal").classList.remove("active");
      }
      
    }else{
      quantitySpan.textContent=quantity;
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
  const row=button.closest('tr');

  const product=row.querySelector('th[scope="row"]').textContent.trim();

  const price=parseFloat(row.querySelector('.td-price p').dataset.price);

  funcionCompleja(product,price);
}