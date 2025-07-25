<?php
// sistema_pizzeria/servicios/servicio_notificaciones/publico/index.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

// Middleware para parsear JSON
$app->addBodyParsingMiddleware();

// Manejo de errores
$app->addErrorMiddleware(true, true, true); // (displayErrorDetails, logErrors, logErrorDetails)

// Cargar configuración de la base de datos
$dbConfig = require __DIR__ . '/../../../configuracion/base_de_datos.php';

// Rutas del servicio de notificaciones
require __DIR__ . '/../src/Rutas/notificaciones.php';

$app->run();