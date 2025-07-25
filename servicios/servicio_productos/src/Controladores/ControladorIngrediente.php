<?php
// sistema_pizzeria/servicios/servicio_productos/src/Controladores/ControladorPizza.php

namespace App\Controladores;

use App\Modelos\Ingrediente;
use App\Modelos\Pizza;
use App\Modelos\PizzaIngrediente;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorIngrediente
{
    private $pizzaModel;
    private $pizzaIngredienteModel;
    
    public function __construct(Ingrediente $ingredienteModel)
{
    $this->ingredienteModel = $ingredienteModel;
}

    public function obtenerPizzas(Request $request, Response $response, array $args)
    {
        $pizzas = $this->pizzaModel->obtenerTodas();
        $response->getBody()->write(json_encode($pizzas));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function obtenerPizzaPorId(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $pizza = $this->pizzaModel->obtenerPorId($id);

        if (!$pizza) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        // Obtener ingredientes de la pizza
        $ingredientes = $this->pizzaIngredienteModel->obtenerPorPizzaId($id);
        $pizza['ingredientes'] = $ingredientes;

        $response->getBody()->write(json_encode($pizza));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function crearPizza(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $nuevoId = $this->pizzaModel->crear($datos);
        $response->getBody()->write(json_encode(['id' => $nuevoId, 'mensaje' => 'Pizza creada exitosamente']));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function actualizarPizza(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $filasAfectadas = $this->pizzaModel->actualizar($id, $datos);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada o sin cambios']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Pizza actualizada exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function eliminarPizza(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $filasAfectadas = $this->pizzaModel->eliminar($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Pizza eliminada exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function agregarIngredienteAPizza(Request $request, Response $response, array $args)
    {
        $pizzaId = (int)$args['id'];
        $datos = $request->getParsedBody();
        $ingredienteId = (int)$datos['ingrediente_id'];

        $filasAfectadas = $this->pizzaIngredienteModel->añadirIngredienteAPizza($pizzaId, $ingredienteId);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'No se pudo agregar el ingrediente a la pizza (ya existe o IDs inválidos)']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Ingrediente agregado a la pizza exitosamente']));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function eliminarIngredienteDePizza(Request $request, Response $response, array $args)
    {
        $pizzaId = (int)$args['id'];
        $ingredienteId = (int)$args['ingrediente_id'];

        $filasAfectadas = $this->pizzaIngredienteModel->eliminarIngredienteDePizza($pizzaId, $ingredienteId);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Relación pizza-ingrediente no encontrada']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Ingrediente eliminado de la pizza exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function obtenerIngredientes(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
        try {
            $ingredientes = $this->ingredienteModel->obtenerTodos($limit, $offset);
            $response->getBody()->write(json_encode($ingredientes));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function crearIngrediente(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        try {
            $nuevoId = $this->ingredienteModel->crear($datos);
            $response->getBody()->write(json_encode(['id' => $nuevoId, 'mensaje' => 'Ingrediente creado exitosamente']));
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