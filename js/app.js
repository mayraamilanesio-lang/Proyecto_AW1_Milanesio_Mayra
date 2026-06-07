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
// 5. RENDER PRODUCTS — fetch desde data/productos.json
// ----------------------------------------------------------
function renderProducts(containerId, isLoggedIn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch("data/productos.json")
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar productos.json");
      return response.json();
    })
    .then(productos => {
      container.innerHTML = "";

      const categorias = [...new Set(productos.map(p => p.categoria))];

      categorias.forEach(cat => {
        const prods = productos.filter(p => p.categoria === cat);

        const titulo = document.createElement("h3");
        titulo.className = "categoria-titulo";
        titulo.textContent = cat;
        container.appendChild(titulo);

        const grid = document.createElement("div");
        grid.className = "products-grid";

        grid.innerHTML = prods.map(p => {
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

        container.appendChild(grid);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p style="text-align:center;color:var(--primary);font-family:'Quicksand',sans-serif;">
        No se pudieron cargar los productos. Asegurate de abrir el proyecto desde un servidor local.
      </p>`;
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
