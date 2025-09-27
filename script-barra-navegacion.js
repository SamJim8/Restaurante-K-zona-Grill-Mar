document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMobile = document.getElementById("nav-mobile");
  const closeBtn = document.getElementById("close-btn");
  const navLinks = navMobile.querySelectorAll("a");

  // Abrir/cerrar con ☰
  hamburger.addEventListener("click", () => {
    navMobile.classList.toggle("show");
    document.body.classList.toggle("menu-open");
  });

  // Cerrar con ✖
  closeBtn.addEventListener("click", () => {
    navMobile.classList.remove("show");
    document.body.classList.remove("menu-open");
  });

  // Cerrar al hacer click en un enlace
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("show");
      document.body.classList.remove("menu-open");
    });
  });
});

