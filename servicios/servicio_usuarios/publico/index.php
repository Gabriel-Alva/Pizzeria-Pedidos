<?php
// sistema_pizzeria/servicios/servicio_usuarios/publico/index.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;

require __DIR__ . '/../vendor/autoload.php';

// Cargar variables de entorno (especialmente la clave JWT_SECRET)
$dotenv = Dotenv\Dotenv::createUnsafeImmutable(__DIR__ . '/../');
$dotenv->load();

$app = AppFactory::create();

// Middleware para parsear JSON
$app->addBodyParsingMiddleware();

// Middleware CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

// Permitir preflight CORS para cualquier ruta
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Manejo de errores
$app->addErrorMiddleware(true, true, true); // (displayErrorDetails, logErrors, logErrorDetails)

// Middleware JWT solo para rutas protegidas
$jwtMiddleware = function ($request, $handler) {
    $authHeader = $request->getHeaderLine('Authorization');
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
        $appConfig = require __DIR__ . '/../src/Configuracion/app.php';
        $jwtSecret = $appConfig['jwt_secret'];
        try {
            $decoded = \Firebase\JWT\JWT::decode($jwt, new \Firebase\JWT\Key($jwtSecret, 'HS256'));
            $jwtData = (array)($decoded->data ?? []);
            $request = $request->withAttribute('jwt_data', $jwtData);
            return $handler->handle($request);
        } catch (\Exception $e) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token inválido o expirado.']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
    }
    $response = new \Slim\Psr7\Response();
    $response->getBody()->write(json_encode(['error' => 'Token no proporcionado.']));
    return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
};

// Rutas del servicio de usuarios
require __DIR__ . '/../src/Rutas/usuarios.php';

// Aplicar el middleware solo a rutas protegidas
$app->group('/usuarios', function () {})->add($jwtMiddleware);
$app->group('', function () {})->add($jwtMiddleware); // Para /favoritos y /interacciones

$app->run();