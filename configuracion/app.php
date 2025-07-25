<?php
// Configuración principal de la aplicación
return [
    'nombre_app' => 'Sistema Pizzería',
    'version' => '1.0.0',
    'debug' => true,
    'timezone' => 'America/Lima',
    'jwt_secret' => getenv('JWT_SECRET'),
    'jwt_expiration_seconds' => 3600,
    'microservicios' => [
        'api_gateway' => [
            'url' => 'http://localhost:8000',
            'puerto' => 8000
        ],
        'productos' => [
            'url' => 'https://servicio-productos.onrender.com',
            'puerto' => 8002
        ],
        'usuarios' => [
            'url' => 'https://servicio-usuarios-gn6a.onrender.com',
            'puerto' => 8003
        ],
        'pedidos' => [
            'url' => 'https://servicio-pedidos.onrender.com',
            'puerto' => 8004
        ],
        'notificaciones' => [
            'url' => 'http://localhost:8005',
            'puerto' => 8005
        ],
        'chatbot' => [
            'url' => 'http://localhost:8006',
            'puerto' => 8006
        ],
        'recomendacion' => [
            'url' => 'http://localhost:8007',
            'puerto' => 8007
        ]
    ]
];
