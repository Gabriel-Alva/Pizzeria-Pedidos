<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Controladores/ControladorAutenticacion.php

namespace App\Controladores;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Servicios\ServicioAutenticacion;

class ControladorAutenticacion
{
    private $servicioAutenticacion;

    public function __construct(ServicioAutenticacion $servicioAutenticacion)
    {
        $this->servicioAutenticacion = $servicioAutenticacion;
    }

    public function registrar(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $email = trim($datos['email'] ?? '');
        $contrasena = $datos['contrasena'] ?? '';
        $nombre_usuario = trim($datos['nombre_usuario'] ?? '');
        $apellido = trim($datos['apellido'] ?? '');
        $telefono = $datos['telefono'] ?? null;
        $direccion = $datos['direccion'] ?? null;

        // Validaciones
        if (empty($email) || empty($contrasena) || empty($nombre_usuario)) {
            $response->getBody()->write(json_encode(['mensaje' => 'Email, contraseña y nombre de usuario son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode(['mensaje' => 'Correo electrónico no válido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        if (strlen($contrasena) < 8) {
            $response->getBody()->write(json_encode(['mensaje' => 'La contraseña debe tener al menos 8 caracteres.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        // Validación de contraseña fuerte (mínimo 8 caracteres, una mayúscula, una minúscula, un número)
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $contrasena)) {
            $response->getBody()->write(json_encode(['mensaje' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        // Verificar si el usuario ya existe
        try {
            $usuarioExistente = $this->servicioAutenticacion->usuarioModel->obtenerPorEmail($email);
            if ($usuarioExistente) {
                $response->getBody()->write(json_encode(['mensaje' => 'El correo ya está registrado.']));
                return $response->withStatus(409)->withHeader('Content-Type', 'application/json');
            }
        } catch (\Exception $e) {
            // Si hay un error al consultar, lo reportamos
            $response->getBody()->write(json_encode(['mensaje' => 'Error al verificar usuario existente: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        try {
            // Crear el usuario directamente (no necesitamos tabla clientes separada)
            $datosUsuario = [
                'nombre' => $nombre_usuario,
                'apellido' => $apellido,
                'correo' => $email,
                'contrasena' => $contrasena,
                'rol' => 'cliente',
                'telefono' => $telefono
            ];
            $usuarioId = $this->servicioAutenticacion->registrarUsuario($datosUsuario);

            $response->getBody()->write(json_encode(['id_usuario' => $usuarioId, 'mensaje' => 'Usuario registrado exitosamente.']));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error en el registro: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function iniciarSesion(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        $email = trim($datos['email'] ?? '');
        $contrasena = $datos['contrasena'] ?? '';

        // Validaciones
        if (empty($email) || empty($contrasena)) {
            $response->getBody()->write(json_encode(['mensaje' => 'Email y contraseña son requeridos.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode(['mensaje' => 'Correo electrónico no válido.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $resultado = $this->servicioAutenticacion->iniciarSesion($email, $contrasena);

        if ($resultado) {
            $response->getBody()->write(json_encode($resultado));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Usuario o contraseña incorrectos.']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    // Un endpoint simple para validar un token (usado por el API Gateway)
    public function validarToken(Request $request, Response $response, array $args)
    {
        $headers = $request->getHeaders();
        $authHeader = $headers['Authorization'][0] ?? '';

        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
            $datosToken = $this->servicioAutenticacion->validarToken($jwt);

            if ($datosToken) {
                $response->getBody()->write(json_encode(['valido' => true, 'data' => $datosToken]));
                return $response->withHeader('Content-Type', 'application/json');
            }
        }

        $response->getBody()->write(json_encode(['valido' => false, 'mensaje' => 'Token inválido o no proporcionado.']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}