<?php
// sistema_pizzeria/api_gateway/src/Rutas/gateway.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorProxy;
use GuzzleHttp\Client;

// Obtener la configuración de los microservicios
$appConfig = require __DIR__ . '/../Configuracion/app.php';
$microserviceConfig = $appConfig['microservicios'];

// Instanciar Guzzle HTTP Client
$httpClient = new Client();

// Ajustar zona horaria para evitar problemas de comparación de fechas
// Puedes cambiar 'America/Lima' por la zona horaria de tu país si es necesario
if (function_exists('date_default_timezone_set')) {
    date_default_timezone_set('America/Lima');
}

// Instanciar el controlador de proxy
$proxyController = new ControladorProxy($httpClient, $microserviceConfig);

// --- Ruta de inicio ---
$app->get('/', function (Request $request, Response $response, array $args) {
    $html = file_get_contents(__DIR__ . '/../../publico/index.html');
    $response->getBody()->write($html);
    return $response->withHeader('Content-Type', 'text/html');
});

// --- Rutas de Autenticación (Públicas) ---
// Estas rutas no pasan por el middleware de autenticación del AuthMiddleware
$app->map(['POST', 'OPTIONS'], '/login', function (Request $request, Response $response, array $args) use ($proxyController) {
    if ($request->getMethod() === 'OPTIONS') {
        return $response->withStatus(200);
    }
    return $proxyController->proxy($request, $response, ['service' => 'usuarios', 'path' => 'login']);
});

$app->map(['POST', 'OPTIONS'], '/registro', function (Request $request, Response $response, array $args) use ($proxyController) {
    if ($request->getMethod() === 'OPTIONS') {
        return $response->withStatus(200);
    }
    return $proxyController->proxy($request, $response, ['service' => 'usuarios', 'path' => 'registro']);
});


