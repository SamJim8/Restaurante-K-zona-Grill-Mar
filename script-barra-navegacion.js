document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMobile = document.getElementById("nav-mobile");
  const closeBtn = document.getElementById("close-btn");
  const navLinks = navMobile.querySelectorAll("a");

  const toggleMenu = () => {
    navMobile.classList.toggle("show");
    document.body.classList.toggle("menu-open");
  };

  const closeMenu = () => {
    navMobile.classList.remove("show");
    document.body.classList.remove("menu-open");
  };

  hamburger.addEventListener("click", toggleMenu);
  closeBtn.addEventListener("click", closeMenu);

  navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    const clickInsideMenu = navMobile.contains(e.target);
    const clickOnHamburger = hamburger.contains(e.target);

    if (navMobile.classList.contains("show") && 
        !clickInsideMenu && 
        !clickOnHamburger) {
      closeMenu();
    }
  });
});
