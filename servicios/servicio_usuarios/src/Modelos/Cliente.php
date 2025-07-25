<?php
// sistema_pizzeria/servicios/servicio_usuarios/src/Modelos/Cliente.php

namespace App\Modelos;

use PDO;

class Cliente
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodos($limit = 50, $offset = 0)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, apellido, correo, telefono, direccion FROM clientes LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id)
    {
        $stmt = $this->db->prepare("SELECT id, nombre, apellido, correo, telefono, direccion FROM clientes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        // Validación básica de email
        if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Email inválido.');
        }
        if (empty($datos['nombre'])) {
            throw new \InvalidArgumentException('El nombre es obligatorio.');
        }
        $sql = "INSERT INTO clientes (nombre, apellido, correo, telefono, direccion) VALUES (:nombre, :apellido, :correo, :telefono, :direccion)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':apellido', $datos['apellido']);
        $stmt->bindParam(':correo', $datos['correo']);
        $stmt->bindParam(':telefono', $datos['telefono']);
        $stmt->bindParam(':direccion', $datos['direccion']);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos)
    {
        $sql = "UPDATE clientes SET nombre = :nombre, apellido = :apellido, correo = :correo, telefono = :telefono, direccion = :direccion WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':apellido', $datos['apellido']);
        $stmt->bindParam(':correo', $datos['correo']);
        $stmt->bindParam(':telefono', $datos['telefono']);
        $stmt->bindParam(':direccion', $datos['direccion']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM clientes WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}