<?php
return [
    'driver' => 'mysql',
    'host' => getenv('DB_HOST') ?: '127.0.0.1',
    'database' => getenv('DB_NAME') ?: 'pizzeria_bd',
    'username' => getenv('DB_USER') ?: 'root',
    'password' => getenv('DB_PASS') ?: '',
    'port' => getenv('DB_PORT') ?: '3306',
    'jwt_secret' => getenv('JWT_SECRET') ?: 'TU_CLAVE_SECRETA_MUY_LARGA_Y_COMPLEJA_PARA_DESARROLLO_2025',
    'charset' => 'utf8mb4',
];