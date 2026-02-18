// Menu data and table rendering for K-zona Grill & Mar.

// Order: 1.Breakfasts, 2.Soups, 3.Ceviches, 4.Rices, 5.Pork rinds, 6.Creole dishes, 7.Grill, 8.Portions, 9.Drinks
const MENU_DATA = [
  {
    categoryName: "Desayunos",
    items: [
      { name: "Bolón", description: "Queso, chicharrón o mixto y huevo.", price: 2.25 },
      { name: "Tigrillo", description: "Queso, chicharrón o mixto + huevo.", price: 2.75 },
      { name: "Continental", description: "Tostada, leche o café, huevos y jugo.", price: 3.5 },
      { name: "Café/leche", description: "", price: 1.0 },
      { name: "Humitas", description: "Rellenas de queso.", price: 1.25 },
      { name: "Tamales", description: "Rellenas de pollo o queso.", price: 1.5 }
    ]
  },
  {
    categoryName: "Sopas",
    items: [
      { name: "Encebollado", description: "+ chifles.", price: 3.0 },
      { name: "Encebollado mixto", description: "Albacora y camarón + chifles.", price: 4.0 }
    ]
  },
  {
    categoryName: "Ceviches",
    items: [
      { name: "Ceviche de pescado", description: "Acompañado de camote, choclo y tostado.", price: 6.0 },
      { name: "Ceviche de camarón", description: "Acompañado de camote, choclo y tostado.", price: 7.0 },
      { name: "Ceviche mixto", description: "Camarón y pescado, acompañado de camote, choclo y tostado.", price: 8.0 },
      { name: "Leche de tigre", description: "Coctel de camarón y pescado.", price: 7.0 }
    ]
  },
  {
    categoryName: "Arroces",
    items: [
      { name: "Chaulafán mixto", description: "Pollo y cerdo.", price: 5.0 },
      { name: "Chaulafán especial", description: "Pollo, cerdo y camarón.", price: 6.5 },
      { name: "Cevi-chaufa", description: "Chaulafán especial + ceviche de pescado.", price: 8.0 },
      { name: "Arroz marinero", description: "Arroz, pescado, camarón, pulpo y conchas.", price: 7.0 }
    ]
  },
  {
    categoryName: "Chicharrones",
    items: [
      { name: "Chicharrón de pescado", description: "Acompañado de deditos de verde + arroz + ensalada.", price: 6.0 },
      { name: "Chicharrón de camarón", description: "Acompañado de deditos de verde + arroz + ensalada.", price: 7.0 },
      { name: "Chicharrón de mixto", description: "Chicharrón de pescado y camarón. Acompañado de deditos de verde + arroz + ensalada.", price: 8.0 },
      { name: "Chicharrón de pollo", description: "Acompañado de deditos de verde + arroz + ensalada.", price: 5.0 }
    ]
  },
  {
    categoryName: "Platos criollos",
    items: [
      { name: "Pescado frito o sudado", description: "Arroz, ensalada y patacones.", price: 8.0 },
      { name: "Lomo salteado", description: "Lomo de res salteado, acompañado de arroz y papas.", price: 7.0 },
      { name: "Pollo salteado", description: "Acompañado de arroz y papas.", price: 6.0 }
    ]
  },
  {
    categoryName: "Al grill",
    items: [
      { name: "Filete de pollo", description: "Papas + arroz + menestra + ensalada.", price: 3.5 },
      { name: "Parrillada personal", description: "Chuleta de cerdo + filete de pollo + chorizo + papas + arroz + menestra + ensalada.", price: 6.5 },
      { name: "Papi pollo", description: "Papas + ensalada.", price: 3.0 },
      { name: "Cecina", description: "Lomo de cerdo al grill, acompañado de yuca, mote y ensalada.", price: 6.0 },
      { name: "Chuleta de cerdo", description: "Papas + arroz + menestra + ensalada.", price: 4.5 },
      { name: "Lomo fino de res", description: "Papas + arroz + menestra + ensalada.", price: 4.5 },
      { name: "Churrasco", description: "Carne asada acompañado de arroz, huevos fritos y ensalada.", price: 6.5 },
      { name: "Filete de pescado", description: "Patacones + arroz + menestra + ensalada.", price: 4.5 }
    ]
  },
  {
    categoryName: "Porciones",
    items: [
      { name: "Papas fritas", description: "", price: 1.5 },
      { name: "Ensalada", description: "", price: 1.5 },
      { name: "Patacones", description: "", price: 2.0 },
      { name: "Arroz", description: "", price: 1.5 }
    ]
  },
  {
    categoryName: "Bebidas",
    items: [
      { name: "Botella de agua", description: "", price: 1.0 },
      { name: "Gaseosa personal", description: "", price: 1.0 },
      { name: "Gaseosa 1 L", description: "", price: 2.25 },
      { name: "Club personal", description: "", price: 2.5 },
      { name: "Limonada", description: "", price: 1.25 },
      { name: "Jugos", description: "Mora, fresa, guanábana, tomate, piña.", price: 1.75 },
      { name: "Batidos", description: "Mora, fresa, guanábana, tomate.", price: 2.0 },
      { name: "Agua aromática", description: "", price: 1.25 },
      { name: "Jarra de limonada / Horchata", description: "", price: 3.5 },
      { name: "Jarra de jugo", description: "", price: 5.0 }
    ]
  }
];

