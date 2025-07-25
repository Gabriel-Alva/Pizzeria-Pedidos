<?php
// sistema_pizzeria/servicios/servicio_productos/publico/index.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno (para la conexión a la BD, si no es localhost)
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

// Middleware CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});


// Middleware para parsear JSON (si envías datos como JSON)
$app->addBodyParsingMiddleware();

// Manejo de errores
$app->addErrorMiddleware(true, true, true); // (displayErrorDetails, logErrors, logErrorDetails)

// Cargar configuración de la base de datos
$dbConfig = require __DIR__ . '/../../../configuracion/base_de_datos.php';

// Configuración de la base de datos (Usaremos PDO para simplicidad)
$container = $app->getContainer(); // Asegúrate de que el contenedor esté disponible si usas inyección de dependencias
if ($container === null) {
    // Si no hay un contenedor Psr-11, puedes crear uno simple o pasar la configuración directamente.
    // Para Slim 4, AppFactory::create() ya suele crear un contenedor básico o puedes configurarlo.
    // Aquí un enfoque directo sin contenedor de inyección de dependencias por ahora.
}

// Rutas del servicio de productos
require __DIR__ . '/../src/Rutas/productos.php';
// Permitir preflight CORS para cualquier ruta

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});
$app->run();