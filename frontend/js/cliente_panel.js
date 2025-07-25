// cliente_panel.js
// Lógica principal para el panel de cliente de la pizzería
// Autor: [Tu Nombre]
// Comentarios detallados en español

import { obtenerPizzas, obtenerFavoritosUsuario, quitarFavoritoUsuario, agregarFavoritoUsuario, obtenerCalificacionesUsuario, calificarPizzaUsuario, crearPedido, obtenerPedidosUsuario } from './api.js';

// ===== Variables globales =====
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');
const pedidosTotales = document.getElementById('pedidosTotales');
const pedidosPendientes = document.getElementById('pedidosPendientes');
const misPedidosList = document.getElementById('misPedidosList');
const explorarProductos = document.getElementById('explorarProductos');
const perfilContent = document.getElementById('perfilContent');

// ===== Funciones de inicialización de secciones =====
async function inicializarDashboard() {
  mostrarBienvenidaDashboard();
  try {
    const pedidos = await obtenerPedidosUsuario();
    // Total de pedidos realizados
    const totalPedidos = pedidos.length;
    // Total de pedidos pendientes (estados: pendiente, confirmado, preparando)
    const pendientes = pedidos.filter(p => ['pendiente', 'confirmado', 'preparando'].includes((p.estado || '').toLowerCase())).length;
    if (pedidosTotales) pedidosTotales.textContent = totalPedidos;
    if (pedidosPendientes) pedidosPendientes.textContent = pendientes;
  } catch (e) {
    if (pedidosTotales) pedidosTotales.textContent = '0';
    if (pedidosPendientes) pedidosPendientes.textContent = '0';
  }
  // Eliminar contenido de debug
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection) {
    const debugDiv = dashboardSection.querySelector('.debug-content');
    if (debugDiv) debugDiv.remove();
  }
}

