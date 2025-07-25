<?php

namespace App\Controladores;
use App\Modelos\Pizza;
use App\Modelos\PizzaIngrediente;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ControladorPizza
{
    private $pizzaModel;
    private $pizzaIngredienteModel;

    public function __construct(Pizza $pizzaModel, PizzaIngrediente $pizzaIngredienteModel)
    {
        $this->pizzaModel = $pizzaModel;
        $this->pizzaIngredienteModel = $pizzaIngredienteModel;
    }
    public function obtenerPizzaPorId(Request $request, Response $response, array $args)
{
    $id = $args['id'];
    try {
        $pizza = $this->pizzaModel->obtenerPorId($id);
        if ($pizza) {
            $response->getBody()->write(json_encode($pizza));
            return $response->withHeader('Content-Type', 'application/json');
        } else {
            $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }
}

    public function obtenerPizzas(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
        try {
            $pizzas = $this->pizzaModel->obtenerTodas($limit, $offset);
            $response->getBody()->write(json_encode($pizzas));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function crearPizza(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        try {
            $nuevoId = $this->pizzaModel->crear($datos);
            $response->getBody()->write(json_encode(['id' => $nuevoId, 'mensaje' => 'Pizza creada exitosamente']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
                $response->getBody()->write(json_encode([
                    'mensaje' => 'Error interno del servidor.',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]));
                return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
            }
    }

    public function actualizarPizza(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        $datos = $request->getParsedBody();
        
        try {
            $actualizado = $this->pizzaModel->actualizar($id, $datos);
            if ($actualizado) {
                $response->getBody()->write(json_encode(['mensaje' => 'Pizza actualizada exitosamente']));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode([
                'mensaje' => 'Error interno del servidor.',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function eliminarPizza(Request $request, Response $response, array $args)
    {
        $id = $args['id'];
        try {
            $eliminado = $this->pizzaModel->eliminar($id);
            if ($eliminado) {
                $response->getBody()->write(json_encode(['mensaje' => 'Pizza eliminada exitosamente']));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write(json_encode(['mensaje' => 'Pizza no encontrada']));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function agregarIngredienteAPizza(Request $request, Response $response, array $args)
    {
        $pizzaId = $args['id'];
        $datos = $request->getParsedBody();
        $ingredienteId = $datos['ingrediente_id'] ?? null;
        
        if (!$ingredienteId) {
            $response->getBody()->write(json_encode(['mensaje' => 'ingrediente_id es requerido']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            $agregado = $this->pizzaIngredienteModel->agregarIngredienteAPizza($pizzaId, $ingredienteId);
            if ($agregado) {
                $response->getBody()->write(json_encode(['mensaje' => 'Ingrediente agregado a la pizza exitosamente']));
                return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write(json_encode(['mensaje' => 'No se pudo agregar el ingrediente']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }

    public function eliminarIngredienteDePizza(Request $request, Response $response, array $args)
    {
        $pizzaId = $args['id'];
        $ingredienteId = $args['ingrediente_id'];
        
        try {
            $eliminado = $this->pizzaIngredienteModel->eliminarIngredienteDePizza($pizzaId, $ingredienteId);
            if ($eliminado) {
                $response->getBody()->write(json_encode(['mensaje' => 'Ingrediente eliminado de la pizza exitosamente']));
                return $response->withHeader('Content-Type', 'application/json');
            } else {
                $response->getBody()->write(json_encode(['mensaje' => 'No se pudo eliminar el ingrediente']));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
    }
}
