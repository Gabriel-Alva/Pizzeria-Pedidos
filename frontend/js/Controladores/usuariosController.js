// Exporto funciones para login y registro para ser usadas en login.html y registro.html

// Controlador de autenticación para login y registro

export async function loginUsuario({ email, password }) {
  const res = await fetch('http://localhost:8000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contrasena: password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error en login');
  // Guardar token y usuario en localStorage
  localStorage.setItem('jwt', data.jwt);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  // Redirigir según el rol
  if (data.usuario.rol === 'administrador') {
    window.location.href = '../interfaz/panel_admin.html';
  } else if (data.usuario.rol === 'empleado') {
    window.location.href = '../interfaz/panel_empleado.html';
  } else {
    window.location.href = '../interfaz/panel_cliente.html'; // Clientes van al panel principal
  }
}

export async function registrarUsuario({ nombre, apellido, email, password, telefono, direccion }) {
  const res = await fetch('http://localhost:8000/registro', {
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensaje || 'Error en registro');
  return data;
}

// Función para cerrar sesión
export function logoutUsuario() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('usuario');
  window.location.href = '../interfaz/login.html';
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated() {
  return localStorage.getItem('jwt') !== null;
}

// Función para obtener datos del usuario actual
export function getCurrentUser() {
  const userStr = localStorage.getItem('usuario');
  return userStr ? JSON.parse(userStr) : null;
} 

// ===== FUNCIONES PARA GESTIÓN DE USUARIOS EN PANEL ADMIN =====

import { 
  obtenerUsuarios, 
  crearUsuario, 
  obtenerUsuarioPorId, 
  actualizarUsuario, 
  eliminarUsuario, 
  cambiarContrasenaUsuario 
} from '../api.js';

// Obtener todos los usuarios
export async function obtenerTodosLosUsuarios() {
  try {
    const usuarios = await obtenerUsuarios();
    return usuarios;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw new Error('Error al cargar los usuarios');
  }
}

// Crear nuevo usuario
export async function crearNuevoUsuario(datosUsuario) {
  try {
    const resultado = await crearUsuario(datosUsuario);
    if (resultado.mensaje) {
      return { success: true, mensaje: resultado.mensaje, contrasenaTemporal: resultado.contrasena_temporal };
    } else {
      throw new Error(resultado.mensaje || 'Error al crear usuario');
    }
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

// Obtener usuario por ID
export async function obtenerUsuario(id) {
  try {
    const usuario = await obtenerUsuarioPorId(id);
    return usuario;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw new Error('Error al cargar el usuario');
  }
}

// Actualizar usuario
export async function actualizarUsuarioExistente(id, datosUsuario) {
  try {
    const resultado = await actualizarUsuario(id, datosUsuario);
    if (resultado.mensaje) {
      return { success: true, mensaje: resultado.mensaje };
    } else {
      throw new Error(resultado.mensaje || 'Error al actualizar usuario');
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

// Eliminar usuario
export async function eliminarUsuarioExistente(id) {
  try {
    const resultado = await eliminarUsuario(id);
    if (resultado.mensaje) {
      return { success: true, mensaje: resultado.mensaje };
    } else {
      throw new Error(resultado.mensaje || 'Error al eliminar usuario');
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}

// Cambiar contraseña de usuario
export async function cambiarContrasenaDeUsuario(id, nuevaContrasena) {
  try {
    const resultado = await cambiarContrasenaUsuario(id, nuevaContrasena);
    if (resultado.mensaje) {
      return { success: true, mensaje: resultado.mensaje };
    } else {
      throw new Error(resultado.mensaje || 'Error al cambiar contraseña');
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
}

// Validar datos de usuario
export function validarDatosUsuario(datos) {
  const errores = [];
  
  if (!datos.nombre || datos.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!datos.apellido || datos.apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }
  
  if (!datos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
    errores.push('El correo electrónico no es válido');
  }
  
  if (datos.contrasena && datos.contrasena.length < 8) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (datos.telefono && !/^[\d\s\-\+\(\)]+$/.test(datos.telefono)) {
    errores.push('El formato del teléfono no es válido');
  }
  
  return errores;
} 