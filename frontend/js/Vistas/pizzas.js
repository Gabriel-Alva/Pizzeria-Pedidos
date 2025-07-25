import { obtenerPizzas } from '../api.js';

let pizzasCache = [];

export async function mostrarVistaPizzas(gridId = 'listaPizzas', pizzasArr = null) {
    let gridHtml = '<div class="productos-grid" id="' + gridId + '">Cargando...</div>';
    let contenedor;
    if (gridId === 'listaPizzas') {
        contenedor = document.getElementById('contenido');
        // Eliminar encabezado repetido y solo dejar las tarjetas
        contenedor.innerHTML = '';
    } else {
        contenedor = document.getElementById(gridId);
        if (contenedor) contenedor.innerHTML = '';
    }
    try {
        // Mostrar todas las pizzas, pero solo deshabilitar el botón si no está disponible
        const pizzas = pizzasArr || await obtenerPizzas();
        pizzasCache = pizzas; // Guardar para el modal
        const lista = pizzas.map((pizza, idx) => `
            <div class="pizza-card-modern bg-white rounded-lg shadow-md p-4 flex flex-col items-center border border-green-200 hover:shadow-lg transition mb-4" data-idx="${idx}">
                ${pizza.url_imagen ? `<img src="${pizza.url_imagen}" alt="${pizza.nombre}" class="pizza-img w-32 h-32 object-cover rounded-full border-4 border-green-400 mb-3">` : ''}
                <div class="pizza-etiqueta-disponible ${pizza.disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded-full text-xs font-semibold mb-2">
                  ${pizza.disponible ? 'Disponible' : 'No disponible'}
                </div>
                <div class="pizza-info w-full text-center">
                  <div class="pizza-nombre text-lg font-bold text-green-700 cursor-pointer hover:underline mb-1">${pizza.nombre}</div>
                  <div class="pizza-ingredientes text-gray-600 text-sm mb-2">
                    ${pizza.ingredientes ? pizza.ingredientes.split(',').map(ing => `<span>${ing.trim()}</span>`).join(', ') : ''}
                  </div>
                  <div class="pizza-precio text-green-600 font-semibold mb-2"><b>Precio:</b> $${pizza.precio}</div>
                  <button class="btn agregar bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded transition" data-idx="${idx}" ${!pizza.disponible ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>Agregar al pedido</button>
                </div>
            </div>
        `).join('');
        const grid = document.getElementById(gridId);
        if (grid) grid.innerHTML = lista || 'No hay pizzas disponibles.';

        // Eventos para abrir modal desde imagen, nombre y botón Agregar
        if (grid) {
          const cards = Array.from(grid.querySelectorAll('.pizza-card-modern'));
          cards.forEach((card, idx) => {
            const pizza = pizzas[idx];
            // Imagen y nombre
            card.querySelector('.pizza-img')?.addEventListener('click', () => mostrarModalPizza(pizza));
            card.querySelector('.pizza-nombre')?.addEventListener('click', () => mostrarModalPizza(pizza));
            // Botón agregar
            card.querySelector('.btn.agregar')?.addEventListener('click', () => mostrarModalPizza(pizza));
          });
        }

    } catch (e) {
        const grid = document.getElementById(gridId);
        if (grid) grid.innerHTML = 'Error al cargar las pizzas.';
    }
}

