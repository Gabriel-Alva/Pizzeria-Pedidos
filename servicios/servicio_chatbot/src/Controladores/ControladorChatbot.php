<?php
// sistema_pizzeria/servicios/servicio_chatbot/src/Controladores/ControladorChatbot.php

namespace App\Controladores;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Servicios\ServicioLogicaChatbot;
use App\Modelos\InteraccionChatbot;

class ControladorChatbot
{
    private $servicioLogicaChatbot;
    private $interaccionChatbotModel;

    public function __construct(ServicioLogicaChatbot $servicioLogicaChatbot, InteraccionChatbot $interaccionChatbotModel)
    {
        $this->servicioLogicaChatbot = $servicioLogicaChatbot;
        $this->interaccionChatbotModel = $interaccionChatbotModel;
    }

    public function interactuar(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $mensajeUsuario = $datos['mensaje'] ?? null;
        $usuarioId = $datos['usuario_id'] ?? null;

        if (empty($mensajeUsuario)) {
            $response->getBody()->write(json_encode(['mensaje' => 'El mensaje es requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            $respuestaChatbot = $this->servicioLogicaChatbot->procesarMensaje($mensajeUsuario);
            $this->interaccionChatbotModel->crear([
                'usuario_id' => $usuarioId,
                'mensaje_usuario' => $mensajeUsuario,
                'respuesta_chatbot' => $respuestaChatbot
            ]);
            $response->getBody()->write(json_encode(['respuesta' => $respuestaChatbot]));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function obtenerInteracciones(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $usuarioId = isset($params['usuario_id']) ? (int)$params['usuario_id'] : null;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;

        try {
            if ($usuarioId) {
                $interacciones = $this->interaccionChatbotModel->obtenerPorUsuarioId($usuarioId);
            } else {
                $interacciones = $this->interaccionChatbotModel->obtenerTodas($limit, $offset);
            }
            $response->getBody()->write(json_encode($interacciones));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
}