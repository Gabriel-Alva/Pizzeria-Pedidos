<?php
// sistema_pizzeria/servicios/servicio_productos/src/Configuracion/app.php

return [
    'jwt_secret' => getenv('JWT_SECRET'), 
    'nombre_servicio' => 'Servicio de Productos',
    'debug' => true, // Cambiar a false en producción
    'timezone' => 'America/Lima', // O tu zona horaria
    // Otros ajustes específicos del servicio
];