import { getCurrentUser, logoutUsuario } from './Controladores/usuariosController.js';
import { mostrarVistaUsuarios } from './Vistas/usuarios.js';

// Verificar autenticación
const user = getCurrentUser();
if (!user || user.rol !== 'administrador') {
  window.location.href = 'interfaz/login.html';
}

// Mostrar información del usuario
document.getElementById('userName').textContent = `${user.nombre} ${user.apellido}`;
document.getElementById('userEmail').textContent = user.correo;
// Función de logout
window.logout = function() {
  logoutUsuario();
};
// Navegación entre secciones
// Cambiado para usar clases Tailwind: 'hidden' y 'block' en vez de 'active'
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    // Quitar resaltado de todos los botones
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('bg-green-100', 'bg-green-200', 'active'));
    // Resaltar el botón actual
    this.classList.add('bg-green-100', 'active');
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(s => {
      s.classList.add('hidden');
      s.classList.remove('block', 'active');
    });
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(section);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      targetSection.classList.add('block');
    }
    loadSectionContent(section);
  });
});
function loadSectionContent(section) {
  switch(section) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'usuarios':
      loadUsuarios();
      break;
    case 'productos':
      loadProductos();
      break;
    case 'pedidos':
      loadPedidos();
      break;
    case 'reportes':
      loadReportes();
      break;
  }
}
async function loadDashboard() {
  document.getElementById('totalUsuarios').textContent = 'Cargando...';
  document.getElementById('pedidosHoy').textContent = 'Cargando...';
  document.getElementById('ingresosHoy').textContent = 'Cargando...';
  document.getElementById('productosActivos').textContent = 'Cargando...';
  // Obtener token
  const token = localStorage.getItem('jwt');
  try {
    const res = await fetch('http://localhost:8000/admin/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('No autorizado o error en backend');
    const data = await res.json();
    document.getElementById('totalUsuarios').textContent = data.totalUsuarios;
    document.getElementById('pedidosHoy').textContent = data.pedidosHoy;
    document.getElementById('ingresosHoy').textContent = '$' + data.ingresosHoy.toFixed(2);
    document.getElementById('productosActivos').textContent = data.productosActivos;
    // Gráfica de ingresos últimos 7 días
    renderIngresosChart(data.ingresosUltimos7Dias);
    // Últimos pedidos
    renderUltimosPedidos(data.ultimosPedidos);
  } catch (e) {
    document.getElementById('totalUsuarios').textContent = '-';
    document.getElementById('pedidosHoy').textContent = '-';
    document.getElementById('ingresosHoy').textContent = '-';
    document.getElementById('productosActivos').textContent = '-';
    renderIngresosChart([]);
    renderUltimosPedidos([]);
  }
}

let ingresosChartInstance = null;
function renderIngresosChart(datos) {
  const ctx = document.getElementById('ingresosChart').getContext('2d');
  const labels = datos.map(d => {
    const fecha = new Date(d.fecha);
    return fecha.toLocaleDateString('es-ES', { weekday: 'short' });
  });
  const values = datos.map(d => d.total);
  if (ingresosChartInstance) ingresosChartInstance.destroy();
  ingresosChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Ingresos',
        data: values,
        fill: true,
        backgroundColor: 'rgba(52, 152, 219, 0.15)',
        borderColor: '#3498db',
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3498db',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#888', font: { size: 13 } }
        },
        x: {
          ticks: { color: '#888', font: { size: 13 } }
        }
      }
    }
  });
}
function renderUltimosPedidos(pedidos) {
  const tbody = document.getElementById('ultimosPedidosTbody');
  if (!pedidos || pedidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Sin datos</td></tr>';
    return;
  }
  tbody.innerHTML = pedidos.map(p => `
    <tr>
      <td>$${parseFloat(p.monto).toFixed(2)}</td>
      <td>${new Date(p.fecha).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
      <td class="estado">${p.estado}</td>
    </tr>
  `).join('');
}
async function loadUsuarios() {
  try {
    await mostrarVistaUsuarios();
  } catch (error) {
    document.getElementById('contenido').innerHTML = '<p>Error al cargar usuarios: ' + error.message + '</p>';
  }
}
  //cargar productos