const CART_ICON_PATH = "assets/icons/icon-cart-shopping.svg";

/**
 Builds the menu: title block above the table, then table with thead (Dishes, Description, Price), tbody per category, tfoot.
 **/
function renderMenuTable(container) {
  if (!container) return;

  const header = document.createElement("div");
  header.className = "menu-table-header";
  header.innerHTML = `
    <h2>Carta K-zona Grill & Mar</h2>
    <p class="menu-slogan">Pide lo que más te guste, cuando quieras y donde estés.</p>
  `;
  container.appendChild(header);

  const table = document.createElement("table");
  table.className = "table-outer-edge";
  table.appendChild(createThead());
  MENU_DATA.forEach(({ categoryName, items }) => {
    table.appendChild(createCategoryTbody(categoryName, items));
  });
  table.appendChild(createTfoot());

  container.appendChild(table);
}

function createThead() {
  const thead = document.createElement("thead");
  thead.className = "columns-card";
  thead.innerHTML = `
    <tr>
      <th scope="col">Platos</th>
      <th scope="col">Descripción</th>
      <th class="price-style" scope="col">Precio</th>
    </tr>
  `;
  return thead;
}

function createCategoryTbody(categoryName, items) {
  const tbody = document.createElement("tbody");
  tbody.className = "category";
  tbody.id = "menu-" + categoryName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `<th colspan="3" class="variety accordion" role="button" tabindex="0" aria-expanded="false">${escapeHtml(categoryName)}</th>`;
  tbody.appendChild(headerRow);

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row">${escapeHtml(item.name)}</th>
      <td>${escapeHtml(item.description)}</td>
      <td class="td-price">
        <p data-price="${escapeHtml(String(item.price))}">$${formatPrice(item.price)}</p>
        <button class="btn-add-item" onclick="addToCart(this)"><img src="${escapeHtml(CART_ICON_PATH)}" alt="icon-to-buy"></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  return tbody;
}

function createTfoot() {
  const tfoot = document.createElement("tfoot");
  tfoot.innerHTML = `
    <tr>
      <td colspan="3">
        Para llevar, cada plato tiene un precio extra por los desechables.
      </td>
    </tr>
  `;
  return tfoot;
}

function formatPrice(price) {
  return Number(price).toFixed(2);
}

function escapeHtml(text) {
  if (text == null || text === "") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Run when DOM is ready. Must execute before cart.js 
const menuContainer = document.getElementById("menu-container");
if (menuContainer) {
  renderMenuTable(menuContainer);
}
