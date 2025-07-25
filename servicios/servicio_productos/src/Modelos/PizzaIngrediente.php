<?php
// sistema_pizzeria/servicios/servicio_productos/src/Modelos/PizzaIngrediente.php

namespace App\Modelos;

use PDO;

class PizzaIngrediente
{
    private $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function obtenerPorPizzaId(int $pizzaId)
    {
        $stmt = $this->db->prepare("SELECT pi.ingrediente_id, i.nombre FROM pizza_ingredientes pi JOIN ingredientes i ON pi.ingrediente_id = i.id WHERE pi.pizza_id = :pizza_id");
        $stmt->bindParam(':pizza_id', $pizzaId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function agregarIngredienteAPizza(int $pizzaId, int $ingredienteId)
    {
        $sql = "INSERT INTO pizza_ingredientes (pizza_id, ingrediente_id) VALUES (:pizza_id, :ingrediente_id)";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':pizza_id', $pizzaId, PDO::PARAM_INT);
        $stmt->bindParam(':ingrediente_id', $ingredienteId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

    public function eliminarIngredienteDePizza(int $pizzaId, int $ingredienteId)
    {
        $stmt = $this->db->prepare("DELETE FROM pizza_ingredientes WHERE pizza_id = :pizza_id AND ingrediente_id = :ingrediente_id");
        $stmt->bindParam(':pizza_id', $pizzaId, PDO::PARAM_INT);
        $stmt->bindParam(':ingrediente_id', $ingredienteId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
}