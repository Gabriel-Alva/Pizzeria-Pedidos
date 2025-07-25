<?php
namespace App\Middlewares;

use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Psr\Http\Message\ResponseInterface as Response;

class MiddlewareCORS implements MiddlewareInterface
{
    public function process(Request $request, Handler $handler): Response
    {
        // Responder inmediatamente a las preflight requests (OPTIONS)
        if ($request->getMethod() === 'OPTIONS') {
            $response = new \Slim\Psr7\Response();
            return $this->agregarHeadersCORS($response);
        }

        // Manejar la petición normalmente
        $response = $handler->handle($request);

        // Asegurarse de que los headers CORS estén presentes SIEMPRE
        return $this->agregarHeadersCORS($response);
    }

    private function agregarHeadersCORS(Response $response): Response
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    }
}