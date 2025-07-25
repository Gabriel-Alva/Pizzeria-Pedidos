<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Rutas/usuarios.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorAutenticacion;
use App\Controladores\ControladorUsuario;
use App\Modelos\ConexionBD;
use App\Modelos\Usuario;
use App\Servicios\ServicioAutenticacion;

// Cargar configuración global y específica del servicio
$dbConfig = require __DIR__ . '/../../../../configuracion/base_de_datos.php';
$appConfig = require __DIR__ . '/../Configuracion/app.php';

// Obtener conexión PDO
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Instanciar Modelos
$usuarioModel = new Usuario($pdo);

// Instanciar Servicios
$servicioAutenticacion = new ServicioAutenticacion($usuarioModel, $appConfig['jwt_secret'], $appConfig['jwt_expiration_seconds']);

// Instanciar Controladores
$controladorAutenticacion = new ControladorAutenticacion($servicioAutenticacion);
$controladorUsuario = new ControladorUsuario($usuarioModel);

// --- Rutas de Autenticación (Públicas) ---
$app->post('/registro', [$controladorAutenticacion, 'registrar']);
$app->post('/login', [$controladorAutenticacion, 'iniciarSesion']);
$app->post('/validar-token', [$controladorAutenticacion, 'validarToken']); // Para que el API Gateway pueda validar tokens

// --- Rutas de Usuarios (requerirán autenticación en el API Gateway) ---
$app->group('/usuarios', function (RouteCollectorProxy $group) use ($controladorUsuario) {
    // --- Favoritos ---
    $group->get('/favoritos', [$controladorUsuario, 'obtenerFavoritos']);
    $group->post('/favoritos/{pizza_id}', [$controladorUsuario, 'agregarFavorito']);
    $group->delete('/favoritos/{pizza_id}', [$controladorUsuario, 'quitarFavorito']);
    // --- Calificaciones ---
    $group->get('/interacciones', [$controladorUsuario, 'obtenerCalificaciones']);
    $group->post('/interacciones/{pizza_id}', [$controladorUsuario, 'calificarPizza']);
    // --- Mejor calificadas global ---
    $group->get('/pizzas/mejor-calificadas', [$controladorUsuario, 'obtenerPizzasMejorCalificadas']);
    // --- Rutas variables SIEMPRE al final ---
    $group->get('', [$controladorUsuario, 'obtenerUsuarios']);
    $group->post('', [$controladorUsuario, 'crearUsuario']);
    $group->get('/{id}', [$controladorUsuario, 'obtenerUsuarioPorId']);
    $group->put('/{id}', [$controladorUsuario, 'actualizarUsuario']);
    $group->delete('/{id}', [$controladorUsuario, 'eliminarUsuario']);
    $group->put('/{id}/cambiar-contrasena', [$controladorUsuario, 'cambiarContrasena']);
});

// --- Rutas globales para panel_cliente (alias de favoritos e interacciones, solo clientes) ---
$app->get('/favoritos', [$controladorUsuario, 'obtenerFavoritos']);
$app->post('/favoritos/{pizza_id}', [$controladorUsuario, 'agregarFavorito']);
$app->delete('/favoritos/{pizza_id}', [$controladorUsuario, 'quitarFavorito']);
$app->get('/interacciones', [$controladorUsuario, 'obtenerCalificaciones']);
$app->post('/interacciones/{pizza_id}', [$controladorUsuario, 'calificarPizza']);

// Las rutas de clientes ahora se manejan a través de usuarios
// ya que los datos del cliente están en la tabla usuarios