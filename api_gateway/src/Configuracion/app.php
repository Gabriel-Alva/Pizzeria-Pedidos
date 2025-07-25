<?php
// sistema_pizzeria/api_gateway/src/Configuracion/app.php

return [
    'nombre_gateway' => 'API Gateway Pizzeria',
    'debug' => true, // Cambiar a false en producción
    'jwt_secret' =>  getenv('JWT_SECRET'), // Debe ser la misma que en servicio_usuarios
    'microservicios' => [
        'productos' => [
            'url' => 'https://servicio-productos.onrender.com',
            'rutas_protegidas' => ['/pizzas/crear', '/pizzas/{id}', '/ingredientes/crear', '/ingredientes/{id}'] // Ejemplos
        ],
        'pedidos' => [
            'url' => 'https://servicio-pedidos.onrender.com',
            'rutas_protegidas' => ['/pedidos', '/pedidos/{id}', '/pagos'] // Todas las de pedidos son protegidas
        ],
        'usuarios' => [
            'url' => 'https://servicio-usuarios-gn6a.onrender.com',
            'rutas_protegidas' => ['/usuarios', '/usuarios/{id}']
        ],
        'notificaciones' => [
            'url' => 'http://localhost:8005',
            'rutas_protegidas' => ['/notificaciones', '/notificaciones/{id}']
        ],
        'chatbot' => [
            'url' => 'http://localhost:8006',
            'rutas_protegidas' => ['/chatbot/interactuar', '/chatbot/interacciones']
        ],
        'recomendacion' => [
            'url' => 'http://localhost:8007',
            'rutas_protegidas' => ['/recomendaciones', '/recomendaciones/interaccion']
        ]
    ],
    'rutas_publicas' => [
        '/',
        '/index.html',
        '/favicon.ico',
        '/frontend/.*',
        '/css/.*',
        '/js/.*',
        '/assets/.*',
        '/login',
        '/registro',
        '/pizzas', // Leer pizzas puede ser público
        '/pizzas/{id}', // Leer pizza por ID puede ser público
        '/ingredientes', // Leer ingredientes puede ser público
        '/recomendaciones', // Las recomendaciones generales pueden ser públicas
        '/productos/pizzas', // Hacer público el menú de pizzas
        '/productos/pizzas/{id}', // Hacer público el detalle de pizza
        '/pedidos', // Permitir registrar pedidos sin autenticación
        '/pedidos/{id}' // Permitir consultar pedido por id sin autenticación
    ]
];