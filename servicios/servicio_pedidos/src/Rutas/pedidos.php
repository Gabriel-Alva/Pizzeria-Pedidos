<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Rutas/pedidos.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorPedido;
use App\Controladores\ControladorPago;
use App\Modelos\ConexionBD;
use App\Modelos\Pedido;
use App\Modelos\ItemPedido;
use App\Modelos\Pago;

// Configuración de la base de datos desde el archivo global
$dbConfig = require __DIR__ . '/../../../../configuracion/base_de_datos.php';
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Crear instancias de los modelos
$pedidoModel = new Pedido($pdo);
$itemPedidoModel = new ItemPedido($pdo);
$pagoModel = new Pago($pdo);

// Crear instancias de los controladores, inyectando los modelos
$controladorPedido = new ControladorPedido($pedidoModel, $itemPedidoModel, $pagoModel);
$controladorPago = new ControladorPago($pagoModel);

// Grupo de rutas para pedidos
$app->group('/pedidos', function (RouteCollectorProxy $group) use ($controladorPedido) {
    $group->get('', [$controladorPedido, 'obtenerPedidos']); // Puede recibir query param 'usuario_id'
    $group->get('/{id}', [$controladorPedido, 'obtenerPedidoPorId']);
    $group->post('', [$controladorPedido, 'crearPedido']);
    $group->put('/{id}', [$controladorPedido, 'actualizarPedido']); // Actualización completa (menos común para pedidos)
    $group->patch('/{id}/estado', [$controladorPedido, 'actualizarEstadoPedido']); // Actualizar solo el estado
    $group->patch('/{id}/estado-pago', [$controladorPedido, 'actualizarEstadoPagoPedido']); // Actualizar solo el estado_pago
    $group->delete('/{id}', [$controladorPedido, 'eliminarPedido']);

    // =============================
    // Subgrupo de rutas para reportes
    // =============================
    // Estos endpoints proporcionan información agregada útil para el panel de administración,
    // como reportes de pedidos diarios, pedidos por estado y productos más vendidos.
    // Se agrupan bajo '/pedidos/reportes' para mantener la coherencia con la arquitectura actual
    // y facilitar el mantenimiento y la escalabilidad del microservicio.
    $group->group('/reportes', function (RouteCollectorProxy $reportes) use ($controladorPedido) {
        // Endpoint para obtener la cantidad de pedidos diarios
        // Devuelve un arreglo con la fecha y el total de pedidos por cada día
        // Ejemplo de respuesta: [{"fecha": "2024-06-01", "total": 12}, ...]
        $reportes->get('/diarios', [$controladorPedido, 'reportePedidosDiarios']);

        // Endpoint para obtener la cantidad de pedidos agrupados por estado
        // Devuelve un arreglo con el estado y el total de pedidos para cada estado
        // Ejemplo de respuesta: [{"estado": "pendiente", "total": 5}, ...]
        $reportes->get('/por-estado', [$controladorPedido, 'reportePedidosPorEstado']);

        // Endpoint para obtener el ranking de pizzas más pedidas
        // Devuelve un arreglo con el nombre de la pizza y la cantidad total pedida
        // Ejemplo de respuesta: [{"nombre": "Pizza Pepperoni", "cantidad": 15}, ...]
        $reportes->get('/mas-pedidas', [$controladorPedido, 'reportePizzasMasPedidas']);
        // Aquí se agregarán los otros endpoints de reportes (por estado, más pedidas, etc.)
    });
});

// Grupo de rutas para pagos
$app->group('/pagos', function (RouteCollectorProxy $group) use ($controladorPago) {
    $group->get('/pedido/{pedido_id}', [$controladorPago, 'obtenerPagoPorPedidoId']);
    $group->patch('/{id}/estado', [$controladorPago, 'actualizarEstadoPago']); // Actualizar estado de un pago específico
});