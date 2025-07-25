#!/bin/bash

# Obtener la ruta absoluta del directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Iniciando servicios de la Pizzería..."
echo "Directorio del proyecto: $SCRIPT_DIR"
echo ""

echo "Iniciando API Gateway en puerto 8000..."
cd "$SCRIPT_DIR/api_gateway/publico"
php -S localhost:8000 &
GATEWAY_PID=$!

echo "Iniciando Servicio de Usuarios en puerto 8003..."
cd "$SCRIPT_DIR/servicios/servicio_usuarios/publico"
php -S localhost:8003 &
USERS_PID=$!

echo "Iniciando Servicio de Productos en puerto 8002..."
cd "$SCRIPT_DIR/servicios/servicio_productos/publico"
php -S localhost:8002 &
PRODUCTS_PID=$!

echo "Iniciando Servicio de Pedidos en puerto 8004..."
cd "$SCRIPT_DIR/servicios/servicio_pedidos/publico"
php -S localhost:8004 &
ORDERS_PID=$!

echo "Iniciando Servicio de Notificaciones en puerto 8005..."
cd "$SCRIPT_DIR/servicios/servicio_notificaciones/publico"
php -S localhost:8005 &
NOTIFICATIONS_PID=$!

echo "Iniciando Servicio de Chatbot en puerto 8006..."
cd "$SCRIPT_DIR/servicios/servicio_chatbot/publico"
php -S localhost:8006 &
CHATBOT_PID=$!

echo "Iniciando Servicio de Recomendación en puerto 8007..."
cd "$SCRIPT_DIR/servicios/servicio_recomendacion/publico"
php -S localhost:8007 &
RECOMMENDATION_PID=$!

echo ""
echo "Servicios iniciados correctamente!"
echo "   - API Gateway: http://localhost:8000"
echo "   - Servicio Usuarios: http://localhost:8003"
echo "   - Servicio Productos: http://localhost:8002"
echo "   - Servicio Pedidos: http://localhost:8004"
echo "   - Servicio Notificaciones: http://localhost:8005"
echo "   - Servicio Chatbot: http://localhost:8006"
echo "   - Servicio Recomendación: http://localhost:8007"
echo ""
echo "Frontend disponible en: http://localhost/frontend/"
echo ""
echo "Para detener los servicios, presiona Ctrl+C"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "Deteniendo servicios..."
    kill $GATEWAY_PID 2>/dev/null
    kill $USERS_PID 2>/dev/null
    kill $PRODUCTS_PID 2>/dev/null
    kill $ORDERS_PID 2>/dev/null
    kill $NOTIFICATIONS_PID 2>/dev/null
    kill $CHATBOT_PID 2>/dev/null
    kill $RECOMMENDATION_PID 2>/dev/null
    echo "Servicios detenidos"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Mantener el script corriendo
wait 