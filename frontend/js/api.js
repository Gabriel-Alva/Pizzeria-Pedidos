// api.js - Configuración de la API
const API_GATEWAY_URL = 'http://localhost:8000';

export async function obtenerPizzas() {
    const respuesta = await fetch(`${API_GATEWAY_URL}/productos/pizzas`);
    return respuesta.json();
}

export async function obtenerPedidos() {
    const respuesta = await fetch(`${API_GATEWAY_URL}/pedidos`);
    return respuesta.json();
}

export async function obtenerUsuarios() {
    return await apiRequest('/usuarios/usuarios');
}

// Funciones para gestión de usuarios
export async function crearUsuario(datosUsuario) {
    const respuesta = await apiRequest('/usuarios/usuarios', {
        method: 'POST',
        body: JSON.stringify(datosUsuario)
    });
    return respuesta;
}

export async function obtenerUsuarioPorId(id) {
  const respuesta = await apiRequest(`/usuarios/usuarios/${id}`);
  return respuesta;
}

export async function actualizarUsuario(id, datosUsuario) {
  const respuesta = await apiRequest(`/usuarios/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datosUsuario)
  });
  return respuesta;
}

export async function eliminarUsuario(id) {
  const respuesta = await apiRequest(`/usuarios/usuarios/${id}`, {
      method: 'DELETE'
  });
  return respuesta;
}

export async function cambiarContrasenaUsuario(id, nuevaContrasena) {
  const respuesta = await apiRequest(`/usuarios/usuarios/${id}/cambiar-contrasena`, {
      method: 'PUT',
      body: JSON.stringify({ nueva_contrasena: nuevaContrasena })
  });
  return respuesta;
}

// Funciones de autenticación
export async function apiLoginUsuario(email, password) {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, contrasena: password })
    });
    return await response.json();
  } catch (e) {
    return { success: false, message: 'Error de red.' };
  }
}

export async function apiRegistrarUsuario(nombre, apellido, email, password, telefono, direccion) {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        nombre_usuario: nombre, 
        apellido: apellido,
        email, 
        contrasena: password,
        telefono: telefono,
        direccion: direccion
      })
    });
    return await response.json();
  } catch (e) {
    return { success: false, message: 'Error de red.' };
  }
}

// Función para obtener el token de autenticación
export function getAuthToken() {
    return localStorage.getItem('jwt');
}

// Función para hacer peticiones autenticadas
export async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_GATEWAY_URL}${url}`, {
        ...options,
        headers
    });
    
    return response.json();
}

// === Favoritos ===
export async function obtenerFavoritosUsuario() {
  return await apiRequest('/usuarios/favoritos');
}
export async function agregarFavoritoUsuario(pizzaId) {
  return await apiRequest(`/usuarios/favoritos/${pizzaId}`, { method: 'POST' });
}
export async function quitarFavoritoUsuario(pizzaId) {
  return await apiRequest(`/usuarios/favoritos/${pizzaId}`, { method: 'DELETE' });
}

// === Calificaciones ===
export async function obtenerCalificacionesUsuario() {
  return await apiRequest('/usuarios/interacciones');
}
export async function calificarPizzaUsuario(pizzaId, calificacion) {
  return await apiRequest(`/usuarios/interacciones/${pizzaId}`, {
    method: 'POST',
    body: JSON.stringify({ calificacion })
  });
}

// === Pedidos del usuario autenticado ===
export async function obtenerPedidosUsuario() {
  const token = getAuthToken();
  if (!token) throw new Error('No autenticado');
  // Decodificar el JWT para extraer el usuario_id
  const payload = JSON.parse(atob(token.split('.')[1]));
  // Ajuste: el id está en payload.data.id
  const usuario_id = payload.data?.id;
  if (!usuario_id) throw new Error('ID de usuario no encontrado en el token');
  return await apiRequest(`/pedidos/pedidos?usuario_id=${usuario_id}`);
}

// Agrega aquí más funciones según los endpoints de tu gateway 

export async function crearPedido(payloadPedido) {
  return await apiRequest('/pedidos/pedidos', {
    method: 'POST',
    body: JSON.stringify(payloadPedido)
  });
} 