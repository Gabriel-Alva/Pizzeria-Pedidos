<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Controladores/ControladorPago.php

namespace App\Controladores;

use App\Modelos\Pago;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorPago
{
    private $pagoModel;

    public function __construct(Pago $pagoModel)
    {
        $this->pagoModel = $pagoModel;
    }

    public function obtenerPagoPorPedidoId(Request $request, Response $response, array $args)
    {
        $pedidoId = (int)$args['pedido_id'];
        $pago = $this->pagoModel->obtenerPorPedidoId($pedidoId);

        if (!$pago) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pago no encontrado para este pedido']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($pago));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function actualizarEstadoPago(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $estado = $datos['estado'] ?? null;

        if (!$estado) {
            $response->getBody()->write(json_encode(['mensaje' => 'El estado de pago es requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            $filasAfectadas = $this->pagoModel->actualizarEstado($id, $estado);
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pago no encontrado o sin cambios de estado.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Estado de pago actualizado exitosamente.']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}