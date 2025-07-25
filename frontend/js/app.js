// app.js - Aplicación principal del frontend
import { mostrarVistaPizzas as mostrarPizzasOriginal, mostrarModalPizza } from './Vistas/pizzas.js';
import { mostrarVistaPedidos } from './Vistas/pedidos.js';
import { mostrarVistaUsuarios } from './Vistas/usuarios.js';
import { obtenerPizzas } from './api.js';

let pizzasGlobal = [];
let categoriasGlobal = [];
let categoriaSeleccionada = null;
let terminoBusqueda = '';

async function cargarCategoriasYMenu() {
  const pizzas = await obtenerPizzas();
  pizzasGlobal = pizzas; // Mostrar todas las pizzas, disponibles y no disponibles
  // Obtener categorías únicas
  const categorias = Array.from(new Set(pizzasGlobal.map(p => (p.categoria ? p.categoria.trim() : 'Otras'))));
  categoriasGlobal = categorias;
  renderSidebarCategorias();
  renderMenuFiltrado();
}

function renderSidebarCategorias() {
  const sidebar = document.getElementById('sidebarCategorias');
  if (!sidebar) return;
  sidebar.innerHTML = '';
  // Título de categorías
  const titulo = document.createElement('div');
  titulo.textContent = 'Categorías';
  titulo.className = 'text-green-700 font-bold text-lg mb-4';
  sidebar.appendChild(titulo);
  // Botón Todas
  const todas = document.createElement('button');
  todas.textContent = 'Todas';
  todas.className = 'w-full mb-2 py-2 rounded-lg border border-green-400 text-green-700 font-semibold hover:bg-green-50 transition' + (categoriaSeleccionada === null ? ' bg-green-100 border-2' : '');
  todas.onclick = () => { categoriaSeleccionada = null; renderSidebarCategorias(); renderMenuFiltrado(); };
  sidebar.appendChild(todas);
  // Botones de categorías
  categoriasGlobal.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'w-full mb-2 py-2 rounded-lg border border-green-400 text-green-700 font-semibold hover:bg-green-50 transition' + (categoriaSeleccionada === cat ? ' bg-green-100 border-2' : '');
    btn.onclick = () => { categoriaSeleccionada = cat; renderSidebarCategorias(); renderMenuFiltrado(); };
    sidebar.appendChild(btn);
  });
}

function renderMenuFiltrado() {
  const contenido = document.getElementById('contenido');
  if (!contenido) return;
  let pizzas = pizzasGlobal;
  if (categoriaSeleccionada) pizzas = pizzas.filter(p => (p.categoria ? p.categoria.trim() : 'Otras') === categoriaSeleccionada);
  if (terminoBusqueda) {
    const t = terminoBusqueda.toLowerCase();
    pizzas = pizzas.filter(p =>
      p.nombre.toLowerCase().includes(t) ||
      (p.ingredientes && p.ingredientes.toLowerCase().includes(t))
    );
  }
  if (!pizzas.length) {
    contenido.innerHTML = '<div class="py-8 text-center text-gray-400">No se encontraron pizzas.</div>';
    actualizarCarritoUI();
    return;
  }
  // Solo renderizar el grid de pizzas, sin banner
  let html = '';
  if (!categoriaSeleccionada && !terminoBusqueda) {
    const cats = {};
    pizzas.forEach(p => {
      const cat = p.categoria ? p.categoria.trim() : 'Otras';
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push(p);
    });
    html = Object.entries(cats).map(([cat, arr]) => `
      <div class="mb-10">
        <h3 class="text-green-700 text-xl font-bold mb-4">${cat}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${arr.map(pizza => pizzaCardHTML({...pizza, tamano: 'pequeña'})).join('')}
        </div>
      </div>
    `).join('');
  } else {
    html = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">${pizzas.map(pizza => pizzaCardHTML({...pizza, tamano: 'pequeña'})).join('')}</div>`;
  }
  contenido.innerHTML = html;
  // Eventos para abrir modal desde imagen, nombre y botón Agregar
  document.querySelectorAll('.pizza-card-modern').forEach(card => {
    const id = card.getAttribute('data-id');
    const tamano = card.getAttribute('data-tamano');
    const pizza = pizzas.find(p => p.id == id);
    card.querySelector('.pizza-img')?.addEventListener('click', () => mostrarModalPizza(pizza));
    card.querySelector('.pizza-nombre')?.addEventListener('click', () => mostrarModalPizza(pizza));
    // Botón agregar al carrito: solo abrir modal de detalles
    const btnAgregar = card.querySelector('.btn.agregar');
    if (btnAgregar) {
      btnAgregar.onclick = (e) => {
        e.stopPropagation();
        mostrarModalPizza(pizza);
      };
    }
  });
  // Reasignar evento al icono del carrito después de renderizar
  const iconCart = document.querySelector('.cart-icon');
  if (iconCart) {
    iconCart.onclick = window.mostrarCarritoModal;
  }
  actualizarCarritoUI();
}