async function loadProductos() {
  const grid = document.getElementById('productosGrid');
  grid.innerHTML = '<p>Cargando productos...</p>';
  try {
    // Cambia la URL según tu configuración real
    const res = await fetch('http://localhost:8000/productos/pizzas');
    const productos = await res.json();
    grid.innerHTML = '';
    productos.forEach(producto => {
      grid.innerHTML += renderProductoCard(producto);
    });
    // Asigna eventos a los íconos de edición
    document.querySelectorAll('.edit-icon').forEach(btn => {
      btn.onclick = () => abrirModalEditar(btn.dataset.id);
    });
    // Asigna eventos a los íconos de eliminar
    document.querySelectorAll('.delete-icon').forEach(btn => {
      btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
  } catch (e) {
    grid.innerHTML = '<p>Error al cargar productos.</p>';
  }
}

//renderizar productos
function renderProductoCard(producto) {
  // SVGs para iconos
  const svgEdit = `<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z' /></svg>`;
  const svgDelete = `<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12' /></svg>`;
  return `
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 flex flex-col items-center relative group transition hover:shadow-2xl mb-4">
      <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button class="edit-icon bg-green-100 hover:bg-green-200 p-1 rounded" data-id="${producto.id}" title="Editar">${svgEdit}</button>
        <button class="delete-icon bg-red-100 hover:bg-red-200 p-1 rounded" data-id="${producto.id}" title="Eliminar">${svgDelete}</button>
      </div>
      <img src="${producto.url_imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${producto.nombre}" class="w-full h-48 object-cover rounded-xl mb-3 border-2 border-green-100 shadow" />
      <div class="w-full text-center flex-1 flex flex-col justify-between">
        <div>
          <div class="text-lg font-bold text-green-800 mb-1">${producto.nombre}</div>
          <div class="text-gray-500 text-sm mb-1">${producto.categoria || 'Pizza'}</div>
          <div class="text-green-700 font-semibold mb-1">$${parseFloat(producto.precio).toFixed(2)}</div>
          <div class="text-gray-600 text-xs mb-2">${producto.ingredientes || ''}</div>
        </div>
        <div class="mt-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs font-semibold ${producto.disponible == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
            ${producto.disponible == 1 ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>
    </div>
  `;
}
//modal editar producto
let productoActual = null;

async function abrirModalEditar(id) {
  // Busca el producto actual (puedes optimizar guardando la lista)
  const res = await fetch(`http://localhost:8000/productos/pizzas/${id}`);
  const producto = await res.json();
  productoActual = producto;
  document.getElementById('editNombre').value = producto.nombre;
  document.getElementById('editDescripcion').value = producto.descripcion || '';
  document.getElementById('editPrecio').value = producto.precio;
  document.getElementById('editUrlImagen').value = producto.url_imagen || '';
  document.getElementById('editCategoria').value = producto.categoria || '';
  document.getElementById('editIngredientes').value = producto.ingredientes || '';
  document.getElementById('editDisponible').value = producto.disponible;
  abrirModal('modalEditarProducto');
}
// Cerrar modal editar producto
if (document.getElementById('cerrarModalEditar')) {
  document.getElementById('cerrarModalEditar').onclick = function() {
    cerrarModal('modalEditarProducto');
  };
}
// Cerrar modal editar producto al hacer clic fuera
if (document.getElementById('modalEditarProducto')) {
  document.getElementById('modalEditarProducto').onclick = function(e) {
    if (e.target === this) cerrarModal('modalEditarProducto');
  };
}
//manejar el formulario de edición
document.getElementById('formEditarProducto').onsubmit = async function(e) {
  e.preventDefault();
  if (!productoActual) return;
  const data = {
    nombre: document.getElementById('editNombre').value,
    descripcion: document.getElementById('editDescripcion').value,
    precio: document.getElementById('editPrecio').value,
    url_imagen: document.getElementById('editUrlImagen').value,
    categoria: document.getElementById('editCategoria').value,
    ingredientes: document.getElementById('editIngredientes').value,
    disponible: document.getElementById('editDisponible').value === "1" ? true : false
  };
  try {
    await fetch(`http://localhost:8000/productos/pizzas/${productoActual.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    cerrarModal('modalEditarProducto');
    loadProductos();
  } catch (e) {
    alert('Error al guardar cambios');
  }
};

//manejar el formulario de creación
// Abrir y cerrar modal de crear producto
if (document.getElementById('btnAbrirCrearProducto')) {
  document.getElementById('btnAbrirCrearProducto').onclick = function() {
    abrirModal('modalCrearProducto');
  };
}
// Cerrar modal crear producto
if (document.getElementById('cerrarModalCrear')) {
  document.getElementById('cerrarModalCrear').onclick = function() {
    cerrarModal('modalCrearProducto');
  };
}
// Cerrar modal crear producto al hacer clic fuera
if (document.getElementById('modalCrearProducto')) {
  document.getElementById('modalCrearProducto').onclick = function(e) {
    if (e.target === this) cerrarModal('modalCrearProducto');
  };
}

// Crear producto (POST)
document.getElementById('formCrearProducto').onsubmit = async function(e) {
  e.preventDefault();
  const data = {
    nombre: document.getElementById('crearNombre').value,
    descripcion: document.getElementById('crearDescripcion').value,
    precio: document.getElementById('crearPrecio').value,
    url_imagen: document.getElementById('crearUrlImagen').value,
    categoria: document.getElementById('crearCategoria').value,
    ingredientes: document.getElementById('crearIngredientes').value,
    disponible: document.getElementById('crearDisponible').value === "1" ? true : false
  };
  try {
    await fetch('http://localhost:8000/productos/pizzas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    cerrarModal('modalCrearProducto');
    this.reset();
    loadProductos();
  } catch (e) {
    alert('Error al crear producto');
  }
};


async function loadPedidos() {
  const pedidosList = document.getElementById('pedidosList');
  pedidosList.innerHTML = '<p>Cargando pedidos...</p>';
  let allPedidos = [];
  try {
    // Obtener token de autenticación
    const token = localStorage.getItem('jwt');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const resp = await fetch('http://localhost:8000/pedidos/pedidos', {
      headers: headers
    });
    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }
    allPedidos = await resp.json();
    renderPedidosFiltrados();
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    pedidosList.innerHTML = '<p>Error al cargar pedidos. Verifica la conexión con el servidor.</p>';
  }

  // Filtros reactivos
  const formFiltros = document.getElementById('filtrosPedidosAdmin');
  if (formFiltros) {
    formFiltros.onsubmit = function(e) {
      e.preventDefault();
      renderPedidosFiltrados();
    };
    // También filtrar al cambiar cualquier filtro
    ['filtroEstadoPedido','filtroPagoPedido','filtroDesdePedido','filtroHastaPedido','filtroClientePedido'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', renderPedidosFiltrados);
      if (el && el.tagName==='INPUT') el.addEventListener('input', renderPedidosFiltrados);
    });
  }

  function renderPedidosFiltrados() {
    let pedidos = allPedidos.slice();
    // Filtros
    const estado = document.getElementById('filtroEstadoPedido')?.value || '';
    const pago = document.getElementById('filtroPagoPedido')?.value || '';
    const desde = document.getElementById('filtroDesdePedido')?.value || '';
    const hasta = document.getElementById('filtroHastaPedido')?.value || '';
    const cliente = document.getElementById('filtroClientePedido')?.value?.toLowerCase() || '';
    if (estado) pedidos = pedidos.filter(p => (p.estado||'') === estado);
    if (pago) pedidos = pedidos.filter(p => (p.estado_pago||'') === pago);
    if (desde) pedidos = pedidos.filter(p => p.creado_en && p.creado_en >= desde);
    if (hasta) pedidos = pedidos.filter(p => p.creado_en && p.creado_en <= hasta+'T23:59:59');
    if (cliente) {
      pedidos = pedidos.filter(p => {
        const nombre = (p.nombre_cliente||'').toLowerCase();
        const correo = (p.correo_cliente||'').toLowerCase();
        const tel = (p.telefono_cliente||'').toLowerCase();
        return nombre.includes(cliente) || correo.includes(cliente) || tel.includes(cliente);
      });
    }
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      pedidosList.innerHTML = '<p>No hay pedidos registrados con esos filtros.</p>';
      return;
    }
    let html = `<div class="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-green-100">
          <tr>
            <th class="px-3 py-2 font-bold text-left">Cliente</th>
            <th class="px-3 py-2 font-bold text-left">Email</th>
            <th class="px-3 py-2 font-bold text-left">Teléfono</th>
            <th class="px-3 py-2 font-bold text-left">Dirección</th>
            <th class="px-3 py-2 font-bold text-left">Estado</th>
            <th class="px-3 py-2 font-bold text-left">Pago</th>
            <th class="px-3 py-2 font-bold text-right">Total</th>
            <th class="px-3 py-2 font-bold text-left">Fecha</th>
            <th class="px-3 py-2 font-bold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${pedidos.map(p => `
            <tr class="hover:bg-green-50 transition">
              <td class="px-3 py-2">${p.nombre_cliente || '-'}</td>
              <td class="px-3 py-2">${p.correo_cliente || '-'}</td>
              <td class="px-3 py-2">${p.telefono_cliente || '-'}</td>
              <td class="px-3 py-2">${p.direccion_entrega || '-'}</td>
              <td class="px-3 py-2">
                <select class="select-estado bg-white border border-gray-300 rounded px-2 py-1 text-xs" data-id="${p.id}" style="min-width:90px;">
                  ${['pendiente','confirmado','preparando','listo','en_entrega','entregado','cancelado'].map(e => 
                    `<option value="${e}" ${p.estado===e?'selected':''}>${e.charAt(0).toUpperCase()+e.slice(1).replace('_',' ')}</option>`
                  ).join('')}
                </select>
              </td>
              <td class="px-3 py-2">
                <select class="select-estado-pago bg-white border border-gray-300 rounded px-2 py-1 text-xs" data-id="${p.id}" style="min-width:80px;">
                  ${['pagado','pendiente','fallido'].map(e => 
                    `<option value="${e}" ${p.estado_pago===e?'selected':''}>${e.charAt(0).toUpperCase()+e.slice(1)}</option>`
                  ).join('')}
                </select>
              </td>
              <td class="px-3 py-2 text-right">S/ ${parseFloat(p.monto_total).toFixed(2)}</td>
              <td class="px-3 py-2">${p.creado_en ? new Date(p.creado_en).toLocaleString('es-ES') : '-'}</td>
              <td class="px-3 py-2 text-center">
                <button class="btn-ver-detalle text-blue-600 hover:underline mr-2" data-id="${p.id}">Ver</button>
                <button class="btn-eliminar text-red-600 hover:underline" data-id="${p.id}">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
    pedidosList.innerHTML = html;
    // Event listeners para cambiar estado
    document.querySelectorAll('.select-estado').forEach(sel => {
      sel.addEventListener('change', async function() {
        const id = this.getAttribute('data-id');
        const nuevoEstado = this.value;
        const originalValue = this.dataset.originalValue || this.value;
        try {
          const token = localStorage.getItem('jwt');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`http://localhost:8000/pedidos/pedidos/${id}/estado`, {
            method: 'PATCH', headers, body: JSON.stringify({ estado: nuevoEstado })
          });
          if (response.ok) {
            this.style.background = '#e8f5e8';
            this.style.borderColor = '#28a745';
            setTimeout(() => { this.style.background = ''; this.style.borderColor = ''; }, 2000);
            this.dataset.originalValue = nuevoEstado;
            mostrarNotificacion('Estado actualizado correctamente', 'success');
          } else {
            throw new Error('Error en la respuesta del servidor');
          }
        } catch (error) {
          this.value = originalValue;
          mostrarNotificacion('Error al actualizar estado', 'error');
        }
      });
      sel.dataset.originalValue = sel.value;
    });
    // Event listeners para cambiar estado_pago
    document.querySelectorAll('.select-estado-pago').forEach(sel => {
      sel.addEventListener('change', async function() {
        const id = this.getAttribute('data-id');
        const nuevoEstadoPago = this.value;
        try {
          const token = localStorage.getItem('jwt');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`http://localhost:8000/pedidos/pedidos/${id}/estado-pago`, {
            method: 'PATCH', headers, body: JSON.stringify({ estado_pago: nuevoEstadoPago })
          });
          if (response.ok) {
            this.style.background = '#e8f5e8';
            this.style.borderColor = '#28a745';
            setTimeout(() => { this.style.background = ''; this.style.borderColor = ''; }, 800);
            mostrarNotificacion('Estado de pago actualizado', 'success');
          } else {
            this.style.background = '#ffe6e6';
            this.style.borderColor = '#dc3545';
            setTimeout(() => { this.style.background = ''; this.style.borderColor = ''; }, 800);
            mostrarNotificacion('Error al actualizar estado de pago', 'error');
          }
        } catch (error) {
          this.style.background = '#ffe6e6';
          this.style.borderColor = '#dc3545';
          setTimeout(() => { this.style.background = ''; this.style.borderColor = ''; }, 800);
          mostrarNotificacion('Error al actualizar estado de pago', 'error');
        }
      });
    });
    // Event listeners para eliminar pedido
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        if (!confirm('¿Seguro que deseas eliminar este pedido? Esta acción no se puede deshacer.')) return;
        try {
          const token = localStorage.getItem('jwt');
          const headers = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`http://localhost:8000/pedidos/pedidos/${id}`, { method: 'DELETE', headers });
          if (response.ok) {
            const tr = this.closest('tr');
            tr.style.background = '#ffe6e6';
            setTimeout(() => { tr.remove(); }, 300);
            mostrarNotificacion('Pedido eliminado correctamente', 'success');
          } else {
            throw new Error('Error en la respuesta del servidor');
          }
        } catch (error) {
          mostrarNotificacion('Error al eliminar pedido', 'error');
        }
      });
    });
    // Event listeners para ver detalle
    document.querySelectorAll('.btn-ver-detalle').forEach(btn => {
      btn.addEventListener('click', async function() {
        const id = this.getAttribute('data-id');
        await mostrarDetallePedido(id);
      });
    });
  }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  // Estilos de la notificación
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    max-width: 300px;
  `;
  
  if (tipo === 'success') {
    notificacion.style.background = '#28a745';
  } else if (tipo === 'error') {
    notificacion.style.background = '#dc3545';
  } else {
    notificacion.style.background = '#17a2b8';
  }
  
  document.body.appendChild(notificacion);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.parentNode.removeChild(notificacion);
      }
    }, 300);
  }, 3000);
}

// Función para mostrar detalle del pedido
async function mostrarDetallePedido(id) {
  console.log('Intentando mostrar detalle del pedido:', id); // Debug
  try {
    const token = localStorage.getItem('jwt');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('Haciendo petición a:', `http://localhost:8000/pedidos/pedidos/${id}`); // Debug
    const response = await fetch(`http://localhost:8000/pedidos/pedidos/${id}`, {
      headers: headers
    });
    
    console.log('Respuesta del servidor:', response.status); // Debug
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles del pedido');
    }
    
    const pedido = await response.json();
    console.log('Datos del pedido:', pedido); // Debug
    mostrarModalDetalle(pedido);
    
  } catch (error) {
    console.error('Error al cargar detalle:', error);
    mostrarNotificacion('Error al cargar detalles del pedido', 'error');
  }
}
async function loadReportes() {
  const container = document.getElementById('reportesContent');

  // SVGs para los iconos
  const svgPDF = `<svg xmlns='http://www.w3.org/2000/svg' class='inline h-5 w-5 mr-1 text-red-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4v16m8-8H4' /></svg>`;
  const svgExcel = `<svg xmlns='http://www.w3.org/2000/svg' class='inline h-5 w-5 mr-1 text-green-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2' /><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 2v4m8-4v4M8 12h8m-4-4v8' /></svg>`;

  // Formulario de filtros mejorado
  container.innerHTML = `
    <form id="filtrosReportes" class="flex flex-wrap gap-2 items-center mb-4 bg-white p-4 rounded-lg shadow border border-gray-200">
      <label class="flex flex-col text-xs font-semibold text-gray-700">Desde
        <input type="date" id="filtroDesde" class="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-400" />
      </label>
      <label class="flex flex-col text-xs font-semibold text-gray-700">Hasta
        <input type="date" id="filtroHasta" class="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-400" />
      </label>
      <label class="flex flex-col text-xs font-semibold text-gray-700">Estado
        <select id="filtroEstado" class="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-400">
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmado">Confirmado</option>
          <option value="preparando">Preparando</option>
          <option value="listo">Listo</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </label>
      <label class="flex flex-col text-xs font-semibold text-gray-700">Top pizzas
        <select id="filtroTopPizzas" class="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-400">
          <option value="5">Top 5</option>
          <option value="10" selected>Top 10</option>
          <option value="15">Top 15</option>
        </select>
      </label>
      <button type="submit" class="ml-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-800 transition">Aplicar filtros</button>
    </form>
    <div id="contenedorReportesGraficas"></div>
  `;

  // Manejar el envío del formulario de filtros
  document.getElementById('filtrosReportes').onsubmit = function(e) {
    e.preventDefault();
    renderReportesConFiltros();
  };

  // Renderizar los reportes con los filtros actuales
  renderReportesConFiltros();

  async function renderReportesConFiltros() {
    const desde = document.getElementById('filtroDesde').value;
    const hasta = document.getElementById('filtroHasta').value;
    const estado = document.getElementById('filtroEstado').value;
    const topPizzas = document.getElementById('filtroTopPizzas').value;
    const contGraficas = document.getElementById('contenedorReportesGraficas');
    contGraficas.innerHTML = '<p>Cargando reportes...</p>';

    // Función para construir sufijo de filtros para el nombre de archivo
    function filtrosToSufijo(extra = '') {
      let suf = '';
      if (desde) suf += `_desde_${desde}`;
      if (hasta) suf += `_hasta_${hasta}`;
      if (estado && extra === 'estado') suf += `_estado_${estado}`;
      if (topPizzas && extra === 'top') suf += `_top_${topPizzas}`;
      return suf;
    }

    try {
      // Obtener token JWT del localStorage
      const token = localStorage.getItem('jwt');
      const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
      // Construir query params
      const params = [];
      if (desde) params.push(`desde=${desde}`);
      if (hasta) params.push(`hasta=${hasta}`);
      // 1. Pedidos diarios (por rango de fechas)
      let urlDiarios = 'http://localhost:8000/pedidos/pedidos/reportes/diarios';
      if (params.length) urlDiarios += '?' + params.join('&');
      const resDiarios = await fetch(urlDiarios, { headers });
      const pedidosDiarios = await resDiarios.json();
      // 2. Pedidos por estado (por estado y rango de fechas)
      let urlEstados = 'http://localhost:8000/pedidos/pedidos/reportes/por-estado';
      const paramsEstados = [...params];
      if (estado) paramsEstados.push(`estado=${estado}`);
      if (paramsEstados.length) urlEstados += '?' + paramsEstados.join('&');
      const resEstados = await fetch(urlEstados, { headers });
      const pedidosPorEstado = await resEstados.json();
      // 3. Pizzas más pedidas (por rango de fechas y top N)
      let urlMasPedidas = 'http://localhost:8000/pedidos/pedidos/reportes/mas-pedidas';
      const paramsPizzas = [...params];
      if (topPizzas) paramsPizzas.push(`top=${topPizzas}`);
      if (paramsPizzas.length) urlMasPedidas += '?' + paramsPizzas.join('&');
      const resMasPedidas = await fetch(urlMasPedidas, { headers });
      const pizzasMasPedidas = await resMasPedidas.json();

      // Renderizar los reportes con gráficas y tablas lado a lado (igual que antes)
      let html = '';
      // --- Pedidos diarios ---
      html += `<h3 class="font-bold text-lg text-green-800 mb-2">Pedidos diarios</h3>`;
      html += `<div class="mb-2 flex gap-2">
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded transition' id='exportarDiariosPDF'>${svgPDF} PDF</button>
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded transition' id='exportarDiariosExcel'>${svgExcel} Excel</button>
      </div>`;
      html += `<div class="reporte-row flex flex-col md:flex-row gap-4 items-start">` +
        `<div class="reporte-grafica bg-white p-2 rounded shadow border border-gray-100 flex-shrink-0 flex items-center justify-center max-w-xs overflow-auto"><canvas id="graficaPedidosDiarios" width="220" height="100" class="w-64"></canvas></div>` +
        `<div class="reporte-tabla-leyenda overflow-x-auto">`;
      if (pedidosDiarios.length > 0) {
        html += `<div class='overflow-x-auto'><table class="reporte-table min-w-[400px] text-sm bg-white rounded border border-gray-200" id="tablaPedidosDiarios">
        <thead class='bg-green-100 sticky top-0 z-10'><tr><th class='px-3 py-2 font-bold text-left'>Fecha</th><th class='px-3 py-2 font-bold text-left'>Total pedidos</th></tr></thead><tbody>`;
        pedidosDiarios.forEach(row => {
          html += `<tr class='${row.total % 2 === 0 ? 'bg-gray-50' : ''}'><td class='px-3 py-2'>${row.fecha}</td><td class='px-3 py-2'>${row.total}</td></tr>`;
        });
        html += `</tbody></table></div>`;
      } else {
        html += `<p>No hay datos de pedidos diarios.</p>`;
      }
      html += `</div></div>`;
      // --- Pedidos por estado ---
      html += `<h3 class="font-bold text-lg text-green-800 mt-6 mb-2">Pedidos por estado</h3>`;
      html += `<div class="mb-2 flex gap-2">
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded transition' id='exportarEstadoPDF'>${svgPDF} PDF</button>
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded transition' id='exportarEstadoExcel'>${svgExcel} Excel</button>
      </div>`;
      html += `<div class="reporte-row flex flex-col md:flex-row gap-4 items-start">` +
        `<div class="reporte-grafica bg-white p-2 rounded shadow border border-gray-100 flex-shrink-0 flex items-center justify-center max-w-xs overflow-auto"><canvas id="graficaPedidosEstado" width="220" height="100" class="w-64"></canvas></div>` +
        `<div class="reporte-tabla-leyenda overflow-x-auto">`;
      if (pedidosPorEstado.length > 0) {
        html += `<div class='overflow-x-auto'><table class="reporte-table min-w-[300px] text-sm bg-white rounded border border-gray-200" id="tablaPedidosEstado">
        <thead class='bg-green-100 sticky top-0 z-10'><tr><th class='px-3 py-2 font-bold text-left'>Estado</th><th class='px-3 py-2 font-bold text-left'>Total</th></tr></thead><tbody>`;
        pedidosPorEstado.forEach(row => {
          html += `<tr class='${row.total % 2 === 0 ? 'bg-gray-50' : ''}'><td class='px-3 py-2'>${row.estado}</td><td class='px-3 py-2'>${row.total}</td></tr>`;
        });
        html += `</tbody></table></div>`;
      } else {
        html += `<p>No hay datos de pedidos por estado.</p>`;
      }
      html += `</div></div>`;
      // --- Pizzas más pedidas ---
      html += `<h3 class="font-bold text-lg text-green-800 mt-6 mb-2">Pizzas más pedidas</h3>`;
      html += `<div class="mb-2 flex gap-2">
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded transition' id='exportarPizzasPDF'>${svgPDF} PDF</button>
        <button class='btn-exportar flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded transition' id='exportarPizzasExcel'>${svgExcel} Excel</button>
      </div>`;
      html += `<div class="reporte-row flex flex-col md:flex-row gap-4 items-start">` +
        `<div class="reporte-grafica bg-white p-2 rounded shadow border border-gray-100 flex-shrink-0 flex items-center justify-center max-w-xs overflow-auto"><canvas id="graficaPizzasMasPedidas" width="220" height="100" class="w-64"></canvas></div>` +
        `<div class="reporte-tabla-leyenda overflow-x-auto">`;
      if (pizzasMasPedidas.length > 0) {
        html += `<div class='overflow-x-auto'><table class="reporte-table min-w-[300px] text-sm bg-white rounded border border-gray-200" id="tablaPizzasMasPedidas">
        <thead class='bg-green-100 sticky top-0 z-10'><tr><th class='px-3 py-2 font-bold text-left'>Pizza</th><th class='px-3 py-2 font-bold text-left'>Cantidad</th></tr></thead><tbody>`;
        pizzasMasPedidas.forEach(row => {
          html += `<tr class='${row.cantidad % 2 === 0 ? 'bg-gray-50' : ''}'><td class='px-3 py-2'>${row.nombre}</td><td class='px-3 py-2'>${row.cantidad}</td></tr>`;
        });
        html += `</tbody></table></div>`;
      } else {
        html += `<p>No hay datos de pizzas más pedidas.</p>`;
      }
      html += `</div></div>`;
      contGraficas.innerHTML = html;

      // Funciones de exportación para cada reporte
      setTimeout(() => {
        // Pedidos diarios
        document.getElementById('exportarDiariosPDF').onclick = () => exportarTablaPDF('tablaPedidosDiarios', 'pedidos_diarios' + filtrosToSufijo());
        document.getElementById('exportarDiariosExcel').onclick = () => exportarTablaExcel('tablaPedidosDiarios', 'pedidos_diarios' + filtrosToSufijo());
        // Pedidos por estado
        document.getElementById('exportarEstadoPDF').onclick = () => exportarTablaPDF('tablaPedidosEstado', 'pedidos_por_estado' + filtrosToSufijo('estado'));
        document.getElementById('exportarEstadoExcel').onclick = () => exportarTablaExcel('tablaPedidosEstado', 'pedidos_por_estado' + filtrosToSufijo('estado'));
        // Pizzas más pedidas
        document.getElementById('exportarPizzasPDF').onclick = () => exportarTablaPDF('tablaPizzasMasPedidas', 'pizzas_mas_pedidas' + filtrosToSufijo('top'));
        document.getElementById('exportarPizzasExcel').onclick = () => exportarTablaExcel('tablaPizzasMasPedidas', 'pizzas_mas_pedidas' + filtrosToSufijo('top'));
      }, 100);

      // Renderizar gráficas con Chart.js (igual que antes)
      if (pedidosDiarios.length > 0) {
        const ctx1 = document.getElementById('graficaPedidosDiarios').getContext('2d');
        new Chart(ctx1, {
          type: 'bar',
          data: {
            labels: pedidosDiarios.map(r => r.fecha),
            datasets: [{
              label: 'Pedidos',
              data: pedidosDiarios.map(r => r.total),
              backgroundColor: 'rgba(44,204,64,0.7)',
              borderColor: 'rgba(44,204,64,1)',
              borderWidth: 1
            }]
          },
          options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }
        });
      }
      if (pedidosPorEstado.length > 0) {
        const ctx2 = document.getElementById('graficaPedidosEstado').getContext('2d');
        new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: pedidosPorEstado.map(r => r.estado),
            datasets: [{
              label: 'Pedidos',
              data: pedidosPorEstado.map(r => r.total),
              backgroundColor: [
                'rgba(255,99,132,0.7)',
                'rgba(44,204,64,0.7)',
                'rgba(54,162,235,0.7)',
                'rgba(255,206,86,0.7)',
                'rgba(153,102,255,0.7)',
                'rgba(255,159,64,0.7)'
              ],
              borderColor: [
                'rgba(255,99,132,1)',
                'rgba(44,204,64,1)',
                'rgba(54,162,235,1)',
                'rgba(255,206,86,1)',
                'rgba(153,102,255,1)',
                'rgba(255,159,64,1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
          }
        });
      }
      if (pizzasMasPedidas.length > 0) {
        const ctx3 = document.getElementById('graficaPizzasMasPedidas').getContext('2d');
        new Chart(ctx3, {
          type: 'pie',
          data: {
            labels: pizzasMasPedidas.map(r => r.nombre),
            datasets: [{
              label: 'Cantidad',
              data: pizzasMasPedidas.map(r => r.cantidad),
              backgroundColor: [
                'rgba(255,99,132,0.7)',
                'rgba(44,204,64,0.7)',
                'rgba(54,162,235,0.7)',
                'rgba(255,206,86,0.7)',
                'rgba(153,102,255,0.7)',
                'rgba(255,159,64,0.7)',
                'rgba(100,100,100,0.7)',
                'rgba(0,200,200,0.7)',
                'rgba(200,0,200,0.7)',
                'rgba(0,0,0,0.7)'
              ],
              borderColor: [
                'rgba(255,99,132,1)',
                'rgba(44,204,64,1)',
                'rgba(54,162,235,1)',
                'rgba(255,206,86,1)',
                'rgba(153,102,255,1)',
                'rgba(255,159,64,1)',
                'rgba(100,100,100,1)',
                'rgba(0,200,200,1)',
                'rgba(200,0,200,1)',
                'rgba(0,0,0,1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    } catch (error) {
      document.getElementById('contenedorReportesGraficas').innerHTML = `<p>Error al cargar los reportes: ${error.message}</p>`;
    }
  }

  // Función para exportar una tabla a PDF usando jsPDF y autoTable
  function exportarTablaPDF(tablaId, nombreArchivo) {
    const doc = new window.jspdf.jsPDF();
    doc.autoTable({ html: '#' + tablaId });
    doc.save(nombreArchivo + '.pdf');
  }
  // Función para exportar una tabla a Excel usando SheetJS
  function exportarTablaExcel(tablaId, nombreArchivo) {
    const tabla = document.getElementById(tablaId);
    if (!tabla) return;
    const wb = window.XLSX.utils.table_to_book(tabla, { sheet: 'Reporte' });
    window.XLSX.writeFile(wb, nombreArchivo + '.xlsx');
  }
}
loadDashboard();

window.addEventListener('DOMContentLoaded', () => {
  // --- Navegación entre secciones ---
  document.querySelectorAll('.sidebar nav button').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sidebar nav button').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const section = this.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');
      if (window.innerWidth <= 900) closeSidebar();
    });
  });
  // --- Cerrar sesión ---
  document.getElementById('logoutBtn').onclick = function() {
    localStorage.removeItem('usuario');
    window.location.href = 'interfaz/login.html';
  };
  // --- Menú lateral funcional y responsivo ---
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('translate-x-0');
    sidebar.classList.add('-translate-x-full');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('-translate-x-full')) {
        openSidebar();
      } else {
        closeSidebar();
      }
    });
  }
  if (overlay) {
    overlay.onclick = closeSidebar;
  }
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  if (closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar;
  // Cerrar sidebar al seleccionar sección en móvil
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth < 900) closeSidebar();
    });
  });
  // Marcar sección activa en el sidebar
  function marcarNavActiva(section) {
    document.querySelectorAll('.nav-link').forEach(btn => {
      if (btn.dataset.section === section) {
        btn.classList.add('bg-green-100', 'text-green-900');
        btn.setAttribute('data-active', 'true');
      } else {
        btn.classList.remove('bg-green-100', 'text-green-900');
        btn.removeAttribute('data-active');
      }
    });
  }
  // Llama marcarNavActiva(section) cuando cambie de sección
  // Si la sección productos está activa al cargar la página, carga los productos
  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productos').classList.contains('active')) {
      loadProductos();
    }
  });
});

