<?php
// Configuración de servicios para el API Gateway
return [
    'timeout' => 30,
    'retry_attempts' => 3,
    'health_check_interval' => 60,
    'circuit_breaker' => [
        'failure_threshold' => 5,
        'recovery_timeout' => 60,
        'expected_exceptions' => [
            'GuzzleHttp\Exception\ConnectException',
            'GuzzleHttp\Exception\ServerException'
        ]
    ]
];