function inicializarMisPedidos() {
  console.log('Inicializando Mis Pedidos...');
  if (misPedidosList) {
    misPedidosList.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Historial de Pedidos</h3>
        <p class="text-gray-600">No tienes pedidos aún.</p>
      </div>
    `;
  }
}

function inicializarExplorar() {
  console.log('Inicializando Explorar Productos...');
  if (explorarProductos) {
    explorarProductos.innerHTML = '<div class="loading">Cargando productos...</div>';
  }
}

function inicializarPerfil() {
  console.log('Inicializando Perfil...');
  const perfilContent = document.getElementById('perfilContent');
  if (perfilContent) {
    renderPerfil();
  } else {
    console.error('Elemento perfilContent no encontrado');
  }
}

// ===== Navegación entre secciones =====
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    console.log('Navegando a sección:', link.getAttribute('data-section'));
    
    // Remover clase active de todos los enlaces
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const sectionId = link.getAttribute('data-section');
    
    // Ocultar todas las secciones
    sections.forEach(sec => {
      sec.classList.add('hidden');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      console.log('Sección mostrada:', sectionId);
    } else {
      console.error('Sección no encontrada:', sectionId);
    }
    
    // Cargar contenido específico de la sección
    switch(sectionId) {
      case 'dashboard':
        inicializarDashboard();
        break;
      case 'mis-pedidos':
        inicializarMisPedidos();
        break;
      case 'favoritos':
        cargarFavoritos();
        break;
      case 'explorar':
        mostrarMenuCliente(); // Usar la función que llama a la API
        break;
      case 'perfil':
        inicializarPerfil();
        break;
      default:
        console.log('Sección sin inicialización específica:', sectionId);
    }
  });
});

// ===== Cargar datos del usuario =====
let usuario = JSON.parse(localStorage.getItem('usuario')) || {
  nombre: 'Cliente',
  apellido: '',
  email: 'cliente@pizzeria.com',
};

if (userName) userName.textContent = usuario.nombre;
if (userEmail) userEmail.textContent = usuario.email;
if (userAvatar) userAvatar.textContent = usuario.nombre.charAt(0).toUpperCase();

// ===== Mejorar bienvenida personalizada en dashboard =====
function mostrarBienvenidaDashboard() {
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection) {
    let bienvenida = dashboardSection.querySelector('.bienvenida-cliente');
    if (!bienvenida) {
      bienvenida = document.createElement('div');
      bienvenida.className = 'bienvenida-cliente text-lg font-semibold text-green-800 mb-4';
      dashboardSection.insertBefore(bienvenida, dashboardSection.firstChild.nextSibling); // después del h2
    }
    bienvenida.textContent = `¡Bienvenido/a, ${usuario.nombre}!`;
  }
}

// ===== Inicialización al cargar la página =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('Panel de cliente cargado');
  
  // Mostrar la sección dashboard por defecto
  const dashboardSection = document.getElementById('dashboard');
  if (dashboardSection) {
    dashboardSection.classList.remove('hidden');
  }
  
  // Activar el enlace del dashboard
  const dashboardLink = document.querySelector('[data-section="dashboard"]');
  if (dashboardLink) {
    dashboardLink.classList.add('active');
  }
  
  // Inicializar el dashboard
  inicializarDashboard();
  
  // Inicializar el botón flotante del carrito
  asignarEventoCarritoFlotante();
  
  // Configurar el botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Limpiar datos de sesión
      localStorage.removeItem('carrito');
      localStorage.removeItem('favoritos');
      localStorage.removeItem('calificaciones');
      // Redirigir al login
      window.location.href = '../interfaz/login.html';
    });
  }
  
  // Configurar el botón de menú móvil
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }
});



// ===== Lógica para Perfil (editable, solo localStorage) =====
async function renderPerfil() {
  const perfilContent = document.getElementById('perfilContent');
  if (!perfilContent) {
    console.error('Elemento perfilContent no encontrado');
    return;
  }

  // Obtener datos del usuario
  let usuario = JSON.parse(localStorage.getItem('usuario')) || {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ciudad: '',
    descripcion: '',
    edad: '',
  };

  // Estadísticas (pedidos y favoritos)
  const pedidos = parseInt(document.getElementById('pedidosTotales')?.textContent) || 0;
  // Obtener favoritos en tiempo real desde la API
  let favoritos = 0;
  try {
    const { obtenerFavoritosUsuario } = await import('./api.js');
    const favs = await obtenerFavoritosUsuario();
    favoritos = Array.isArray(favs) ? favs.length : 0;
  } catch {
    favoritos = 0;
  }

  perfilContent.innerHTML = `
    <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border border-green-200">
      <div class="flex flex-col items-center w-full">
        <div class="w-28 h-28 rounded-full bg-gradient-to-tr from-green-200 to-green-400 flex items-center justify-center text-5xl font-bold text-green-800 shadow-inner border-4 border-green-300 mb-4">
          <svg xmlns='http://www.w3.org/2000/svg' class='h-20 w-20 text-green-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='8' r='4' stroke='currentColor' stroke-width='2' fill='white'/><path stroke='currentColor' stroke-width='2' d='M4 20c0-4 4-7 8-7s8 3 8 7' fill='white'/></svg>
        </div>
        <div class="text-2xl font-bold text-gray-800 text-center">${usuario.nombre} ${usuario.apellido ? usuario.apellido : ''}</div>
        <div class="text-gray-500 text-center text-lg mb-2">${usuario.email}</div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center my-4">
          <div class="flex flex-col items-center">
            <span class="text-xl font-bold text-green-700">${pedidos}</span>
            <span class="text-gray-500 text-sm">Pedidos</span>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-xl font-bold text-green-700">${favoritos}</span>
            <span class="text-gray-500 text-sm">Favoritos</span>
          </div>
        </div>
        <div class="text-gray-700 text-center mb-4">
          ${usuario.descripcion || '¡Bienvenido a tu perfil! Aquí puedes ver y editar tus datos personales.'}
        </div>
        <div class="flex gap-4 mt-2">
          <button id="btnEditarPerfil" class="bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 px-6 transition shadow">Editar perfil</button>
          <button id="btnCambiarContrasena" class="bg-blue-600 hover:bg-blue-800 text-white font-bold rounded-lg py-2 px-6 transition shadow">Cambiar contraseña</button>
        </div>
      </div>
    </div>
  `;

  // Eventos para los botones
  document.getElementById('btnEditarPerfil').onclick = function() {
    mostrarFormularioEditarPerfil();
  };
  document.getElementById('btnCambiarContrasena').onclick = function() {
    mostrarFormularioCambiarContrasena();
  };
}

// Funciones placeholder para mostrar formularios (debes implementarlas)
function mostrarFormularioEditarPerfil() {
  let usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  // Modal HTML
  let modal = document.createElement('div');
  modal.id = 'modalEditarPerfil';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative border border-green-200 animate-fadeIn flex flex-col items-center">
      <button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalEditarPerfil">&times;</button>
      <h3 class="text-2xl font-bold text-green-800 mb-4 text-center">Editar perfil</h3>
      <form id="formEditarPerfil" class="flex flex-col gap-4 w-full">
        <div>
          <label class="font-semibold text-gray-700">Nombre</label>
          <input type="text" id="editarNombre" value="${usuario.nombre || ''}" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
        </div>
        <div>
          <label class="font-semibold text-gray-700">Apellido</label>
          <input type="text" id="editarApellido" value="${usuario.apellido || ''}" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
        </div>
        <div>
          <label class="font-semibold text-gray-700">Email</label>
          <input type="email" id="editarEmail" value="${usuario.email || ''}" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
        </div>
        <div>
          <label class="font-semibold text-gray-700">Teléfono</label>
          <input type="tel" id="editarTelefono" value="${usuario.telefono || ''}" class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
        </div>
        <button type="submit" class="bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 transition shadow-lg">Guardar cambios</button>
        <div id="editarPerfilMsg" class="text-center text-green-700 font-semibold mt-2"></div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('cerrarModalEditarPerfil').onclick = () => modal.remove();
  document.getElementById('modalEditarPerfil').onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.getElementById('formEditarPerfil').onsubmit = async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('editarNombre').value.trim();
    const apellido = document.getElementById('editarApellido').value.trim();
    const email = document.getElementById('editarEmail').value.trim();
    const telefono = document.getElementById('editarTelefono').value.trim();
    // Obtener id del usuario desde localStorage o JWT
    let id = usuario.id;
    if (!id) {
      try {
        const token = localStorage.getItem('jwt');
        const payload = JSON.parse(atob(token.split('.')[1]));
        id = payload.data?.id;
      } catch {}
    }
    if (!id) {
      document.getElementById('editarPerfilMsg').textContent = 'No se pudo identificar al usuario.';
      return;
    }
    // Llamar API para actualizar usuario, siempre enviar rol: 'cliente'
    try {
      const { actualizarUsuario } = await import('./api.js');
      const res = await actualizarUsuario(id, { nombre, apellido, correo: email, telefono, rol: 'cliente' });
      if (res.mensaje && res.mensaje.includes('exitosamente')) {
        // Actualizar localStorage y UI
        usuario.nombre = nombre;
        usuario.apellido = apellido;
        usuario.email = email;
        usuario.telefono = telefono;
        usuario.rol = 'cliente';
        localStorage.setItem('usuario', JSON.stringify(usuario));
        document.getElementById('userName').textContent = nombre;
        document.getElementById('userEmail').textContent = email;
        document.getElementById('userAvatar').textContent = nombre.charAt(0).toUpperCase();
        renderPerfil();
        modal.remove();
      } else {
        document.getElementById('editarPerfilMsg').textContent = res.mensaje || 'Error al actualizar.';
      }
    } catch (err) {
      document.getElementById('editarPerfilMsg').textContent = 'Error de red.';
    }
  };
}

function mostrarFormularioCambiarContrasena() {
  let usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  let modal = document.createElement('div');
  modal.id = 'modalCambiarContrasena';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative border border-blue-200 animate-fadeIn flex flex-col items-center">
      <button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalCambiarContrasena">&times;</button>
      <h3 class="text-2xl font-bold text-blue-800 mb-4 text-center">Cambiar contraseña</h3>
      <form id="formCambiarContrasena" class="flex flex-col gap-4 w-full">
        <div>
          <label class="font-semibold text-gray-700">Nueva contraseña</label>
          <input type="password" id="nuevaContrasena" required minlength="8" class="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
        </div>
        <div>
          <label class="font-semibold text-gray-700">Confirmar contraseña</label>
          <input type="password" id="confirmarContrasena" required minlength="8" class="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
        </div>
        <button type="submit" class="bg-blue-600 hover:bg-blue-800 text-white font-bold rounded-lg py-2 transition shadow-lg">Guardar contraseña</button>
        <div id="cambiarContrasenaMsg" class="text-center text-blue-700 font-semibold mt-2"></div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('cerrarModalCambiarContrasena').onclick = () => modal.remove();
  document.getElementById('modalCambiarContrasena').onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.getElementById('formCambiarContrasena').onsubmit = async function(e) {
    e.preventDefault();
    const nueva = document.getElementById('nuevaContrasena').value;
    const confirmar = document.getElementById('confirmarContrasena').value;
    if (nueva !== confirmar) {
      document.getElementById('cambiarContrasenaMsg').textContent = 'Las contraseñas no coinciden.';
      return;
    }
    if (nueva.length < 8) {
      document.getElementById('cambiarContrasenaMsg').textContent = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    // Obtener id del usuario desde localStorage o JWT
    let id = usuario.id;
    if (!id) {
      try {
        const token = localStorage.getItem('jwt');
        const payload = JSON.parse(atob(token.split('.')[1]));
        id = payload.data?.id;
      } catch {}
    }
    if (!id) {
      document.getElementById('cambiarContrasenaMsg').textContent = 'No se pudo identificar al usuario.';
      return;
    }
    // Llamar API para cambiar contraseña
    try {
      const { cambiarContrasenaUsuario } = await import('./api.js');
      const res = await cambiarContrasenaUsuario(id, nueva);
      if (res.mensaje && res.mensaje.includes('actualizada')) {
        document.getElementById('cambiarContrasenaMsg').textContent = 'Contraseña actualizada correctamente.';
        setTimeout(() => { modal.remove(); }, 1500);
      } else {
        document.getElementById('cambiarContrasenaMsg').textContent = res.mensaje || 'Error al cambiar contraseña.';
      }
    } catch (err) {
      document.getElementById('cambiarContrasenaMsg').textContent = 'Error de red.';
    }
  };
}

// Mostrar perfil al entrar a la sección 'perfil'
document.querySelector('[data-section="perfil"]').addEventListener('click', renderPerfil);
// Si la sección perfil está activa al cargar la página, mostrar el perfil
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('perfil').classList.contains('active')) {
    renderPerfil();
  }
});

// ===== Lógica para el historial de pedidos del cliente (Tailwind, filtros y exportación) =====
async function renderHistorialPedidos() {
  try {
    const pedidos = await obtenerPedidosUsuario();
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    // Filtros
    let pedidosUsuario = pedidos;
    const desde = document.getElementById('filtroDesde').value;
    const hasta = document.getElementById('filtroHasta').value;
    const estado = document.getElementById('filtroEstado').value;
    if (desde) {
      pedidosUsuario = pedidosUsuario.filter(p => p.fecha && p.fecha >= desde);
    }
    if (hasta) {
      pedidosUsuario = pedidosUsuario.filter(p => p.fecha && p.fecha <= hasta);
    }
    if (estado) {
      pedidosUsuario = pedidosUsuario.filter(p => p.estado === estado);
    }
    if (!pedidosUsuario.length) {
      misPedidosList.innerHTML = '<div class="text-gray-500 text-center py-4">No tienes pedidos en este rango.</div>';
      return;
    }
    let html = `<div class="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-green-100">
          <tr>
            <th class="px-3 py-2 font-bold text-left">Fecha</th>
            <th class="px-3 py-2 font-bold text-left">Nombre</th>
            <th class="px-3 py-2 font-bold text-left">Tamaño</th>
            <th class="px-3 py-2 font-bold text-left">Cantidad</th>
            <th class="px-3 py-2 font-bold text-left">Precio Unitario</th>
            <th class="px-3 py-2 font-bold text-left">Total Item</th>
            <th class="px-3 py-2 font-bold text-left">Total Pedido</th>
            <th class="px-3 py-2 font-bold text-left">Estado</th>
            <th class="px-3 py-2 font-bold text-left">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${pedidosUsuario.map((pedido, pedidoIdx) => {
            const items = pedido.items || pedido.detalle || [];
            const pedidoId = pedido.id || pedido.pedido_id || pedidoIdx;
            return items.map((item, idx) => `
              <tr class="hover:bg-green-50 transition">
                ${idx === 0 ? `<td class="px-3 py-2" rowspan="${items.length}">${pedido.fecha || pedido.creado_en || '-'}</td>` : ''}
                <td class="px-3 py-2">${item.nombre_pizza || item.nombre || '-'}</td>
                <td class="px-3 py-2">${item.tamano || '-'}</td>
                <td class="px-3 py-2">${item.cantidad}</td>
                <td class="px-3 py-2">$${item.precio_unitario ? Number(item.precio_unitario).toFixed(2) : '-'}</td>
                <td class="px-3 py-2">$${item.precio_total ? Number(item.precio_total).toFixed(2) : '-'}</td>
                ${idx === 0 ? `<td class="px-3 py-2" rowspan="${items.length}">$${pedido.monto_total ? Number(pedido.monto_total).toFixed(2) : (pedido.total ? Number(pedido.total).toFixed(2) : '-')}</td>` : ''}
                ${idx === 0 ? `<td class="px-3 py-2" rowspan="${items.length}">${pedido.estado || 'pendiente'}</td>` : ''}
                ${idx === 0 ? `<td class="px-3 py-2" rowspan="${items.length}"><button class='bg-blue-600 hover:bg-blue-800 text-white font-semibold rounded px-3 py-1 transition' onclick='window.mostrarModalDetallePedido(${JSON.stringify(pedido).replace(/'/g, "\'")})'>Ver detalles</button></td>` : ''}
              </tr>
            `).join('');
          }).join('')}
        </tbody>
      </table>
    </div>`;
    misPedidosList.innerHTML = html;

    // Modal de detalles de pedido
    window.mostrarModalDetallePedido = function(pedido) {
      // Eliminar cualquier modal previo
      document.getElementById('modalDetallePedidoContainer')?.remove();
      const items = pedido.items || pedido.detalle || [];
      let modalHtml = `
        <div id="modalDetallePedidoContainer" class="fixed inset-0 flex items-center justify-center z-50">
          <div class="absolute inset-0 bg-black bg-opacity-40" id="modalDetallePedidoBg"></div>
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative border border-green-200 animate-fadeIn m-auto flex flex-col items-center justify-center z-50 overflow-y-auto max-h-[95vh]">
            <button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalDetallePedido">&times;</button>
            <h3 class="text-2xl font-bold text-green-800 mb-4 text-center">Detalle del pedido</h3>
            <div class="w-full mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span class="font-semibold text-gray-700">Fecha:</span> ${pedido.fecha || pedido.creado_en || '-'}</div>
              <div><span class="font-semibold text-gray-700">Estado:</span> ${pedido.estado || '-'}</div>
              <div><span class="font-semibold text-gray-700">Total:</span> $${pedido.monto_total ? Number(pedido.monto_total).toFixed(2) : (pedido.total ? Number(pedido.total).toFixed(2) : '-')}</div>
              <div><span class="font-semibold text-gray-700">Método de pago:</span> ${pedido.metodo_pago || '-'}</div>
              <div><span class="font-semibold text-gray-700">Dirección:</span> ${pedido.direccion_entrega || '-'}</div>
              <div><span class="font-semibold text-gray-700">Notas:</span> ${pedido.notas || '-'}</div>
            </div>
            <div class="w-full mb-2">
              <h4 class="font-bold text-green-700 mb-2">Productos</h4>
              <div class="overflow-x-auto w-full">
                <table class="min-w-full divide-y divide-gray-200 text-sm mb-2">
                  <thead class="bg-green-100">
                    <tr>
                      <th class="px-2 py-1 font-bold text-left">Nombre</th>
                      <th class="px-2 py-1 font-bold text-left">Tamaño</th>
                      <th class="px-2 py-1 font-bold text-left">Cantidad</th>
                      <th class="px-2 py-1 font-bold text-left">Precio Unitario</th>
                      <th class="px-2 py-1 font-bold text-left">Total Item</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    ${items.map(item => `
                      <tr>
                        <td class="px-2 py-1">${item.nombre_pizza || item.nombre || '-'}</td>
                        <td class="px-2 py-1">${item.tamano || '-'}</td>
                        <td class="px-2 py-1">${item.cantidad}</td>
                        <td class="px-2 py-1">$${item.precio_unitario ? Number(item.precio_unitario).toFixed(2) : '-'}</td>
                        <td class="px-2 py-1">$${item.precio_total ? Number(item.precio_total).toFixed(2) : '-'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>`;
      let modalDiv = document.createElement('div');
      modalDiv.innerHTML = modalHtml;
      document.body.appendChild(modalDiv.firstElementChild);
      document.getElementById('cerrarModalDetallePedido').onclick = () => {
        document.getElementById('modalDetallePedidoContainer').remove();
      };
      document.getElementById('modalDetallePedidoBg').onclick = () => {
        document.getElementById('modalDetallePedidoContainer').remove();
      };
    };
  } catch (e) {
    misPedidosList.innerHTML = `<div class='text-red-500 text-center py-4'>Error al cargar tus pedidos: ${e.message}</div>`;
  }
}
// Mostrar historial al entrar a la sección 'mis-pedidos' y al filtrar
const btnFiltrarPedidos = document.getElementById('btnFiltrarPedidos');
if (btnFiltrarPedidos) {
  btnFiltrarPedidos.onclick = renderHistorialPedidos;
}
document.querySelector('[data-section="mis-pedidos"]').addEventListener('click', renderHistorialPedidos);
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('mis-pedidos').classList.contains('block') || document.getElementById('mis-pedidos').classList.contains('active')) {
    renderHistorialPedidos();
  }
});
// ===== Exportar pedidos a PDF y Excel =====
function exportarPedidosPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Mis Pedidos', 14, 18);
  doc.autoTable({
    html: '#misPedidosList table',
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 12 }
  });
  doc.save('mis_pedidos.pdf');
}
function exportarPedidosExcel() {
  const tabla = document.querySelector('#misPedidosList table');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: 'MisPedidos' });
  XLSX.writeFile(wb, 'mis_pedidos.xlsx');
}
const btnExportarPedidosPDF = document.getElementById('btnExportarPedidosPDF');
if (btnExportarPedidosPDF) {
  btnExportarPedidosPDF.onclick = exportarPedidosPDF;
}
const btnExportarPedidosExcel = document.getElementById('btnExportarPedidosExcel');
if (btnExportarPedidosExcel) {
  btnExportarPedidosExcel.onclick = exportarPedidosExcel;
}

// ===== Guardar pedido en localStorage tras compra (para simular backend) =====
window.guardarPedidoCliente = function(pedido) {
  const pedidos = JSON.parse(localStorage.getItem('pedidos_cliente') || '[]');
  pedidos.push(pedido);
  localStorage.setItem('pedidos_cliente', JSON.stringify(pedidos));
};

// ===== Cerrar sesión =====
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Aquí deberías limpiar el almacenamiento y redirigir al login
  localStorage.clear();
  window.location.href = 'interfaz/login.html';
});

// ===== Lógica para mostrar/ocultar el sidebar en mobile =====
// ===== Sidebar y botón hamburguesa 100% responsive =====
// (Asegúrate de que el HTML tenga el id 'menuToggle' en el botón y 'sidebar' en el aside)
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
  }
}

if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', toggleSidebar);

  // Cerrar sidebar al hacer clic fuera (en móvil/tablet)
  document.addEventListener('click', function(event) {
    if (window.innerWidth <= 900 && sidebar.classList.contains('translate-x-0')) {
      if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
      }
    }
  });

  // Cerrar sidebar al redimensionar a desktop
  window.addEventListener('resize', function() {
    if (window.innerWidth > 900) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
    }
  });
}

// Mostrar/ocultar sidebar al hacer clic en el botón hamburguesa
// menuToggle.addEventListener('click', toggleSidebar); // This line is now handled by the new function

// Cerrar sidebar al hacer clic en un enlace del menú (en mobile)
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open'); // This class is no longer used for the sidebar
      document.getElementById('sidebarOverlay')?.remove();
      sidebar.classList.remove('z-50');
    }
  });
});

// Cerrar sidebar al redimensionar a desktop
window.addEventListener('resize', function() {
  if (window.innerWidth > 900) {
    sidebar.classList.remove('open'); // This class is no longer used for the sidebar
    document.getElementById('sidebarOverlay')?.remove();
    sidebar.classList.remove('z-50');
  }
});

// ===== Mostrar menú de productos en la sección 'explorar' con favoritos y estrellas =====
// SVGs para los iconos
const svgCorazonLleno = `<svg width='22' height='22' viewBox='0 0 24 24' fill='#e74c3c' xmlns='http://www.w3.org/2000/svg'><path d='M12 21s-7.5-6.1-9.5-9.1C-1.1 8.1 1.6 3 6.1 3c2.1 0 3.9 1.2 4.9 3.1C12.9 4.2 14.7 3 16.8 3c4.5 0 7.2 5.1 3.6 8.9C19.5 14.9 12 21 12 21z'/></svg>`;
const svgCorazonVacio = `<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#b0b0b0' stroke-width='2' xmlns='http://www.w3.org/2000/svg'><path d='M12 21s-7.5-6.1-9.5-9.1C-1.1 8.1 1.6 3 6.1 3c2.1 0 3.9 1.2 4.9 3.1C12.9 4.2 14.7 3 16.8 3c4.5 0 7.2 5.1 3.6 8.9C19.5 14.9 12 21 12 21z'/></svg>`;
const svgEstrellaLlena = `<svg width='20' height='20' viewBox='0 0 24 24' fill='#f1c40f' xmlns='http://www.w3.org/2000/svg'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/></svg>`;
const svgEstrellaVacia = `<svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f1c40f' stroke-width='2' xmlns='http://www.w3.org/2000/svg'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'/></svg>`;

async function mostrarMenuCliente() {
  const contenedor = document.getElementById('explorarProductos');
  contenedor.innerHTML = '<div class="loading">Cargando productos...</div>';
  try {
    let productos = [];
    let favoritos = [];
    let calificaciones = {};
    try {
      productos = await obtenerPizzas();
    } catch {
      contenedor.innerHTML = '<div style="padding:2rem; text-align:center; color:#888;">No hay productos disponibles.</div>';
      return;
    }
    try {
      favoritos = await obtenerFavoritosUsuario();
    } catch {
      favoritos = null; // Si hay error, no mostrar favoritos
    }
    try {
      calificaciones = await obtenerCalificacionesUsuario();
    } catch {
      calificaciones = null; // Si hay error, no mostrar estrellas
    }
    if (!productos.length) {
      contenedor.innerHTML = '<div style="padding:2rem; text-align:center; color:#888;">No hay productos disponibles.</div>';
      return;
    }
    contenedor.innerHTML = productos.map(producto => {
      const showFav = Array.isArray(favoritos);
      const showCal = calificaciones && typeof calificaciones === 'object';
      const favorito = showFav ? favoritos.includes(producto.id) : false;
      const calificacion = showCal ? (calificaciones[producto.id] || 0) : 0;
      return `
      <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200 hover:shadow-lg transition">
        <div class="flex items-center justify-between w-full mb-2">
          ${showFav ? `<span class="icono-favorito cursor-pointer" data-id="${producto.id}" title="Añadir a favoritos">${favorito ? svgCorazonLleno : svgCorazonVacio}</span>` : '<span></span>'}
          <span class="flex gap-1">${showCal ? [1,2,3,4,5].map(n => `<span class="estrella cursor-pointer" data-id="${producto.id}" data-valor="${n}">${n <= calificacion ? svgEstrellaLlena : svgEstrellaVacia}</span>`).join('') : ''}</span>
        </div>
        <img src="${producto.url_imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${producto.nombre}" class="w-full max-w-xs h-32 object-cover rounded mb-2">
        <div class="font-bold text-lg text-gray-800 mb-1">${producto.nombre}</div>
        <div class="text-sm text-gray-500 mb-1">${producto.ingredientes || 'Sin ingredientes especificados'}</div>
        <div class="text-green-600 font-semibold text-base mb-1">$${parseFloat(producto.precio).toFixed(2)}</div>
        <div class="mt-1 text-xs font-semibold ${producto.disponible == 1 ? 'text-green-700' : 'text-red-600'}">
          ${producto.disponible == 1 ? 'Disponible' : 'No disponible'}
        </div>
        <div class="flex gap-2 mt-2">
          <button class="bg-green-600 hover:bg-green-800 text-white font-semibold rounded-lg py-1 px-3 transition text-sm btn-carrito" ${producto.disponible != 1 ? 'disabled' : ''} onclick="mostrarModalDetalleProductoPanel(${JSON.stringify(producto).replace(/"/g, '&quot;')})">Agregar</button>
        </div>
      </div>
      `;
    }).join('');
    // Eventos para favoritos
    if (Array.isArray(favoritos)) {
      document.querySelectorAll('.icono-favorito').forEach(icono => {
        icono.addEventListener('click', async e => {
          const id = parseInt(icono.getAttribute('data-id'));
          const esFavorito = icono.innerHTML.includes('fill="#e74c3c"');
          console.log('esFavorito:', esFavorito, 'innerHTML:', icono.innerHTML);
          // Cambio visual inmediato
          icono.innerHTML = esFavorito ? svgCorazonVacio : svgCorazonLleno;
          try {
            if (esFavorito) {
              const res = await quitarFavoritoUsuario(id);
              if (!res.ok) throw new Error('No se pudo eliminar de favoritos');
              document.dispatchEvent(new CustomEvent('favoritosActualizados'));
            } else {
              const res = await agregarFavoritoUsuario(id);
              if (!res.ok) throw new Error('No se pudo agregar a favoritos');
              document.dispatchEvent(new CustomEvent('favoritosActualizados'));
            }
          } catch (err) {
            // Revertir el cambio visual si falla
            icono.innerHTML = esFavorito ? svgCorazonLleno : svgCorazonVacio;
            alert('Error al actualizar favoritos: ' + err.message);
          }
        });
      });
    }
    // Eventos para calificación
    if (calificaciones && typeof calificaciones === 'object') {
      document.querySelectorAll('.estrella').forEach(estrella => {
        estrella.addEventListener('click', async e => {
          const id = parseInt(estrella.getAttribute('data-id'));
          const valor = parseInt(estrella.getAttribute('data-valor'));
          await calificarPizzaUsuario(id, valor);
          // Actualizar solo las estrellas de este producto
          document.querySelectorAll(`.estrella[data-id='${id}']`).forEach(star => {
            const starValor = parseInt(star.getAttribute('data-valor'));
            star.innerHTML = starValor <= valor ? svgEstrellaLlena : svgEstrellaVacia;
          });
          // (Opcional) Feedback visual
          estrella.parentElement.classList.add('animate-pulse');
          setTimeout(() => estrella.parentElement.classList.remove('animate-pulse'), 400);
        });
      });
    }
  } catch (e) {
    contenedor.innerHTML = '<div class="no-data">Error al cargar productos</div>';
  }
}

// Mostrar menú al entrar a la sección 'explorar'
document.querySelector('[data-section="explorar"]').addEventListener('click', mostrarMenuCliente);

// Si la sección explorar está activa al cargar la página, cargar el menú
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('explorar').classList.contains('active')) {
    mostrarMenuCliente();
  }
});

// MODAL DETALLE DE PRODUCTO PARA PANEL CLIENTE
function mostrarModalDetalleProductoPanel(pizza) {
  // Eliminar cualquier modal previo
  document.getElementById('modalDetalleProductoPanelContainer')?.remove();
  let precioBase = parseFloat(pizza.precio);
  let html = `
    <div id="modalDetalleProductoPanelContainer" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black bg-opacity-40" id="modalDetalleProductoPanelBg"></div>
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-green-200 animate-fadeIn m-auto flex flex-col items-center justify-center z-50" id="modalDetalleProductoPanel">
        <button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalDetalleProductoPanel">&times;</button>
        <img src="${pizza.url_imagen || pizza.imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${pizza.nombre}" class="w-full max-w-xs h-40 object-cover rounded-xl mb-4 shadow-md">
        <h3 class="text-2xl font-bold text-green-800 mb-2 text-center">${pizza.nombre}</h3>
        <div class="text-gray-700 mb-2 text-center"><b>Ingredientes:</b> ${pizza.ingredientes || pizza.descripcion || 'Sin ingredientes'}</div>
        <div class="text-green-700 font-semibold mb-4 text-lg">Precio base: $<span id='precioBaseDetalle'>${precioBase.toFixed(2)}</span></div>
        <form id="formAgregarCarritoPanel" class="flex flex-col gap-3 w-full">
          <div class="flex flex-col gap-1">
            <label for="cantidadDetalle" class="font-medium text-gray-700">Cantidad</label>
            <input type="number" id="cantidadDetalle" min="1" max="10" value="1" class="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-24" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="tamanoDetalle" class="font-medium text-gray-700">Tamaño</label>
            <select id="tamanoDetalle" class="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
              <option value="pequeña">Pequeña</option>
              <option value="mediana">Mediana (+$5)</option>
              <option value="grande">Grande (+$10)</option>
            </select>
          </div>
          <div class="text-green-800 font-bold text-lg mt-2">Total: $<span id="precioTotalDetalle">${precioBase.toFixed(2)}</span></div>
          <div class="flex gap-4 mt-2">
            <button type="button" class="bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 px-6 transition shadow" id="btnAgregarSolo">Agregar</button>
            <button type="button" class="bg-blue-600 hover:bg-blue-800 text-white font-bold rounded-lg py-2 px-6 transition shadow" id="btnOrdenarDirecto">Ordenar</button>
          </div>
        </form>
      </div>
    </div>`;
  let modalDiv = document.createElement('div');
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv.firstElementChild);
  // Cerrar modal
  document.getElementById('cerrarModalDetalleProductoPanel').onclick = () => {
    document.getElementById('modalDetalleProductoPanelContainer').remove();
  };
  document.getElementById('modalDetalleProductoPanelBg').onclick = () => {
    document.getElementById('modalDetalleProductoPanelContainer').remove();
  };
  const cantidadInput = document.getElementById('cantidadDetalle');
  const tamanoInput = document.getElementById('tamanoDetalle');
  const precioTotalSpan = document.getElementById('precioTotalDetalle');
  function actualizarPrecioTotal() {
    let cantidad = parseInt(cantidadInput.value) || 1;
    let tamano = tamanoInput.value;
    let precio = precioBase;
    if (tamano === 'mediana') precio += 5;
    if (tamano === 'grande') precio += 10;
    precioTotalSpan.textContent = (precio * cantidad).toFixed(2);
  }
  cantidadInput.addEventListener('input', actualizarPrecioTotal);
  tamanoInput.addEventListener('change', actualizarPrecioTotal);
  // Botón Agregar: solo agrega al carrito y cierra el modal
  document.getElementById('btnAgregarSolo').onclick = function() {
    let cantidad = parseInt(cantidadInput.value) || 1;
    let tamano = tamanoInput.value;
    let precio = precioBase;
    if (tamano === 'mediana') precio += 5;
    if (tamano === 'grande') precio += 10;
    let item = {
      ...pizza,
      cantidad,
      tamano,
      precio_unitario: precio,
      precio_total: precio * cantidad
    };
    agregarAlCarritoPanel(item);
    document.getElementById('modalDetalleProductoPanelContainer').remove();
  };
  // Botón Ordenar: agrega al carrito y abre el modal de checkout
  document.getElementById('btnOrdenarDirecto').onclick = function() {
    let cantidad = parseInt(cantidadInput.value) || 1;
    let tamano = tamanoInput.value;
    let precio = precioBase;
    if (tamano === 'mediana') precio += 5;
    if (tamano === 'grande') precio += 10;
    let item = {
      ...pizza,
      cantidad,
      tamano,
      precio_unitario: precio,
      precio_total: precio * cantidad
    };
    agregarAlCarritoPanel(item);
    document.getElementById('modalDetalleProductoPanelContainer').remove();
    mostrarModalCheckout();
  };
}
window.mostrarModalDetalleProductoPanel = mostrarModalDetalleProductoPanel;

// ===== Modal para añadir al carrito desde el menú =====
function mostrarModalAgregarCarrito(pizza) {
  document.getElementById('modalAgregarCarritoContainer')?.remove();
  let html = `<div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50" id="modalAgregarCarritoBg"></div>
    <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative border border-green-200 animate-fadeIn fixed inset-0 m-auto flex flex-col items-center justify-center z-50" id="modalAgregarCarrito">
      <h3 class="text-2xl font-bold text-green-800 mb-4">${pizza.nombre}</h3>
      <img src="${pizza.url_imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${pizza.nombre}" class="w-full max-w-xs h-32 object-cover rounded mb-4">
      <div class="text-gray-700 mb-2"><b>Ingredientes:</b> ${pizza.ingredientes || 'Sin ingredientes'}</div>
      <div class="text-green-700 font-semibold mb-4">Precio base: $${parseFloat(pizza.precio).toFixed(2)}</div>
      <form id="formAgregarCarrito" class="flex flex-col gap-3 w-full">
        <div class="flex flex-col gap-1">
          <label for="cantidadAgregar" class="font-medium text-gray-700">Cantidad</label>
          <input type="number" id="cantidadAgregar" min="1" max="10" value="1" class="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-24" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="tamanoAgregar" class="font-medium text-gray-700">Tamaño</label>
          <select id="tamanoAgregar" class="px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
            <option value="pequeña">Pequeña</option>
            <option value="mediana">Mediana (+$5)</option>
            <option value="grande">Grande (+$10)</option>
          </select>
        </div>
        <button type="submit" class="bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 transition shadow-lg mt-2">Agregar al carrito</button>
      </form>
      <button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalAgregarCarrito">&times;</button>
    </div>`;
  let modalDiv = document.createElement('div');
  modalDiv.id = 'modalAgregarCarritoContainer';
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv);
  document.getElementById('cerrarModalAgregarCarrito').onclick = () => {
    document.getElementById('modalAgregarCarritoContainer').remove();
  };
  document.getElementById('modalAgregarCarritoBg').onclick = () => {
    document.getElementById('modalAgregarCarritoContainer').remove();
  };
  document.getElementById('formAgregarCarrito').onsubmit = function(e) {
    e.preventDefault();
    let cantidad = parseInt(document.getElementById('cantidadAgregar').value) || 1;
    let tamano = document.getElementById('tamanoAgregar').value;
    let precio = parseFloat(pizza.precio);
    if (tamano === 'mediana') precio += 5;
    if (tamano === 'grande') precio += 10;
    let item = {
      ...pizza,
      cantidad,
      tamano,
      precio_unitario: precio,
      precio_total: precio * cantidad
    };
    agregarAlCarritoPanel(item);
    document.getElementById('modalAgregarCarritoContainer').remove();
  };
}
// ===== Carrito: botón flotante fijo y modal =====
function actualizarBotonCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const btn = document.getElementById('btnCarritoFlotante');
  if (btn) btn.querySelector('#carritoCantidad').textContent = carrito.length;
}
function agregarAlCarritoPanel(pizza) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const idx = carrito.findIndex(item => item.id === pizza.id);
  if (idx !== -1) {
    carrito[idx].cantidad = (carrito[idx].cantidad || 1) + 1;
  } else {
    carrito.push({...pizza, cantidad: 1});
  }
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarBotonCarrito();
}
function mostrarModalCarrito() {
  document.getElementById('modalCarritoContainer')?.remove();
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  document.body.classList.add('overflow-hidden');
  let html = `
    <div id="modalCarritoContainer" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black bg-opacity-40" id="modalCarritoBg"></div>
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-4 md:p-8 relative border border-green-200 animate-fadeIn m-auto flex flex-col items-center justify-center z-50 overflow-y-auto max-h-[90vh]" id="modalCarrito">
        <h3 class="text-2xl font-bold text-green-800 mb-4">Tu carrito</h3>`;
  if (!carrito.length) {
    html += `<div class="flex flex-col items-center justify-center py-8">
      <svg xmlns='http://www.w3.org/2000/svg' class='w-20 h-20 text-gray-300 mb-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01'/></svg>
      <div class='text-gray-500 text-lg font-semibold mb-2'>¡Tu carrito está vacío!</div>
      <div class='text-gray-400 text-sm'>Agrega productos para comenzar tu pedido.</div>
    </div>`;
  } else {
    let total = 0;
    html += `<div class='overflow-x-auto w-full'><table class="min-w-full divide-y divide-gray-200 text-sm mb-4"><thead class="bg-green-100"><tr><th class="px-3 py-2 font-bold text-left">Pizza</th><th class="px-3 py-2 font-bold text-left">Tamaño</th><th class="px-3 py-2 font-bold text-left">Cant.</th><th class="px-3 py-2 font-bold text-left">Precio u.</th><th class="px-3 py-2 font-bold text-left">Subtotal</th><th></th></tr></thead><tbody class="divide-y divide-gray-100">`;
    carrito.forEach((item, i) => {
      let precio = Number(item.precio_unitario ?? item.precio ?? 0);
      let cantidad = item.cantidad || 1;
      total += precio * cantidad;
      html += `<tr>
        <td class="px-3 py-2">${item.nombre}</td>
        <td class="px-3 py-2">${item.tamano === 'pequena' || item.tamano === 'pequeña' ? 'Pequeña' : item.tamano === 'mediana' ? 'Mediana' : item.tamano === 'grande' ? 'Grande' : '-'}</td>
        <td class="px-3 py-2"><input type='number' min='1' max='10' value='${cantidad}' class='input-cantidad-carrito px-2 py-1 border border-green-300 rounded w-16' data-idx='${i}'></td>
        <td class="px-3 py-2">$${precio.toFixed(2)}</td>
        <td class="px-3 py-2">$${(precio * cantidad).toFixed(2)}</td>
        <td class="px-3 py-2"><button class='bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded px-2 py-1 transition btn-quitar' onclick='window.eliminarDelCarritoPanel(${i})'>Quitar</button></td>
      </tr>`;
    });
    html += `</tbody></table></div><div class="carrito-total text-lg font-bold text-green-800 mb-4">Total: $${total.toFixed(2)}</div>
    <button class="bg-blue-600 hover:bg-blue-800 text-white font-bold rounded-lg py-2 px-6 transition shadow-lg mb-2 w-full" onclick="mostrarModalCheckout()">Ir a pagar</button>`;
  }
  html += `<button class="absolute top-4 right-4 text-2xl text-gray-400 hover:text-red-500 transition" id="cerrarModalCarrito">&times;</button></div>
    </div>`;
  let modalDiv = document.createElement('div');
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv.firstElementChild);
  document.getElementById('cerrarModalCarrito').onclick = () => {
    document.getElementById('modalCarritoContainer').remove();
    document.body.classList.remove('overflow-hidden');
  };
  document.getElementById('modalCarritoBg').onclick = () => {
    document.getElementById('modalCarritoContainer').remove();
    document.body.classList.remove('overflow-hidden');
  };
  window.eliminarDelCarritoPanel = function(idx) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(idx, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    document.getElementById('modalCarritoContainer').remove();
    document.body.classList.remove('overflow-hidden');
    mostrarModalCarrito();
    actualizarBotonCarrito();
  };
  document.querySelectorAll('.input-cantidad-carrito').forEach(input => {
    input.addEventListener('change', function() {
      let idx = parseInt(this.getAttribute('data-idx'));
      let val = parseInt(this.value);
      let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
      if (isNaN(val) || val < 1) {
        carrito.splice(idx, 1);
      } else {
        carrito[idx].cantidad = val > 10 ? 10 : val;
      }
      localStorage.setItem('carrito', JSON.stringify(carrito));
      document.getElementById('modalCarritoContainer').remove();
      document.body.classList.remove('overflow-hidden');
      mostrarModalCarrito();
      actualizarBotonCarrito();
    });
  });
}
// Siempre asignar el evento al botón flotante, exista o no
// Esto garantiza que el modal se abra correctamente
function asignarEventoCarritoFlotante() {
  const btn = document.getElementById('btnCarritoFlotante');
  if (btn) btn.onclick = mostrarModalCarrito;
}
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('btnCarritoFlotante')) {
    let btn = document.createElement('button');
    btn.id = 'btnCarritoFlotante';
    btn.type = 'button';
    btn.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-400 hover:bg-red-500 text-white font-bold py-3 px-5 rounded-full shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 animate-bounce-slow';
    btn.setAttribute('aria-label', 'Ver carrito');
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68l3.58-8.59A1 1 0 0021 7H7.42M7 13V6a1 1 0 011-1h3m4 0h2a1 1 0 011 1v7" />
      </svg>
      <span class="text-lg">Carrito</span>
      <span id="carritoCantidad" class="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow">0</span>
    `;
    btn.onclick = mostrarModalCarrito;
    document.body.appendChild(btn);
    actualizarBotonCarrito();
  }
  asignarEventoCarritoFlotante();
});
// Actualizar cantidad del carrito al cargar y al cambiar el carrito
window.addEventListener('storage', actualizarBotonCarrito);

// ===== Funciones para la sección de Favoritos =====
async function cargarFavoritos() {
  console.log('Cargando favoritos...');
  const favoritosList = document.getElementById('favoritosList');
  const favoritosVacio = document.getElementById('favoritosVacio');
  
  if (!favoritosList || !favoritosVacio) {
    console.error('Elementos de favoritos no encontrados');
    return;
  }
  
  // Obtener favoritos del usuario desde la API
  let favoritos = [];
  try {
    favoritos = await obtenerFavoritosUsuario();
  } catch (e) {
    console.error('Error al obtener favoritos del usuario:', e);
    favoritos = [];
  }
  console.log('Favoritos encontrados:', favoritos);
  
  if (!favoritos.length) {
    favoritosList.classList.add('hidden');
    favoritosVacio.classList.remove('hidden');
    return;
  }
  favoritosList.classList.remove('hidden');
  favoritosVacio.classList.add('hidden');
  
  // Obtener todas las pizzas para renderizar las tarjetas de las favoritas
  let productos = [];
  try {
    productos = await obtenerPizzas();
  } catch (e) {
    console.error('Error al obtener productos:', e);
    favoritosList.innerHTML = '<div class="text-red-500">Error al cargar productos</div>';
    return;
  }
  // Filtrar solo las pizzas favoritas
  const pizzasFavoritas = productos.filter(pizza => favoritos.includes(pizza.id));
  if (!pizzasFavoritas.length) {
    favoritosList.classList.add('hidden');
    favoritosVacio.classList.remove('hidden');
    return;
  }
  favoritosList.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${pizzasFavoritas.map(pizza => `
    <div class="favorito-card bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200 hover:shadow-lg transition">
      <div class="flex items-center justify-between w-full mb-2">
        <button class="favorito-btn active" data-id="${pizza.id}" title="Quitar de favoritos">
          <svg fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>
      </div>
      <img src="${pizza.url_imagen || pizza.imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${pizza.nombre}" class="w-full max-w-xs h-32 object-cover rounded mb-2">
      <div class="font-bold text-lg text-gray-800 mb-1 text-center">${pizza.nombre}</div>
      <div class="text-sm text-gray-500 mb-1 text-center">${pizza.descripcion || pizza.ingredientes || 'Sin descripción disponible'}</div>
      <div class="text-green-600 font-semibold text-base mb-1">$${Number(pizza.precio_unitario || pizza.precio || 0).toFixed(2)}</div>
      <div class="flex gap-2 mt-2">
        <button class="bg-green-600 hover:bg-green-800 text-white font-semibold rounded-lg py-1 px-3 transition text-sm btn-add-cart" onclick="mostrarModalDetalleProductoPanel(${JSON.stringify(pizza).replace(/\"/g, '&quot;')})">Agregar</button>
      </div>
    </div>
  `).join('')}</div>`;
  // Evento para quitar de favoritos
  favoritosList.querySelectorAll('.favorito-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pizzaId = btn.getAttribute('data-id');
      btn.disabled = true;
      try {
        const res = await quitarFavoritoUsuario(pizzaId);
        if (!res.ok) throw new Error('No se pudo quitar de favoritos');
        await cargarFavoritos(); // Refresca la lista tras quitar
        document.dispatchEvent(new CustomEvent('favoritosActualizados'));
      } catch (err) {
        alert('Error al quitar de favoritos: ' + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  });
}

// ===== Eliminar utilidades de favoritos y calificaciones en localStorage =====
// function getFavoritos() { ... }
// function setFavoritos(favs) { ... }
// function esFavorito(id) { ... }
// function toggleFavorito(id) { ... }
// function getCalificacion(id) { ... }
// function setCalificacion(id, valor) { ... }
// window.getFavoritos = getFavoritos;
// window.setFavoritos = setFavoritos;
// window.esFavorito = esFavorito;
// window.toggleFavorito = toggleFavorito;
// window.getCalificacion = getCalificacion;
// window.setCalificacion = setCalificacion;
// window.cargarFavoritos = cargarFavoritos;

// ===== En generarEstrellas, simplificar la función =====
function generarEstrellas(calificacion) {
  const estrellas = Math.round(calificacion || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= estrellas) {
      html += '<span class="text-yellow-400">★</span>';
    } else {
      html += '<span class="text-gray-300">★</span>';
    }
  }
  return html;
}

