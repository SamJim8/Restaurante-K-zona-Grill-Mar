document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault(); // Evita que recargue

  const form = e.target;
  const data = new FormData(form);

  fetch(
    "https://script.google.com/macros/s/AKfycbwHhqpMmP9itWw3SbpaqSHOm37-tq3Jf4uw1c3cF7DtuQM8R3iDUpqYxY4gUtXsVd0D/exec",
    {
      method: "POST",
      body: data,
    }
  )
    .then((mensaje) => {
      alert("✅ ¡Gracias por registrarte!");
      form.reset(); // Limpia los campos
      window.location.href = "#"; // Vuelve al inicio de la página
    })

    .catch((error) => {
      alert("❌ Ocurrió un error. Inténtalo de nuevo.");
      console.error("Error:", error);
    });
});
