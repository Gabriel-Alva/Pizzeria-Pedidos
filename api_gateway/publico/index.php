<?php
// sistema_pizzeria/api_gateway/publico/index.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use GuzzleHttp\Client;
use App\Middlewares\AuthMiddleware;
use App\Middlewares\MiddlewareCORS;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno (para JWT_SECRET y URLs de microservicios)
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

// Middleware para parsear JSON
$app->addBodyParsingMiddleware();

// Manejo de errores
$app->addErrorMiddleware(true, true, true); // (displayErrorDetails, logErrors, logErrorDetails)

// Configuración de los microservicios
$appConfig = require __DIR__ . '/../src/Configuracion/app.php';

// Instanciar Guzzle HTTP Client
$httpClient = new Client();

// Añadir el middleware de autenticación globalmente
// Se excluyen las rutas públicas como /registro y /login
$app->add(new AuthMiddleware($httpClient, $appConfig['microservicios']['usuarios']['url'], $appConfig['jwt_secret']));

// === EL MIDDLEWARE DE CORS DEBE SER EL ÚLTIMO ===
$app->add(\App\Middlewares\MiddlewareCORS::class);

// Rutas del API Gateway
require __DIR__ . '/../src/Rutas/gateway.php';

$app->run();