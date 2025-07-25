<?php
// sistema_pizzeria/servicios/servicio_chatbot/src/Modelos/InteraccionChatbot.php

namespace App\Modelos;

use PDO;

class InteraccionChatbot
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodas($limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, mensaje_usuario, respuesta_chatbot, fecha_interaccion FROM interacciones_chatbot ORDER BY fecha_interaccion DESC LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorUsuarioId(int $usuarioId)
    {
        $stmt = $this->db->prepare("SELECT id, usuario_id, mensaje_usuario, respuesta_chatbot, fecha_interaccion FROM interacciones_chatbot WHERE usuario_id = :usuario_id ORDER BY fecha_interaccion DESC");
        $stmt->bindParam(':usuario_id', $usuarioId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        if (isset($datos['usuario_id']) && !is_null($datos['usuario_id']) && !is_numeric($datos['usuario_id'])) {
            throw new \InvalidArgumentException('usuario_id debe ser numérico si se proporciona.');
        }
        if (empty($datos['mensaje_usuario'])) {
            throw new \InvalidArgumentException('El mensaje del usuario es obligatorio.');
        }
        if (empty($datos['respuesta_chatbot'])) {
            throw new \InvalidArgumentException('La respuesta del chatbot es obligatoria.');
        }
        $sql = "INSERT INTO interacciones_chatbot (usuario_id, mensaje_usuario, respuesta_chatbot) VALUES (:usuario_id, :mensaje_usuario, :respuesta_chatbot)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':usuario_id', $datos['usuario_id'], PDO::PARAM_INT);
        $stmt->bindParam(':mensaje_usuario', $datos['mensaje_usuario']);
        $stmt->bindParam(':respuesta_chatbot', $datos['respuesta_chatbot']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }
}