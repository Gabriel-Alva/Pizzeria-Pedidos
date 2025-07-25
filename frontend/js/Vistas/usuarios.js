import { 
  obtenerTodosLosUsuarios, 
  crearNuevoUsuario, 
  obtenerUsuario, 
  actualizarUsuarioExistente, 
  eliminarUsuarioExistente, 
  cambiarContrasenaDeUsuario,
  validarDatosUsuario 
} from '../Controladores/usuariosController.js';

let usuariosActuales = [];
let usuarioEditando = null;

export async function mostrarVistaUsuarios() {
    const contenedor = document.getElementById('contenido');
    contenedor.innerHTML = `
        <div class="usuarios-container space-y-4">
            <div class="usuarios-header flex items-center justify-between mb-2">
                <h2 class="text-xl font-bold text-green-900">Gestión de Usuarios</h2>
                <button class="flex items-center gap-2 bg-green-600 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition" onclick="mostrarFormularioCrear()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                    Nuevo Usuario
                </button>
            </div>
            <div class="usuarios-filtros flex flex-col md:flex-row gap-2 items-center mb-2">
                <input type="text" id="filtroUsuarios" placeholder="Buscar usuarios..." class="form-control px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full md:w-64" />
                <select id="filtroRol" class="form-control px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 w-full md:w-48">
                    <option value="">Todos los roles</option>
                    <option value="administrador">Administrador</option>
                    <option value="empleado">Empleado</option>
                    <option value="cliente">Cliente</option>
                </select>
            </div>
            <div id="tablaUsuarios" class="usuarios-tabla"></div>
        </div>
        <!-- Modal para crear/editar usuario -->
        <div id="modalUsuario" class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-green-200 animate-fadeIn">
                <div class="flex items-center justify-between mb-4">
                    <h3 id="modalTitulo" class="text-lg font-bold text-green-800">Nuevo Usuario</h3>
                    <button class="text-2xl text-gray-400 hover:text-red-500 transition" onclick="cerrarModalUsuario()">&times;</button>
                </div>
                <form id="formUsuario" class="flex flex-col gap-3">
                    <div>
                        <label for="nombre" class="font-semibold text-gray-700">Nombre *</label>
                        <input type="text" id="nombre" name="nombre" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                    </div>
                    <div>
                        <label for="apellido" class="font-semibold text-gray-700">Apellido *</label>
                        <input type="text" id="apellido" name="apellido" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                    </div>
                    <div>
                        <label for="correo" class="font-semibold text-gray-700">Correo Electrónico *</label>
                        <input type="email" id="correo" name="correo" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                    </div>
                    <div>
                        <label for="telefono" class="font-semibold text-gray-700">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono" class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                    </div>
                    <div>
                        <label for="rol" class="font-semibold text-gray-700">Rol *</label>
                        <select id="rol" name="rol" required class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50">
                            <option value="cliente">Cliente</option>
                            <option value="empleado">Empleado</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>
                    <div id="contrasenaGroup">
                        <label for="contrasena" class="font-semibold text-gray-700">Contraseña</label>
                        <input type="password" id="contrasena" name="contrasena" class="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                        <small class="form-text text-gray-500">Dejar vacío para generar contraseña automática</small>
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <button type="button" onclick="cerrarModalUsuario()" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit" class="px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-800 transition">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- Modal para cambiar contraseña -->
        <div id="modalContrasena" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 hidden">
            <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-200 animate-fadeIn">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-blue-800">Cambiar Contraseña</h3>
                    <button class="text-2xl text-gray-400 hover:text-red-500 transition" onclick="cerrarModalContrasena()">&times;</button>
                </div>
                <form id="formContrasena" class="flex flex-col gap-3">
                    <div>
                        <label for="nuevaContrasena" class="font-semibold text-gray-700">Nueva Contraseña *</label>
                        <input type="password" id="nuevaContrasena" name="nuevaContrasena" required class="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                        <small class="form-text text-gray-500">Mínimo 8 caracteres, incluir mayúscula, minúscula y número</small>
                    </div>
                    <div>
                        <label for="confirmarContrasena" class="font-semibold text-gray-700">Confirmar Contraseña *</label>
                        <input type="password" id="confirmarContrasena" name="confirmarContrasena" required class="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                    </div>
                    <div class="flex justify-end gap-2 mt-4">
                        <button type="button" onclick="cerrarModalContrasena()" class="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition">Cancelar</button>
                        <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-800 transition">Cambiar Contraseña</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Cargar usuarios iniciales
    await cargarUsuarios();
    
    // Configurar eventos
    configurarEventos();
}

async function cargarUsuarios() {
    try {
        usuariosActuales = await obtenerTodosLosUsuarios();
        renderizarTablaUsuarios(usuariosActuales);
    } catch (error) {
        mostrarError('Error al cargar usuarios: ' + error.message);
    }
}

function renderizarTablaUsuarios(usuarios) {
    const tabla = document.getElementById('tablaUsuarios');
    
    if (usuarios.length === 0) {
        tabla.innerHTML = '<div class="no-data">No hay usuarios registrados</div>';
        return;
    }
    // Tabla con Tailwind y SVGs para acciones
    const tablaHTML = `
        <div class="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-green-100">
                <tr>
                    <th class="px-3 py-2 font-bold text-left">ID</th>
                    <th class="px-3 py-2 font-bold text-left">Nombre</th>
                    <th class="px-3 py-2 font-bold text-left">Apellido</th>
                    <th class="px-3 py-2 font-bold text-left">Correo</th>
                    <th class="px-3 py-2 font-bold text-left">Teléfono</th>
                    <th class="px-3 py-2 font-bold text-left">Rol</th>
                    <th class="px-3 py-2 font-bold text-center">Acciones</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
                ${usuarios.map(usuario => `
                    <tr class="hover:bg-green-50 transition">
                        <td class="px-3 py-2">${usuario.id}</td>
                        <td class="px-3 py-2">${usuario.nombre}</td>
                        <td class="px-3 py-2">${usuario.apellido}</td>
                        <td class="px-3 py-2">${usuario.correo}</td>
                        <td class="px-3 py-2">${usuario.telefono || '-'}</td>
                        <td class="px-3 py-2">
                            <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${usuario.rol === 'administrador' ? 'bg-red-100 text-red-700' : usuario.rol === 'empleado' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}">
                                ${usuario.rol}
                            </span>
                        </td>
                        <td class="px-3 py-2 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <button class="hover:bg-green-100 p-1 rounded" onclick="editarUsuario(${usuario.id})" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" /></svg>
                                </button>
                                <button class="hover:bg-blue-100 p-1 rounded" onclick="cambiarContrasena(${usuario.id})" title="Cambiar contraseña">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm6 2v-2a6 6 0 10-12 0v2a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2z" /></svg>
                                </button>
                                <button class="hover:bg-red-100 p-1 rounded" onclick="confirmarEliminarUsuario(${usuario.id})" title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;
    
    tabla.innerHTML = tablaHTML;
}

function getBadgeClass(rol) {
    switch (rol) {
        case 'administrador': return 'danger';
        case 'empleado': return 'warning';
        case 'cliente': return 'info';
        default: return 'secondary';
    }
}

function configurarEventos() {
    // Filtro de búsqueda
    document.getElementById('filtroUsuarios').addEventListener('input', filtrarUsuarios);
    document.getElementById('filtroRol').addEventListener('change', filtrarUsuarios);
    
    // Formulario de usuario
    document.getElementById('formUsuario').addEventListener('submit', manejarSubmitUsuario);
    
    // Formulario de contraseña
    document.getElementById('formContrasena').addEventListener('submit', manejarSubmitContrasena);
}

function filtrarUsuarios() {
    const filtroTexto = document.getElementById('filtroUsuarios').value.toLowerCase();
    const filtroRol = document.getElementById('filtroRol').value;
    
    const usuariosFiltrados = usuariosActuales.filter(usuario => {
        const coincideTexto = !filtroTexto || 
            usuario.nombre.toLowerCase().includes(filtroTexto) ||
            usuario.apellido.toLowerCase().includes(filtroTexto) ||
            usuario.correo.toLowerCase().includes(filtroTexto);
        
        const coincideRol = !filtroRol || usuario.rol === filtroRol;
        
        return coincideTexto && coincideRol;
    });
    
    renderizarTablaUsuarios(usuariosFiltrados);
}

// Funciones globales para los botones
// Funciones para abrir/cerrar el modal de usuario
function abrirModalUsuario() {
  const modal = document.getElementById('modalUsuario');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Elimina cualquier clase block o similar
    modal.classList.remove('block');
  }
}
function cerrarModalUsuario() {
  const modal = document.getElementById('modalUsuario');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.classList.remove('block');
  }
}
window.abrirModalUsuario = abrirModalUsuario;
window.cerrarModalUsuario = cerrarModalUsuario;
// Botón de cerrar (X)
document.addEventListener('DOMContentLoaded', function() {
  const closeModalUsuarioBtn = document.getElementById('closeModalUsuarioBtn');
  if (closeModalUsuarioBtn) closeModalUsuarioBtn.onclick = cerrarModalUsuario;
  // Cerrar modal al hacer clic fuera
  const modalUsuario = document.getElementById('modalUsuario');
  if (modalUsuario) {
    modalUsuario.onclick = function(e) {
      if (e.target === modalUsuario) cerrarModalUsuario();
    };
  }
});
// Abrir modal desde mostrarFormularioCrear y editarUsuario
window.mostrarFormularioCrear = function() {
  usuarioEditando = null;
  document.getElementById('modalTitulo').textContent = 'Nuevo Usuario';
  document.getElementById('formUsuario').reset();
  document.getElementById('contrasenaGroup').style.display = 'block';
  abrirModalUsuario();
};
window.editarUsuario = async function(id) {
  try {
    usuarioEditando = await obtenerUsuario(id);
    document.getElementById('modalTitulo').textContent = 'Editar Usuario';
    document.getElementById('nombre').value = usuarioEditando.nombre;
    document.getElementById('apellido').value = usuarioEditando.apellido;
    document.getElementById('correo').value = usuarioEditando.correo;
    document.getElementById('telefono').value = usuarioEditando.telefono || '';
    document.getElementById('rol').value = usuarioEditando.rol;
    document.getElementById('contrasenaGroup').style.display = 'none';
    abrirModalUsuario();
  } catch (error) {
    mostrarError('Error al cargar usuario: ' + error.message);
  }
};

window.confirmarEliminarUsuario = function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
        eliminarUsuario(id);
    }
};

window.cambiarContrasena = function(id) {
    usuarioEditando = { id };
    document.getElementById('formContrasena').reset();
    document.getElementById('modalContrasena').classList.remove('hidden');
};

window.cerrarModalContrasena = function() {
    document.getElementById('modalContrasena').classList.add('hidden');
    usuarioEditando = null;
};

async function manejarSubmitUsuario(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const datosUsuario = {
        nombre: formData.get('nombre'),
        apellido: formData.get('apellido'),
        correo: formData.get('correo'),
        telefono: formData.get('telefono'),
        rol: formData.get('rol')
    };
    
    // Agregar contraseña solo si se está creando un usuario nuevo
    if (!usuarioEditando) {
        datosUsuario.contrasena = formData.get('contrasena');
    }
    
    // Validar datos
    const errores = validarDatosUsuario(datosUsuario);
    if (errores.length > 0) {
        mostrarError('Errores de validación:\n' + errores.join('\n'));
        return;
    }
    
    try {
        if (usuarioEditando) {
            // Actualizar usuario existente
            await actualizarUsuarioExistente(usuarioEditando.id, datosUsuario);
            mostrarExito('Usuario actualizado exitosamente');
        } else {
            // Crear nuevo usuario
            const resultado = await crearNuevoUsuario(datosUsuario);
            mostrarExito(`Usuario creado exitosamente. Contraseña temporal: ${resultado.contrasenaTemporal}`);
        }
        
        cerrarModalUsuario();
        await cargarUsuarios();
    } catch (error) {
        mostrarError('Error: ' + error.message);
    }
}

async function manejarSubmitContrasena(event) {
    event.preventDefault();
    
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;
    
    if (nuevaContrasena !== confirmarContrasena) {
        mostrarError('Las contraseñas no coinciden');
        return;
    }
    
    if (nuevaContrasena.length < 8) {
        mostrarError('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    try {
        await cambiarContrasenaDeUsuario(usuarioEditando.id, nuevaContrasena);
        mostrarExito('Contraseña cambiada exitosamente');
        cerrarModalContrasena();
    } catch (error) {
        mostrarError('Error al cambiar contraseña: ' + error.message);
    }
}

async function eliminarUsuario(id) {
    try {
        await eliminarUsuarioExistente(id);
        mostrarExito('Usuario eliminado exitosamente');
        await cargarUsuarios();
    } catch (error) {
        mostrarError('Error al eliminar usuario: ' + error.message);
    }
}

function mostrarExito(mensaje) {
    alert('Éxito: ' + mensaje);
}

function mostrarError(mensaje) {
    alert('Error: ' + mensaje);
} 