// ===== Eliminar función mostrarSeccion (ya cubierta por la navegación principal) =====

// ===== Función de prueba para debug =====
// (Eliminada la función testNavigation y su referencia)

function mostrarModalCheckout() {
  document.getElementById('modalCheckoutContainer')?.remove();
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  if (!carrito.length) return;
  let usuario = JSON.parse(localStorage.getItem('usuario')) || { nombre: '', apellido: '', email: '', telefono: '', direccion: '' };
  let total = carrito.reduce((acc, item) => acc + (Number(item.precio_unitario ?? item.precio ?? 0) * (item.cantidad || 1)), 0);
  let html = `
    <div id="modalCheckoutContainer" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black bg-opacity-40" id="modalCheckoutBg"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 md:p-8 relative border border-green-200 animate-fadeIn m-auto flex flex-col items-center justify-center z-50 overflow-y-auto max-h-[95vh]" id="modalCheckout">
        <h3 class="text-2xl font-bold text-green-800 mb-4 text-center">Finalizar pedido</h3>
        <form id="formCheckoutPanel" class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">Nombre</label>
            <input type="text" id="checkoutNombre" value="${usuario.nombre || ''}" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">Apellido</label>
            <input type="text" id="checkoutApellido" value="${usuario.apellido || ''}" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">Email</label>
            <input type="email" id="checkoutEmail" value="${usuario.email || ''}" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-semibold text-gray-700">Teléfono</label>
            <input type="tel" id="checkoutTelefono" value="${usuario.telefono || ''}" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" />
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="font-semibold text-gray-700">Dirección de entrega</label>
            <input type="text" id="checkoutDireccion" value="${usuario.direccion || ''}" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" />
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="font-semibold text-gray-700">Método de pago</label>
            <select id="checkoutMetodoPago" required class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full">
              <option value="">Selecciona un método</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
          <div class="flex flex-col gap-2 md:col-span-2">
            <label class="font-semibold text-gray-700">Notas para el pedido</label>
            <textarea id="checkoutNotas" rows="2" class="px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full" placeholder="Ej: sin cebolla, llamar al llegar, etc."></textarea>
          </div>
        </form>
        <div class="w-full mt-6 mb-2">
          <h4 class="font-bold text-green-700 mb-2">Resumen del pedido</h4>
          <div class="overflow-x-auto w-full">
            <table class="min-w-full divide-y divide-gray-200 text-sm mb-2">
              <thead class="bg-green-100">
                <tr>
                  <th class="px-2 py-1 font-bold text-left">Pizza</th>
                  <th class="px-2 py-1 font-bold text-left">Tamaño</th>
                  <th class="px-2 py-1 font-bold text-left">Cant.</th>
                  <th class="px-2 py-1 font-bold text-left">Precio u.</th>
                  <th class="px-2 py-1 font-bold text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${carrito.map(item => `
                  <tr>
                    <td class="px-2 py-1">${item.nombre}</td>
                    <td class="px-2 py-1">${item.tamano === 'pequena' || item.tamano === 'pequeña' ? 'Pequeña' : item.tamano === 'mediana' ? 'Mediana' : item.tamano === 'grande' ? 'Grande' : '-'}</td>
                    <td class="px-2 py-1">${item.cantidad}</td>
                    <td class="px-2 py-1">$${Number(item.precio_unitario ?? item.precio ?? 0).toFixed(2)}</td>
                    <td class="px-2 py-1">$${((item.precio_unitario ?? item.precio ?? 0) * item.cantidad).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="text-right font-bold text-green-800 text-lg mt-2">Total: $${total.toFixed(2)}</div>
        </div>
        <div class="flex flex-col md:flex-row gap-4 mt-4 w-full">
          <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg py-2 px-6 transition shadow w-full md:w-auto" id="cerrarModalCheckout">Cancelar</button>
          <button class="bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 px-6 transition shadow w-full md:w-auto" id="confirmarPedidoBtn">Confirmar pedido</button>
        </div>
      </div>
    </div>`;
  let modalDiv = document.createElement('div');
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv.firstElementChild);
  document.getElementById('cerrarModalCheckout').onclick = () => {
    document.getElementById('modalCheckoutContainer').remove();
    document.body.classList.remove('overflow-hidden');
  };
  document.getElementById('modalCheckoutBg').onclick = () => {
    document.getElementById('modalCheckoutContainer').remove();
    document.body.classList.remove('overflow-hidden');
  };
  document.getElementById('confirmarPedidoBtn').onclick = async function() {
    // Validar campos
    const nombre = document.getElementById('checkoutNombre').value.trim();
    const apellido = document.getElementById('checkoutApellido').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const telefono = document.getElementById('checkoutTelefono').value.trim();
    const direccion = document.getElementById('checkoutDireccion').value.trim();
    const metodo_pago = document.getElementById('checkoutMetodoPago').value;
    const notas = document.getElementById('checkoutNotas').value.trim();
    if (!nombre || !apellido || !email || !telefono || !direccion || !metodo_pago) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    // Construir payload pedido
    let total = carrito.reduce((acc, item) => acc + (Number(item.precio_unitario ?? item.precio ?? 0) * (item.cantidad || 1)), 0);
    const items = carrito.map(item => ({
      pizza_id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      tamano: item.tamano || null
    }));
    let payloadPedido = {
      items,
      direccion_entrega: direccion,
      estado: 'pendiente',
      datos_cliente: { nombre, apellido, email, telefono },
      metodo_pago,
      monto_total: Number(total),
      notas: notas.trim() || null
    };
    // Si el usuario tiene id, agregarlo
    if (usuario.id) payloadPedido.usuario_id = usuario.id;
    try {
      const resPedido = await crearPedido(payloadPedido);
      if (resPedido && (resPedido.id || resPedido.pedido_id || resPedido.pedidoId)) {
        localStorage.removeItem('carrito');
        actualizarBotonCarrito();
        document.getElementById('modalCheckoutContainer')?.remove();
        document.getElementById('modalCarritoContainer')?.remove(); // Cierra el modal del carrito si está abierto
        document.body.classList.remove('overflow-hidden');
        mostrarModalExito('¡Pedido realizado con éxito!');
        // Opcional: recargar pedidos, mostrar mensaje, etc.
      } else {
        alert('Error al registrar el pedido: ' + (resPedido.mensaje || 'Intenta nuevamente.'));
      }
    } catch (e) {
      alert('Error de red al registrar el pedido.');
    }
  };
}
window.mostrarModalCheckout = mostrarModalCheckout;

// === Chatbot flotante ===
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del chatbot
  const fab = document.getElementById('chatbotFab');
  const windowEl = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatbotClose');
  const bodyEl = document.getElementById('chatbotBody');
  const inputEl = document.getElementById('chatbotInput');
  const sendBtn = document.getElementById('chatbotSend');

  // Opciones rápidas
  const quickOptions = [
    { label: 'Menú', value: 'Menú', isMenu: true },
    { label: 'Recomendaciones', value: 'Recomendaciones', isRecom: true },
    { label: 'Promociones', value: 'Promociones' },
    { label: 'Delivery', value: '¿Tienen delivery?' },
    { label: 'Ubicación', value: 'Ubicación' },
    { label: 'Horario', value: 'Horario' },
    { label: 'Estado de mi pedido', value: 'Estado de mi pedido' }
  ];

  if (fab && windowEl && closeBtn && bodyEl && inputEl && sendBtn) {
    // Mostrar/ocultar ventana
    function openChat() {
      windowEl.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
      windowEl.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
      inputEl.focus();
    }
    function closeChat() {
      windowEl.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
      windowEl.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
    }
    fab.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);

    // Lógica de respuestas informativas
    function getBotReply(msg) {
      const mensajeUsuario = msg.trim().toLowerCase();
      if (mensajeUsuario.includes('hola') || mensajeUsuario.includes('saludos')) {
        return "¡Hola! ¿En qué puedo ayudarte hoy?";
      } else if (mensajeUsuario.includes('menú') || mensajeUsuario.includes('menu') || mensajeUsuario.includes('pizzas')) {
        return "menu_dinamico";
      } else if (mensajeUsuario.includes('recomendacion') || mensajeUsuario.includes('recomendación')) {
        return "recomendaciones_dinamico";
      } else if (mensajeUsuario.includes('promocion') || mensajeUsuario.includes('promoción') || mensajeUsuario.includes('oferta')) {
        return "¡Tenemos promociones especiales los fines de semana! Consulta la sección de promociones en la web o pregunta por nuestras ofertas del día.";
      } else if (mensajeUsuario.includes('delivery')) {
        return "¡Sí! Ofrecemos servicio de delivery en toda la ciudad. Haz tu pedido y elige la opción de entrega a domicilio.";
      } else if (mensajeUsuario.includes('pedido') || mensajeUsuario.includes('estado')) {
        return "Para consultar el estado de tu pedido, por favor ve a la sección 'Mis pedidos' y busca tu número de pedido.";
      } else if (mensajeUsuario.includes('dirección') || mensajeUsuario.includes('direccion') || mensajeUsuario.includes('ubicacion') || mensajeUsuario.includes('ubicación')) {
        return "Estamos ubicados en Av. Siempre Viva 742. ¡Te esperamos!";
      } else if (mensajeUsuario.includes('horario') || mensajeUsuario.includes('abren')) {
        return "Nuestro horario de atención es de Lunes a Domingo, de 12:00 PM a 11:00 PM.";
      } else if (mensajeUsuario.includes('gracias') || mensajeUsuario.includes('adios') || mensajeUsuario.includes('adiós')) {
        return "De nada. ¡Que tengas un gran día!";
      } else {
        return "Lo siento, no entiendo tu pregunta. ¿Podrías reformularla o preguntar algo sobre nuestro menú, promociones, delivery o pedidos?";
      }
    }

    // Mostrar mensaje en el chat
    function addMessage(text, sender = 'bot', showOptions = false) {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex flex-col ' + (sender === 'user' ? 'items-end' : 'items-start');
      const msgDiv = document.createElement('div');
      msgDiv.className = `rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-sm mb-1 ${
        sender === 'user' ? 'bg-yellow-100 text-gray-900 self-end' : 'bg-gray-200 text-gray-800 self-start'
      }`;
      msgDiv.textContent = text;
      wrapper.appendChild(msgDiv);
      // Si showOptions, mostrar botones debajo del mensaje
      if (showOptions) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'flex flex-wrap gap-2 mt-1';
        quickOptions.forEach(opt => {
          const btn = document.createElement('button');
          btn.textContent = opt.label;
          btn.className = 'bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
          btn.onclick = () => {
            addMessage(opt.value, 'user');
            if (opt.isMenu) {
              showMenuDinamico();
              return;
            }
            if (opt.isRecom) {
              showRecomendaciones();
              return;
            }
            setTimeout(() => {
              const reply = getBotReply(opt.value);
              const showAgain = reply.startsWith('Lo siento');
              if (reply === 'menu_dinamico') {
                showMenuDinamico();
              } else if (reply === 'recomendaciones_dinamico') {
                showRecomendaciones();
              } else {
                addMessage(reply, 'bot', showAgain);
              }
            }, 400);
          };
          optionsDiv.appendChild(btn);
        });
        wrapper.appendChild(optionsDiv);
      }
      bodyEl.appendChild(wrapper);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    // Mostrar menú dinámico de pizzas
    async function showMenuDinamico() {
      addMessage('Consultando el menú de pizzas...', 'bot');
      try {
        const res = await fetch('http://localhost:8002/pizzas');
        if (!res.ok) throw new Error('No se pudo obtener el menú');
        const pizzas = await res.json();
        if (!Array.isArray(pizzas) || pizzas.length === 0) {
          addMessage('No hay pizzas disponibles en este momento.', 'bot', true);
          return;
        }
        // Encabezado del menú
        const menuHeader = document.createElement('div');
        menuHeader.className = 'font-semibold text-yellow-700 mb-2';
        menuHeader.textContent = 'Estas son nuestras pizzas disponibles:';
        bodyEl.appendChild(menuHeader);
        // Lista de pizzas
        pizzas.forEach(pizza => {
          const pizzaDiv = document.createElement('div');
          pizzaDiv.className = 'mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm flex items-start gap-3';
          // Imagen o ícono
          let imgOrIcon = null;
          if (pizza.url_imagen) {
            imgOrIcon = document.createElement('img');
            imgOrIcon.src = pizza.url_imagen;
            imgOrIcon.alt = pizza.nombre;
            imgOrIcon.className = 'w-10 h-10 object-cover rounded-full border border-yellow-300 bg-white flex-shrink-0';
          } else {
            imgOrIcon = document.createElement('span');
            imgOrIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='w-8 h-8 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 3c-4.97.17-9.17 2.1-12.02 4.95C5.1 9.83 3.17 14.03 3 19c4.97-.17 9.17-2.1 12.02-4.95C18.9 14.17 20.83 9.97 21 5z' /><circle cx='15.5' cy='8.5' r='1.5' fill='currentColor'/><circle cx='11.5' cy='12.5' r='1.5' fill='currentColor'/></svg>`;
            imgOrIcon.className = 'flex-shrink-0';
          }
          pizzaDiv.appendChild(imgOrIcon);
          // Contenido textual
          const contentDiv = document.createElement('div');
          // Nombre y precio
          const namePrice = document.createElement('div');
          namePrice.innerHTML = `<span class='font-bold text-gray-800'>${pizza.nombre}</span> <span class='text-yellow-600 font-semibold'>- $${Number(pizza.precio).toFixed(2)}</span>`;
          contentDiv.appendChild(namePrice);
          // Descripción
          if (pizza.descripcion) {
            const desc = document.createElement('div');
            desc.className = 'text-gray-600 text-sm mt-1';
            desc.textContent = pizza.descripcion;
            contentDiv.appendChild(desc);
          }
          pizzaDiv.appendChild(contentDiv);
          bodyEl.appendChild(pizzaDiv);
        });
        // Opciones rápidas al final
        const optionsWrapper = document.createElement('div');
        optionsWrapper.className = 'flex flex-wrap gap-2 mt-2';
        quickOptions.forEach(opt => {
          const btn = document.createElement('button');
          btn.textContent = opt.label;
          btn.className = 'bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
          btn.onclick = () => {
            addMessage(opt.value, 'user');
            if (opt.isMenu) {
              showMenuDinamico();
              return;
            }
            if (opt.isRecom) {
              showRecomendaciones();
              return;
            }
            setTimeout(() => {
              const reply = getBotReply(opt.value);
              const showAgain = reply.startsWith('Lo siento');
              if (reply === 'menu_dinamico') {
                showMenuDinamico();
              } else if (reply === 'recomendaciones_dinamico') {
                showRecomendaciones();
              } else {
                addMessage(reply, 'bot', showAgain);
              }
            }, 400);
          };
          optionsWrapper.appendChild(btn);
        });
        bodyEl.appendChild(optionsWrapper);
        bodyEl.scrollTop = bodyEl.scrollHeight;
      } catch (err) {
        addMessage('Hubo un error al consultar el menú. Intenta más tarde.', 'bot', true);
      }
    }

    // Mostrar recomendaciones de pizzas mejor calificadas
    async function showRecomendaciones() {
      addMessage('Buscando las pizzas mejor calificadas para ti...', 'bot');
      try {
        const res = await fetch('http://localhost:8003/usuarios/pizzas/mejor-calificadas');
        if (!res.ok) throw new Error('No se pudo obtener recomendaciones');
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          addMessage('No hay recomendaciones disponibles en este momento.', 'bot', true);
          return;
        }
        // Encabezado
        const header = document.createElement('div');
        header.className = 'font-semibold text-yellow-700 mb-2';
        header.textContent = 'Pizzas que te podrían gustar (mejor calificadas):';
        bodyEl.appendChild(header);
        // Mostrar cada pizza recomendada
        for (const pizza of data) {
          // Obtener los datos completos de la pizza (nombre, imagen, etc.)
          let pizzaInfo = null;
          try {
            const resPizza = await fetch(`http://localhost:8002/pizzas/${pizza.pizza_id}`);
            if (resPizza.ok) pizzaInfo = await resPizza.json();
          } catch {}
          const pizzaDiv = document.createElement('div');
          pizzaDiv.className = 'mb-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm flex items-start gap-3';
          // Imagen o ícono
          let imgOrIcon = null;
          if (pizzaInfo && pizzaInfo.url_imagen) {
            imgOrIcon = document.createElement('img');
            imgOrIcon.src = pizzaInfo.url_imagen;
            imgOrIcon.alt = pizzaInfo.nombre;
            imgOrIcon.className = 'w-10 h-10 object-cover rounded-full border border-yellow-300 bg-white flex-shrink-0';
          } else {
            imgOrIcon = document.createElement('span');
            imgOrIcon.innerHTML = `<svg xmlns='http://www.w3.org/2000/svg' class='w-8 h-8 text-yellow-500' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 3c-4.97.17-9.17 2.1-12.02 4.95C5.1 9.83 3.17 14.03 3 19c4.97-.17 9.17-2.1 12.02-4.95C18.9 14.17 20.83 9.97 21 5z' /><circle cx='15.5' cy='8.5' r='1.5' fill='currentColor'/><circle cx='11.5' cy='12.5' r='1.5' fill='currentColor'/></svg>`;
            imgOrIcon.className = 'flex-shrink-0';
          }
          pizzaDiv.appendChild(imgOrIcon);
          // Contenido textual
          const contentDiv = document.createElement('div');
          // Nombre y promedio
          const nameScore = document.createElement('div');
          nameScore.innerHTML = `<span class='font-bold text-gray-800'>${pizzaInfo && pizzaInfo.nombre ? pizzaInfo.nombre : 'Pizza #' + pizza.pizza_id}</span> <span class='text-yellow-600 font-semibold'>⭐ ${pizza.promedio ? Number(pizza.promedio).toFixed(2) : 'N/A'}</span>`;
          contentDiv.appendChild(nameScore);
          // Descripción
          if (pizzaInfo && pizzaInfo.descripcion) {
            const desc = document.createElement('div');
            desc.className = 'text-gray-600 text-sm mt-1';
            desc.textContent = pizzaInfo.descripcion;
            contentDiv.appendChild(desc);
          }
          pizzaDiv.appendChild(contentDiv);
          bodyEl.appendChild(pizzaDiv);
        }
        // Opciones rápidas al final
        const optionsWrapper = document.createElement('div');
        optionsWrapper.className = 'flex flex-wrap gap-2 mt-2';
        quickOptions.forEach(opt => {
          const btn = document.createElement('button');
          btn.textContent = opt.label;
          btn.className = 'bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold rounded-full px-4 py-1 transition-all duration-150 shadow';
          btn.onclick = () => {
            addMessage(opt.value, 'user');
            if (opt.isMenu) {
              showMenuDinamico();
              return;
            }
            if (opt.isRecom) {
              showRecomendaciones();
              return;
            }
            setTimeout(() => {
              const reply = getBotReply(opt.value);
              const showAgain = reply.startsWith('Lo siento');
              if (reply === 'menu_dinamico') {
                showMenuDinamico();
              } else if (reply === 'recomendaciones_dinamico') {
                showRecomendaciones();
              } else {
                addMessage(reply, 'bot', showAgain);
              }
            }, 400);
          };
          optionsWrapper.appendChild(btn);
        });
        bodyEl.appendChild(optionsWrapper);
        bodyEl.scrollTop = bodyEl.scrollHeight;
      } catch (err) {
        addMessage('No se pudieron obtener recomendaciones. Intenta más tarde.', 'bot', true);
      }
    }

    // Manejar input usuario
    function handleUserInput() {
      const userMsg = inputEl.value.trim();
      if (!userMsg) return;
      addMessage(userMsg, 'user');
      if (userMsg.toLowerCase().includes('menú') || userMsg.toLowerCase().includes('menu') || userMsg.toLowerCase().includes('pizzas')) {
        showMenuDinamico();
        inputEl.value = '';
        return;
      }
      if (userMsg.toLowerCase().includes('recomendacion') || userMsg.toLowerCase().includes('recomendación')) {
        showRecomendaciones();
        inputEl.value = '';
        return;
      }
      inputEl.value = '';
      setTimeout(() => {
        const reply = getBotReply(userMsg);
        const showAgain = reply.startsWith('Lo siento');
        if (reply === 'menu_dinamico') {
          showMenuDinamico();
        } else if (reply === 'recomendaciones_dinamico') {
          showRecomendaciones();
        } else {
          addMessage(reply, 'bot', showAgain);
        }
      }, 400);
    }

    sendBtn.addEventListener('click', handleUserInput);
    inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleUserInput();
    });

    // Mensaje de bienvenida
    function showWelcome() {
      addMessage("¡Bienvenido! Soy el asistente de Paladar del Inca. ¿En qué puedo ayudarte hoy?", 'bot', true);
    }
    closeChat();
    showWelcome();
  }
});

