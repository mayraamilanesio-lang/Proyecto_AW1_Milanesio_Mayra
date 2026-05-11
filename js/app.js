// ============================================================
//  LUMI BAKERY — app.js
// ============================================================

// ----------------------------------------------------------
// 1. ESTRUCTURA DE DATOS: rutas y títulos
// ----------------------------------------------------------
const pages = [
  { title: "Inicio",    href: "index.html" },
  { title: "Productos", href: "index.html#productos" },
];

// ----------------------------------------------------------
// 2. ESTRUCTURA DE DATOS: productos
// ----------------------------------------------------------
const products = [
  {
    id: 1,
    name: "Marquise",
    description: "Brownie, dulce de leche y crema chantilly, coronado con merengue italiano o salsa de frutos rojos.",
    price: 35000,
    image: "img/marquise.png",
    quantity: 0,
  },
  {
    id: 2,
    name: "Chocotorta",
    description: "Galletas Chocolinas embebidas en chocolatada con la clásica crema de Chocotorta.",
    price: 25000,
    image: "img/chocotorta.png",
    quantity: 0,
  },
  {
    id: 3,
    name: "Torta Red Velvet",
    description: "Bizcochuelo de chocolate color rojo, relleno a base de queso crema y chocolate blanco.",
    price: 20000,
    image: "img/redvelvet.png",
    quantity: 0,
  },
];

// ----------------------------------------------------------
// 3. COMPONENTE: Navbar
// ----------------------------------------------------------
function renderNavbar(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const navItems = pages
    .map(p => `<li><a href="${p.href}">${p.title}</a></li>`)
    .join("");

  container.innerHTML = `
    <nav class="navbar">
      <div class="logo">LUMI BAKERY</div>
      <ul class="nav-links">
        ${navItems}
        <li>
          <button class="btn-logout" onclick="logout()">Cerrar sesión</button>
        </li>
      </ul>
    </nav>
  `;
}

// ----------------------------------------------------------
// 4. COMPONENTE: Cards de productos
// ----------------------------------------------------------
function renderProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-card" id="card-${p.id}">
        <div class="card-img-wrapper">
          <img
            src="${p.image}"
            alt="${p.name}"
            class="card-img"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          />
          <div class="card-img-placeholder" style="display:none;">🍰</div>
        </div>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-price">$${p.price.toLocaleString("es-AR")}</div>

        <!-- Control de cantidad -->
        <div class="quantity-control">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-display" id="qty-${p.id}">0</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, +1)">+</button>
        </div>

        <button class="btn-comprar" onclick="addToCart(${p.id})">Agregar al carrito</button>
      </div>
    `
    )
    .join("");
}

// ----------------------------------------------------------
// 5. LÓGICA DE CANTIDAD
// ----------------------------------------------------------
function changeQty(productId, delta) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  product.quantity = Math.max(0, product.quantity + delta);
  document.getElementById(`qty-${productId}`).textContent = product.quantity;
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const qty = product.quantity;
  if (qty === 0) {
    showToast("Seleccioná al menos 1 unidad.");
    return;
  }
  showToast(`✓ ${qty} × ${product.name} agregado/s al carrito.`);
  product.quantity = 0;
  document.getElementById(`qty-${productId}`).textContent = 0;
}

// ----------------------------------------------------------
// 6. AUTENTICACIÓN: login / logout
// ----------------------------------------------------------

function login(event) {
  event.preventDefault();      
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showFormError("Completá todos los campos.");
    return;
  }


  sessionStorage.setItem("lumiBakeryUser", email);
  window.location.href = "index.html";
}


function logout() {
  sessionStorage.removeItem("lumiBakeryUser");
  window.location.href = "login.html";
}


function requireAuth() {
  const user = sessionStorage.getItem("lumiBakeryUser");
  if (!user) {
    window.location.href = "login.html";
  }
  return user;
}

// ----------------------------------------------------------
// 7. HELPERS: toast y error de formulario
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
