<?php
// sistema_pizzeria/servicios/servicio_notificaciones/src/Modelos/Notificacion.php

namespace App\Modelos;

use PDO;

class Notificacion
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodas($limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, tipo, mensaje, leida, fecha_creacion FROM notificaciones ORDER BY fecha_creacion DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorUsuarioId(int $usuarioId)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, tipo, mensaje, leida, fecha_creacion FROM notificaciones WHERE usuario_id = :usuario_id ORDER BY fecha_creacion DESC");
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerNoLeidasPorUsuarioId(int $usuarioId)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, tipo, mensaje, leida, fecha_creacion FROM notificaciones WHERE usuario_id = :usuario_id AND leida = 0 ORDER BY fecha_creacion DESC");
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        if (!isset($datos['usuario_id']) || !is_numeric($datos['usuario_id'])) {
            throw new \InvalidArgumentException('usuario_id es obligatorio y debe ser numérico.');
        }
        if (empty($datos['tipo'])) {
            throw new \InvalidArgumentException('El tipo es obligatorio.');
        }
        if (empty($datos['mensaje'])) {
            throw new \InvalidArgumentException('El mensaje es obligatorio.');
        }
        $sql = "INSERT INTO notificaciones (usuario_id, tipo, mensaje) VALUES (:usuario_id, :tipo, :mensaje)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':usuario_id', $datos['usuario_id'], PDO::PARAM_INT);
        $stmt->bindParam(':tipo', $datos['tipo']);
        $stmt->bindParam(':mensaje', $datos['mensaje']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function marcarComoLeida(int $id)
    {
        $stmt = $this->db->prepare("UPDATE notificaciones SET leida = 1 WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM notificaciones WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}