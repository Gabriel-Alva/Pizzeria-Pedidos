// Mostrar resumen del carrito
function renderResumen() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log('Carrito actual:', carrito); // Debug
    const tabla = document.getElementById('checkoutResumenTabla');
    const totalDiv = document.getElementById('checkoutTotal');
    if (!carrito.length) {
      tabla.innerHTML = '<p>Tu carrito está vacío.</p>';
      totalDiv.textContent = '';
      return;
    }
    let total = 0;
    tabla.innerHTML = `<table><thead><tr><th>Pizza</th><th>Tamaño</th><th>Cant.</th><th>Precio u.</th><th>Subtotal</th></tr></thead><tbody>
      ${carrito.map(item => {
        total += item.precio_unitario * item.cantidad;
        return `<tr>
          <td>${item.nombre}</td>
          <td>${item.tamano === 'pequena' || item.tamano === 'pequeña' ? 'Pequeña' : item.tamano === 'mediana' ? 'Mediana' : item.tamano === 'grande' ? 'Grande' : '-'}</td>
          <td>${item.cantidad}</td>
          <td>$${item.precio_unitario.toFixed(2)}</td>
          <td>$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
        </tr>`;
      }).join('')}
    </tbody></table>`;
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
  }
  renderResumen();
  // Mostrar mensaje si elige tarjeta
  document.getElementById('metodo_pago').addEventListener('change', function() {
    document.getElementById('mensajeTarjeta').style.display = this.value === 'tarjeta' ? 'block' : 'none';
  });

  function renderInstruccionesItems() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('checkoutInstruccionesItems');
    if (!carrito.length) { cont.innerHTML = ''; return; }
    cont.innerHTML = `
      <div class="instrucciones-especiales-area">
        <h4 class="instrucciones-especiales-label" style="margin-top:1.2rem;">Instrucciones especiales por pizza</h4>
        ${carrito.map((item, idx) => `
          <div style="margin-bottom:0.7rem;">
            <label for="instruccion_item_${idx}" class="nombre-pizza instrucciones-especiales-label">
              ${item.nombre} (${item.tamano === 'pequena' || item.tamano === 'pequeña' ? 'Pequeña' : item.tamano === 'mediana' ? 'Mediana' : item.tamano === 'grande' ? 'Grande' : '-'})
            </label>
            <textarea
              id="instruccion_item_${idx}"
              class="instrucciones-especiales-textarea"
              name="instrucciones"
              placeholder="Ej: sin cebolla, extra queso..."
              rows="3"
            >${item.instrucciones_especiales || ''}</textarea>
          </div>
        `).join('')}
      </div>
    `;
  }
renderInstruccionesItems();

// Actualizar instrucciones en localStorage al escribir
window.addEventListener('input', function(e) {
  if (e.target && e.target.id && e.target.id.startsWith('instruccion_item_')) {
    const idx = parseInt(e.target.id.replace('instruccion_item_', ''));
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito[idx]) {
      carrito[idx].instrucciones_especiales = e.target.value;
      localStorage.setItem('carrito', JSON.stringify(carrito));
    }
  }
});

  // Enviar pedido real al backend
  async function enviarPedido() {
    const form = document.getElementById('checkoutForm');
    if (!form.reportValidity()) return;
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (!carrito.length) return alert('El carrito está vacío.');
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const notas = document.getElementById('notas').value;
    const metodo_pago = document.getElementById('metodo_pago').value;
    // Construir payload pedido
    let total = 0;
    const items = carrito.map((item, idx) => {
      total += item.precio_unitario * item.cantidad;
      return {
        pizza_id: item.id, // Usar pizza_id
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        tamano: item.tamano === 'pequena' ? 'pequeña' : item.tamano || null,
        instrucciones_especiales: item.instrucciones_especiales || null
      };
    });
    let payloadPedido = {
      items,
      direccion_entrega: direccion,
      estado: 'pendiente',
      datos_cliente: { nombre, email, telefono },
      metodo_pago,
      monto_total: Number(total),
      notas: notas.trim() || null
    };
    // Solo agrega usuario_id si existe y es numérico
    if (window.usuario_id && !isNaN(window.usuario_id)) payloadPedido.usuario_id = Number(window.usuario_id);
    // Elimina usuario_id si es null o undefined
    if (!payloadPedido.usuario_id) delete payloadPedido.usuario_id;
    try {
      // 1. Crear pedido
      const resPedido = await fetch('https://servicio-pedidos.onrender.com/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadPedido)
      });
      if (resPedido.status === 201) {
        const pedido = await resPedido.json();
        // 2. Registrar pago pendiente
        const payloadPago = {
          pedido_id: pedido.id || pedido.pedido_id || pedido.pedidoId,
          monto: total,
          metodo_pago,
          estado_pago: 'pendiente'
        };
      
        document.getElementById('checkoutMsg').style.display = 'block';
        // Cerrar el modal del carrito si está abierto
        if (window.cerrarCarritoModal) window.cerrarCarritoModal();
        setTimeout(() => {
          localStorage.removeItem('carrito');
          window.location.href = 'interfaz/index.html';
        }, 2000);
      } else {
        const data = await resPedido.json();
        alert('Error al registrar el pedido: ' + (data.mensaje || 'Intenta nuevamente.'));
      }
    } catch (e) {
      alert('Error de red al registrar el pedido.');
    }
  } 