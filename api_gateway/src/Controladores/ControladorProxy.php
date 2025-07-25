<?php
// sistema_pizzeria/api_gateway/src/Controladores/ControladorProxy.php

namespace App\Controladores;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ControladorProxy
{
    private $httpClient;
    private $microserviceConfig;

    public function __construct(Client $httpClient, array $microserviceConfig)
    {
        $this->httpClient = $httpClient;
        $this->microserviceConfig = $microserviceConfig;
    }

    public function proxy(Request $request, Response $response, array $args): Response
    {
        $serviceName = $args['service'] ?? ''; // Nombre del microservicio (ej. 'productos', 'usuarios')
        $servicePath = $args['path'] ?? '';    // El resto de la URL (ej. 'pizzas/1', 'registro')

        if (empty($serviceName) || !isset($this->microserviceConfig[$serviceName])) {
            $response->getBody()->write(json_encode(['error' => 'Servicio no encontrado.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $serviceUrl = $this->microserviceConfig[$serviceName]['url'];
        $fullUrl = $serviceUrl;
        if (!empty($servicePath)) {
            $fullUrl .= '/' . $servicePath;
        }

        $method = $request->getMethod();
        $headers = $request->getHeaders();
        $body = $request->getBody()->getContents(); // Lee el cuerpo de la solicitud

        // Eliminar headers que pueden causar problemas o no son necesarios para el microservicio
        unset($headers['Host'], $headers['User-Agent'], $headers['Content-Length']);

        $options = [
            'headers' => $headers,
            'body' => $body,
            'http_errors' => false, // No lanzar excepciones para 4xx o 5xx
            'query' => $request->getQueryParams() // Pasar parámetros de consulta
        ];

        try {
            $proxyResponse = $this->httpClient->request($method, $fullUrl, $options);

            $responseBody = $proxyResponse->getBody()->getContents();
            $responseStatus = $proxyResponse->getStatusCode();
            $responseHeaders = $proxyResponse->getHeaders();

            // Copiar los headers de la respuesta del microservicio
            foreach ($responseHeaders as $name => $values) {
                foreach ($values as $value) {
                    $response = $response->withAddedHeader($name, $value);
                }
            }

            $response->getBody()->write($responseBody);
            return $response->withStatus($responseStatus);

        } catch (RequestException $e) {
            // Manejar errores de red o comunicación con el microservicio
            $errorResponse = $e->getResponse();
            $statusCode = $errorResponse ? $errorResponse->getStatusCode() : 500;
            $errorMessage = $errorResponse ? json_decode($errorResponse->getBody()->getContents(), true) : ['error' => 'Error de comunicación con el servicio.'];

            $response->getBody()->write(json_encode($errorMessage));
            return $response->withStatus($statusCode)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            // Errores inesperados
            $response->getBody()->write(json_encode(['error' => 'Error inesperado del Gateway: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}