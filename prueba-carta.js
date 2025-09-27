document.addEventListener("DOMContentLoaded", () => {

  // ---------------- Acordeón ----------------
  const acordeones = document.querySelectorAll(".acordeon");
  acordeones.forEach(acordeon => {
    acordeon.addEventListener("click", () => {
      let fila = acordeon.parentElement.nextElementSibling;
      while (fila && !fila.classList.contains("acordeon")) {
        fila.style.display = (getComputedStyle(fila).display !== "none") 
          ? "none" 
          : "table-row";
        fila = fila.nextElementSibling;
      }
      acordeon.classList.toggle("expanded");
    });
  });

  const btnHacerPedido = document.getElementById("start-order");
  const carritoContainer = document.getElementById("cart");
  const carritoLista = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  let total = 0;

  // Acción al hacer clic en "Hacer pedido"
  btnHacerPedido.addEventListener("click", () => {
    btnHacerPedido.remove(); // elimina el botón
    carritoContainer.style.display = "block"; // muestra el carrito

    // Muestra la columna de acción en el encabezado
    const thAccion = document.querySelector("th.accion");
    if (thAccion) thAccion.style.display = "table-cell";

    // Recorre todas las filas del cuerpo de la tabla
    const filas = document.querySelectorAll("tbody tr");
    filas.forEach((fila) => {
      // Encuentra la celda de acción de esa fila
      let tdAccion = fila.querySelector("td.accion");

      if (tdAccion) {
        tdAccion.style.display = "table-cell"; // muestra la celda

        // Evita duplicar botones
        if (!tdAccion.querySelector("button")) {
          const btnAgregar = document.createElement("button");
          btnAgregar.textContent = "Agregar";
          btnAgregar.classList.add("btn-agregar");

          // Acción al hacer clic en "Agregar"
          btnAgregar.addEventListener("click", () => {
            const producto = fila.querySelector("td:nth-child(1)").textContent;
            const precio = parseFloat(
              fila.querySelector("td:nth-child(2)").textContent.replace("$", "")
            );

            // Agregar producto al carrito
            const li = document.createElement("li");
            li.textContent = `${producto} - $${precio.toFixed(2)}`;
            carritoLista.appendChild(li);

            // Actualizar total
            total += precio;
            totalElement.textContent = total.toFixed(2);
          });

          tdAccion.appendChild(btnAgregar);
        }
      }
    });
  });
});
