<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Modelos/Pedido.php

namespace App\Modelos;

use PDO;

class Pedido
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodos($limit = 50, $offset = 0)
{
    $stmt = $this->db->prepare("SELECT id, usuario_id, nombre_cliente, correo_cliente, telefono_cliente, creado_en, monto_total, estado, estado_pago, metodo_pago, direccion_entrega, notas FROM pedidos ORDER BY creado_en DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

public function obtenerPorId(int $id)
{
    $stmt = $this->db->prepare("SELECT id, usuario_id, nombre_cliente, correo_cliente, telefono_cliente, creado_en, monto_total, estado, estado_pago, metodo_pago, direccion_entrega, notas FROM pedidos WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

    public function obtenerPorUsuarioId(int $usuarioId)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, creado_en, monto_total, estado, estado_pago, metodo_pago, direccion_entrega, notas FROM pedidos WHERE usuario_id = :usuario_id ORDER BY creado_en DESC");
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        $estadosValidos = ['pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'cancelado'];
        // usuario_id es opcional
        $usuario_id = isset($datos['usuario_id']) && is_numeric($datos['usuario_id']) ? $datos['usuario_id'] : null;
        $nombre_cliente = $datos['nombre_cliente'] ?? null;
        $correo_cliente = $datos['correo_cliente'] ?? null;
        $telefono_cliente = $datos['telefono_cliente'] ?? null;
        $metodo_pago = $datos['metodo_pago'] ?? null;
        $estado_pago = $datos['estado_pago'] ?? null;
        if (!isset($datos['monto_total']) || !is_numeric($datos['monto_total']) || $datos['monto_total'] < 0) {
            throw new \InvalidArgumentException('El monto_total debe ser un número positivo.');
        }
        if (!isset($datos['estado']) || !in_array($datos['estado'], $estadosValidos)) {
            throw new \InvalidArgumentException('El estado no es válido.');
        }
        $sql = "INSERT INTO pedidos (usuario_id, monto_total, estado, direccion_entrega, nombre_cliente, correo_cliente, telefono_cliente, metodo_pago, estado_pago, notas) VALUES (:usuario_id, :monto_total, :estado, :direccion_entrega, :nombre_cliente, :correo_cliente, :telefono_cliente, :metodo_pago, :estado_pago, :notas)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':usuario_id', $usuario_id, PDO::PARAM_INT);
        $stmt->bindParam(':monto_total', $datos['monto_total']);
        $stmt->bindParam(':estado', $datos['estado']);
        $stmt->bindParam(':direccion_entrega', $datos['direccion_entrega']);
        $stmt->bindParam(':nombre_cliente', $nombre_cliente);
        $stmt->bindParam(':correo_cliente', $correo_cliente);
        $stmt->bindParam(':telefono_cliente', $telefono_cliente);
        $stmt->bindParam(':metodo_pago', $metodo_pago);
        $stmt->bindParam(':estado_pago', $estado_pago);
        $stmt->bindParam(':notas', $datos['notas']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos)
    {
        $sql = "UPDATE pedidos SET 
            hora_entrega_estimada = :hora_entrega_estimada, 
            hora_entrega_real = :hora_entrega_real
            WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':hora_entrega_estimada', $datos['hora_entrega_estimada']);
        $stmt->bindParam(':hora_entrega_real', $datos['hora_entrega_real']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function actualizarEstado(int $id, string $estado)
    {
        $stmt = $this->db->prepare("UPDATE pedidos SET estado = :estado WHERE id = :id");
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function actualizarEstadoPago(int $id, string $estado_pago)
    {
        $stmt = $this->db->prepare("UPDATE pedidos SET estado_pago = :estado_pago WHERE id = :id");
        $stmt->bindParam(':estado_pago', $estado_pago);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM pedidos WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    // =============================
    // MÉTODO DE REPORTE: Pedidos Diarios
    // =============================
    /**
     * Obtiene la cantidad de pedidos realizados por día, con filtro opcional de fechas.
     * @param string|null $desde Fecha de inicio (YYYY-MM-DD)
     * @param string|null $hasta Fecha de fin (YYYY-MM-DD)
     * @return array
     */
    public function obtenerPedidosDiarios($desde = null, $hasta = null)
    {
        $sql = "SELECT DATE(creado_en) AS fecha, COUNT(*) AS total FROM pedidos";
        $where = [];
        $params = [];
        if ($desde) {
            $where[] = "DATE(creado_en) >= :desde";
            $params[':desde'] = $desde;
        }
        if ($hasta) {
            $where[] = "DATE(creado_en) <= :hasta";
            $params[':hasta'] = $hasta;
        }
        if ($where) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " GROUP BY fecha ORDER BY fecha DESC";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    // =============================
    // MÉTODO DE REPORTE: Pedidos por Estado
    // =============================
    /**
     * Obtiene la cantidad de pedidos agrupados por estado, con filtro opcional de fechas y estado.
     * @param string|null $desde
     * @param string|null $hasta
     * @param string|null $estado
     * @return array
     */
    public function obtenerPedidosPorEstado($desde = null, $hasta = null, $estado = null)
    {
        $sql = "SELECT estado, COUNT(*) AS total FROM pedidos";
        $where = [];
        $params = [];
        if ($desde) {
            $where[] = "DATE(creado_en) >= :desde";
            $params[':desde'] = $desde;
        }
        if ($hasta) {
            $where[] = "DATE(creado_en) <= :hasta";
            $params[':hasta'] = $hasta;
        }
        if ($estado) {
            $where[] = "estado = :estado";
            $params[':estado'] = $estado;
        }
        if ($where) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        $sql .= " GROUP BY estado ORDER BY total DESC";
        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}