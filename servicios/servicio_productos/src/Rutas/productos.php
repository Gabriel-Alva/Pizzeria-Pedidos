<?php
// sistema_pizzeria/servicios/servicio_productos/src/Rutas/productos.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorPizza;
use App\Controladores\ControladorIngrediente;
use App\Modelos\ConexionBD;
use App\Modelos\Pizza;
use App\Modelos\Ingrediente;
use App\Modelos\PizzaIngrediente;

// Configuración de la base de datos desde el archivo global
//$dbConfig = require __DIR__ . '/../../configuracion/base_de_datos.php';
$dbConfig = require '/var/www/html/configuracion/base_de_datos.php';
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Crear instancias de los modelos
$pizzaModel = new Pizza($pdo);
$ingredienteModel = new Ingrediente($pdo);
$pizzaIngredienteModel = new PizzaIngrediente($pdo);

// Crear instancias de los controladores, inyectando los modelos
$controladorPizza = new ControladorPizza($pizzaModel, $pizzaIngredienteModel);
$controladorIngrediente = new ControladorIngrediente($ingredienteModel);

// Grupo de rutas para pizzas
$app->group('/pizzas', function (RouteCollectorProxy $group) use ($controladorPizza) {
    $group->get('', [$controladorPizza, 'obtenerPizzas']);
    $group->get('/{id}', [$controladorPizza, 'obtenerPizzaPorId']);
    $group->post('', [$controladorPizza, 'crearPizza']);
    $group->put('/{id}', [$controladorPizza, 'actualizarPizza']);
    $group->delete('/{id}', [$controladorPizza, 'eliminarPizza']);
    // Rutas para ingredientes de pizzas
    $group->post('/{id}/ingredientes', [$controladorPizza, 'agregarIngredienteAPizza']); // Body: { "ingrediente_id": 1 }
    $group->delete('/{id}/ingredientes/{ingrediente_id}', [$controladorPizza, 'eliminarIngredienteDePizza']);
});

// Grupo de rutas para ingredientes
$app->group('/ingredientes', function (RouteCollectorProxy $group) use ($controladorIngrediente) {
    $group->get('', [$controladorIngrediente, 'obtenerIngredientes']);
    $group->get('/{id}', [$controladorIngrediente, 'obtenerIngredientePorId']);
    $group->post('', [$controladorIngrediente, 'crearIngrediente']);
    $group->put('/{id}', [$controladorIngrediente, 'actualizarIngrediente']);
    $group->delete('/{id}', [$controladorIngrediente, 'eliminarIngrediente']);
});