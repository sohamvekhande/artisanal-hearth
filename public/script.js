function initAppBindings() {
  // Main action buttons
  const orderBtn = document.getElementById("orderBtn");
  const menuBtn = document.getElementById("menuBtn");

  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      console.log("Order clicked");
      navigate('order');
    });
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      console.log("Menu clicked");
      navigate('menu');
    });
  }

  // Navigation buttons - convert data-page attributes to listeners
  const navButtons = document.querySelectorAll('[data-page]');
  navButtons.forEach(btn => {
    const page = btn.getAttribute('data-page');
    if (page) {
      btn.addEventListener('click', () => {
        navigate(page);
        if (btn.closest('#mobile-menu')) {
          toggleMobileMenu();
        }
      });
    }
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMobileMenu);
  }

  // Tab buttons
  const tabButtons = document.querySelectorAll('[data-tab]');
  tabButtons.forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    if (tab) {
      btn.addEventListener('click', () => setTab(tab));
    }
  });

  // Add to cart buttons
  const cartButtons = document.querySelectorAll('[data-add-to-cart]');
  cartButtons.forEach(btn => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);
    if (name && !Number.isNaN(price)) {
      btn.addEventListener('click', () => addToCart(name, price));
    }
  });

  // Order and confirmation actions
  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', placeOrder);
  }

  const closeOrderConfirmBtn = document.getElementById('close-order-confirm-btn');
  if (closeOrderConfirmBtn) {
    closeOrderConfirmBtn.addEventListener('click', closeOrderConfirm);
  }

  // Reservation form
  const resForm = document.getElementById('res-form');
  if (resForm) {
    resForm.addEventListener('submit', submitReservation);
  }

  const resConfirmCloseBtn = document.getElementById('res-confirm-close-btn');
  if (resConfirmCloseBtn) {
    resConfirmCloseBtn.addEventListener('click', () => {
      document.getElementById('res-confirm').classList.add('hidden');
      navigate('home');
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', submitContact);
  }

  // Menu search
  const menuSearch = document.getElementById('menu-search');
  if (menuSearch) {
    menuSearch.addEventListener('input', filterMenu);
  }

  // Admin actions
  const adminLoginBtn = document.getElementById('admin-login-btn');
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', adminLogin);
  }

  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', adminLogout);
  }

  // Admin tab buttons
  const adminTabButtons = document.querySelectorAll('[data-admin-tab]');
  adminTabButtons.forEach(btn => {
    const tab = btn.getAttribute('data-admin-tab');
    if (tab) {
      btn.addEventListener('click', () => setAdminTab(tab));
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAppBindings);
} else {
  initAppBindings();
}