function pizzaCardHTML(pizza) {
  return `<div class="pizza-card-modern bg-white rounded-xl shadow-md p-6 flex flex-col items-center border border-green-200 hover:shadow-lg transition mb-4 w-full" data-id="${pizza.id}" data-tamano="pequeña">
    <div class='w-28 h-28 rounded-full overflow-hidden border-4 border-green-400 mb-3 flex items-center justify-center bg-white'>
      ${pizza.url_imagen ? `<img src="${pizza.url_imagen}" alt="${pizza.nombre}" class="object-cover w-full h-full">` : ''}
    </div>
    <div class="pizza-etiqueta-disponible ${pizza.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded-full text-xs font-semibold mb-2">
      ${pizza.disponible ? 'Disponible' : 'No disponible'}
    </div>
    <div class="pizza-info w-full text-center flex-1 flex flex-col justify-between">
      <div>
        <div class="pizza-nombre text-lg font-bold text-green-700 cursor-pointer hover:underline mb-1">${pizza.nombre}</div>
        <div class="pizza-ingredientes text-gray-600 text-sm mb-2">
          ${pizza.ingredientes ? pizza.ingredientes.split(',').map(ing => `<span>${ing.trim()}</span>`).join(', ') : ''}
        </div>
        <div class="pizza-precio text-green-600 font-semibold mb-2"><b>Precio:</b> $${pizza.precio}</div>
      </div>
      <button class="btn agregar bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition mt-2 w-full" ${!pizza.disponible ? 'disabled style=\"background:#ccc;cursor:not-allowed;\"' : ''}>Agregar al pedido</button>
    </div>
  </div>`;
}

// Buscador en header
const searchBar = document.getElementById('searchBar');
if (searchBar) {
  searchBar.addEventListener('input', function() {
    terminoBusqueda = this.value;
    renderMenuFiltrado();
  });
}

// Inicializar menú y categorías al cargar
if (document.getElementById('sidebarCategorias')) {
  cargarCategoriasYMenu();
}

function mostrarVistaNosotros() {
  const contenido = document.getElementById('contenido');
  if (contenido) {
    contenido.innerHTML = `
      <div class="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-6 text-center">
        <h2 class="text-2xl font-bold text-green-700 mb-4">Sobre Nosotros</h2>
        <p class="mb-4 text-gray-700">Somos una pizzería con pasión por la calidad y el sabor, ubicada en el corazón de Cusco. Nuestra misión es ofrecer la mejor experiencia gastronómica con ingredientes frescos y atención cálida.</p>
        <ul class="text-left text-green-700 font-semibold space-y-2 mb-2">
          <li>🍕 +10 años de experiencia en el rubro</li>
          <li>🍕 Recetas tradicionales e innovadoras</li>
          <li>🍕 Compromiso con la calidad y la comunidad</li>
        </ul>
      </div>
    `;
  }
}

