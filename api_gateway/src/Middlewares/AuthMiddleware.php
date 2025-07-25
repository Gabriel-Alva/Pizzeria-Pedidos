<?php
// sistema_pizzeria/api_gateway/src/Middlewares/AuthMiddleware.php

namespace App\Middlewares;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use GuzzleHttp\Client;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthMiddleware implements MiddlewareInterface
{
    private $httpClient;
    private $userServiceUrl;
    private $jwtSecret;
    private $rutasPublicas;
    private $rutasProtegidasPorServicio;

    public function __construct(Client $httpClient, string $userServiceUrl, string $jwtSecret)
    {
        $this->httpClient = $httpClient;
        $this->userServiceUrl = $userServiceUrl;
        $this->jwtSecret = $jwtSecret;

        // Cargar la configuración de rutas (necesario para determinar si una ruta es pública)
        $appConfig = require __DIR__ . '/../Configuracion/app.php';
        $this->rutasPublicas = $appConfig['rutas_publicas'];
        $this->rutasProtegidasPorServicio = $appConfig['microservicios'];
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        $path = $request->getUri()->getPath();

        // Verificar si la ruta actual es una ruta pública
        foreach ($this->rutasPublicas as $publicPath) {
            // Usar preg_match para comparar con patrones que puedan incluir {id}
            $pattern = '#^' . str_replace(['{id}', '/'], ['[^/]+', '\/'], $publicPath) . '$#';
            if (preg_match($pattern, $path)) {
                return $handler->handle($request); // La ruta es pública, continuar sin autenticación
            }
        }

        // Si no es una ruta pública, requiere autenticación
        $authHeader = $request->getHeaderLine('Authorization');

        if (empty($authHeader)) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token de autenticación no proporcionado.']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Formato de token inválido. Use "Bearer [token]".']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $token = $matches[1];

        try {
            // Validar el token localmente (opcional, pero mejora rendimiento y reduce carga al servicio de usuarios)
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));

            // Opcional: Validar el token contra el servicio de usuarios (más seguro pero añade latencia)
            // $responseFromUserSvc = $this->httpClient->post($this->userServiceUrl . '/validar-token', [
            //     'headers' => [
            //         'Authorization' => $authHeader
            //     ]
            // ]);

            // if ($responseFromUserSvc->getStatusCode() !== 200) {
            //     $response = new \Slim\Psr7\Response();
            //     $response->getBody()->write(json_encode(['error' => 'Token inválido o expirado.']));
            //     return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
            // }
            // $userData = json_decode($responseFromUserSvc->getBody()->__toString(), true)['data'];

            // Adjuntar los datos del usuario a la solicitud para que los controladores puedan acceder a ellos
            $request = $request->withAttribute('jwt_data', (array) $decoded->data);
            // $request = $request->withAttribute('user_data', $userData); // Si usas la validación externa

        } catch (\Exception $e) {
            $response = new \Slim\Psr7\Response();
            $response->getBody()->write(json_encode(['error' => 'Token inválido o expirado: ' . $e->getMessage()]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        return $handler->handle($request); // Autenticación exitosa, continuar
    }
}