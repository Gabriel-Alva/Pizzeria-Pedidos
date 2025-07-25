// Panel de Empleado - Lógica completa y centralizada
// Este archivo contiene toda la funcionalidad del panel de empleado, incluyendo autenticación, navegación, dashboard, pedidos, entregas, productos, reportes, modales y notificaciones.

import { getCurrentUser, logoutUsuario } from './Controladores/usuariosController.js';

// ====== AUTENTICACIÓN Y DATOS DE USUARIO ======
const user = getCurrentUser();
if (!user || user.rol !== 'empleado') {
  window.location.href = '../interfaz/login.html';
}
document.getElementById('userName').textContent = `${user.nombre} ${user.apellido}`;
document.getElementById('userEmail').textContent = user.correo;
document.getElementById('userAvatar').textContent = user.nombre ? user.nombre.charAt(0).toUpperCase() : 'E';

window.logout = function() {
  logoutUsuario();
};

let pedidosChartInstance = null;

// ====== NAVEGACIÓN ENTRE SECCIONES ======
document.addEventListener('DOMContentLoaded', function() {
  // Verifica autenticación antes de cargar el dashboard
  const user = getCurrentUser();
  if (!user || user.rol !== 'empleado') {
    window.location.href = '../interfaz/login.html';
    return;
  }
  // Oculta todas las secciones excepto dashboard al cargar
  document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('dashboard').classList.remove('hidden');
  // Carga el dashboard solo si la sección está visible
  if (!document.getElementById('dashboard').classList.contains('hidden')) {
    loadDashboardEmpleado();
  }
  setInterval(() => {
    if (!document.getElementById('dashboard').classList.contains('hidden')) {
      loadDashboardEmpleado();
    }
  }, 30000);

  // Asegura que el botón de cerrar sesión funcione correctamente
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      logoutUsuario();
    };
  }

  // Asegura que el filtro de estado de pedidos funcione correctamente
  const filtroEstado = document.getElementById('filtroEstado');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', function() {
      loadPedidosEmpleado();
    });
  }

  // Asegura que el botón de actualizar pedidos funcione correctamente
  const btnActualizarPedidos = document.getElementById('btnActualizarPedidos');
  if (btnActualizarPedidos) {
    btnActualizarPedidos.onclick = function() {
      loadPedidosEmpleado();
    };
  }
});

// Navegación entre secciones usando 'hidden'
document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const section = this.dataset.section;
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    loadSectionContent(section);
    if (section === 'dashboard') {
      loadDashboardEmpleado();
    }
  });
});

function loadSectionContent(section) {
  switch(section) {
    case 'dashboard':
      loadDashboardEmpleado();
      break;
    case 'pedidos':
      loadPedidosEmpleado();
      break;
    case 'entregas':
      loadEntregasEmpleado();
      break;
    case 'productos':
      loadProductosEmpleado();
      break;
    case 'reportes':
      loadReportesEmpleado();
      break;
  }
}

// ====== DASHBOARD ======
/**
 * Carga los datos del dashboard del empleado y los mapea correctamente a las tarjetas.
 * El backend debe devolver los siguientes campos:
 * - pedidos_pendientes
 * - pedidos_en_preparacion
 * - pedidos_listos
 * - pedidos_entregados_hoy
 * - ultimos_pedidos (array)
 */
async function loadDashboardEmpleado() {
  // Mostrar mensaje de carga en cada tarjeta mientras se obtienen los datos
  document.getElementById('pedidosPendientes').textContent = 'Cargando...';
  document.getElementById('pedidosPreparando').textContent = 'Cargando...';
  document.getElementById('pedidosListos').textContent = 'Cargando...';
  document.getElementById('pedidosEntregados').textContent = 'Cargando...';
  try {
    // Obtener el token JWT almacenado tras el login
    const token = localStorage.getItem('jwt');
    // Solicitar los datos del dashboard del empleado al backend
    const res = await fetch('http://localhost:8000/empleado/dashboard', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('No autorizado o error en backend');
    const data = await res.json();
    // Mapear correctamente los datos a las tarjetas del dashboard
    document.getElementById('pedidosPendientes').textContent = data.pedidos_pendientes || 0;
    document.getElementById('pedidosPreparando').textContent = data.pedidos_en_preparacion || 0;
    document.getElementById('pedidosListos').textContent = data.pedidos_listos || 0;
    document.getElementById('pedidosEntregados').textContent = data.pedidos_entregados_hoy || 0;
    // Renderizar la gráfica de pedidos por estado (hoy)
    renderPedidosChart({
      pendientes: data.pedidos_pendientes || 0,
      preparando: data.pedidos_en_preparacion || 0,
      listos: data.pedidos_listos || 0,
      entregados: data.pedidos_entregados_hoy || 0
    });
    // Renderizar la tabla de últimos pedidos
    renderUltimosPedidos(data.ultimos_pedidos || []);
  } catch (e) {
    // En caso de error, mostrar 0 en todas las tarjetas y limpiar la gráfica y la tabla
    console.error('Error cargando dashboard:', e);
    document.getElementById('pedidosPendientes').textContent = '0';
    document.getElementById('pedidosPreparando').textContent = '0';
    document.getElementById('pedidosListos').textContent = '0';
    document.getElementById('pedidosEntregados').textContent = '0';
    renderPedidosChart({ pendientes: 0, preparando: 0, listos: 0, entregados: 0 });
    renderUltimosPedidos([]);
  }
}

function renderPedidosChart(datos) {
  const chartCanvas = document.getElementById('pedidosChart');
  if (!chartCanvas) return;
  // Ajustar tamaño fijo para evitar distorsión
  chartCanvas.width = 260;
  chartCanvas.height = 180;
  const ctx = chartCanvas.getContext('2d');
  if (pedidosChartInstance) {
    pedidosChartInstance.destroy();
    pedidosChartInstance = null;
  }
  pedidosChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Preparando', 'Listos', 'Entregados'],
      datasets: [{
        data: [
          datos.pendientes || 0,
          datos.preparando || 0,
          datos.listos || 0,
          datos.entregados || 0
        ],
        backgroundColor: ['#ffc107', '#fd7e14', '#28a745', '#6c757d'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: { size: 12 }
          }
        }
      }
    }
  });
}

