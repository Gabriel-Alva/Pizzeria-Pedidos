<?php
// sistema_pizzeria/servicios/servicio_recomendacion/src/Modelos/UsuarioPizzaInteraccion.php

namespace App\Modelos;

use PDO;

class UsuarioPizzaInteraccion
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function registrarInteraccion(array $datos)
    {
        if (!isset($datos['usuario_id']) || !is_numeric($datos['usuario_id'])) {
            throw new \InvalidArgumentException('usuario_id es obligatorio y debe ser numérico.');
        }
        if (!isset($datos['pizza_id']) || !is_numeric($datos['pizza_id'])) {
            throw new \InvalidArgumentException('pizza_id es obligatorio y debe ser numérico.');
        }
        if (empty($datos['tipo_interaccion'])) {
            throw new \InvalidArgumentException('El tipo de interacción es obligatorio.');
        }
        $sql = "INSERT INTO usuario_pizza_interacciones (usuario_id, pizza_id, tipo_interaccion) VALUES (:usuario_id, :pizza_id, :tipo_interaccion)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':usuario_id', $datos['usuario_id'], PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $datos['pizza_id'], PDO::PARAM_INT);
        $stmt->bindParam(':tipo_interaccion', $datos['tipo_interaccion']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function obtenerInteraccionesPorUsuario(int $usuarioId, $limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT pizza_id, tipo_interaccion, COUNT(*) as count FROM usuario_pizza_interacciones WHERE usuario_id = :usuario_id GROUP BY pizza_id, tipo_interaccion ORDER BY count DESC LIMIT :limit OFFSET :offset");
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPizzasMasPopulares(int $limit = 5)
    {
        $sql = "SELECT p.id, p.nombre, p.descripcion, p.precio, p.imagen, COUNT(upi.pizza_id) as interacciones_count
                FROM pizzas p
                JOIN usuario_pizza_interacciones upi ON p.id = upi.pizza_id
                GROUP BY p.id, p.nombre, p.descripcion, p.precio, p.imagen
                ORDER BY interacciones_count DESC
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Opcional: Obtener pizzas compradas por un usuario
    public function obtenerPizzasCompradasPorUsuario(int $usuarioId)
    {
        $sql = "SELECT DISTINCT p.id, p.nombre, p.descripcion, p.precio, p.imagen
                FROM pizzas p
                JOIN pedido_items pi ON p.id = pi.pizza_id
                JOIN pedidos pe ON pi.pedido_id = pe.id
                WHERE pe.usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}