function mostrarVistaContactanos() {
  const contenido = document.getElementById('contenido');
  if (contenido) {
    contenido.innerHTML = `
      <div class="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-6">
        <h2 class="text-2xl font-bold text-green-700 mb-4 text-center">Contáctanos</h2>
        <form class="space-y-4" onsubmit="event.preventDefault(); document.getElementById('contactoMsg').style.display='block'; this.reset();">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <label for="contactoNombre" class="block text-green-700 font-semibold mb-1">Nombre</label>
              <input id="contactoNombre" type="text" required placeholder="Tu nombre" class="w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
            </div>
            <div class="flex-1">
              <label for="contactoEmail" class="block text-green-700 font-semibold mb-1">Email</label>
              <input id="contactoEmail" type="email" required placeholder="tucorreo@email.com" class="w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400">
            </div>
          </div>
          <div>
            <label for="contactoMensaje" class="block text-green-700 font-semibold mb-1">Mensaje</label>
            <textarea id="contactoMensaje" required rows="4" placeholder="¿En qué podemos ayudarte?" class="w-full border border-green-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
          </div>
          <button class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition" type="submit">Enviar mensaje</button>
          <div id="contactoMsg" class="success-msg text-green-700 text-center mt-2 hidden">¡Gracias por contactarnos! Te responderemos pronto.</div>
        </form>
      </div>
    `;
  }
}

function mostrarVistaUbicanos() {
  const contenido = document.getElementById('contenido');
  if (contenido) {
    contenido.innerHTML = `
      <div class="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-6 text-center">
        <h2 class="text-2xl font-bold text-green-700 mb-4">Ubícanos</h2>
        <p class="mb-4 text-gray-700">Estamos en Av. Principal 123, Cusco, Perú.</p>
        <div class="rounded-lg overflow-hidden shadow">
          <iframe src="https://www.google.com/maps?q=-13.517088,-71.978535&z=15&output=embed" width="100%" height="300" style="border:0;"></iframe>
        </div>
      </div>
    `;
  }
}

// Mejorar la vista del menú de pizzas con banner y sección destacada
function mostrarVistaPizzas() {
  const contenido = document.getElementById('contenido');
  if (contenido) {
    (async () => {
      const pizzas = await obtenerPizzas();
      // Agrupar por categoría
      const categorias = {};
      pizzas.forEach(pizza => {
        const cat = pizza.categoria ? pizza.categoria.trim() : 'Otras';
        if (!categorias[cat]) categorias[cat] = [];
        categorias[cat].push(pizza);
      });
      // Limpiar completamente el contenido antes de renderizar
      contenido.innerHTML = '';
      // Renderizar banner de bienvenida solo una vez
      const banner = document.createElement('div');
      banner.innerHTML = `
        <div class="flex flex-col items-center mb-6 w-full">
          <img src="https://static.vecteezy.com/system/resources/previews/011/157/909/non_2x/pizzeria-emblem-on-blackboard-pizza-logo-template-emblem-for-cafe-restaurant-or-food-delivery-service-vector.jpg" alt="Pizza Banner" class="w-32 h-32 md:w-56 md:h-56 object-contain rounded-full shadow mb-4">
          <div class="text-center max-w-xl px-2">
            <h1 class="text-2xl md:text-3xl font-bold text-green-700 mb-2">¡Bienvenido a Paladar del Inca!</h1>
            <p class="text-gray-700 mb-2">Descubre nuestras pizzas artesanales, hechas con ingredientes frescos y mucho amor. ¡Elige tu favorita y disfruta!</p>
          </div>
        </div>
      `;
      contenido.appendChild(banner);
      // Crear el grid de todas las categorías en una sola pasada
      const grid = document.createElement('div');
      grid.id = 'gridPizzas';
      contenido.appendChild(grid);
      let gridHtml = '';
      Object.entries(categorias).forEach(([cat, arr]) => {
        gridHtml += `
          <div class="mb-10">
            <h3 class="text-green-700 text-xl font-bold mb-4">${cat}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              ${arr.map(pizza => pizzaCardHTML(pizza)).join('')}
            </div>
          </div>
        `;
      });
      grid.innerHTML = gridHtml;
      // Reasignar eventos a los botones de las tarjetas
      document.querySelectorAll('.pizza-card-modern').forEach(card => {
        const id = card.getAttribute('data-id');
        const pizza = pizzas.find(p => p.id == id);
        card.querySelector('.pizza-img')?.addEventListener('click', () => mostrarModalPizza(pizza));
        card.querySelector('.pizza-nombre')?.addEventListener('click', () => mostrarModalPizza(pizza));
        // Botón agregar al carrito: solo abrir modal de detalles
        const btnAgregar = card.querySelector('.btn.agregar');
        if (btnAgregar) {
          btnAgregar.onclick = (e) => {
            e.stopPropagation();
            mostrarModalPizza(pizza);
          };
        }
      });
      // Reasignar evento al icono del carrito después de renderizar
      const iconCart = document.querySelector('.cart-icon');
      if (iconCart) {
        iconCart.onclick = window.mostrarCarritoModal;
      }
      actualizarCarritoUI();
    })();
  }
}