// Función para mostrar modal de detalle del pedido
function mostrarModalDetalle(pedido) {
  const modal = document.getElementById('modalDetallePedido');
  const content = document.getElementById('detallePedidoContent');
  // Crear contenido del modal
  let html = `
    <div class="p-2 sm:p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <div>
          <h4 class="text-xl font-bold mb-1">Pedido #${pedido.id}</h4>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold mr-2 ${badgeEstadoColor(pedido.estado)}">${pedido.estado}</span>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${badgePagoColor(pedido.estado_pago)}">${pedido.estado_pago || 'Pendiente'}</span>
        </div>
        <div class="text-sm text-gray-500">${pedido.creado_en ? new Date(pedido.creado_en).toLocaleString('es-ES') : 'No disponible'}</div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <div class="bg-gray-50 rounded-lg p-3 border">
          <h5 class="font-semibold text-green-700 mb-1">Cliente</h5>
          <div><span class="font-semibold">Nombre:</span> ${pedido.nombre_cliente || 'No especificado'}</div>
          <div><span class="font-semibold">Email:</span> ${pedido.correo_cliente || 'No especificado'}</div>
          <div><span class="font-semibold">Teléfono:</span> ${pedido.telefono_cliente || 'No especificado'}</div>
          <div><span class="font-semibold">Dirección:</span> ${pedido.direccion_entrega || 'No especificada'}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border">
          <h5 class="font-semibold text-green-700 mb-1">Pedido</h5>
          <div><span class="font-semibold">Método Pago:</span> ${pedido.metodo_pago || 'No especificado'}</div>
          <div><span class="font-semibold">Notas:</span> ${pedido.notas || '-'}</div>
        </div>
      </div>
      <div class="mb-4">
        <h5 class="font-semibold mb-2">Productos</h5>
        <div class="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border pb-6" style="max-width:100vw;">
          <table class="min-w-[700px] divide-y divide-gray-200 text-sm bg-white rounded">
            <thead class="bg-green-100">
              <tr>
                <th class="px-2 py-1 font-bold text-left">Pizza</th>
                <th class="px-2 py-1 font-bold text-left">Tamaño</th>
                <th class="px-2 py-1 font-bold text-left">Cantidad</th>
                <th class="px-2 py-1 font-bold text-left">Precio Unitario</th>
                <th class="px-2 py-1 font-bold text-left">Subtotal</th>
                <th class="px-2 py-1 font-bold text-left">Instrucciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${(pedido.items || []).map(item => `
                <tr>
                  <td class="px-2 py-1">${item.nombre_pizza || item.nombre || '-'}</td>
                  <td class="px-2 py-1">${item.tamano || '-'}</td>
                  <td class="px-2 py-1">${item.cantidad}</td>
                  <td class="px-2 py-1">$${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                  <td class="px-2 py-1">$${parseFloat(item.precio_total || 0).toFixed(2)}</td>
                  <td class="px-2 py-1">${item.instrucciones_especiales || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1 mt-2">
        <div><strong>Total del Pedido:</strong> <span class="text-green-700 text-lg font-bold">$${parseFloat(pedido.monto_total || 0).toFixed(2)}</span></div>
      </div>
    </div>
  `;
  content.innerHTML = html;
  abrirModal('modalDetallePedido');
}

// Utilidades para badges de estado y pago
function badgeEstadoColor(estado) {
  switch ((estado || '').toLowerCase()) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'confirmado': return 'bg-blue-100 text-blue-800';
    case 'preparando': return 'bg-orange-100 text-orange-800';
    case 'listo': return 'bg-green-100 text-green-800';
    case 'en_entrega': return 'bg-indigo-100 text-indigo-800';
    case 'entregado': return 'bg-green-200 text-green-900';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-200 text-gray-700';
  }
}
function badgePagoColor(estadoPago) {
  switch ((estadoPago || '').toLowerCase()) {
    case 'pagado': return 'bg-green-100 text-green-700';
    case 'pendiente': return 'bg-yellow-100 text-yellow-700';
    case 'fallido': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-200 text-gray-700';
  }
}
// Event listeners para el modal de detalle
document.addEventListener('DOMContentLoaded', function() {
  // Cerrar modal de detalle
  document.getElementById('cerrarModalDetalle').addEventListener('click', function() {
    cerrarModal('modalDetallePedido');
  });
  
  // Cerrar modal al hacer clic fuera
  document.getElementById('modalDetallePedido').addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.add('hidden');
      this.classList.remove('flex');
    }
  });
});

// Nueva función para abrir el modal de edición
function abrirModalEditarPedido(pedido) {
  const modal = document.getElementById('modalEditarPedido');
  document.getElementById('editHoraEstimada').value = pedido.hora_entrega_estimada ? pedido.hora_entrega_estimada.substring(0,16) : '';
  document.getElementById('editHoraReal').value = pedido.hora_entrega_real ? pedido.hora_entrega_real.substring(0,16) : '';
  // Render instrucciones por item
  const cont = document.getElementById('editarInstruccionesItems');
  cont.innerHTML = '<h4 style="margin-top:1.2rem;">Instrucciones especiales por pizza</h4>' +
    (pedido.items || []).map((item, idx) => `
      <div style='margin-bottom:0.7rem;'>
        <label for="edit_instruccion_item_${idx}" style="font-weight:500;">${item.nombre_pizza || item.nombre || 'Producto'} (${item.tamano || '-'})</label>
        <textarea id="edit_instruccion_item_${idx}" rows="2" style="width:100%;max-width:400px;resize:vertical;" placeholder="Ej: sin cebolla, extra queso...">${item.instrucciones_especiales || ''}</textarea>
      </div>
    `).join('');
  abrirModal('modalEditarPedido');
  // Guardar referencia al pedido actual
  modal.dataset.pedidoId = pedido.id;
  modal.dataset.itemsCount = (pedido.items || []).length;
  // Cerrar modal
  document.getElementById('cerrarModalEditarPedido').onclick = function() {
    cerrarModal('modalEditarPedido');
  };
}

// Lógica para guardar cambios al enviar el formulario
const formEditarPedido = document.getElementById('formEditarPedido');
if (formEditarPedido) {
  formEditarPedido.onsubmit = async function(e) {
    e.preventDefault();
    const modal = document.getElementById('modalEditarPedido');
    const pedidoId = modal.dataset.pedidoId;
    const itemsCount = parseInt(modal.dataset.itemsCount || '0');
    const horaEstimada = document.getElementById('editHoraEstimada').value;
    const horaReal = document.getElementById('editHoraReal').value;
    // Obtener instrucciones editadas
    const instrucciones = [];
    for (let i = 0; i < itemsCount; i++) {
      instrucciones.push(document.getElementById('edit_instruccion_item_' + i).value);
    }
    // Construir payload
    const payload = {
      hora_entrega_estimada: horaEstimada || null,
      hora_entrega_real: horaReal || null,
      instrucciones_especiales: instrucciones
    };
    // Eliminar campos vacíos (null, string vacío o arrays vacíos)
    Object.keys(payload).forEach(key => {
      if (
        payload[key] === null ||
        payload[key] === '' ||
        (Array.isArray(payload[key]) && payload[key].every(val => !val || val === ''))
      ) {
        delete payload[key];
      }
    });
    try {
      const token = localStorage.getItem('jwt'); // Obtener el token JWT
      const res = await fetch(`http://localhost:8000/pedidos/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Agregar cabecera de autenticación
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        cerrarModal('modalEditarPedido');
        mostrarNotificacion('Pedido actualizado correctamente', 'success');
        // Opcional: recargar pedidos o detalle
      } else {
        mostrarNotificacion('Error al actualizar el pedido', 'error');
      }
    } catch (e) {
      mostrarNotificacion('Error de red al actualizar el pedido', 'error');
    }
  };
}

