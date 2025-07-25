<?php
// sistema_pizzeria/servicios/servicio_productos/src/Modelos/Ingrediente.php

namespace App\Modelos;

use PDO;

class Ingrediente
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodos($limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, stock FROM ingredientes LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, stock FROM ingredientes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        if (empty($datos['nombre'])) {
            throw new \InvalidArgumentException('El nombre es obligatorio.');
        }
        if (!isset($datos['stock']) || !is_numeric($datos['stock']) || $datos['stock'] < 0) {
            throw new \InvalidArgumentException('El stock debe ser un número positivo.');
        }
        $sql = "INSERT INTO ingredientes (nombre, stock) VALUES (:nombre, :stock)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':stock', $datos['stock'], PDO::PARAM_INT);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos)
    {
        $sql = "UPDATE ingredientes SET nombre = :nombre, stock = :stock WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':stock', $datos['stock'], PDO::PARAM_INT);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM ingredientes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}