// Modal
export function mostrarModalPizza(pizza) {
    if (!pizza.disponible) {
        alert('Esta pizza no está disponible actualmente.');
        return;
    }
    document.getElementById('modalPizzaImg').src = pizza.url_imagen || '';
    document.getElementById('modalPizzaNombre').textContent = pizza.nombre;
    // Ingredientes como lista
    const ul = document.getElementById('modalPizzaIngredientes');
    ul.innerHTML = '';
    if (pizza.ingredientes) {
        pizza.ingredientes.split(',').forEach(ing => {
            const li = document.createElement('li');
            li.textContent = ing.trim();
            ul.appendChild(li);
        });
    }
    // Selector de tamaño y cantidad
    const selectTamano = document.getElementById('modalPizzaTamano');
    const inputCantidad = document.getElementById('modalPizzaCantidad');
    selectTamano.value = 'pequena';
    inputCantidad.value = 1;
    // Precio dinámico
    function calcularPrecio() {
        let base = parseFloat(pizza.precio);
        let tamano = selectTamano.value;
        let cantidad = parseInt(inputCantidad.value) || 1;
        let precio = base;
        if (tamano === 'mediana') precio += 5;
        if (tamano === 'grande') precio += 10;
        return (precio * cantidad).toFixed(2);
    }
    function actualizarPrecio() {
        let base = parseFloat(pizza.precio);
        let tamano = selectTamano.value;
        let cantidad = parseInt(inputCantidad.value) || 1;
        let precio = base;
        if (tamano === 'mediana') precio += 5;
        if (tamano === 'grande') precio += 10;
        document.getElementById('modalPizzaPrecio').innerHTML = `<b>Precio:</b> $${(precio * cantidad).toFixed(2)}`;
    }
    // Validación de cantidad máxima
    const cantidadError = document.getElementById('modalCantidadError');
    inputCantidad.oninput = function() {
        let cantidad = parseInt(inputCantidad.value) || 1;
        if (cantidad > 10) {
            cantidadError.textContent = 'La cantidad máxima es 10.';
            cantidadError.style.display = 'inline';
            inputCantidad.value = 10;
            actualizarPrecio();
        } else {
            cantidadError.textContent = '';
            cantidadError.style.display = 'none';
            actualizarPrecio();
        }
    };
    selectTamano.onchange = actualizarPrecio;
    actualizarPrecio();
    // Mostrar modal correctamente
    const modal = document.getElementById('pizzaModal');
    modal.classList.add('activo', 'flex');
    modal.classList.remove('hidden');

    // Botón añadir al carrito
    const agregarBtn = document.getElementById('modalAgregarBtn');
    const nuevoBtn = agregarBtn.cloneNode(true);
    agregarBtn.parentNode.replaceChild(nuevoBtn, agregarBtn);
    nuevoBtn.onclick = () => {
        let tamano = selectTamano.value;
        let cantidad = parseInt(inputCantidad.value) || 1;
        let base = parseFloat(pizza.precio);
        let precio = base;
        if (tamano === 'mediana') precio += 5;
        if (tamano === 'grande') precio += 10;
        let item = {
            ...pizza,
            tamano,
            cantidad,
            precio_unitario: precio,
            precio_total: (precio * cantidad)
        };
        // Usar la función global para que el contador se actualice correctamente
        window.agregarAlCarritoIndex(item);
        cerrarModalPizza();
    };
    // Botón ordenar ahora
    const ordenarBtn = document.getElementById('modalOrdenarBtn');
    const nuevoOrdenarBtn = ordenarBtn.cloneNode(true);
    ordenarBtn.parentNode.replaceChild(nuevoOrdenarBtn, ordenarBtn);
    nuevoOrdenarBtn.onclick = () => {
        let tamano = selectTamano.value;
        let cantidad = parseInt(inputCantidad.value) || 1;
        let base = parseFloat(pizza.precio);
        let precio = base;
        if (tamano === 'mediana') precio += 5;
        if (tamano === 'grande') precio += 10;
        let item = {
            ...pizza,
            tamano,
            cantidad,
            precio_unitario: precio,
            precio_total: (precio * cantidad)
        };
        // Guardar solo este item en el carrito temporal y redirigir a checkout
        localStorage.setItem('carrito', JSON.stringify([item]));
        window.location.href = 'checkout.html';
    };
}
function cerrarModalPizza() {
    const modal = document.getElementById('pizzaModal');
    modal.classList.remove('activo', 'flex');
    modal.classList.add('hidden');
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('closeModalBtn').onclick = cerrarModalPizza;
    window.onclick = (e) => {
        if (e.target === document.getElementById('pizzaModal')) cerrarModalPizza();
    };
});

// Carrito simple
function agregarAlCarrito(pizza) {
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
function actualizarCarritoUI() {
    // Puedes mostrar el número de ítems en el carrito en la barra superior
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let icon = document.querySelector('.icon-cart');
    if (icon) {
        icon.textContent = `Carrito (${carrito.length})`;
    }
}
actualizarCarritoUI();

// Mostrar modal de carrito al hacer click en el icono del carrito
const iconCart = document.querySelector('.icon-cart');
if (iconCart) {
    iconCart.addEventListener('click', mostrarCarritoModal);
}
const carritoModal = document.getElementById('carritoModal');
const cerrarCarritoBtn = document.getElementById('cerrarCarritoBtn');
if (cerrarCarritoBtn) {
    cerrarCarritoBtn.onclick = () => {
        const modal = document.getElementById('carritoModal');
        modal.classList.remove('activo', 'flex');
        modal.classList.add('hidden');
    };
}
function mostrarCarritoModal() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const cont = document.getElementById('carritoContenido');
    if (!carrito.length) {
        cont.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        let total = 0;
        cont.innerHTML = `<table class="carrito-table">
            <thead><tr><th>Pizza</th><th>Tamaño</th><th>Cant.</th><th>Precio u.</th><th>Subtotal</th><th></th></tr></thead>
            <tbody>
            ${carrito.map((item, i) => {
                total += item.precio_unitario * item.cantidad;
                return `<tr>
                    <td>${item.nombre}</td>
                    <td>${item.tamano || '-'}</td>
                    <td>${item.cantidad}</td>
                    <td>$${item.precio_unitario.toFixed(2)}</td>
                    <td>$${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                    <td><button class='btn-quitar' onclick='window.eliminarDelCarrito(${i})'>Quitar</button></td>
                </tr>`;
            }).join('')}
            </tbody>
        </table>
        <div style="text-align:right; margin-top:1.5rem; font-size:1.2rem;"><b>Total: $${total.toFixed(2)}</b></div>
        <button id="btnContinuarPedido" class="btn registro" style="margin-top:1.5rem; width:100%; background:#28a745; color:white; font-size:1.1em; padding:10px; border:none; border-radius:5px; cursor:pointer;">Continuar pedido</button>`;
        // Agregar evento al botón
        setTimeout(() => {
          const btn = document.getElementById('btnContinuarPedido');
          if (btn) btn.onclick = () => { window.location.href = 'checkout.html'; };
        }, 0);
    }
    const modal = document.getElementById('carritoModal');
    modal.classList.add('activo', 'flex');
    modal.classList.remove('hidden');
}
// Permitir eliminar productos del carrito desde el modal
document.addEventListener('DOMContentLoaded', () => {
    window.eliminarDelCarrito = function(idx) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.splice(idx, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarCarritoModal();
        actualizarCarritoUI();
    };
});