document.getElementById("formulario").addEventListener("submit", function (e) {
  e.preventDefault(); 
  const form = e.target;
  const data = new FormData(form);

  fetch(
    "https://script.google.com/macros/s/AKfycbwHf108Nusg0_jylpFvKq3rWCe7CGkjIKlUek-SMOKhXbXg9LahIGMC-rytTOys9Vfs/exec",
    {
      method: "POST",
      body: data,
    }
  )
    .then((mensaje) => {
      alert("✅ ¡Gracias por registrarte!");
      form.reset(); 
      window.location.href = "#"; 
    })

    .catch((error) => {
      alert("❌ Ocurrió un error. Inténtalo de nuevo.");
      console.error("Error:", error);
    });
});
