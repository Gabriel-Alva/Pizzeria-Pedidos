<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Configuracion/app.php

return [
    'jwt_secret' => getenv('JWT_SECRET'), 
    'nombre_servicio' => 'Servicio de Pedidos',
    'debug' => true,
    'timezone' => 'America/Lima',
    'puerto' => 8004, // Puerto específico para el servicio de pedidos
    'host' => 'localhost',
];