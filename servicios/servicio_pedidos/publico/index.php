<?php
// sistema_pizzeria/servicios/servicio_pedidos/publico/index.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(true, true, true);

// Cargar configuración de la base de datos
$dbConfig = require __DIR__ . '/../../../configuracion/base_de_datos.php';

// Rutas del servicio de pedidos
require __DIR__ . '/../src/Rutas/pedidos.php';

$app->run();