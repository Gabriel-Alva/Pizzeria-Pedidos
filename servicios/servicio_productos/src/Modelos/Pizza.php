<?php
// sistema_pizzeria/servicios/servicio_productos/src/Modelos/Pizza.php

namespace App\Modelos;

use PDO;

class Pizza
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerTodas($limit = 50, $offset = 0)
    {
        // En obtenerTodas
$stmt = $this->db->prepare("SELECT id, nombre, descripcion, precio, url_imagen, disponible, ingredientes, categoria FROM pizzas LIMIT :limit OFFSET :offset");


        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id)
    {
       // En obtenerPorId
$stmt = $this->db->prepare("SELECT id, nombre, descripcion, precio, url_imagen, disponible, ingredientes, categoria FROM pizzas WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crear(array $datos)
    {
        if (empty($datos['nombre'])) {
            throw new \InvalidArgumentException('El nombre es obligatorio.');
        }
        if (!isset($datos['precio']) || !is_numeric($datos['precio']) || $datos['precio'] < 0) {
            throw new \InvalidArgumentException('El precio debe ser un número positivo.');
        }
        if (!isset($datos['disponible']) || !is_bool($datos['disponible'])) {
            throw new \InvalidArgumentException('El campo disponible debe ser booleano.');
        }
        $sql = "INSERT INTO pizzas (nombre, descripcion, precio, url_imagen, disponible) VALUES (:nombre, :descripcion, :precio, :url_imagen, :disponible)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':descripcion', $datos['descripcion']);
        $stmt->bindParam(':precio', $datos['precio']);
        $stmt->bindParam(':url_imagen', $datos['url_imagen']);
        $stmt->bindParam(':disponible', $datos['disponible'], PDO::PARAM_BOOL);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos)
    {
        $sql = "UPDATE pizzas SET nombre = :nombre, descripcion = :descripcion, precio = :precio, url_imagen = :url_imagen, disponible = :disponible, ingredientes = :ingredientes, categoria = :categoria WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':nombre', $datos['nombre']);
        $stmt->bindParam(':descripcion', $datos['descripcion']);
        $stmt->bindParam(':precio', $datos['precio']);
        $stmt->bindParam(':url_imagen', $datos['url_imagen']);
        $stmt->bindParam(':disponible', $datos['disponible'], PDO::PARAM_BOOL);
        $stmt->bindParam(':ingredientes', $datos['ingredientes']);
        $stmt->bindParam(':categoria', $datos['categoria']);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function eliminar(int $id)
    {
        $stmt = $this->db->prepare("DELETE FROM pizzas WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount();
    }
}