# 🚀 Instrucciones para Iniciar los Servicios

## 📋 Requisitos Previos
- XAMPP instalado y funcionando
- PHP 8.0 o superior
- Composer instalado
- Base de datos `pizzeria_bd` creada y configurada

## 🔧 Configuración de Puertos

Los servicios están configurados para correr en los siguientes puertos:

| Servicio | Puerto | URL |
|----------|--------|-----|
| API Gateway | 8000 | http://localhost:8000 |
| Servicio Productos | 8002 | http://localhost:8002 |
| Servicio Usuarios | 8003 | http://localhost:8003 |
| **Servicio Pedidos** | **8004** | **http://localhost:8004** |
| Servicio Notificaciones | 8005 | http://localhost:8005 |
| Servicio Chatbot | 8006 | http://localhost:8006 |
| Servicio Recomendación | 8007 | http://localhost:8007 |

## 🚀 Iniciar Servicios

### Opción 1: Usando el script automático
```bash
# En la raíz del proyecto
./iniciar_servicios.sh
```

### Opción 2: Iniciar manualmente

#### 1. API Gateway (Puerto 8000)
```bash
cd api_gateway
php -S localhost:8000 -t publico
```

#### 2. Servicio Productos (Puerto 8002)
```bash
cd servicios/servicio_productos
php -S localhost:8002 -t publico
```

#### 3. Servicio Usuarios (Puerto 8003)
```bash
cd servicios/servicio_usuarios
php -S localhost:8003 -t publico
```

#### 4. Servicio Pedidos (Puerto 8004) ⭐
```bash
cd servicios/servicio_pedidos
php -S localhost:8004 -t publico
```

#### 5. Servicio Notificaciones (Puerto 8005)
```bash
cd servicios/servicio_notificaciones
php -S localhost:8005 -t publico
```

#### 6. Servicio Chatbot (Puerto 8006)
```bash
cd servicios/servicio_chatbot
php -S localhost:8006 -t publico
```

#### 7. Servicio Recomendación (Puerto 8007)
```bash
cd servicios/servicio_recomendacion
php -S localhost:8007 -t publico
```

## 🔍 Verificar Servicios

Para verificar que todos los servicios estén funcionando:

1. Abre la consola del navegador (F12)
2. Ejecuta el script de verificación:
```javascript
// Copia y pega el contenido de verificar_servicios.js en la consola
```

O visita directamente:
- http://localhost:8000 (API Gateway)
- http://localhost:8004 (Servicio Pedidos)

## 🛠️ Solución de Problemas

### Error: Puerto ya en uso
```bash
# En Windows (PowerShell)
netstat -ano | findstr :8004
taskkill /PID [PID] /F

# En Linux/Mac
lsof -ti:8004 | xargs kill -9
```

### Error: Base de datos no conecta
1. Verifica que XAMPP esté corriendo
2. Verifica que la base de datos `pizzeria_bd` exista
3. Verifica las credenciales en `configuracion/base_de_datos.php`

### Error: CORS
Los servicios ya están configurados con CORS, pero si persisten problemas:
1. Verifica que el API Gateway esté corriendo en el puerto 8000
2. Verifica que las rutas públicas estén configuradas correctamente

## 📱 Acceder al Panel de Administración

1. Inicia todos los servicios
2. Abre http://localhost:8000 en tu navegador
3. Navega a `frontend/panel_admin.html`
4. Inicia sesión con credenciales de administrador

## 🎯 Funcionalidades del Panel de Pedidos

✅ **Visualizar todos los pedidos**
✅ **Cambiar estado de pedidos** (pendiente → confirmado → preparando → listo → entregado)
✅ **Ver detalles completos** de cada pedido
✅ **Eliminar pedidos** (con confirmación)
✅ **Notificaciones visuales** de acciones
✅ **Diseño responsive** para móviles

## 🔐 Autenticación

El panel requiere autenticación de administrador. Las peticiones incluyen automáticamente el token JWT para autenticación. 