function renderUltimosPedidos(pedidos) {
  const tbody = document.getElementById('ultimosPedidosTbody');
  if (!pedidos || pedidos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-gray-500 text-center py-2">Sin pedidos recientes</td></tr>';
    return;
  }
  tbody.innerHTML = pedidos.map(p => `
    <tr class="hover:bg-green-50 transition">
      <td class="px-3 py-2">${p.cliente || 'Cliente'}</td>
      <td class="px-3 py-2">${p.estado}</td>
      <td class="px-3 py-2">${new Date(p.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</td>
    </tr>
  `).join('');
}

// ====== GESTIÓN DE PEDIDOS ======
/**
 * Carga la lista de pedidos relevantes para el empleado.
 * Permite filtrar por estado y muestra solo los pedidos que no están entregados ni cancelados.
 */
async function loadPedidosEmpleado() {
  const container = document.getElementById('pedidosList');
  container.innerHTML = '<div class="loading">Cargando pedidos...</div>';
  try {
    const token = localStorage.getItem('jwt');
    const filtroEstado = document.getElementById('filtroEstado').value;
    // Endpoint dedicado para pedidos del empleado
    let url = 'https://servicio-pedidos.onrender.com/empleado/pedidos';
    if (filtroEstado) {
      url += `?estado=${filtroEstado}`;
    }
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Error al cargar pedidos');
    let pedidos = await res.json();
    // Filtrar solo los pedidos que no están entregados ni cancelados
    pedidos = pedidos.filter(p => p.estado !== 'entregado' && p.estado !== 'cancelado');
    renderPedidosEmpleado(pedidos);
  } catch (e) {
    console.error('Error cargando pedidos:', e);
    container.innerHTML = '<div class="no-data">Error al cargar pedidos</div>';
  }
}

/**
 * Renderiza la tabla de pedidos para el empleado.
 * @param {Array} pedidos - Lista de pedidos a mostrar.
 */
