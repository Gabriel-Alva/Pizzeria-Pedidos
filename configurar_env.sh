#!/bin/bash

echo "Configurando archivos .env..."

# Obtener la ruta absoluta del directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copiar archivos env.example a .env
cp "$SCRIPT_DIR/api_gateway/env.example" "$SCRIPT_DIR/api_gateway/.env"
cp "$SCRIPT_DIR/servicios/servicio_usuarios/env.example" "$SCRIPT_DIR/servicios/servicio_usuarios/.env"
cp "$SCRIPT_DIR/servicios/servicio_productos/env.example" "$SCRIPT_DIR/servicios/servicio_productos/.env"
cp "$SCRIPT_DIR/servicios/servicio_pedidos/env.example" "$SCRIPT_DIR/servicios/servicio_pedidos/.env"
cp "$SCRIPT_DIR/servicios/servicio_notificaciones/env.example" "$SCRIPT_DIR/servicios/servicio_notificaciones/.env"
cp "$SCRIPT_DIR/servicios/servicio_chatbot/env.example" "$SCRIPT_DIR/servicios/servicio_chatbot/.env"
cp "$SCRIPT_DIR/servicios/servicio_recomendacion/env.example" "$SCRIPT_DIR/servicios/servicio_recomendacion/.env"

echo "Archivos .env configurados correctamente!"
echo ""
echo "Recuerda:"
echo "- Verificar que XAMPP esté ejecutándose"
echo "- Importar pizzeria_bd.sql en phpMyAdmin"
echo "- Ejecutar ./iniciar_servicios.sh para iniciar los servicios"
echo "" 