// Escuchar el evento en el perfil para actualizar el contador automáticamente
if (document.getElementById('perfilContent')) {
  document.addEventListener('favoritosActualizados', () => {
    // Si el usuario está viendo el perfil, actualizar solo el contador
    if (document.getElementById('perfil').classList.contains('block') || document.getElementById('perfil').classList.contains('active')) {
      renderPerfil();
    }
  });
}

// Modal de éxito reutilizable
function mostrarModalExito(mensaje) {
  // Eliminar cualquier modal previo
  document.getElementById('modalExitoContainer')?.remove();
  let html = `
    <div id="modalExitoContainer" class="fixed inset-0 flex items-center justify-center z-50">
      <div class="absolute inset-0 bg-black bg-opacity-40" id="modalExitoBg"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative border border-green-200 animate-fadeIn m-auto flex flex-col items-center justify-center z-50">
        <svg class="w-20 h-20 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="#dcfce7"/><path stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/></svg>
        <div class="text-2xl font-bold text-green-800 mb-2 text-center">${mensaje}</div>
        <button class="mt-4 bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg py-2 px-6 transition shadow" id="cerrarModalExito">Cerrar</button>
      </div>
    </div>`;
  let modalDiv = document.createElement('div');
  modalDiv.innerHTML = html;
  document.body.appendChild(modalDiv.firstElementChild);
  // Cerrar al hacer click en botón o fondo
  document.getElementById('cerrarModalExito').onclick = cerrar;
  document.getElementById('modalExitoBg').onclick = cerrar;
  function cerrar() {
    document.getElementById('modalExitoContainer')?.remove();
  }
  // Cerrar automáticamente tras 2.5 segundos
  setTimeout(cerrar, 2500);
}