// --- Endpoint protegido para dashboard admin ---
$app->get('/admin/dashboard', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo admin o empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || !in_array($jwtData['rol'], ['administrador', 'empleado'])) {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    // Consultar microservicios
    try {
        // Usuarios (solo clientes activos)
        $usuariosRes = $httpClient->get($microserviceConfig['usuarios']['url'] . '/usuarios?limit=1000');
        $usuarios = json_decode($usuariosRes->getBody()->getContents(), true);
        $clientesActivos = array_filter($usuarios, function($u) {
            return ($u['rol'] ?? '') === 'cliente' && (isset($u['activo']) ? $u['activo'] == 1 : true);
        });
        $usuariosTotal = count($clientesActivos);

        // Productos activos
        $productosRes = $httpClient->get($microserviceConfig['productos']['url'] . '/pizzas');
        $productos = json_decode($productosRes->getBody()->getContents(), true);
        $productosActivos = is_array($productos) ? count(array_filter($productos, function($p) { return $p['disponible'] ?? false; })) : 0;

        // Pedidos de hoy y últimos pedidos
        $pedidosRes = $httpClient->get($microserviceConfig['pedidos']['url'] . '/pedidos?limit=20');
        $pedidos = json_decode($pedidosRes->getBody()->getContents(), true);
        $pedidosHoy = 0;
        $ingresosHoy = 0;
        $ultimosPedidos = [];
        $hoy = date('Y-m-d');
        foreach ($pedidos as $pedido) {
            $fecha = substr($pedido['creado_en'], 0, 10);
            if ($fecha === $hoy) {
                $pedidosHoy++;
                if (isset($pedido['estado_pago']) && $pedido['estado_pago'] === 'pagado') {
                    $ingresosHoy += floatval($pedido['monto_total']);
                }
            }
            $ultimosPedidos[] = [
                'monto' => $pedido['monto_total'],
                'fecha' => $pedido['creado_en'],
                'estado' => $pedido['estado']
            ];
        }
        // Ingresos últimos 7 días (para gráfica)
        $desde = date('Y-m-d', strtotime('-6 days'));
        $hasta = $hoy;
        $reporteRes = $httpClient->get($microserviceConfig['pedidos']['url'] . '/pedidos/reportes/diarios?desde=' . $desde . '&hasta=' . $hasta);
        $reporte = json_decode($reporteRes->getBody()->getContents(), true);
        $dias = [];
        $ingresosDias = [];
        // Inicializar días
        for ($i = 6; $i >= 0; $i--) {
            $dia = date('Y-m-d', strtotime("-$i days"));
            $dias[$dia] = 0;
        }
        foreach ($reporte as $r) {
            $dias[$r['fecha']] = $r['total'];
        }
        foreach ($dias as $fecha => $total) {
            $ingresosDias[] = [
                'fecha' => $fecha,
                'total' => $total
            ];
        }
        $data = [
            'totalUsuarios' => intval($usuariosTotal),
            'productosActivos' => intval($productosActivos),
            'pedidosHoy' => intval($pedidosHoy),
            'ingresosHoy' => floatval($ingresosHoy),
            'ultimosPedidos' => $ultimosPedidos,
            'ingresosUltimos7Dias' => $ingresosDias
        ];
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener datos del dashboard: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Endpoint protegido para dashboard empleado ---
$app->get('/empleado/dashboard', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || $jwtData['rol'] !== 'empleado') {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    // Consultar microservicio de pedidos
    try {
        // Obtener todos los pedidos recientes (puedes ajustar el límite si es necesario)
        $pedidosRes = $httpClient->get($microserviceConfig['pedidos']['url'] . '/pedidos?limit=100');
        $pedidos = json_decode($pedidosRes->getBody()->getContents(), true);
        $hoy = date('Y-m-d');
        $pedidos_pendientes = 0;
        $pedidos_en_preparacion = 0;
        $pedidos_listos = 0;
        $pedidos_entregados_hoy = 0;
        $ultimos_pedidos = [];
        // Filtrar y contar pedidos del día por estado
        foreach ($pedidos as $pedido) {
            $fecha = substr($pedido['creado_en'], 0, 10);
            if ($fecha === $hoy) {
                switch ($pedido['estado']) {
                    case 'pendiente':
                        $pedidos_pendientes++;
                        break;
                    case 'preparando':
                        $pedidos_en_preparacion++;
                        break;
                    case 'listo':
                        $pedidos_listos++;
                        break;
                    case 'entregado':
                        $pedidos_entregados_hoy++;
                        break;
                }
                // Guardar para la tabla de últimos pedidos
                $ultimos_pedidos[] = [
                    'cliente' => $pedido['nombre_cliente'] ?? 'Cliente',
                    'estado' => $pedido['estado'],
                    'fecha' => $pedido['creado_en']
                ];
            }
        }
        // Ordenar últimos pedidos por fecha descendente y limitar a 10
        usort($ultimos_pedidos, function($a, $b) {
            return strtotime($b['fecha']) - strtotime($a['fecha']);
        });
        $ultimos_pedidos = array_slice($ultimos_pedidos, 0, 10);
        // Respuesta final
        $data = [
            'pedidos_pendientes' => $pedidos_pendientes,
            'pedidos_en_preparacion' => $pedidos_en_preparacion,
            'pedidos_listos' => $pedidos_listos,
            'pedidos_entregados_hoy' => $pedidos_entregados_hoy,
            'ultimos_pedidos' => $ultimos_pedidos
        ];
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener datos del dashboard: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Endpoint protegido para obtener pedidos del empleado ---
$app->get('/empleado/pedidos', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || $jwtData['rol'] !== 'empleado') {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    // Obtener el filtro de estado si existe
    $queryParams = $request->getQueryParams();
    $estado = isset($queryParams['estado']) ? $queryParams['estado'] : null;
    // Construir la URL al microservicio de pedidos
    $url = $microserviceConfig['pedidos']['url'] . '/pedidos?limit=100';
    if ($estado) {
        $url .= '&estado=' . urlencode($estado);
    }
    try {
        $pedidosRes = $httpClient->get($url);
        $pedidos = json_decode($pedidosRes->getBody()->getContents(), true);
        $response->getBody()->write(json_encode($pedidos));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener pedidos: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Endpoint protegido para obtener el detalle de un pedido para el empleado ---
$app->get('/empleado/pedidos/{id}', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || $jwtData['rol'] !== 'empleado') {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    $pedidoId = $args['id'];
    $url = $microserviceConfig['pedidos']['url'] . '/pedidos/' . urlencode($pedidoId);
    try {
        $pedidoRes = $httpClient->get($url);
        $pedido = json_decode($pedidoRes->getBody()->getContents(), true);
        $response->getBody()->write(json_encode($pedido));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener detalle del pedido: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Endpoint protegido para obtener entregas del empleado ---
$app->get('/empleado/entregas', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || $jwtData['rol'] !== 'empleado') {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    // Obtener el filtro de estado si existe
    $queryParams = $request->getQueryParams();
    $estado = isset($queryParams['estado']) ? $queryParams['estado'] : null;
    // Construir la URL al microservicio de pedidos
    $url = $microserviceConfig['pedidos']['url'] . '/pedidos?limit=100';
    if ($estado) {
        $url .= '&estado=' . urlencode($estado);
    }
    try {
        $entregasRes = $httpClient->get($url);
        $entregas = json_decode($entregasRes->getBody()->getContents(), true);
        $response->getBody()->write(json_encode($entregas));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al obtener entregas: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Endpoint protegido para actualizar el estado de un pedido (empleado) ---
$app->patch('/empleado/pedidos/{id}/estado', function (Request $request, Response $response, array $args) use ($httpClient, $microserviceConfig) {
    // Validar token y rol (solo empleado)
    $jwtData = $request->getAttribute('jwt_data');
    if (!$jwtData || !isset($jwtData['rol']) || $jwtData['rol'] !== 'empleado') {
        $response->getBody()->write(json_encode(['error' => 'No autorizado.']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }
    $pedidoId = $args['id'];
    $url = $microserviceConfig['pedidos']['url'] . '/pedidos/' . urlencode($pedidoId) . '/estado';
    $body = $request->getBody()->getContents();
    try {
        $res = $httpClient->patch($url, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => $body
        ]);
        $result = json_decode($res->getBody()->getContents(), true);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (\Exception $e) {
        $response->getBody()->write(json_encode(['error' => 'Error al actualizar estado: ' . $e->getMessage()]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// --- Rutas Generales del Gateway (proxy a microservicios) ---
// La sintaxis /{service}[/{path:.*}] permite capturar el nombre del servicio
// y el resto de la ruta como 'path'.
// TODAS estas rutas pasarán por el AuthMiddleware por defecto,
// a menos que se especifiquen explícitamente en 'rutas_publicas' en app.php
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{service}[/{path:.*}]', function (Request $request, Response $response, array $args) use ($proxyController) {
    // La lógica del AuthMiddleware ya ha determinado si la ruta es pública o protegida.
    // Si llegó aquí, significa que pasó la autenticación si era necesaria.
    return $proxyController->proxy($request, $response, $args);
});