function renderPedidosEmpleado(pedidos) {
  const container = document.getElementById('pedidosList');
  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = '<div class="no-data text-gray-500 text-center py-4">No hay pedidos disponibles</div>';
    return;
  }
  const svgEye = `<svg xmlns='http://www.w3.org/2000/svg' class='inline h-5 w-5 text-blue-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5-4.03 9-9 9s-9-4-9-9 4.03-9 9-9 9 4 9 9z' /></svg>`;
  const tabla = `
    <div class="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-green-100">
        <tr>
          <th class="px-3 py-2 font-bold text-left">ID</th>
          <th class="px-3 py-2 font-bold text-left">Cliente</th>
          <th class="px-3 py-2 font-bold text-left">Productos</th>
          <th class="px-3 py-2 font-bold text-left">Subtotal</th>
          <th class="px-3 py-2 font-bold text-left">Total</th>
          <th class="px-3 py-2 font-bold text-left">Estado</th>
          <th class="px-3 py-2 font-bold text-left">Fecha</th>
          <th class="px-3 py-2 font-bold text-center">Acciones</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        ${pedidos.map(p => `
          <tr class="hover:bg-green-50 transition">
            <td class="px-3 py-2">#${p.id}</td>
            <td class="px-3 py-2">${p.nombre_cliente || 'Cliente'}</td>
            <td class="px-3 py-2" id="productos-pedido-${p.id}">Cargando...</td>
            <td class="px-3 py-2" id="subtotal-pedido-${p.id}">-</td>
            <td class="px-3 py-2">$${parseFloat(p.monto_total || 0).toFixed(2)}</td>
            <td class="px-3 py-2">
              <select class="select-estado px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 bg-gray-50 text-xs" data-id="${p.id}" data-estado-actual="${p.estado}">
                <option value="pendiente" ${p.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="confirmado" ${p.estado === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                <option value="preparando" ${p.estado === 'preparando' ? 'selected' : ''}>Preparando</option>
                <option value="listo" ${p.estado === 'listo' ? 'selected' : ''}>Listo</option>
                <option value="entregado" ${p.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                <option value="cancelado" ${p.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </td>
            <td class="px-3 py-2">${new Date(p.creado_en).toLocaleString('es-ES')}</td>
            <td class="px-3 py-2 text-center">
              <button class="hover:bg-blue-100 p-1 rounded" onclick="mostrarDetallePedido(${p.id})" title="Ver Detalle">
                ${svgEye}
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
  container.innerHTML = tabla;
  // Cargar resumen de productos y subtotal para cada pedido
  pedidos.forEach(async p => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(`http://localhost:8000/empleado/pedidos/${p.id}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error();
      const pedidoDetalle = await res.json();
      let resumen = 'Sin productos';
      let subtotal = 0;
      if (pedidoDetalle.items && pedidoDetalle.items.length > 0) {
        resumen = `<ul class='list-none m-0 p-0'>` + pedidoDetalle.items.map(item => `<li class='mb-0.5'>${item.cantidad}x ${item.tamano || ''} ${item.nombre_pizza}</li>`).join('') + `</ul>`;
        subtotal = pedidoDetalle.items.reduce((acc, item) => acc + (parseFloat(item.precio_total) || 0), 0);
      }
      document.getElementById(`productos-pedido-${p.id}`).innerHTML = resumen;
      document.getElementById(`subtotal-pedido-${p.id}`).textContent = `$${subtotal.toFixed(2)}`;
    } catch {
      document.getElementById(`productos-pedido-${p.id}`).textContent = 'Sin productos';
      document.getElementById(`subtotal-pedido-${p.id}`).textContent = '-';
    }
  });
  document.querySelectorAll('.select-estado').forEach(select => {
    select.addEventListener('change', function() {
      const pedidoId = this.dataset.id;
      const nuevoEstado = this.value;
      const estadoActual = this.dataset.estadoActual;
      if (nuevoEstado !== estadoActual) {
        actualizarEstadoPedido(pedidoId, nuevoEstado);
      }
    });
  });
}

/**
 * Actualiza el estado de un pedido desde el panel de empleado.
 * @param {number} pedidoId - ID del pedido a actualizar.
 * @param {string} nuevoEstado - Nuevo estado a asignar.
 */
async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
  try {
    const token = localStorage.getItem('jwt');
    // Endpoint dedicado para actualizar estado de pedido por empleado
    const res = await fetch(`http://localhost:8000/empleado/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    mostrarNotificacion(`Estado del pedido #${pedidoId} actualizado a: ${nuevoEstado}`, 'success');
    loadDashboardEmpleado();
    loadPedidosEmpleado();
  } catch (e) {
    console.error('Error actualizando estado:', e);
    mostrarNotificacion('Error al actualizar estado del pedido', 'error');
  }
}

// ====== GESTIÓN DE ENTREGAS (NUEVO DISEÑO CARDS) ======
async function loadEntregasEmpleado() {
  try {
    const token = localStorage.getItem('jwt');
    // Obtener todas las entregas relevantes (puedes ajustar el endpoint si es necesario)
    const res = await fetch('http://localhost:8000/empleado/pedidos', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    let entregas = await res.json();
    if (!Array.isArray(entregas)) entregas = [];
    renderEntregasCards(entregas);
  } catch (e) {
    console.error('Error cargando entregas:', e);
    document.getElementById('entregasCardsGrid').innerHTML = '<div class="no-data text-gray-500 text-center py-4">Error al cargar entregas</div>';
  }
}

function renderEntregasCards(entregas) {
  const grid = document.getElementById('entregasCardsGrid');
  if (!grid) return;
  // Filtros
  const estadoFiltro = document.getElementById('filtroEstadoEntrega').value;
  const pagoFiltro = document.getElementById('filtroPagoEntrega').value;
  const busqueda = document.getElementById('busquedaClienteEntrega').value.trim().toLowerCase();
  let filtradas = entregas.filter(e => {
    let matchEstado = !estadoFiltro || e.estado === estadoFiltro;
    let matchPago = !pagoFiltro || (e.estado_pago || '').toLowerCase() === pagoFiltro;
    let matchCliente = !busqueda || (e.nombre_cliente || '').toLowerCase().includes(busqueda);
    return matchEstado && matchPago && matchCliente;
  });
  if (filtradas.length === 0) {
    grid.innerHTML = '<div class="no-data text-gray-500 text-center py-4">No hay entregas para mostrar</div>';
    return;
  }
  grid.innerHTML = filtradas.map(e => {
    // Iconos SVG y estilos según estado
    let icono = '';
    let badgeEstado = '';
    let badgePago = '';
    let btnAccion = '';
    let cardClass = 'entrega-card shadow-lg p-5 border-2 mb-2 ';
    switch (e.estado) {
      case 'pendiente':
        icono = `<svg class='w-7 h-7 text-yellow-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#ffc107' stroke-width='2' fill='#fffbe6'/><path d='M12 6v6l4 2' stroke='#ffc107' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold flex items-center gap-1'>${icono} Pendiente</span>`;
        btnAccion = `<button class='btn-entrega iniciar text-lg py-3 px-6 flex items-center gap-2' onclick='iniciarEntrega(${e.id})'>
          <svg class='w-5 h-5 mr-1' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M3 17v-6a2 2 0 012-2h3V7a2 2 0 012-2h4a2 2 0 012 2v2h3a2 2 0 012 2v6'/><circle cx='7.5' cy='17.5' r='2.5'/><circle cx='16.5' cy='17.5' r='2.5'/></svg>
          Iniciar Entrega
        </button>`;
        cardClass += 'border-yellow-400 bg-yellow-50';
        break;
      case 'confirmado':
        icono = `<svg class='w-7 h-7 text-blue-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#60a5fa' stroke-width='2' fill='#e3f0fa'/><path d='M9 12l2 2 4-4' stroke='#60a5fa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1'>${icono} Confirmado</span>`;
        btnAccion = '';
        cardClass += 'border-blue-400 bg-blue-50';
        break;
      case 'preparando':
        icono = `<svg class='w-7 h-7 text-orange-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#fd7e14' stroke-width='2' fill='#fff7ed'/><path d='M12 8v4l3 3' stroke='#fd7e14' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-bold flex items-center gap-1'>${icono} Preparando</span>`;
        btnAccion = '';
        cardClass += 'border-orange-400 bg-orange-50';
        break;
      case 'listo':
        icono = `<svg class='w-7 h-7 text-green-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#22c55e' stroke-width='2' fill='#e6fbe6'/><path d='M12 8v4l3 3' stroke='#22c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold flex items-center gap-1'>${icono} Listo</span>`;
        btnAccion = '';
        cardClass += 'border-green-400 bg-green-50';
        break;
      case 'en_entrega':
        icono = `<svg class='w-7 h-7 text-indigo-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><rect x='3' y='7' width='18' height='13' rx='2' fill='#e0e7ff'/><path d='M16 3v4M8 3v4' stroke='#6366f1' stroke-width='2' stroke-linecap='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1'>${icono} En Entrega</span>`;
        btnAccion = `<button class='btn-entrega completar text-lg py-3 px-6 flex items-center gap-2' onclick='completarEntrega(${e.id})'>
          <svg class='w-5 h-5 mr-1' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M9 12l2 2 4-4' stroke='#fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>
          Completar Entrega
        </button>`;
        cardClass += 'border-indigo-400 bg-indigo-50';
        break;
      case 'entregado':
        icono = `<svg class='w-7 h-7 text-green-700' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#16a34a' stroke-width='2' fill='#e6fbe6'/><path d='M9 12l2 2 4-4' stroke='#16a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold flex items-center gap-1'>${icono} Entregado</span>`;
        btnAccion = `<button class='btn-entrega text-lg py-3 px-6 flex items-center gap-2' disabled><svg class='w-5 h-5 mr-1' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><path d='M9 12l2 2 4-4' stroke='#16a34a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>✓</button>`;
        cardClass += 'border-green-700 bg-green-50';
        break;
      case 'cancelado':
        icono = `<svg class='w-7 h-7 text-red-500' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' stroke='#dc3545' stroke-width='2' fill='#fff1f0'/><path d='M15 9l-6 6M9 9l6 6' stroke='#dc3545' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
        badgeEstado = `<span class='px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1'>${icono} Cancelado</span>`;
        btnAccion = '';
        cardClass += 'border-red-400 bg-red-50';
        break;
      default:
        badgeEstado = `<span class='px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-bold'>${e.estado}</span>`;
        btnAccion = '';
        cardClass += 'border-gray-300 bg-gray-50';
    }
    // Badge de pago
    if ((e.estado_pago || '').toLowerCase() === 'pagado') {
      badgePago = `<span class='px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold ml-2'>Pagado</span>`;
    } else if ((e.estado_pago || '').toLowerCase() === 'pendiente') {
      badgePago = `<span class='px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold ml-2'>No Pagado</span>`;
    } else if ((e.estado_pago || '').toLowerCase() === 'fallido') {
      badgePago = `<span class='px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold ml-2'>Fallido</span>`;
    }
    // Productos en lista
    let productos = '';
    if (e.items && Array.isArray(e.items) && e.items.length > 0) {
      productos = `<ul class='list-disc pl-5 text-sm text-gray-700 mb-2'>` + e.items.map(item => `<li>${item.cantidad}x ${item.tamano || ''} ${item.nombre_pizza}</li>`).join('') + `</ul>`;
    }
    return `
      <div class="${cardClass}">
        <div class="entrega-header flex items-center justify-between mb-2">
          <span class="cliente font-semibold">${e.nombre_cliente || 'Cliente'}</span>
          <div class="flex items-center gap-2">${badgeEstado}${badgePago}</div>
        </div>
        <div class="direccion text-gray-600 text-sm mb-1"><strong>Dirección:</strong> ${e.direccion_entrega || '-'}</div>
        <div class="mb-1"><strong>Hora:</strong> ${e.creado_en ? new Date(e.creado_en).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
        <div class="mb-1"><strong>Total:</strong> $${parseFloat(e.monto_total || 0).toFixed(2)}</div>
        <div class="mb-1"><strong>Productos:</strong> ${productos || '-'}</div>
        <div class="acciones flex gap-2 mt-2">${btnAccion}</div>
      </div>
    `;
  }).join('');
}

// Filtros interactivos para entregas
['filtroEstadoEntrega', 'filtroPagoEntrega', 'busquedaClienteEntrega'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => loadEntregasEmpleado());
    el.addEventListener('change', () => loadEntregasEmpleado());
  }
});

/**
 * Inicia la entrega de un pedido cambiando su estado a 'en_entrega'.
 * @param {number} pedidoId - ID del pedido a actualizar.
 */
function iniciarEntrega(pedidoId) {
    // Obtener el token JWT almacenado tras el login
    const token = localStorage.getItem('jwt');
    fetch(`http://localhost:8000/pedidos/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: 'en_entrega' })
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al iniciar entrega');
      mostrarNotificacion(`Entrega iniciada para el pedido #${pedidoId}`, 'success');
      loadDashboardEmpleado();
      loadPedidosEmpleado();
      loadEntregasEmpleado(); // Actualizar la lista de entregas pendientes
    })
    .catch(error => {
      console.error('Error iniciando entrega:', error);
      mostrarNotificacion('Error al iniciar entrega', 'error');
    });
}

/**
 * Completa la entrega de un pedido cambiando su estado a 'entregado'.
 * @param {number} pedidoId - ID del pedido a actualizar.
 */
function completarEntrega(pedidoId) {
    // Obtener el token JWT almacenado tras el login
    const token = localStorage.getItem('jwt');
    fetch(`http://localhost:8000/pedidos/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: 'entregado' })
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al completar entrega');
      mostrarNotificacion(`Entrega completada para el pedido #${pedidoId}`, 'success');
      loadDashboardEmpleado();
      loadPedidosEmpleado();
      loadEntregasEmpleado(); // Actualizar la lista de entregas pendientes
    })
    .catch(error => {
      console.error('Error completando entrega:', error);
      mostrarNotificacion('Error al completar entrega', 'error');
    });
}

// ====== MODALES Y NOTIFICACIONES ======
function mostrarModalDetalle(pedido) {
  const modal = document.getElementById('modalDetallePedido');
  const content = document.getElementById('detallePedidoContent');
  // Calcular subtotal
  let subtotal = 0;
  if (pedido.items && pedido.items.length > 0) {
    subtotal = pedido.items.reduce((acc, item) => acc + (parseFloat(item.precio_total) || 0), 0);
  }
  content.innerHTML = `
    <div class="detalle-pedido p-4">
      <div class="detalle-pedido-header flex flex-col md:flex-row md:items-center md:justify-between mb-2">
        <h4 class="text-xl font-bold">Pedido #${pedido.id}</h4>
        <span class="estado-badge ${pedido.estado} px-3 py-1 rounded text-white font-semibold text-sm" style="background:#16a34a;">${pedido.estado}</span>
      </div>
      <div class="detalle-pedido-info grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <span><strong>Cliente:</strong> <span class="valor">${pedido.nombre_cliente || 'Cliente'}</span></span>
        <span><strong>Fecha:</strong> <span class="valor">${new Date(pedido.creado_en).toLocaleString('es-ES')}</span></span>
        <span><strong>Dirección:</strong> <span class="valor">${pedido.direccion_entrega || '-'}</span></span>
        <span><strong>Método de pago:</strong> <span class="valor">${pedido.metodo_pago || '-'}</span></span>
        <span><strong>Notas:</strong> <span class="valor">${pedido.notas || '-'}</span></span>
      </div>
      <div class="detalle-pedido-items mb-4">
        <h4 class="font-semibold mb-2">Productos:</h4>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm bg-white rounded">
            <thead class="bg-green-100">
              <tr>
                <th class="px-2 py-1 font-bold text-left">Pizza</th>
                <th class="px-2 py-1 font-bold text-left">Tamaño</th>
                <th class="px-2 py-1 font-bold text-left">Cantidad</th>
                <th class="px-2 py-1 font-bold text-left">Precio Unitario</th>
                <th class="px-2 py-1 font-bold text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${pedido.items ? pedido.items.map(item => `
                <tr>
                  <td class="px-2 py-1">${item.nombre_pizza}</td>
                  <td class="px-2 py-1">${item.tamano || '-'}</td>
                  <td class="px-2 py-1">${item.cantidad}</td>
                  <td class="px-2 py-1">$${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                  <td class="px-2 py-1">$${parseFloat(item.precio_total || 0).toFixed(2)}</td>
                </tr>
              `).join('') : '<tr><td colspan="5">No hay productos en este pedido</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      <div class="detalle-pedido-total flex flex-col items-end gap-1">
        <div><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</div>
        <div><strong>Total del Pedido:</strong> $${parseFloat(pedido.monto_total || 0).toFixed(2)}</div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  if (tipo === 'success') {
    notificacion.style.background = '#28a745';
  } else if (tipo === 'error') {
    notificacion.style.background = '#dc3545';
  } else {
    notificacion.style.background = '#17a2b8';
  }
  document.body.appendChild(notificacion);
  setTimeout(() => {
    notificacion.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.parentNode.removeChild(notificacion);
      }
    }, 300);
  }, 3000);
}

/**
 * Obtiene y muestra el detalle de un pedido en un modal.
 * @param {number} id - ID del pedido a mostrar.
 */
async function mostrarDetallePedido(id) {
  try {
    const token = localStorage.getItem('jwt');
    // Usar el endpoint dedicado para empleados
    const res = await fetch(`http://localhost:8000/empleado/pedidos/${id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Error al cargar detalle');
    const pedido = await res.json();
    mostrarModalDetalle(pedido);
  } catch (e) {
    console.error('Error cargando detalle:', e);
    mostrarNotificacion('Error al cargar detalle del pedido', 'error');
  }
}

// Exponer la función correctamente en window para evitar ReferenceError
window.mostrarDetallePedido = mostrarDetallePedido;

// Expone las funciones para que los botones funcionen correctamente desde el HTML
window.iniciarEntrega = iniciarEntrega;
window.completarEntrega = completarEntrega;

// Asegura que el botón de cerrar del modal de detalle funcione correctamente
const cerrarModalDetalleBtn = document.getElementById('cerrarModalDetalle');
if (cerrarModalDetalleBtn) {
  cerrarModalDetalleBtn.onclick = function() {
    document.getElementById('modalDetallePedido').classList.add('hidden');
  };
}

// ====== PRODUCTOS ======
function loadProductosEmpleado() {
  const grid = document.getElementById('productosGrid');
  if (grid) {
    grid.innerHTML = '<div class="loading text-gray-500 text-center py-4">Cargando productos...</div>';
    fetch('http://localhost:8000/productos/pizzas')
      .then(res => res.json())
      .then(productos => {
        grid.innerHTML = '';
        productos.forEach(producto => {
          grid.innerHTML += `
            <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-200 hover:shadow-lg transition">
              <img src="${producto.url_imagen || 'https://via.placeholder.com/300x200?text=Pizza'}" alt="${producto.nombre}" class="w-full max-w-xs h-32 object-cover rounded mb-2">
              <div class="font-bold text-lg text-gray-800 mb-1">${producto.nombre}</div>
              <div class="text-sm text-gray-500 mb-1">${producto.ingredientes || 'Sin ingredientes especificados'}</div>
              <div class="text-green-600 font-semibold text-base mb-1">$${parseFloat(producto.precio).toFixed(2)}</div>
              <div class="mt-1 text-xs font-semibold ${producto.disponible == 1 ? 'text-green-700' : 'text-red-600'}">
                ${producto.disponible == 1 ? 'Disponible' : 'No disponible'}
              </div>
            </div>
          `;
        });
      })
      .catch(() => {
        grid.innerHTML = '<div class="no-data text-gray-500 text-center py-4">Error al cargar productos</div>';
      });
  }
}

/**
 * Carga los reportes del empleado y los muestra en la sección correspondiente.
 * Consulta el backend para obtener pedidos procesados hoy, entregas completadas y tiempo promedio de preparación.
 */
async function loadReportesEmpleado() {
  // Elementos donde se mostrarán los datos
  const pedidosHoyElem = document.getElementById('pedidosProcesadosHoy');
  const entregasElem = document.getElementById('entregasCompletadas');
  const tiempoElem = document.getElementById('tiempoPromedio');
  const tbodyPedidos = document.getElementById('tbodyPedidosCompletos');
  const tbodyResumen = document.getElementById('tbodyResumenEstadosHoy');
  const tbodyTodosPedidos = document.getElementById('tbodyTodosPedidos');

  // Mostrar valores de carga
  if (pedidosHoyElem) pedidosHoyElem.textContent = 'Cargando...';
  if (entregasElem) entregasElem.textContent = 'Cargando...';
  if (tiempoElem) tiempoElem.textContent = 'Cargando...';
  if (tbodyPedidos) tbodyPedidos.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
  if (tbodyResumen) tbodyResumen.innerHTML = '<tr><td colspan="2">Cargando...</td></tr>';
  if (tbodyTodosPedidos) tbodyTodosPedidos.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

  try {
    const token = localStorage.getItem('jwt');
    fetch('http://localhost:8000/empleado/pedidos', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(async pedidos => {
        // Pedidos procesados hoy (entregados hoy)
        const hoy = new Date();
        const hoyStr = hoy.toISOString().slice(0, 10);
        const pedidosHoy = pedidos.filter(p => (p.creado_en || '').slice(0, 10) === hoyStr && p.estado === 'entregado');
        if (pedidosHoyElem) pedidosHoyElem.textContent = pedidosHoy.length;
        if (entregasElem) entregasElem.textContent = pedidosHoy.length;
        // Calcular tiempo promedio de preparación (si hay datos)
        let totalMin = 0;
        let count = 0;
        pedidosHoy.forEach(p => {
          if (p.creado_en && p.hora_entrega_real) {
            const inicio = new Date(p.creado_en);
            const fin = new Date(p.hora_entrega_real);
            const min = (fin - inicio) / 60000;
            if (!isNaN(min) && min > 0) {
              totalMin += min;
              count++;
            }
          }
        });
        if (tiempoElem) {
          if (count > 0) {
            tiempoElem.textContent = Math.round(totalMin / count) + ' min';
          } else {
            tiempoElem.textContent = 'N/A';
          }
        }
        // Tabla completa de pedidos recientes (últimos 7 días) con productos
        if (tbodyPedidos) {
          // Asegura que el thead existe antes de modificarlo
          let theadPedidos = tbodyPedidos.parentElement.querySelector('thead');
          if (!theadPedidos) {
            theadPedidos = document.createElement('thead');
            tbodyPedidos.parentElement.insertBefore(theadPedidos, tbodyPedidos.parentElement.firstChild);
          }
          theadPedidos.innerHTML = `
            <tr>
              <th class='px-6 py-4 font-bold text-left'>Fecha</th>
              <th class='px-6 py-4 font-bold text-left'>Hora</th>
              <th class='px-6 py-4 font-bold text-left'>Estado</th>
              <th class='px-6 py-4 font-bold text-left'>Productos</th>
              <th class='px-6 py-4 font-bold text-left'>Cliente</th>
              <th class='px-6 py-4 font-bold text-left'>Monto Total</th>
            </tr>
          `;
          tbodyPedidos.innerHTML = pedidos.map(() =>
            `<tr><td colspan="6">Cargando productos...</td></tr>`
          ).join('');
          // Para cada pedido, obtener los productos y actualizar la fila
          await Promise.all(pedidos.map(async (p, idx) => {
            let productosHtml = '<span class="text-gray-400">Sin productos</span>';
            let fecha = '', hora = '';
            if (p.creado_en) {
              const d = new Date(p.creado_en);
              fecha = d.toLocaleDateString('es-ES');
              hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            try {
              const resDetalle = await fetch(`http://localhost:8000/empleado/pedidos/${p.id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (resDetalle.ok) {
                const detalle = await resDetalle.json();
                if (detalle.items && Array.isArray(detalle.items) && detalle.items.length > 0) {
                  productosHtml = `<table class='min-w-full text-xs border border-gray-200 rounded'>
                    <thead class='bg-gray-50'>
                      <tr>
                        <th class='px-2 py-1 text-left'>Cant.</th>
                        <th class='px-2 py-1 text-left'>Producto</th>
                        <th class='px-2 py-1 text-left'>Precio u.</th>
                        <th class='px-2 py-1 text-left'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${detalle.items.map(item => `
                        <tr>
                          <td class='px-2 py-1'>${item.cantidad}</td>
                          <td class='px-2 py-1'>${item.nombre_pizza || '-'}</td>
                          <td class='px-2 py-1'>$${item.precio_unitario ? Number(item.precio_unitario).toFixed(2) : '-'}</td>
                          <td class='px-2 py-1'>$${item.precio_total ? Number(item.precio_total).toFixed(2) : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>`;
                }
              }
            } catch {}
            const fila = `<tr>
              <td>${fecha}</td>
              <td>${hora}</td>
              <td>${p.estado || ''}</td>
              <td>${productosHtml}</td>
              <td>${p.nombre_cliente || ''}</td>
              <td class='font-bold text-green-700'>$${parseFloat(p.monto_total || 0).toFixed(2)}</td>
            </tr>`;
            // Reemplaza la fila correspondiente
            tbodyPedidos.children[idx].outerHTML = fila;
          }));
          if (tbodyPedidos.children.length === 0) {
            tbodyPedidos.innerHTML = '<tr><td colspan="6">Sin pedidos recientes</td></tr>';
          }
        }
        // Llenar la tabla de TODOS los pedidos realizados
        if (tbodyTodosPedidos) {
          // Asegura que el thead existe antes de modificarlo
          let theadTodos = tbodyTodosPedidos.parentElement.querySelector('thead');
          if (!theadTodos) {
            theadTodos = document.createElement('thead');
            tbodyTodosPedidos.parentElement.insertBefore(theadTodos, tbodyTodosPedidos.parentElement.firstChild);
          }
          theadTodos.innerHTML = `
            <tr>
              <th class='px-6 py-4 font-bold text-left'>Fecha</th>
              <th class='px-6 py-4 font-bold text-left'>Hora</th>
              <th class='px-6 py-4 font-bold text-left'>Estado</th>
              <th class='px-6 py-4 font-bold text-left'>Productos</th>
              <th class='px-6 py-4 font-bold text-left'>Cliente</th>
              <th class='px-6 py-4 font-bold text-left'>Monto Total</th>
            </tr>
          `;
          tbodyTodosPedidos.innerHTML = pedidos.map(() => `<tr><td colspan="6">Cargando productos...</td></tr>`).join('');
          await Promise.all(pedidos.map(async (p, idx) => {
            let productosHtml = '<span class="text-gray-400">Sin productos</span>';
            let fecha = '', hora = '';
            if (p.creado_en) {
              const d = new Date(p.creado_en);
              fecha = d.toLocaleDateString('es-ES');
              hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            try {
              const resDetalle = await fetch(`http://localhost:8000/empleado/pedidos/${p.id}`, {
                headers: { 'Authorization': 'Bearer ' + token }
              });
              if (resDetalle.ok) {
                const detalle = await resDetalle.json();
                if (detalle.items && Array.isArray(detalle.items) && detalle.items.length > 0) {
                  productosHtml = `<table class='min-w-full text-xs border border-gray-200 rounded'>
                    <thead class='bg-gray-50'>
                      <tr>
                        <th class='px-2 py-1 text-left'>Cant.</th>
                        <th class='px-2 py-1 text-left'>Producto</th>
                        <th class='px-2 py-1 text-left'>Precio u.</th>
                        <th class='px-2 py-1 text-left'>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${detalle.items.map(item => `
                        <tr>
                          <td class='px-2 py-1'>${item.cantidad}</td>
                          <td class='px-2 py-1'>${item.nombre_pizza || '-'}</td>
                          <td class='px-2 py-1'>$${item.precio_unitario ? Number(item.precio_unitario).toFixed(2) : '-'}</td>
                          <td class='px-2 py-1'>$${item.precio_total ? Number(item.precio_total).toFixed(2) : '-'}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>`;
                }
              }
            } catch {}
            const fila = `<tr>
              <td>${fecha}</td>
              <td>${hora}</td>
              <td>${p.estado || ''}</td>
              <td>${productosHtml}</td>
              <td>${p.nombre_cliente || ''}</td>
              <td class='font-bold text-green-700'>$${parseFloat(p.monto_total || 0).toFixed(2)}</td>
            </tr>`;
            tbodyTodosPedidos.children[idx].outerHTML = fila;
          }));
          if (tbodyTodosPedidos.children.length === 0) {
            tbodyTodosPedidos.innerHTML = '<tr><td colspan="6">Sin pedidos</td></tr>';
          }
        }
        // Resumen de pedidos de hoy por estado
        if (tbodyResumen) {
          const resumenEstados = {};
          pedidos.forEach(p => {
            const fecha = (p.creado_en || '').slice(0, 10);
            if (fecha === hoyStr) {
              resumenEstados[p.estado] = (resumenEstados[p.estado] || 0) + 1;
            }
          });
          const estados = ['pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'];
          tbodyResumen.innerHTML = estados.map(e =>
            `<tr><td>${e.charAt(0).toUpperCase() + e.slice(1)}</td><td>${resumenEstados[e] || 0}</td></tr>`
          ).join('');
        }
      })
      .catch(() => {
        if (pedidosHoyElem) pedidosHoyElem.textContent = '0';
        if (entregasElem) entregasElem.textContent = '0';
        if (tiempoElem) tiempoElem.textContent = 'N/A';
        if (tbodyPedidos) tbodyPedidos.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
        if (tbodyResumen) tbodyResumen.innerHTML = '<tr><td colspan="2">Error al cargar</td></tr>';
        if (tbodyTodosPedidos) tbodyTodosPedidos.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
      });
  } catch (e) {
    if (pedidosHoyElem) pedidosHoyElem.textContent = '0';
    if (entregasElem) entregasElem.textContent = '0';
    if (tiempoElem) tiempoElem.textContent = 'N/A';
    if (tbodyPedidos) tbodyPedidos.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
    if (tbodyResumen) tbodyResumen.innerHTML = '<tr><td colspan="2">Error al cargar</td></tr>';
    if (tbodyTodosPedidos) tbodyTodosPedidos.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
  }
}

// ====== EXPORTAR REPORTES (PDF y Excel) ======
// Asegúrate de tener jsPDF y SheetJS incluidos en tu HTML o cargados por CDN
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.7.0/jspdf.plugin.autotable.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

// Actualiza la tabla de reportes con los datos actuales
function actualizarTablaReportes() {
  document.getElementById('tdPedidosHoy').textContent = document.getElementById('pedidosProcesadosHoy').textContent;
  document.getElementById('tdEntregas').textContent = document.getElementById('entregasCompletadas').textContent;
  document.getElementById('tdTiempo').textContent = document.getElementById('tiempoPromedio').textContent;
}

// Exportar a PDF usando jsPDF y autoTable
function exportarReportesPDF() {
  actualizarTablaReportes();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Reporte de Actividad del Empleado', 14, 18);
  doc.autoTable({
    html: '#tablaReportesEmpleado',
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 12 }
  });
  doc.save('reporte_empleado.pdf');
}

// Exportar a Excel usando SheetJS
function exportarReportesExcel() {
  actualizarTablaReportes();
  const tabla = document.getElementById('tablaReportesEmpleado');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: 'Reportes' });
  XLSX.writeFile(wb, 'reporte_empleado.xlsx');
}

// Asignar eventos a los botones de exportar
const btnExportarPDF = document.getElementById('btnExportarPDF');
if (btnExportarPDF) {
  btnExportarPDF.onclick = function() {
    // Mostrar la tabla solo para exportar (si está oculta)
    const tabla = document.getElementById('tablaReportesEmpleado');
    tabla.style.display = '';
    exportarReportesPDF();
    tabla.style.display = 'none';
  };
}
const btnExportarExcel = document.getElementById('btnExportarExcel');
if (btnExportarExcel) {
  btnExportarExcel.onclick = function() {
    const tabla = document.getElementById('tablaReportesEmpleado');
    tabla.style.display = '';
    exportarReportesExcel();
    tabla.style.display = 'none';
  };
}

// Exportar TODOS los pedidos a PDF
function exportarTodosPedidosPDF() {
  generarTablaExportTemp();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Todos los Pedidos Realizados', 14, 18);
  doc.autoTable({
    html: '#tablaExportTemp',
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 12 }
  });
  doc.save('todos_pedidos.pdf');
  document.getElementById('tablaExportTemp')?.remove();
}
// Exportar TODOS los pedidos a Excel
function exportarTodosPedidosExcel() {
  generarTablaExportTemp();
  const tabla = document.getElementById('tablaExportTemp');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: 'TodosPedidos' });
  XLSX.writeFile(wb, 'todos_pedidos.xlsx');
  document.getElementById('tablaExportTemp')?.remove();
}
// Genera una tabla temporal plana para exportar
function generarTablaExportTemp() {
  const tbodyTodosPedidos = document.getElementById('tbodyTodosPedidos');
  if (!tbodyTodosPedidos) return;
  let filas = [];
  for (const tr of tbodyTodosPedidos.children) {
    // Extrae los datos de la fila visual
    const tds = tr.querySelectorAll('td');
    if (tds.length < 6) continue;
    const fecha = tds[0].textContent.trim();
    const hora = tds[1].textContent.trim();
    const estado = tds[2].textContent.trim();
    const cliente = tds[4].textContent.trim();
    const montoTotal = tds[5].textContent.trim();
    // Extrae los productos de la subtabla
    const subtable = tds[3].querySelector('table');
    if (subtable) {
      const subtrs = subtable.querySelectorAll('tbody tr');
      for (const subtr of subtrs) {
        const subtds = subtr.querySelectorAll('td');
        filas.push({
          fecha, hora, estado,
          producto: subtds[1]?.textContent.trim() || '',
          cantidad: subtds[0]?.textContent.trim() || '',
          precioUnit: subtds[2]?.textContent.trim() || '',
          subtotal: subtds[3]?.textContent.trim() || '',
          cliente, montoTotal
        });
      }
    } else {
      filas.push({ fecha, hora, estado, producto: '', cantidad: '', precioUnit: '', subtotal: '', cliente, montoTotal });
    }
  }
  // Crea la tabla temporal
  let html = `<table id="tablaExportTemp" style="display:none"><thead><tr>
    <th>Fecha</th><th>Hora</th><th>Estado</th><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th><th>Cliente</th><th>Monto Total</th>
  </tr></thead><tbody>`;
  for (const f of filas) {
    html += `<tr><td>${f.fecha}</td><td>${f.hora}</td><td>${f.estado}</td><td>${f.producto}</td><td>${f.cantidad}</td><td>${f.precioUnit}</td><td>${f.subtotal}</td><td>${f.cliente}</td><td>${f.montoTotal}</td></tr>`;
  }
  html += '</tbody></table>';
  document.body.insertAdjacentHTML('beforeend', html);
}

// Asignar eventos a los nuevos botones de exportar todos
const btnExportarTodosPDF = document.getElementById('btnExportarTodosPDF');
if (btnExportarTodosPDF) {
  btnExportarTodosPDF.onclick = function() {
    exportarTodosPedidosPDF();
  };
}
const btnExportarTodosExcel = document.getElementById('btnExportarTodosExcel');
if (btnExportarTodosExcel) {
  btnExportarTodosExcel.onclick = function() {
    exportarTodosPedidosExcel();
  };
}

// Exportar pedidos recientes a PDF
function exportarRecientesPDF() {
  generarTablaExportRecientesTemp();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Pedidos Recientes (Últimos 7 días)', 14, 18);
  doc.autoTable({
    html: '#tablaExportRecientesTemp',
    startY: 28,
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 12 }
  });
  doc.save('pedidos_recientes.pdf');
  document.getElementById('tablaExportRecientesTemp')?.remove();
}
// Exportar pedidos recientes a Excel
function exportarRecientesExcel() {
  generarTablaExportRecientesTemp();
  const tabla = document.getElementById('tablaExportRecientesTemp');
  const wb = XLSX.utils.table_to_book(tabla, { sheet: 'PedidosRecientes' });
  XLSX.writeFile(wb, 'pedidos_recientes.xlsx');
  document.getElementById('tablaExportRecientesTemp')?.remove();
}
// Genera una tabla temporal plana para exportar pedidos recientes
function generarTablaExportRecientesTemp() {
  const tbodyPedidos = document.getElementById('tbodyPedidosCompletos');
  if (!tbodyPedidos) return;
  let filas = [];
  for (const tr of tbodyPedidos.children) {
    const tds = tr.querySelectorAll('td');
    if (tds.length < 6) continue;
    const fecha = tds[0].textContent.trim();
    const hora = tds[1].textContent.trim();
    const estado = tds[2].textContent.trim();
    const cliente = tds[4].textContent.trim();
    const montoTotal = tds[5].textContent.trim();
    const subtable = tds[3].querySelector('table');
    if (subtable) {
      const subtrs = subtable.querySelectorAll('tbody tr');
      for (const subtr of subtrs) {
        const subtds = subtr.querySelectorAll('td');
        filas.push({
          fecha, hora, estado,
          producto: subtds[1]?.textContent.trim() || '',
          cantidad: subtds[0]?.textContent.trim() || '',
          precioUnit: subtds[2]?.textContent.trim() || '',
          subtotal: subtds[3]?.textContent.trim() || '',
          cliente, montoTotal
        });
      }
    } else {
      filas.push({ fecha, hora, estado, producto: '', cantidad: '', precioUnit: '', subtotal: '', cliente, montoTotal });
    }
  }
  let html = `<table id="tablaExportRecientesTemp" style="display:none"><thead><tr>
    <th>Fecha</th><th>Hora</th><th>Estado</th><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th><th>Cliente</th><th>Monto Total</th>
  </tr></thead><tbody>`;
  for (const f of filas) {
    html += `<tr><td>${f.fecha}</td><td>${f.hora}</td><td>${f.estado}</td><td>${f.producto}</td><td>${f.cantidad}</td><td>${f.precioUnit}</td><td>${f.subtotal}</td><td>${f.cliente}</td><td>${f.montoTotal}</td></tr>`;
  }
  html += '</tbody></table>';
  document.body.insertAdjacentHTML('beforeend', html);
}
// Asignar eventos a los nuevos botones de exportar recientes
const btnExportarRecientesPDF = document.getElementById('btnExportarRecientesPDF');
if (btnExportarRecientesPDF) {
  btnExportarRecientesPDF.onclick = exportarRecientesPDF;
}
const btnExportarRecientesExcel = document.getElementById('btnExportarRecientesExcel');
if (btnExportarRecientesExcel) {
  btnExportarRecientesExcel.onclick = exportarRecientesExcel;
}

// ===== Sidebar y botón hamburguesa 100% responsive =====
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
// Cerrar sidebar al hacer clic en un enlace del menú (en mobile)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
    }
  });
});