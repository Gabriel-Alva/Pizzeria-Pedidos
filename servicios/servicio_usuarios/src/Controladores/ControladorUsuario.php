<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Controladores/ControladorUsuario.php

namespace App\Controladores;

use App\Modelos\Usuario;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJwtDataFromRequest($request) {
    error_log('JWT_SECRET actual: ' . getenv('JWT_SECRET'));
    $authHeader = $request->getHeaderLine('Authorization');
    if (preg_match('/Bearer\\s(\\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        try {
            $decoded = JWT::decode($token, new Key(getenv('JWT_SECRET'), 'HS256'));
            return (array) $decoded->data;
        } catch (Exception $e) {
            return null;
        }
    }
    return null;
}
class ControladorUsuario
{
    private $usuarioModel;

    public function __construct(Usuario $usuarioModel)
    {
        $this->usuarioModel = $usuarioModel;
    }

    public function obtenerUsuarios(Request $request, Response $response, array $args)
    {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 50;
        $offset = isset($params['offset']) ? (int)$params['offset'] : 0;
        try {
            $usuarios = $this->usuarioModel->obtenerTodos($limit, $offset);
            $response->getBody()->write(json_encode($usuarios));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\InvalidArgumentException $e) {
            $response->getBody()->write(json_encode(['mensaje' => $e->getMessage()]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error interno del servidor.']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function crearUsuario(Request $request, Response $response, array $args)
    {
        $datos = $request->getParsedBody();
        
        // Validaciones
        if (empty($datos['nombre']) || empty($datos['apellido']) || empty($datos['correo'])) {
            $response->getBody()->write(json_encode(['mensaje' => 'Nombre, apellido y correo son obligatorios']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
            $response->getBody()->write(json_encode(['mensaje' => 'Formato de correo inválido']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Validar que el correo no exista
        $usuarioExistente = $this->usuarioModel->obtenerPorEmail($datos['correo']);
        if ($usuarioExistente) {
            $response->getBody()->write(json_encode(['mensaje' => 'El correo ya está registrado']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Generar contraseña temporal si no se proporciona
        $contrasenaTemporal = $datos['contrasena'] ?? $this->generarContrasenaTemporal();
        
        // Validar contraseña
        if (strlen($contrasenaTemporal) < 8) {
            $response->getBody()->write(json_encode(['mensaje' => 'La contraseña debe tener al menos 8 caracteres']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Hash de la contraseña
        $contrasenaHash = password_hash($contrasenaTemporal, PASSWORD_BCRYPT);
        
        // Preparar datos para crear usuario
        $datosUsuario = [
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'correo' => $datos['correo'],
            'contrasena_hash' => $contrasenaHash,
            'rol' => $datos['rol'] ?? 'cliente',
            'telefono' => $datos['telefono'] ?? ''
        ];
        
        try {
            $nuevoId = $this->usuarioModel->crear($datosUsuario);
            $response->getBody()->write(json_encode([
                'mensaje' => 'Usuario creado exitosamente',
                'id' => $nuevoId,
                'contrasena_temporal' => $contrasenaTemporal
            ]));
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            $response->getBody()->write(json_encode(['mensaje' => 'Error al crear usuario: ' . $e->getMessage()]));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }

    public function obtenerUsuarioPorId(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $usuario = $this->usuarioModel->obtenerPorId($id);

        if (!$usuario) {
            $response->getBody()->write(json_encode(['mensaje' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        unset($usuario['contrasena']); // No exponer la contraseña
        $response->getBody()->write(json_encode($usuario));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function actualizarUsuario(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();

        // Asegúrate de no actualizar la contraseña aquí; usa un endpoint dedicado si es necesario
        unset($datos['contrasena']);

        $filasAfectadas = $this->usuarioModel->actualizar($id, $datos);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Usuario no encontrado o sin cambios']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Usuario actualizado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function eliminarUsuario(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $filasAfectadas = $this->usuarioModel->eliminar($id);

        if ($filasAfectadas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Usuario no encontrado']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['mensaje' => 'Usuario eliminado exitosamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function cambiarContrasena(Request $request, Response $response, array $args)
    {
        $id = (int)$args['id'];
        $datos = $request->getParsedBody();
        $nueva = $datos['nueva_contrasena'] ?? '';
        if (strlen($nueva) < 8) {
            $response->getBody()->write(json_encode(['mensaje' => 'La contraseña debe tener al menos 8 caracteres.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        // Validación de contraseña fuerte
        if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/', $nueva)) {
            $response->getBody()->write(json_encode(['mensaje' => 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        $hash = password_hash($nueva, PASSWORD_BCRYPT);
        $filas = $this->usuarioModel->actualizarContrasena($id, $hash);
        if ($filas === 0) {
            $response->getBody()->write(json_encode(['mensaje' => 'Usuario no encontrado o sin cambios']));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }
        $response->getBody()->write(json_encode(['mensaje' => 'Contraseña actualizada correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Obtener pizzas favoritas del usuario autenticado (solo clientes)
     */
    public function obtenerFavoritos(Request $request, Response $response, array $args) {
        $jwt = $request->getAttribute('jwt_data');
        $jwt = getJwtDataFromRequest($request);
        if (!$jwt || ($jwt['rol'] ?? '') !== 'cliente') {
            $response->getBody()->write(json_encode(['error' => 'Solo clientes pueden acceder a favoritos.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $usuario_id = $jwt['id'];
        $favoritos = $this->usuarioModel->obtenerPizzasFavoritas($usuario_id);
        $response->getBody()->write(json_encode($favoritos));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Agregar pizza a favoritos
     */
    public function agregarFavorito(Request $request, Response $response, array $args) {
        $jwt = getJwtDataFromRequest($request);
        if (!$jwt || ($jwt['rol'] ?? '') !== 'cliente') {
            $response->getBody()->write(json_encode(['error' => 'Solo clientes pueden agregar favoritos.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $usuario_id = $jwt['id'];
        $pizza_id = (int)$args['pizza_id'];
        $ok = $this->usuarioModel->agregarPizzaFavorita($usuario_id, $pizza_id);
        $response->getBody()->write(json_encode(['ok' => $ok]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Quitar pizza de favoritos
     */
    public function quitarFavorito(Request $request, Response $response, array $args) {
        error_log('[DEBUG] Entrando a quitarFavorito');
        $jwt = getJwtDataFromRequest($request);
        if (!$jwt || ($jwt['rol'] ?? '') !== 'cliente') {
            $response->getBody()->write(json_encode(['error' => 'Solo clientes pueden quitar favoritos.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $usuario_id = $jwt['id'];
        $pizza_id = (int)$args['pizza_id'];
        error_log("[QuitarFavorito] Usuario: $usuario_id, Pizza: $pizza_id");
        $ok = $this->usuarioModel->quitarPizzaFavorita($usuario_id, $pizza_id);
        error_log("[QuitarFavorito] Resultado: " . var_export($ok, true));
        $response->getBody()->write(json_encode(['ok' => $ok]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Obtener calificaciones del usuario autenticado (solo clientes)
     */
    public function obtenerCalificaciones(Request $request, Response $response, array $args) {
        $jwt = getJwtDataFromRequest($request);
        if (!$jwt || ($jwt['rol'] ?? '') !== 'cliente') {
            $response->getBody()->write(json_encode(['error' => 'Solo clientes pueden ver calificaciones.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $usuario_id = $jwt['id'];
        $calificaciones = $this->usuarioModel->obtenerCalificacionesPizzas($usuario_id);
        $response->getBody()->write(json_encode($calificaciones));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Calificar una pizza
     */
    public function calificarPizza(Request $request, Response $response, array $args) {
        $jwt = getJwtDataFromRequest($request);
        if (!$jwt || ($jwt['rol'] ?? '') !== 'cliente') {
            $response->getBody()->write(json_encode(['error' => 'Solo clientes pueden calificar.']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        $usuario_id = $jwt['id'];
        $pizza_id = (int)$args['pizza_id'];
        $body = $request->getParsedBody();
        $valor = isset($body['calificacion']) ? floatval($body['calificacion']) : null;
        if ($valor === null || $valor < 1 || $valor > 5) {
            $response->getBody()->write(json_encode(['error' => 'La calificación debe ser entre 1 y 5.']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        $ok = $this->usuarioModel->calificarPizza($usuario_id, $pizza_id, $valor);
        $response->getBody()->write(json_encode(['ok' => $ok]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    /**
     * Obtener el top de pizzas mejor calificadas globalmente
     */
    public function obtenerPizzasMejorCalificadas(Request $request, Response $response, array $args) {
        $params = $request->getQueryParams();
        $limit = isset($params['limit']) ? (int)$params['limit'] : 5;
        $result = $this->usuarioModel->obtenerPizzasMejorCalificadas($limit);
        $response->getBody()->write(json_encode($result));
        return $response->withHeader('Content-Type', 'application/json');
    }

    private function generarContrasenaTemporal()
    {
        $caracteres = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $contrasena = '';
        for ($i = 0; $i < 12; $i++) {
            $contrasena .= $caracteres[rand(0, strlen($caracteres) - 1)];
        }
        return $contrasena;
    }
}