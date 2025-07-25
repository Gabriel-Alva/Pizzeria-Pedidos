<?php
// sistema_pizzeria/servicios/servicio_recomendacion/src/Servicios/ServicioLogicaRecomendacion.php

namespace App\Servicios;

use App\Modelos\UsuarioPizzaInteraccion;
use App\Modelos\Pizza;

class ServicioLogicaRecomendacion
{
    private $interaccionModel;
    private $pizzaModel;

    public function __construct(UsuarioPizzaInteraccion $interaccionModel, Pizza $pizzaModel)
    {
        $this->interaccionModel = $interaccionModel;
        $this->pizzaModel = $pizzaModel;
    }

    /**
     * Genera recomendaciones de pizzas para un usuario.
     * Lógica simple:
     * 1. Recomendar pizzas que el usuario ha comprado antes (si aplica).
     * 2. Recomendar pizzas basadas en las interacciones (vistas, favoritas) del usuario.
     * 3. Si no hay suficientes datos de usuario, recomendar las pizzas más populares.
     * 4. Asegurarse de no recomendar la misma pizza varias veces ni pizzas no disponibles.
     */
    public function obtenerRecomendacionesParaUsuario(int $usuarioId, int $limit = 5): array
    {
        $recomendaciones = [];
        $pizzasYaRecomendadas = [];

        // 1. Pizzas compradas anteriormente por el usuario (fuerte señal de preferencia)
        $pizzasCompradas = $this->interaccionModel->obtenerPizzasCompradasPorUsuario($usuarioId);
        foreach ($pizzasCompradas as $pizza) {
            if (!isset($pizzasYaRecomendadas[$pizza['id']])) {
                $recomendaciones[] = $pizza;
                $pizzasYaRecomendadas[$pizza['id']] = true;
                if (count($recomendaciones) >= $limit) break;
            }
        }

        // 2. Basado en otras interacciones del usuario (vistas, favoritas, likes)
        if (count($recomendaciones) < $limit) {
            $interacciones = $this->interaccionModel->obtenerInteraccionesPorUsuario($usuarioId);
            $interaccionesAgrupadas = [];
            foreach ($interacciones as $interaccion) {
                $pizzaId = $interaccion['pizza_id'];
                $tipo = $interaccion['tipo_interaccion'];
                $count = $interaccion['count'];

                if (!isset($interaccionesAgrupadas[$pizzaId])) {
                    $interaccionesAgrupadas[$pizzaId] = 0;
                }

                // Asignar un peso a los tipos de interacción
                if ($tipo === 'comprada') $interaccionesAgrupadas[$pizzaId] += $count * 5;
                elseif ($tipo === 'favorita') $interaccionesAgrupadas[$pizzaId] += $count * 3;
                elseif ($tipo === 'like') $interaccionesAgrupadas[$pizzaId] += $count * 2;
                elseif ($tipo === 'vista') $interaccionesAgrupadas[$pizzaId] += $count * 1;
            }

            arsort($interaccionesAgrupadas); // Ordenar por puntuación de interacción

            $idsParaConsultar = [];
            foreach ($interaccionesAgrupadas as $pizzaId => $score) {
                if (!isset($pizzasYaRecomendadas[$pizzaId])) {
                    $idsParaConsultar[] = $pizzaId;
                }
            }

            // Obtener detalles de las pizzas interaccionadas que aún no se han recomendado
            if (!empty($idsParaConsultar)) {
                $pizzasInteraccionadas = $this->pizzaModel->obtenerPorIds($idsParaConsultar);
                foreach ($pizzasInteraccionadas as $pizza) {
                    if ($pizza['disponible'] && !isset($pizzasYaRecomendadas[$pizza['id']])) {
                        $recomendaciones[] = $pizza;
                        $pizzasYaRecomendadas[$pizza['id']] = true;
                        if (count($recomendaciones) >= $limit) break;
                    }
                }
            }
        }

        // 3. Si aún no tenemos suficientes, añadir pizzas populares
        if (count($recomendaciones) < $limit) {
            $pizzasPopulares = $this->interaccionModel->obtenerPizzasMasPopulares($limit);
            foreach ($pizzasPopulares as $pizza) {
                if ($pizza['disponible'] && !isset($pizzasYaRecomendadas[$pizza['id']])) {
                    $recomendaciones[] = $pizza;
                    $pizzasYaRecomendadas[$pizza['id']] = true;
                    if (count($recomendaciones) >= $limit) break;
                }
            }
        }

        // 4. Si aún faltan, añadir pizzas disponibles aleatorias (o las primeras disponibles)
        if (count($recomendaciones) < $limit) {
            $pizzasDisponibles = $this->pizzaModel->obtenerTodasDisponibles();
            shuffle($pizzasDisponibles); // Mezclar para aleatoriedad
            foreach ($pizzasDisponibles as $pizza) {
                if (!isset($pizzasYaRecomendadas[$pizza['id']])) {
                    $recomendaciones[] = $pizza;
                    $pizzasYaRecomendadas[$pizza['id']] = true;
                    if (count($recomendaciones) >= $limit) break;
                }
            }
        }

        return array_slice($recomendaciones, 0, $limit); // Asegurarse del límite exacto
    }

    public function registrarInteraccion(int $usuarioId, int $pizzaId, string $tipoInteraccion)
    {
        return $this->interaccionModel->registrarInteraccion([
            'usuario_id' => $usuarioId,
            'pizza_id' => $pizzaId,
            'tipo_interaccion' => $tipoInteraccion
        ]);
    }
}