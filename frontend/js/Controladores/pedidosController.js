import { mostrarVistaPedidos } from '../Vistas/pedidos.js';

export function initPedidosController() {
    document.getElementById('btnPedidos').addEventListener('click', mostrarVistaPedidos);
} 