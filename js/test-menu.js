document.addEventListener("DOMContentLoaded", () => {

  // ---------------- Accordion ----------------
  const accordions = document.querySelectorAll(".accordion");
  accordions.forEach(accordion => {
    accordion.addEventListener("click", () => {
      let row = accordion.parentElement.nextElementSibling;
      while (row && !row.classList.contains("accordion")) {
        row.style.display = (getComputedStyle(row).display !== "none") 
          ? "none" 
          : "table-row";
        row = row.nextElementSibling;
      }
      accordion.classList.toggle("expanded");
    });
  });

  const btnHacerPedido = document.getElementById("start-order");
  const carritoContainer = document.getElementById("cart");
  const carritoLista = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  let total = 0;

  // Action on "Place order" click
  btnHacerPedido.addEventListener("click", () => {
    btnHacerPedido.remove(); // remove the button
    carritoContainer.style.display = "block"; // show the cart

    // Show action column in header
    const thAccion = document.querySelector("th.accion");
    if (thAccion) thAccion.style.display = "table-cell";

    // Iterate all table body rows
    const filas = document.querySelectorAll("tbody tr");
    filas.forEach((fila) => {
      // Find action cell for that row
      let tdAccion = fila.querySelector("td.accion");

      if (tdAccion) {
        tdAccion.style.display = "table-cell"; // show the cell

        // Avoid duplicate buttons
        if (!tdAccion.querySelector("button")) {
          const btnAgregar = document.createElement("button");
          btnAgregar.textContent = "Agregar";
          btnAgregar.classList.add("btn-agregar");

          // Action on "Add" click
          btnAgregar.addEventListener("click", () => {
            const producto = fila.querySelector("td:nth-child(1)").textContent;
            const precio = parseFloat(
              fila.querySelector("td:nth-child(2)").textContent.replace("$", "")
            );

            // Add product to cart
            const li = document.createElement("li");
            li.textContent = `${producto} - $${precio.toFixed(2)}`;
            carritoLista.appendChild(li);

            // Update total
            total += precio;
            totalElement.textContent = total.toFixed(2);
          });

          tdAccion.appendChild(btnAgregar);
        }
      }
    });
  });
});
