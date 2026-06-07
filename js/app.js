// ============================================================
//  LUMI BAKERY — app.js
// ============================================================

// ----------------------------------------------------------
// 0. ESTADO GLOBAL
// ----------------------------------------------------------
const _cantidades = {};

// ----------------------------------------------------------
// 1. NAVEGACIÓN
// ----------------------------------------------------------
const pages = [
  { title: "Inicio",    href: "index.html" },
  { title: "Productos", href: "index.html#productos" },
];

// ----------------------------------------------------------
// 2. STORAGE HELPERS
// ----------------------------------------------------------
function getUser() {
  return JSON.parse(sessionStorage.getItem("lumiBakeryUser"));
}

function getCarrito() {
  return JSON.parse(localStorage.getItem("lumiCarrito")) || [];
}

function saveCarrito(carrito) {
  localStorage.setItem("lumiCarrito", JSON.stringify(carrito));
}

function formatPrecio(n) {
  return "$" + n.toLocaleString("es-AR");
}

// ----------------------------------------------------------
// 3. NAVBAR
// ----------------------------------------------------------
function renderNavbar(containerId, isLoggedIn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = getUser();

  const navItems = pages
    .map(p => `<li><a href="${p.href}">${p.title}</a></li>`)
    .join("");

  const authSection = isLoggedIn
    ? `<li><span class="nav-saludo">Hola, ${user ? user.nombre : ""} 🍞</span></li>
       <li>
         <a href="carrito.html" class="btn-login nav-carrito-link">
           🛒 Carrito
           <span class="nav-carrito-count" id="nav-cart-count">0</span>
         </a>
       </li>
       <li><button class="btn-logout" onclick="logout()">Cerrar sesión</button></li>`
    : `<li><a href="login.html" class="btn-login">Iniciar sesión</a></li>`;

  container.innerHTML = `
    <nav class="navbar">
      <div class="logo">LUMI BAKERY</div>
      <ul class="nav-links">
        ${navItems}
        ${authSection}
      </ul>
    </nav>
  `;

  actualizarContadorNav();
}

function actualizarContadorNav() {
  const el = document.getElementById("nav-cart-count");
  if (!el) return;
  const total = getCarrito().reduce((a, p) => a + p.cantidad, 0);
  el.textContent = total;
}

// ----------------------------------------------------------
// 4. LOGIN / LOGOUT
// ----------------------------------------------------------
const LUMI_USERS = [
  { email: "admin@lumi.com",   password: "1234",  nombre: "Mayra" },
  { email: "usuario@lumi.com", password: "1111",  nombre: "Usuario Demo" }
];

function login(event) {
  event.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorEl  = document.getElementById("form-error");

  if (!email || !password) {
    showFormError("Completá todos los campos.");
    return;
  }

  const found = LUMI_USERS.find(u => u.email === email && u.password === password);

  if (found) {
    sessionStorage.setItem(
      "lumiBakeryUser",
      JSON.stringify({ email: found.email, nombre: found.nombre })
    );
    window.location.href = "index.html";
  } else {
    showFormError("Email o contraseña incorrectos.");
  }
}

function logout() {
  sessionStorage.removeItem("lumiBakeryUser");
  window.location.href = "login.html";
}

// ----------------------------------------------------------
// 5. PRODUCTOS
// ----------------------------------------------------------
const PRODUCTOS = [
  {
    id: 1,
    categoria: "Tortas",
    nombre: "MARQUISE",
    descripcion: "Brownie, dulce de leche y crema chantilly, coronado con merengue italiano o salsa de frutos rojos.",
    precio: 35000,
    imagen: "img/marquise.png"
  },
  {
    id: 2,
    categoria: "Tortas",
    nombre: "CHOCOTORTA",
    descripcion: "Galletas Chocolinas embebidas en chocolatada con la clásica crema de Chocotorta.",
    precio: 25000,
    imagen: "img/chocotorta.jpeg"
  },
  {
    id: 3,
    categoria: "Tortas",
    nombre: "RED VELVET",
    descripcion: "Bizcochuelo de chocolate color rojo, relleno a base de queso crema y chocolate blanco.",
    precio: 20000,
    imagen: "img/redvelvet.png"
  }
];

function renderProducts(containerId, isLoggedIn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const categorias = [...new Set(PRODUCTOS.map(p => p.categoria))];

  categorias.forEach(cat => {
    const prods = PRODUCTOS.filter(p => p.categoria === cat);
    const seccion = document.createElement("div");
    seccion.className = "categoria-seccion";

    const cards = prods.map(p => {
      _cantidades[p.id] = 0;
      const prodStr = encodeURIComponent(JSON.stringify(p));
      return `
        <div class="product-card" id="card-${p.id}">
          <div class="card-img-wrapper">
            <img src="${p.imagen}" alt="${p.nombre}" class="card-img"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
            <div class="card-img-placeholder" style="display:none;">🍰</div>
          </div>
          <h3>${p.nombre}</h3>
          <p>${p.descripcion}</p>
          <div class="product-price">${formatPrecio(p.precio)}</div>
          <div class="quantity-control">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span class="qty-display" id="qty-${p.id}">0</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, +1)">+</button>
          </div>
          <button class="btn-comprar"
            onclick="${isLoggedIn
              ? `addToCart(${p.id}, '${prodStr}')`
              : `goToLogin()`}">
            Agregar al carrito
          </button>
        </div>`;
    }).join("");

    seccion.innerHTML = `<div class="products-grid">${cards}</div>`;
    container.appendChild(seccion);
  });
}

// ----------------------------------------------------------
// 6. CANTIDAD Y CARRITO
// ----------------------------------------------------------
function changeQty(productId, delta) {
  _cantidades[productId] = Math.max(0, (_cantidades[productId] || 0) + delta);
  document.getElementById("qty-" + productId).textContent = _cantidades[productId];
}

function addToCart(productId, prodStr) {
  const qty = _cantidades[productId] || 0;
  if (qty === 0) {
    showToast("Seleccioná al menos 1 unidad.");
    return;
  }

  const producto = JSON.parse(decodeURIComponent(prodStr));
  const carrito  = getCarrito();
  const idx      = carrito.findIndex(p => p.id === productId);

  if (idx >= 0) {
    carrito[idx].cantidad += qty;
  } else {
    carrito.push({ ...producto, cantidad: qty });
  }

  saveCarrito(carrito);
  actualizarContadorNav();
  showToast(`✓ ${qty} × ${producto.nombre} agregado/s al carrito.`);

  _cantidades[productId] = 0;
  document.getElementById("qty-" + productId).textContent = 0;
}

function goToLogin() {
  showToast("Iniciá sesión para comprar 😊");
  setTimeout(() => { window.location.href = "login.html"; }, 1200);
}

// ----------------------------------------------------------
// 7. HELPERS
// ----------------------------------------------------------
function showToast(message) {
  let toast = document.getElementById("lumi-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "lumi-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function showFormError(message) {
  const el = document.getElementById("form-error");
  if (el) {
    el.textContent = message;
    el.style.display = "block";
  }
}