// Sobrescribir la función global para SPA
window.mostrarVistaPizzas = mostrarVistaPizzas;
window.mostrarModalPizza = mostrarModalPizza;
window.mostrarVistaNosotros = mostrarVistaNosotros;
window.mostrarVistaContactanos = mostrarVistaContactanos;
window.mostrarVistaUbicanos = mostrarVistaUbicanos;

// Reasignar evento al icono del carrito después de cualquier render dinámico
function actualizarCarritoUI() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let icon = document.querySelector('.cart-icon');
    let countSpan = document.getElementById('cartCount');
    const totalCantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (icon && countSpan) {
        countSpan.textContent = totalCantidad;
        icon.onclick = mostrarCarritoModal;
    }
}

// LÓGICA DEL CARRITO PARA INDEX.HTML
function agregarAlCarritoIndex(pizza) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  // Buscar si ya existe una pizza igual (id y tamaño)
  const idx = carrito.findIndex(item => item.id === pizza.id && item.tamano === pizza.tamano);
  if (idx !== -1) {
    const nuevaCantidad = carrito[idx].cantidad + pizza.cantidad;
    if (nuevaCantidad > 10) {
      alert('No puedes agregar más de 10 unidades de la misma pizza.');
      return;
    }
    carrito[idx].cantidad = nuevaCantidad;
  } else {
    if (pizza.cantidad > 10) {
      alert('No puedes agregar más de 10 unidades de la misma pizza.');
      pizza.cantidad = 10;
    }
    carrito.push(pizza);
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarritoUI();
}

