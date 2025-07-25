<?php
// sistema_pizzeria/servicios/servicio_chatbot/src/Rutas/chatbot.php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;
use App\Controladores\ControladorChatbot;
use App\Modelos\ConexionBD;
use App\Modelos\InteraccionChatbot;
use App\Servicios\ServicioLogicaChatbot;

// Configuración de la base de datos desde el archivo global
$dbConfig = require __DIR__ . '/../../../../configuracion/base_de_datos.php';
$pdo = ConexionBD::obtenerInstancia($dbConfig)->obtenerConexion();

// Crear instancias del modelo y servicio de lógica
$interaccionChatbotModel = new InteraccionChatbot($pdo);
$servicioLogicaChatbot = new ServicioLogicaChatbot();

// Crear instancia del controlador, inyectando dependencias
$controladorChatbot = new ControladorChatbot($servicioLogicaChatbot, $interaccionChatbotModel);

// Grupo de rutas para el chatbot
$app->group('/chatbot', function (RouteCollectorProxy $group) use ($controladorChatbot) {
    $group->post('/interactuar', [$controladorChatbot, 'interactuar']); // Enviar un mensaje al chatbot
    $group->get('/interacciones', [$controladorChatbot, 'obtenerInteracciones']); // Obtener historial de interacciones
});