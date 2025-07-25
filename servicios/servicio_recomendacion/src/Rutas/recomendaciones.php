<?php
// sistema_pizzeria/servicios/servicio_recomendacion/src/Rutas/recomendaciones.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorRecomendacion;
use App\Modelos\ConexionBD;
use App\Modelos\UsuarioPizzaInteraccion;
use App\Modelos\Pizza;
use App\Servicios\ServicioLogicaRecomendacion;

// Configuración de la base de datos desde el archivo global
$dbConfig = require __DIR__ . '/../../../../configuracion/base_de_datos.php';
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Crear instancias de los modelos
$interaccionModel = new UsuarioPizzaInteraccion($pdo);
$pizzaModel = new Pizza($pdo);

// Crear instancia del servicio de lógica
$servicioLogicaRecomendacion = new ServicioLogicaRecomendacion($interaccionModel, $pizzaModel);

// Crear instancia del controlador, inyectando el servicio
$controladorRecomendacion = new ControladorRecomendacion($servicioLogicaRecomendacion);

// Grupo de rutas para recomendaciones
$app->group('/recomendaciones', function (RouteCollectorProxy $group) use ($controladorRecomendacion) {
    $group->get('', [$controladorRecomendacion, 'obtenerRecomendaciones']); // Recibe `usuario_id` y `limit`
    $group->post('/interaccion', [$controladorRecomendacion, 'registrarInteraccion']); // Para registrar interacciones de usuario
});
// POST /interacciones/calificar
$app->post('/interacciones/calificar', function ($request, $response, $args) {
    $data = $request->getParsedBody();
    $usuario_id = $data['usuario_id'];
    $pizza_id = $data['pizza_id'];
    $calificacion = $data['calificacion'];

    $db = require __DIR__ . '/../Configuracion/base_de_datos.php';

    // Verifica si ya existe la interacción
    $stmt = $db->prepare("SELECT id FROM usuario_pizza_interacciones WHERE usuario_id = ? AND pizza_id = ?");
    $stmt->execute([$usuario_id, $pizza_id]);
    $existe = $stmt->fetch();

    if ($existe) {
        // Actualiza la calificación
        $stmt = $db->prepare("UPDATE usuario_pizza_interacciones SET calificacion = ?, fecha_interaccion = NOW() WHERE usuario_id = ? AND pizza_id = ?");
        $stmt->execute([$calificacion, $usuario_id, $pizza_id]);
    } else {
        // Inserta nueva interacción
        $stmt = $db->prepare("INSERT INTO usuario_pizza_interacciones (usuario_id, pizza_id, calificacion) VALUES (?, ?, ?)");
        $stmt->execute([$usuario_id, $pizza_id, $calificacion]);
    }

    $response->getBody()->write(json_encode(['success' => true, 'message' => 'Calificación guardada']));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET /pizzas/{pizza_id}/calificacion
$app->get('/pizzas/{pizza_id}/calificacion', function ($request, $response, $args) {
    $pizza_id = $args['pizza_id'];
    $db = require __DIR__ . '/../Configuracion/base_de_datos.php';

    $stmt = $db->prepare("SELECT AVG(calificacion) as promedio, COUNT(*) as total FROM usuario_pizza_interacciones WHERE pizza_id = ?");
    $stmt->execute([$pizza_id]);
    $result = $stmt->fetch();

    $response->getBody()->write(json_encode([
        'promedio' => round($result['promedio'], 2),
        'total' => $result['total']
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

// GET /pizzas/recomendadas/{usuario_id}
$app->get('/pizzas/recomendadas/{usuario_id}', function ($request, $response, $args) {
    $usuario_id = $args['usuario_id'];
    $db = require __DIR__ . '/../Configuracion/base_de_datos.php';

    // Ejemplo simple: pizzas con mayor promedio de calificación, excluyendo las ya calificadas por el usuario
    $stmt = $db->prepare("
        SELECT pizza_id, AVG(calificacion) as promedio, COUNT(*) as total
        FROM usuario_pizza_interacciones
        WHERE pizza_id NOT IN (
            SELECT pizza_id FROM usuario_pizza_interacciones WHERE usuario_id = ?
        )
        GROUP BY pizza_id
        ORDER BY promedio DESC, total DESC
        LIMIT 5
    ");
    $stmt->execute([$usuario_id]);
    $result = $stmt->fetchAll();

    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json');
});