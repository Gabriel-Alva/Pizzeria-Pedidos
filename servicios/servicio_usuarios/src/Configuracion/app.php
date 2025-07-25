<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Configuracion/app.php

return [
    'jwt_secret' => getenv('JWT_SECRET'), 
    'nombre_servicio' => 'Servicio de Usuarios',
    'debug' => true, // Cambiar a false en producción
    'timezone' => 'America/Lima', // O tu zona horaria
    'jwt_expiration_seconds' => 3600 // 1 hora
];
?>
