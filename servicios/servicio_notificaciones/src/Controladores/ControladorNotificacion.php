<?php
// sistema_pizzeria/servicios/servicio_notificaciones/src/Controladores/ControladorNotificacion.php

namespace App\Controladores;

use App\Modelos\Notificacion;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorNotificacion
{
    private $notificacionModel;

    public function __construct(Notificacion $notificacionModel)
    {
        $this->notificacionModel = $notificacionModel;
    }

    public function obtenerNotificaciones(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $usuarioId = isset($params['usuario_id']) ? (int)$params['usuario_id'] : null;
        $noLeidas = isset($params['no_leidas']) && $params['no_leidas'] === 'true';
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;

        try {
            if ($usuarioId) {
                if ($noLeidas) {
                    $notificaciones = $this->notificacionModel->obtenerNoLeidasPorUsuarioId($usuarioId);
                } else {
                    $notificaciones = $this->notificacionModel->obtenerPorUsuarioId($usuarioId);
                }
            } else {
                $notificaciones = $this->notificacionModel->obtenerTodas($limit, $offset);
            }
            $response->getBody()->write(json_encode($notificaciones));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function crearNotificacion(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        try {
            $nuevoId = $this->notificacionModel->crear($datos);
            $response->getBody()->write(json_encode(['id' => $nuevoId, 'mensaje' => 'Notificación creada exitosamente.']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function marcarComoLeida(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $filasAfectadas = $this->notificacionModel->marcarComoLeida($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Notificación no encontrada o ya marcada como leída.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Notificación marcada como leída.']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function eliminarNotificacion(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $filasAfectadas = $this->notificacionModel->eliminar($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Notificación no encontrada.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Notificación eliminada exitosamente.']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}