<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Modelos/Usuario.php

namespace App\Modelos;

use PDO;

class Usuario
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodos($limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, apellido, correo, rol, telefono FROM usuarios LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, apellido, correo, rol, telefono FROM usuarios WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function obtenerPorEmail(string $email)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, apellido, correo, contrasena_hash, rol, telefono FROM usuarios WHERE correo = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        // Validación básica de email
        if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Email inválido.');
        }
        // La validación de contraseña ya se hace en el controlador, no duplicar aquí
        $sql = "INSERT INTO usuarios (nombre, apellido, correo, contrasena_hash, rol, telefono) VALUES (:nombre, :apellido, :correo, :contrasena_hash, :rol, :telefono)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':apellido', $datos['apellido']);
        $stmt->bindParam(':correo', $datos['correo']);
        $stmt->bindParam(':contrasena_hash', $datos['contrasena_hash']);
        $stmt->bindParam(':rol', $datos['rol']);
        $stmt->bindParam(':telefono', $datos['telefono']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos)
    {
        $sql = "UPDATE usuarios SET nombre = :nombre, apellido = :apellido, correo = :correo, rol = :rol, telefono = :telefono WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':apellido', $datos['apellido']);
        $stmt->bindParam(':correo', $datos['correo']);
        $stmt->bindParam(':rol', $datos['rol']);
        $stmt->bindParam(':telefono', $datos['telefono']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function actualizarContrasena(int $id, string $nuevaContrasenaHasheada)
    {
        $stmt = $this->db->prepare("UPDATE usuarios SET contrasena_hash = :contrasena_hash WHERE id = :id");
        $stmt->bindParam(':contrasena_hash', $nuevaContrasenaHasheada);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM usuarios WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // ===== FAVORITOS =====
    /**
     * Obtener IDs de pizzas favoritas del usuario
     */
    public function obtenerPizzasFavoritas($usuario_id) {
        $stmt = $this->db->prepare("SELECT pizza_id FROM pizzas_favoritas WHERE usuario_id = :usuario_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->execute();
        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'pizza_id');
    }

    /**
     * Agregar una pizza a favoritos
     */
    public function agregarPizzaFavorita($usuario_id, $pizza_id) {
        // Evitar duplicados
        $stmt = $this->db->prepare("SELECT id FROM pizzas_favoritas WHERE usuario_id = :usuario_id AND pizza_id = :pizza_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $pizza_id, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->fetch()) return false;
        $stmt = $this->db->prepare("INSERT INTO pizzas_favoritas (usuario_id, pizza_id) VALUES (:usuario_id, :pizza_id)");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $pizza_id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    /**
     * Quitar una pizza de favoritos
     */
    public function quitarPizzaFavorita($usuario_id, $pizza_id) {
        error_log("[Modelo] Ejecutando DELETE favorito usuario_id=$usuario_id, pizza_id=$pizza_id");
        $stmt = $this->db->prepare("DELETE FROM pizzas_favoritas WHERE usuario_id = :usuario_id AND pizza_id = :pizza_id");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $pizza_id, PDO::PARAM_INT);
        $result = $stmt->execute();
        error_log("[Modelo] DELETE ejecutado, filas afectadas: " . $stmt->rowCount());
        return $result;
    }

    // ===== CALIFICACIONES =====
    /**
     * Obtener calificaciones del usuario (pizza_id => valor)
     */
    public function obtenerCalificacionesPizzas($usuario_id) {
        $stmt = $this->db->prepare("SELECT pizza_id, valor_interaccion FROM usuario_pizza_interacciones WHERE usuario_id = :usuario_id AND tipo_interaccion = 'calificacion'");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->execute();
        $result = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $result[$row['pizza_id']] = $row['valor_interaccion'];
        }
        return $result;
    }

    /**
     * Guardar o actualizar calificación de una pizza
     */
    public function calificarPizza($usuario_id, $pizza_id, $valor) {
        // Verificar si ya existe una calificación
        $stmt = $this->db->prepare("SELECT id FROM usuario_pizza_interacciones WHERE usuario_id = :usuario_id AND pizza_id = :pizza_id AND tipo_interaccion = 'calificacion'");
        $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $pizza_id, PDO::PARAM_INT);
        $stmt->execute();
        if ($row = $stmt->fetch()) {
            // Actualizar
            $stmt = $this->db->prepare("UPDATE usuario_pizza_interacciones SET valor_interaccion = :valor WHERE id = :id");
            $stmt->bindParam(':valor', $valor);
            $stmt->bindParam(':id', $row['id'], PDO::PARAM_INT);
            return $stmt->execute();
        } else {
            // Insertar
            $stmt = $this->db->prepare("INSERT INTO usuario_pizza_interacciones (usuario_id, pizza_id, tipo_interaccion, valor_interaccion) VALUES (:usuario_id, :pizza_id, 'calificacion', :valor)");
            $stmt->bindParam(':usuario_id', $usuario_id, PDO::PARAM_INT);
            $stmt->bindParam(':pizza_id', $pizza_id, PDO::PARAM_INT);
            $stmt->bindParam(':valor', $valor);
            return $stmt->execute();
        }
    }

    /**
     * Obtener el top de pizzas mejor calificadas globalmente
     */
    public function obtenerPizzasMejorCalificadas($limit = 5) {
        $stmt = $this->db->prepare("SELECT pizza_id, AVG(valor_interaccion) as promedio, COUNT(*) as total_votos FROM usuario_pizza_interacciones WHERE tipo_interaccion = 'calificacion' GROUP BY pizza_id HAVING total_votos >= 1 ORDER BY promedio DESC, total_votos DESC LIMIT :limit");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}