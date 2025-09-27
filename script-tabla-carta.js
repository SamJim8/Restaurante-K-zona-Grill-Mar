document.addEventListener("DOMContentLoaded", () => {

    // ---------------- Acordeón ----------------
    const acordeones = document.querySelectorAll(".acordeon");
    acordeones.forEach(acordeon => {
        acordeon.addEventListener("click", () => {
            let fila = acordeon.parentElement.nextElementSibling;
            while (fila && !fila.classList.contains("acordeon")) {
                fila.style.display = (getComputedStyle(fila).display !== "none") ? "none" : "table-row";
                fila = fila.nextElementSibling;
            }
            acordeon.classList.toggle("expanded");
        });
    });

    // ---------------- Botón iniciar pedido ----------------
    const startOrderBtn = document.getElementById("start-order");
    const actionCells = document.querySelectorAll(".action-style");

    startOrderBtn.addEventListener("click", () => {
        actionCells.forEach(cell => cell.style.display = "table-cell");
        startOrderBtn.style.display = "none"; // ocultar botón

        const actionHeader = document.querySelector(".columnas-carta .action-style");
        if (actionHeader){
            actionHeader.style.display= "table-cell";
        }
        startOrderBtn.style.display= "none";
    });

    // ---------------- Carrito ----------------
    const buttons = document.querySelectorAll('.add-to-cart');
    const cart = document.getElementById('cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const sendOrderBtn = document.getElementById('send-order');
    
    let cartData = [];

    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        cartData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} - $${item.price.toFixed(2)} 
                <button class="remove-item">-</button>
                <span> ${item.quantity} </span>
                <button class="add-more">+</button>
            `;
            cartItems.appendChild(li);

            // actualizar total
            total += item.price * item.quantity;

            // eliminar item
            li.querySelector('.remove-item').addEventListener('click', () => {
                cartData = cartData.filter(i => i !== item);
                if (cartData.length === 0) cart.style.display = 'none';
                updateCart();
            });

            // agregar cantidad
            li.querySelector('.add-more').addEventListener('click', () => {
                item.quantity++;
                updateCart();
            });
        });

        cartTotal.textContent = total.toFixed(2);
        if (cartData.length > 0) cart.style.display = 'block';
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            const existing = cartData.find(item => item.name === name);
            if (existing) {
                existing.quantity++;
            } else {
                cartData.push({name, price, quantity: 1});
            }
            updateCart();
        });
    });

    // ---------------- Enviar pedido por WhatsApp ----------------
    sendOrderBtn.addEventListener('click', () => {
        if (cartData.length === 0) return alert("No hay productos en el carrito");
        let message = "Hola! Soy [TU NOMBRE]. Quiero pedir:\n";
        cartData.forEach(item => {
            message += `${item.quantity} x ${item.name} - $${(item.price*item.quantity).toFixed(2)}\n`;
        });
        const url = `https://wa.me/593XXXXXXXXX?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    });
});
