<?php
// sistema_pizzeria/servicios/servicio_recomendacion/src/Modelos/Pizza.php

namespace App\Modelos;

use PDO;

class Pizza
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerPorIds(array $ids)
    {
        if (empty($ids)) {
            return [];
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "SELECT id, nombre, descripcion, precio, imagen, disponible FROM pizzas WHERE id IN ($placeholders)";
        $stmt = $this->db->prepare($sql);
        foreach ($ids as $key => $id) {
            $stmt->bindValue(($key + 1), $id, PDO::PARAM_INT);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerTodasDisponibles()
    {
        $stmt = $this->db->query("SELECT id, nombre, descripcion, precio, imagen, disponible FROM pizzas WHERE disponible = 1");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}