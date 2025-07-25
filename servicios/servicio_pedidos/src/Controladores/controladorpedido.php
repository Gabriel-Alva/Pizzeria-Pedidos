<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Controladores/ControladorPedido.php

namespace App\Controladores;

use App\Modelos\Pedido;
use App\Modelos\ItemPedido;
use App\Modelos\Pago;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorPedido
{
    private $pedidoModel;
    private $itemPedidoModel;
    private $pagoModel;

    public function __construct(Pedido $pedidoModel, ItemPedido $itemPedidoModel, Pago $pagoModel)
    {
        $this->pedidoModel = $pedidoModel;
        $this->itemPedidoModel = $itemPedidoModel;
        $this->pagoModel = $pagoModel;
    }

    public function obtenerPedidos(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $usuarioId = isset($params['usuario_id']) ? (int)$params['usuario_id'] : null;
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;

        try {
            if ($usuarioId) {
                $pedidos = $this->pedidoModel->obtenerPorUsuarioId($usuarioId);
            } else {
                $pedidos = $this->pedidoModel->obtenerTodos($limit, $offset);
            }
            // Agregar los items/productos a cada pedido
            foreach ($pedidos as &$pedido) {
                $pedido['items'] = $this->itemPedidoModel->obtenerPorPedidoId($pedido['id']);
            }
            unset($pedido);
            $response->getBody()->write(json_encode($pedidos));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function obtenerPedidoPorId(Request $request, Response $response, array $args)
    {
        try {
            $id = (int)$args['id'];
            $pedido = $this->pedidoModel->obtenerPorId($id);

            if (!$pedido) {
                $response->getBody()->write(json_encode(['mensaje' => 'Pedido no encontrado']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }

            // Obtener ítems del pedido
            $items = $this->itemPedidoModel->obtenerPorPedidoId($id);
            $pedido['items'] = $items;

            // Eliminado: Obtener información de pago
            // $pago = $this->pagoModel->obtenerPorPedidoId($id);
            // $pedido['pago'] = $pago;

            $response->getBody()->write(json_encode($pedido));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Throwable $e) {
            $response->getBody()->write(json_encode([
                'error' => true,
                'mensaje' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function crearPedido(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();

        if (!isset($datos['items']) || !is_array($datos['items']) || empty($datos['items'])) {
            $response->getBody()->write(json_encode(['mensaje' => 'Datos de pedido inválidos: items son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $total = 0;
        foreach ($datos['items'] as $item) {
            $total += $item['cantidad'] * $item['precio_unitario'];
        }

        // Extraer datos del cliente anónimo si existen
        $nombre_cliente = $datos['datos_cliente']['nombre'] ?? null;
        $correo_cliente = $datos['datos_cliente']['email'] ?? null;
        $telefono_cliente = $datos['datos_cliente']['telefono'] ?? null;

        $datosPedido = [
            'usuario_id' => isset($datos['usuario_id']) && is_numeric($datos['usuario_id']) ? $datos['usuario_id'] : null,
            'monto_total' => $total,
            'estado' => $datos['estado'] ?? 'pendiente',
            'tipo_entrega' => $datos['tipo_entrega'] ?? 'domicilio',
            'direccion_entrega' => $datos['direccion_entrega'] ?? null,
            'nombre_cliente' => $nombre_cliente,
            'correo_cliente' => $correo_cliente,
            'telefono_cliente' => $telefono_cliente,
            'metodo_pago' => $datos['metodo_pago'] ?? null,
            'estado_pago' => $datos['estado_pago'] ?? 'pendiente',
            'notas' => $datos['notas'] ?? null
        ];

        try {
            $pedidoId = $this->pedidoModel->crear($datosPedido);
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($pedidoId) {
            foreach ($datos['items'] as $item) {
                $item['pedido_id'] = $pedidoId;
                $this->itemPedidoModel->crear($item);
            }

            if (isset($datos['pago'])) {
                $datosPago = [
                    'pedido_id' => $pedidoId,
                    'monto' => $total,
                    'metodo_pago' => $datos['pago']['metodo_pago'] ?? 'efectivo',
                    'estado' => $datos['pago']['estado'] ?? 'pendiente',
                ];
                try {
                    $this->pagoModel->crear($datosPago);
                } catch (\InvalidArgumentException $e) {
                    $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
                    return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
                } catch (\Exception $e) {
                    $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
                    return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
                }
            }

            $response->getBody()->write(json_encode(['id' => $pedidoId, 'mensaje' => 'Pedido creado exitosamente']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Error al crear el pedido']));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    public function actualizarPedido(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $filasAfectadas = $this->pedidoModel->actualizar($id, $datos);

        // Actualizar instrucciones especiales de los items si se envían
        if (isset($datos['instrucciones_especiales']) && is_array($datos['instrucciones_especiales'])) {
            $this->itemPedidoModel->actualizarInstruccionesEspeciales($id, $datos['instrucciones_especiales']);
        }

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pedido no encontrado o sin cambios']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Pedido actualizado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function actualizarEstadoPedido(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $estado = $datos['estado'] ?? null;

        if (!$estado) {
            $response->getBody()->write(json_encode(['mensaje' => 'El estado es requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            $filasAfectadas = $this->pedidoModel->actualizarEstado($id, $estado);
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pedido no encontrado o sin cambios de estado.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Estado del pedido actualizado exitosamente.']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function actualizarEstadoPagoPedido(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $estado_pago = $datos['estado_pago'] ?? null;

        if (!$estado_pago) {
            $response->getBody()->write(json_encode(['mensaje' => 'El estado de pago es requerido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        try {
            $filasAfectadas = $this->pedidoModel->actualizarEstadoPago($id, $estado_pago);
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pedido no encontrado o sin cambios de estado de pago.']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Estado de pago actualizado exitosamente.']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function eliminarPedido(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        // Opcional: Eliminar ítems y pagos asociados antes de eliminar el pedido.
        // Si tienes FOREIGN KEY ON DELETE CASCADE en la BD, se encarga automáticamente.
        $filasAfectadas = $this->pedidoModel->eliminar($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pedido no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Pedido eliminado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =============================
    // MÉTODO DE REPORTE: Pedidos Diarios
    // =============================
    /**
     * Endpoint de reporte: pedidos diarios con filtros.
     */
    public function reportePedidosDiarios(Request $request, Response $response, array $args)
    {
        // Leer filtros de la query
        $params = $request->getQueryParams();
        $desde = $params['desde'] ?? null;
        $hasta = $params['hasta'] ?? null;
        $resultados = $this->pedidoModel->obtenerPedidosDiarios($desde, $hasta);
        $response->getBody()->write(json_encode($resultados));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =============================
    // MÉTODO DE REPORTE: Pedidos por Estado
    // =============================
    /**
     * Endpoint de reporte: pedidos por estado con filtros.
     */
    public function reportePedidosPorEstado(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $desde = $params['desde'] ?? null;
        $hasta = $params['hasta'] ?? null;
        $estado = $params['estado'] ?? null;
        $resultados = $this->pedidoModel->obtenerPedidosPorEstado($desde, $hasta, $estado);
        $response->getBody()->write(json_encode($resultados));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // =============================
    // MÉTODO DE REPORTE: Pizzas más pedidas
    // =============================
    /**
     * Endpoint de reporte: pizzas más pedidas con filtros.
     */
    public function reportePizzasMasPedidas(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $desde = $params['desde'] ?? null;
        $hasta = $params['hasta'] ?? null;
        $top = isset($params['top']) ? (int)$params['top'] : 10;
        $resultados = $this->itemPedidoModel->obtenerPizzasMasPedidas($desde, $hasta, $top);
        $response->getBody()->write(json_encode($resultados));
        return $response->withHeader('Content-Type', 'application/json');
    }
}