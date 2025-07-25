<?php
// sistema_pizzeria/servicios/servicio_notificaciones/src/Rutas/notificaciones.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorNotificacion;
use App\Modelos\ConexionBD;
use App\Modelos\Notificacion;

// Configuración de la base de datos desde el archivo global
$dbConfig = require __DIR__ . '/../../../../configuracion/base_de_datos.php';
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Crear instancia del modelo
$notificacionModel = new Notificacion($pdo);

// Crear instancia del controlador, inyectando el modelo
$controladorNotificacion = new ControladorNotificacion($notificacionModel);

// Grupo de rutas para notificaciones
$app->group('/notificaciones', function (RouteCollectorProxy $group) use ($controladorNotificacion) {
    // Obtener todas las notificaciones o por usuario (con query param `usuario_id`)
    // y opcionalmente solo no leídas (con query param `no_leidas=true`)
    $group->get('', [$controladorNotificacion, 'obtenerNotificaciones']);
    $group->post('', [$controladorNotificacion, 'crearNotificacion']); // Para que otros servicios generen notificaciones
    $group->patch('/{id}/leida', [$controladorNotificacion, 'marcarComoLeida']);
    $group->delete('/{id}', [$controladorNotificacion, 'eliminarNotificacion']);
});