// Funciones globales para abrir/cerrar modales de producto
window.abrirModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
};
window.cerrarModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
};

// Funciones para abrir/cerrar modales de usuario
window.abrirModalUsuario = function() {
  const modal = document.getElementById('modalUsuario');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};
window.cerrarModalUsuario = function() {
  const modal = document.getElementById('modalUsuario');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};
window.abrirModalContrasena = function() {
  const modal = document.getElementById('modalContrasena');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};
window.cerrarModalContrasena = function() {
  const modal = document.getElementById('modalContrasena');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};
// Botones de cerrar (X)
const closeModalUsuarioBtn = document.getElementById('closeModalUsuarioBtn');
if (closeModalUsuarioBtn) closeModalUsuarioBtn.onclick = window.cerrarModalUsuario;
const closeModalContrasenaBtn = document.getElementById('closeModalContrasenaBtn');
if (closeModalContrasenaBtn) closeModalContrasenaBtn.onclick = window.cerrarModalContrasena;
// Cerrar modal al hacer clic fuera
const modalUsuario = document.getElementById('modalUsuario');
if (modalUsuario) {
  modalUsuario.onclick = function(e) {
    if (e.target === modalUsuario) window.cerrarModalUsuario();
  };
}
const modalContrasena = document.getElementById('modalContrasena');
if (modalContrasena) {
  modalContrasena.onclick = function(e) {
    if (e.target === modalContrasena) window.cerrarModalContrasena();
  };
}
// Asegurar que el dashboard sea visible en móvil
const dashboardSection = document.getElementById('dashboard');
if (dashboardSection) {
  dashboardSection.classList.remove('hidden');
  dashboardSection.classList.add('block');
}
// Refuerzo del sidebar hamburguesa
const menuToggleBtn = document.getElementById('menuToggle');
if (menuToggleBtn) {
  menuToggleBtn.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && !sidebar.classList.contains('hidden')) {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('flex', 'open');
      if (overlay) overlay.classList.add('hidden');
    } else if (sidebar) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('flex', 'open');
      if (overlay) overlay.classList.remove('hidden');
    }
  });
}
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
if (closeSidebarBtn) closeSidebarBtn.onclick = () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.add('hidden');
  if (sidebar) sidebar.classList.remove('flex', 'open');
  if (overlay) overlay.classList.add('hidden');
};
const sidebarOverlay = document.getElementById('sidebarOverlay');
if (sidebarOverlay) sidebarOverlay.onclick = () => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.add('hidden');
  if (sidebar) sidebar.classList.remove('flex', 'open');
  sidebarOverlay.classList.add('hidden');
};

// Sincronizar estado inicial del sidebar según el ancho de pantalla
function syncSidebarState() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (!sidebar || !overlay) return; // Asegúrate de que los elementos existan

  sidebar.classList.remove('-translate-x-full', 'translate-x-0');
  if (window.innerWidth >= 900) {
    sidebar.classList.add('translate-x-0');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  } else {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
}
window.addEventListener('DOMContentLoaded', syncSidebarState);
window.addEventListener('resize', syncSidebarState);

// Implementar función eliminarProducto para productos
window.eliminarProducto = async function(id) {
  if (!id) return;
  if (!confirm('¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.')) return;
  try {
    const res = await fetch(`http://localhost:8000/productos/pizzas/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      alert('Producto eliminado correctamente.');
      if (typeof loadProductos === 'function') loadProductos();
    } else {
      alert('Error al eliminar el producto.');
    }
  } catch (e) {
    alert('Error de red al eliminar el producto.');
  }
};