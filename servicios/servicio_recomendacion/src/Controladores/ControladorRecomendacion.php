<?php
// sistema_pizzeria/servicios/servicio_recomendacion/src/Controladores/ControladorRecomendacion.php

namespace App\Controladores;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Servicios\ServicioLogicaRecomendacion;

class ControladorRecomendacion
{
    private $servicioRecomendacion;

    public function __construct(ServicioLogicaRecomendacion $servicioRecomendacion)
    {
        $this->servicioRecomendacion = $servicioRecomendacion;
    }

    public function obtenerRecomendaciones(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $usuarioId = isset($params['usuario_id']) ? (int)$params['usuario_id'] : null;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 5;

        try {
            if (!$usuarioId) {
                $recomendaciones = $this->servicioRecomendacion->obtenerRecomendacionesParaUsuario(0, $limit);
                $response->getBody()->write(json_encode(['mensaje' => 'Proporciona un usuario_id para recomendaciones personalizadas. Mostrando populares/generales.', 'recomendaciones' => $recomendaciones]));
                return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
            }

            $recomendaciones = $this->servicioRecomendacion->obtenerRecomendacionesParaUsuario($usuarioId, $limit);

            if (empty($recomendaciones)) {
                $response->getBody()->write(json_encode(['mensaje' => 'No se encontraron recomendaciones para este usuario.']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            $response->getBody()->write(json_encode($recomendaciones));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function registrarInteraccion(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $usuarioId = $datos['usuario_id'] ?? null;
        $pizzaId = $datos['pizza_id'] ?? null;
        $tipoInteraccion = $datos['tipo_interaccion'] ?? null;

        try {
            if (!$usuarioId || !$pizzaId || !$tipoInteraccion) {
                throw new \InvalidArgumentException('usuario_id, pizza_id y tipo_interaccion son requeridos.');
            }
            $idInteraccion = $this->servicioRecomendacion->registrarInteraccion($usuarioId, $pizzaId, $tipoInteraccion);
            $response->getBody()->write(json_encode(['id_interaccion' => $idInteraccion, 'mensaje' => 'Interacción registrada exitosamente.']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
}