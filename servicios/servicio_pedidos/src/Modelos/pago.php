<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Modelos/Pago.php

namespace App\Modelos;

use PDO;

class Pago
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerPorPedidoId(int $pedidoId)
    {
        $stmt = $this->db->prepare("SELECT id, pedido_id, monto, metodo_pago, estado_pago FROM pagos WHERE pedido_id = :pedido_id");
        $stmt->bindParam(':pedido_id', $pedidoId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        $estadosValidos = ['pendiente', 'pagado', 'fallido', 'cancelado'];
        if (!isset($datos['pedido_id']) || !is_numeric($datos['pedido_id'])) {
            throw new \InvalidArgumentException('pedido_id es obligatorio y debe ser numérico.');
        }
        if (!isset($datos['monto']) || !is_numeric($datos['monto']) || $datos['monto'] < 0) {
            throw new \InvalidArgumentException('El monto debe ser un número positivo.');
        }
        if (empty($datos['metodo_pago'])) {
            throw new \InvalidArgumentException('El método de pago es obligatorio.');
        }
        if (!isset($datos['estado_pago']) || !in_array($datos['estado_pago'], $estadosValidos)) {
            throw new \InvalidArgumentException('El estado de pago no es válido.');
        }
        $sql = "INSERT INTO pagos (pedido_id, monto, metodo_pago, estado_pago) VALUES (:pedido_id, :monto, :metodo_pago, :estado_pago)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pedido_id', $datos['pedido_id'], PDO::PARAM_INT);
        $stmt->bindParam(':monto', $datos['monto']);
        $stmt->bindParam(':metodo_pago', $datos['metodo_pago']);
        $stmt->bindParam(':estado_pago', $datos['estado_pago']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizarEstado(int $id, string $estado)
    {
        $estadosValidos = ['pendiente', 'pagado', 'fallido', 'cancelado'];
        if (!in_array($estado, $estadosValidos)) {
            throw new \InvalidArgumentException('El estado de pago no es válido.');
        }
        $stmt = $this->db->prepare("UPDATE pagos SET estado_pago = :estado_pago WHERE id = :id");
        $stmt->bindParam(':estado_pago', $estado_pago);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}