function mostrarCarritoModal() {
  const modal = document.getElementById('carritoModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const cont = document.getElementById('carritoContenido');
  if (!carrito.length) {
    cont.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    let total = 0;
    cont.innerHTML = `<table class="carrito-table w-full text-sm">
      <thead><tr><th>Pizza</th><th>Tamaño</th><th>Cant.</th><th>Precio u.</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>
      ${carrito.map((item, i) => {
        total += item.precio_unitario * item.cantidad;
        return `<tr>
          <td>${item.nombre}</td>
          <td>${item.tamano === 'pequena' || item.tamano === 'pequeña' ? 'Pequeña' : item.tamano === 'mediana' ? 'Mediana' : item.tamano === 'grande' ? 'Grande' : '-'}</td>
          <td class="flex items-center gap-2 justify-center">
            <button class="btn-menos bg-gray-200 hover:bg-gray-300 text-lg px-2 rounded" data-idx="${i}">−</button>
            <span class="inline-block w-6 text-center">${item.cantidad}</span>
            <button class="btn-mas bg-gray-200 hover:bg-gray-300 text-lg px-2 rounded" data-idx="${i}">+</button>
          </td>
          <td>$${item.precio_unitario.toFixed(2)}</td>
          <td>$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
          <td><button class='btn-quitar text-red-500 underline' data-idx='${i}'>Quitar</button></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <div class="text-right mt-4 text-lg font-bold">Total: $${total.toFixed(2)}</div>
    <button id="btnContinuarPedido" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition mt-4">Continuar pedido</button>`;
    // Evento para continuar pedido
    const btn = document.getElementById('btnContinuarPedido');
    if (btn) btn.onclick = () => { window.location.href = 'interfaz/checkout.html'; };
    // Evento para quitar productos
    cont.querySelectorAll('.btn-quitar').forEach(btnQ => {
      btnQ.onclick = function() {
        const idx = parseInt(this.getAttribute('data-idx'));
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.splice(idx, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarritoModal();
        actualizarCarritoUI();
      };
    });
    // Evento para aumentar/disminuir cantidad
    cont.querySelectorAll('.btn-mas').forEach(btnMas => {
      btnMas.onclick = function() {
        const idx = parseInt(this.getAttribute('data-idx'));
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito[idx].cantidad < 10) {
          carrito[idx].cantidad++;
          localStorage.setItem('carrito', JSON.stringify(carrito));
          mostrarCarritoModal();
          actualizarCarritoUI();
        }
      };
    });
    cont.querySelectorAll('.btn-menos').forEach(btnMenos => {
      btnMenos.onclick = function() {
        const idx = parseInt(this.getAttribute('data-idx'));
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        if (carrito[idx].cantidad > 1) {
          carrito[idx].cantidad--;
        } else {
          carrito.splice(idx, 1);
        }
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarritoModal();
        actualizarCarritoUI();
      };
    });
  }
}

// Sobrescribir la función global para SPA y eventos
window.mostrarCarritoModal = mostrarCarritoModal;
window.agregarAlCarritoIndex = agregarAlCarritoIndex;
window.actualizarCarritoUI = actualizarCarritoUI;

// MODAL CARRITO: mostrar y ocultar correctamente
function cerrarCarritoModal() {
  const modal = document.getElementById('carritoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Asignar evento al icono del carrito y al botón de cerrar SIEMPRE después de renderizar
function asignarEventosCarrito() {
  const iconCart = document.querySelector('.cart-icon');
  if (iconCart) {
    iconCart.onclick = mostrarCarritoModal;
  }
  const cerrarCarritoBtn = document.getElementById('cerrarCarritoBtn');
  if (cerrarCarritoBtn) {
    cerrarCarritoBtn.onclick = cerrarCarritoModal;
  }
}

// Permitir cerrar el modal del carrito desde cualquier parte
window.cerrarCarritoModal = cerrarCarritoModal;

// ===== NAVEGACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado, inicializando navegación...');
  
  // Event listeners para el menú principal (desktop)
  const navMenu = document.getElementById('navMenu');
  const navNosotros = document.getElementById('navNosotros');
  const navContactanos = document.getElementById('navContactanos');
  const navUbicanos = document.getElementById('navUbicanos');

  if (navMenu) {
    navMenu.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegando a Menú');
      mostrarVistaPizzas();
    });
  }

  if (navNosotros) {
    navNosotros.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegando a Nosotros');
      mostrarVistaNosotros();
    });
  }

  if (navContactanos) {
    navContactanos.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegando a Contáctanos');
      mostrarVistaContactanos();
    });
  }

  if (navUbicanos) {
    navUbicanos.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navegando a Ubícanos');
      mostrarVistaUbicanos();
    });
  }

  // Mostrar vista inicial (Menú de pizzas) al cargar la página
  if (document.getElementById('contenido')) {
    console.log('Mostrando vista inicial');
    mostrarVistaPizzas();
  }
  asignarEventosCarrito();
}); 