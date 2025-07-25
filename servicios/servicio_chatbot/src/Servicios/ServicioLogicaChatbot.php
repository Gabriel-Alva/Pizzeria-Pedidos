<?php
// sistema_pizzeria/servicios/servicio_chatbot/src/Servicios/ServicioLogicaChatbot.php

namespace App\Servicios;

class ServicioLogicaChatbot
{
    // Este método simulará la lógica de un chatbot
    public function procesarMensaje(string $mensajeUsuario): string
    {
        $mensajeUsuario = strtolower(trim($mensajeUsuario));

        if (str_contains($mensajeUsuario, 'hola') || str_contains($mensajeUsuario, 'saludos')) {
            return "¡Hola! ¿En qué puedo ayudarte hoy?";
        } elseif (str_contains($mensajeUsuario, 'menu') || str_contains($mensajeUsuario, 'pizzas')) {
            return "Puedes ver nuestro menú de pizzas en la sección 'Pizzas' de nuestra web. Tenemos Pepperoni, Hawaiana, Vegetariana, y muchas más.";
        } elseif (str_contains($mensajeUsuario, 'pedido') || str_contains($mensajeUsuario, 'estado')) {
            return "Para consultar el estado de tu pedido, por favor ve a la sección 'Mis Pedidos' y busca tu número de pedido.";
        } elseif (str_contains($mensajeUsuario, 'direccion') || str_contains($mensajeUsuario, 'ubicacion')) {
            return "Estamos ubicados en Av. Siempre Viva 742. ¡Te esperamos!";
        } elseif (str_contains($mensajeUsuario, 'horario') || str_contains($mensajeUsuario, 'abren')) {
            return "Nuestro horario de atención es de Lunes a Domingo, de 12:00 PM a 11:00 PM.";
        } elseif (str_contains($mensajeUsuario, 'gracias') || str_contains($mensajeUsuario, 'adios')) {
            return "De nada. ¡Que tengas un gran día!";
        } else {
            return "Lo siento, no entiendo tu pregunta. ¿Podrías reformularla o preguntar algo sobre nuestro menú o pedidos?";
        }
    }
}