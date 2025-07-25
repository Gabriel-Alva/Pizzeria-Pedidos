import { mostrarVistaPizzas } from '../Vistas/pizzas.js';

export function initPizzasController() {
    document.getElementById('btnPizzas').addEventListener('click', mostrarVistaPizzas);
} 