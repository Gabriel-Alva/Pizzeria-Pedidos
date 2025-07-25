<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Controladores/ControladorCliente.php

namespace App\Controladores;

use App\Modelos\Cliente;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorCliente
{
    private $clienteModel;

    public function __construct(Cliente $clienteModel)
    {
        $this->clienteModel = $clienteModel;
    }

    public function obtenerClientes(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
        try {
            $clientes = $this->clienteModel->obtenerTodos($limit, $offset);
            $response->getBody()->write(json_encode($clientes));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function obtenerClientePorId(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $cliente = $this->clienteModel->obtenerPorId($id);

        if (!$cliente) {
            $response->getBody()->write(json_encode(['mensaje' => 'Cliente no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode($cliente));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function crearCliente(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $nuevoId = $this->clienteModel->crear($datos);
        $response->getBody()->write(json_encode(['id' => $nuevoId, 'mensaje' => 'Cliente creado exitosamente']));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function actualizarCliente(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $filasAfectadas = $this->clienteModel->actualizar($id, $datos);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Cliente no encontrado o sin cambios']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Cliente actualizado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function eliminarCliente(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $filasAfectadas = $this->clienteModel->eliminar($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Cliente no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Cliente eliminado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}