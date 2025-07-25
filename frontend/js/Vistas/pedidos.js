import { obtenerPedidos } from '../api.js';

export async function mostrarVistaPedidos() {
    const contenedor = document.getElementById('contenido');
    contenedor.innerHTML = '<h2>Pedidos</h2><div id="listaPedidos">Cargando...</div>';
    try {
        const pedidos = await obtenerPedidos();
        const lista = pedidos.map(pedido => `<div>Pedido #${pedido.id}: ${pedido.estado} - Total: $${pedido.total}</div>`).join('');
        document.getElementById('listaPedidos').innerHTML = lista || 'No hay pedidos disponibles.';
    } catch (e) {
        document.getElementById('listaPedidos').innerHTML = 'Error al cargar los pedidos.';
    }
} 