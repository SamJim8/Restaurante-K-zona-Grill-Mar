const openModalPrice = () => {
  const carContainer = document.getElementById("shopping-modal");
  carContainer.style.display = "block";
};

const addItem = () =>{
    console.log("añadir")
}

const removeItem = () =>{
      console.log("restar")
}

const createList = (product, price) => {
  return `
    <li style="display:flex flex-direction:row">
    <p>1 ${product} - $${price.toFixed(2)}</p>
    <button onclick="addItem()">+</button>
    <button onclick="removeItem()">-</button>
    </li>
`;
};

const addProduct = (product, price) => {
  //llamo a mi lista y agrego producto
  const carritoLista = document.getElementById("cart-items");
  carritoLista.innerHTML+=createList(product, price);
};
const funcionCompleja = (product, price) => {
  openModalPrice();
  // addProduct(); añadir elemento
  addProduct(product, price);
  //  sumar y eliminar productos dentro del carrito

  // que salga el precio total de los productos
  // un input donde se coloque el nombre y que este sea conjuntamente enviado al whats con el pedido
};
