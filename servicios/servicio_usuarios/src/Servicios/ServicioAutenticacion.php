<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Servicios/ServicioAutenticacion.php

namespace App\Servicios;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Modelos\Usuario;

class ServicioAutenticacion
{
    public $usuarioModel;
    private $jwtSecret;
    private $jwtExpirationSeconds;

    public function __construct(Usuario $usuarioModel, string $jwtSecret, int $jwtExpirationSeconds)
    {
        $this->usuarioModel = $usuarioModel;
        $this->jwtSecret = $jwtSecret;
        $this->jwtExpirationSeconds = $jwtExpirationSeconds;
    }

    public function registrarUsuario(array $datos)
    {
        // Hashear la contraseña
        $datos['contrasena_hash'] = password_hash($datos['contrasena'], PASSWORD_BCRYPT);
        // Por defecto, un nuevo registro es un 'cliente'
        $datos['rol'] = $datos['rol'] ?? 'cliente';
        $datos['telefono'] = $datos['telefono'] ?? null;

        return $this->usuarioModel->crear($datos);
    }

    public function iniciarSesion(string $email, string $contrasena)
    {
        $usuario = $this->usuarioModel->obtenerPorEmail($email);

        if (!$usuario || !password_verify($contrasena, $usuario['contrasena_hash'])) {
            return false; // Credenciales inválidas
        }

        // Generar JWT
        $payload = [
            'iss' => 'sistema-pizzeria-usuarios', // Emisor
            'aud' => 'aplicacion-web-pizzeria', // Audiencia
            'iat' => time(), // Tiempo en que el token fue emitido
            'exp' => time() + $this->jwtExpirationSeconds, // Tiempo de expiración
            'data' => [
                'id' => $usuario['id'],
                'email' => $usuario['correo'],
                'rol' => $usuario['rol']
            ]
        ];

        $jwt = JWT::encode($payload, $this->jwtSecret, 'HS256');

        return [
            'jwt' => $jwt,
            'usuario' => [
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre'],
                'apellido' => $usuario['apellido'],
                'email' => $usuario['correo'],
                'rol' => $usuario['rol']
            ]
        ];
    }

    public function validarToken(string $jwt)
    {
        try {
            $decoded = JWT::decode($jwt, new Key($this->jwtSecret, 'HS256'));
            return (array) $decoded->data;
        } catch (\Exception $e) {
            return false; // Token inválido o expirado
        }
    }
}