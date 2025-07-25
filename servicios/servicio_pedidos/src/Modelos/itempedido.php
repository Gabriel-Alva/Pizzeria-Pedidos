<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Modelos/ItemPedido.php

namespace App\Modelos;

use PDO;

class ItemPedido
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerPorPedidoId(int $pedidoId)
    {
        $stmt = $this->db->prepare("
            SELECT 
                pi.id, pi.pedido_id, pi.pizza_id, pi.cantidad, pi.precio_unitario, pi.precio_total, pi.tamano,
                p.nombre AS nombre_pizza
            FROM pedido_items pi
            INNER JOIN pizzas p ON pi.pizza_id = p.id
            WHERE pi.pedido_id = :pedido_id
        ");
        $stmt->bindParam(':pedido_id', $pedidoId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        $precio_total = $datos['cantidad'] * $datos['precio_unitario'];
        $sql = "INSERT INTO pedido_items (pedido_id, pizza_id, cantidad, precio_unitario, precio_total, tamano) VALUES (:pedido_id, :pizza_id, :cantidad, :precio_unitario, :precio_total, :tamano)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pedido_id', $datos['pedido_id'], PDO::PARAM_INT);
        $stmt->bindParam(':pizza_id', $datos['pizza_id'], PDO::PARAM_INT);
        $stmt->bindParam(':cantidad', $datos['cantidad'], PDO::PARAM_INT);
        $stmt->bindParam(':precio_unitario', $datos['precio_unitario']);
        $stmt->bindParam(':precio_total', $precio_total);
        $stmt->bindParam(':tamano', $datos['tamano']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function eliminarPorPedidoId(int $pedidoId)
    {
        $stmt = $this->db->prepare("DELETE FROM pedido_items WHERE pedido_id = :pedido_id");
        $stmt->bindParam(':pedido_id', $pedidoId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function actualizarInstruccionesEspeciales($pedidoId, $instruccionesArray)
    {
        // $instruccionesArray es un array de instrucciones, en el mismo orden que los items del pedido
        $items = $this->obtenerPorPedidoId($pedidoId);
        foreach ($items as $idx => $item) {
            $instruccion = isset($instruccionesArray[$idx]) ? $instruccionesArray[$idx] : null;
            $stmt = $this->db->prepare("UPDATE pedido_items SET instrucciones_especiales = :instruccion WHERE id = :id");
            $stmt->bindParam(':instruccion', $instruccion);
            $stmt->bindParam(':id', $item['id'], PDO::PARAM_INT);
            $stmt->execute();
        }
    }

    // =============================
    // MÉTODO DE REPORTE: Pizzas más pedidas
    // =============================
    /**
     * Obtiene el ranking de pizzas más pedidas, con filtro opcional de fechas y top N.
     * @param string|null $desde Fecha de inicio (YYYY-MM-DD)
     * @param string|null $hasta Fecha de fin (YYYY-MM-DD)
     * @param int $top Número máximo de resultados (por defecto 10)
     * @return array
     */
    public function obtenerPizzasMasPedidas($desde = null, $hasta = null, $top = 10)
    {
        $sql = "SELECT p.nombre AS nombre, SUM(i.cantidad) AS cantidad
                FROM pedido_items i
                INNER JOIN pizzas p ON i.pizza_id = p.id
                INNER JOIN pedidos pe ON i.pedido_id = pe.id";
        $where = [];
        $params = [];
        if ($desde) {
            $where[] = "DATE(pe.creado_en) >= :desde";
            $params[':desde'] = $desde;
        }
        if ($hasta) {
            $where[] = "DATE(pe.creado_en) <= :hasta";
            $params[':hasta'] = $hasta;
        }
        if ($where) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " GROUP BY p.nombre ORDER BY cantidad DESC LIMIT :top";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':top', (int)$top, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}