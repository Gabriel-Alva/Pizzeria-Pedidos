# Instrucciones para la Base de Datos Existente

## Base de Datos Actual
Tu base de datos `pizzeria_bd` ya está configurada y contiene todas las tablas necesarias. El archivo `127_0_0_1.sql` que proporcionaste incluye:

### Tablas Principales:
- **usuarios**: Almacena información de usuarios y clientes
- **pizzas**: Catálogo de pizzas disponibles
- **pedidos**: Información de pedidos
- **pedido_items**: Items individuales de cada pedido
- **ingredientes**: Ingredientes disponibles
- **pizza_ingredientes**: Relación entre pizzas e ingredientes
- **notificaciones**: Sistema de notificaciones
- **pagos**: Información de pagos
- **interacciones_chatbot**: Historial de interacciones con el chatbot
- **usuario_pizza_interacciones**: Interacciones de usuarios con pizzas

## Cambios Realizados en el Código

### 1. Modelo Usuario Actualizado
- Cambiado `email` por `correo`
- Cambiado `contrasena` por `contrasena_hash`
- Agregados campos `nombre` y `apellido` directamente
- Eliminada referencia a `cliente_id`
- Agregado campo `telefono`

### 2. Servicio de Autenticación Actualizado
- Actualizada la verificación de contraseñas para usar `contrasena_hash`
- Actualizada la generación de JWT para usar `correo`
- Simplificado el proceso de registro (sin tabla clientes separada)

### 3. Controlador de Autenticación Simplificado
- Eliminada dependencia del modelo Cliente
- Registro directo en tabla usuarios
- Manejo simplificado de datos de cliente

## Pasos para Probar el Sistema

### 1. Verificar la Base de Datos
```sql
-- Verificar que la base de datos existe
SHOW DATABASES LIKE 'pizzeria_bd';

-- Verificar que las tablas existen
USE pizzeria_bd;
SHOW TABLES;

-- Verificar estructura de la tabla usuarios
DESCRIBE usuarios;
```

### 2. Instalar Dependencias
```bash
# En cada servicio
cd servicios/servicio_usuarios
composer install

cd ../servicio_productos
composer install

cd ../servicio_pedidos
composer install

# ... etc para todos los servicios
```

### 3. Iniciar los Servicios
```bash
# Usar uno de los scripts disponibles
./iniciar_servicios.sh
# o
.\iniciar_servicios.ps1
# o
iniciar_servicios.bat
```

### 4. Probar el Registro
1. Abrir `frontend/registro.html` en el navegador
2. Llenar el formulario con:
   - Nombre: "Juan"
   - Apellido: "Pérez"
   - Email: "juan@ejemplo.com"
   - Contraseña: "Password123" (debe cumplir los requisitos)
   - Teléfono: "123456789" (opcional)
   - Dirección: "Calle Principal 123" (opcional)

### 5. Probar el Login
1. Abrir `frontend/login.html` en el navegador
2. Usar las credenciales del usuario registrado

## Estructura de la Tabla Usuarios

```sql
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol ENUM('cliente', 'administrador') DEFAULT 'cliente',
    telefono VARCHAR(20) DEFAULT NULL,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Notas Importantes

1. **Contraseñas**: Deben cumplir los requisitos de seguridad (8+ caracteres, mayúscula, minúscula, número)
2. **Emails**: Deben ser únicos en la base de datos
3. **Roles**: Por defecto todos los usuarios nuevos son 'cliente'
4. **Conexión**: La configuración apunta a `127.0.0.1` en lugar de `localhost`

## Solución de Problemas

### Error de Conexión
- Verificar que XAMPP esté ejecutándose
- Verificar que MySQL esté activo en el puerto 3306
- Verificar la configuración en `configuracion/base_de_datos.php`

### Error de Registro
- Verificar que la tabla `usuarios` existe
- Verificar que los campos coinciden con la estructura
- Revisar los logs de error en la consola del navegador

### Error de Login
- Verificar que el usuario existe en la base de datos
- Verificar que la contraseña cumple los requisitos
- Verificar que el hash de la contraseña se generó correctamente 