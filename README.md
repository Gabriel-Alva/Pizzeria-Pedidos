# Sistema de Pizzería - Microservicios

## Resumen Ejecutivo

El Sistema de Pizzería es una plataforma web completa basada en arquitectura de microservicios que permite la gestión integral de pedidos, usuarios y productos para establecimientos de comida rápida. El sistema implementa tecnologías modernas como JWT para autenticación, API Gateway para enrutamiento centralizado, y una interfaz web responsiva para usuarios finales y administradores.

## Introducción

La evolución de los sistemas de gestión de restaurantes ha experimentado una transformación significativa con la adopción de arquitecturas de microservicios (Newman, 2021). Este enfoque permite mayor escalabilidad, mantenibilidad y flexibilidad en comparación con las aplicaciones monolíticas tradicionales. El presente sistema implementa esta arquitectura para optimizar la gestión de pedidos en establecimientos de pizzería.

### Objetivos del Sistema

- Implementar una arquitectura de microservicios para gestión de pedidos
- Proporcionar autenticación segura mediante JWT
- Desarrollar una interfaz web intuitiva para clientes y administradores
- Integrar múltiples servicios especializados (usuarios, productos, pedidos, notificaciones)
- Facilitar la escalabilidad y mantenimiento del sistema

## Arquitectura del Sistema

### Componentes Principales

**API Gateway (Puerto 8000)**
El API Gateway actúa como punto de entrada único para todas las comunicaciones del sistema, implementando patrones de enrutamiento y autenticación centralizada (Richardson, 2018).

**Microservicios Especializados**
- **Servicio de Usuarios** (Puerto 8003): Gestión de cuentas, autenticación y perfiles
- **Servicio de Productos** (Puerto 8002): Catálogo de productos y gestión de inventario
- **Servicio de Pedidos** (Puerto 8004): Procesamiento y seguimiento de pedidos
- **Servicio de Notificaciones** (Puerto 8005): Sistema de alertas y comunicaciones
- **Servicio de Chatbot** (Puerto 8006): Asistencia automatizada al cliente
- **Servicio de Recomendación** (Puerto 8007): Algoritmos de recomendación personalizada

**Frontend**
Interfaz web desarrollada con tecnologías modernas que proporciona acceso tanto para clientes como para administradores del sistema.

**Base de Datos**
Sistema de gestión de base de datos MySQL implementado a través de XAMPP para facilitar el desarrollo y despliegue local.

## Metodología de Instalación

### Requisitos del Sistema

**Software Requerido**
- XAMPP versión 8.1 o superior (Apache + MySQL + PHP)
- Composer (gestor de dependencias PHP)
- Git (control de versiones)
- Navegador web compatible (Chrome, Firefox, Safari, Edge)

**Requisitos de Hardware**
- Memoria RAM: 4GB mínimo (8GB recomendado)
- Espacio en disco: 2GB mínimo
- Procesador: Dual Core o superior

### Proceso de Configuración

#### 1. Configuración de la Base de Datos
1. Iniciar XAMPP (Apache y MySQL)
2. Acceder a phpMyAdmin: http://localhost/phpmyadmin
3. Crear base de datos `pizzeria_bd`
4. Importar archivo `pizzeria_bd.sql`

#### 2. Configuración de Variables de Entorno
Para cada servicio, copiar archivo `env.example` a `.env`:

```bash
# API Gateway
cp api_gateway/env.example api_gateway/.env

# Servicios
cp servicios/servicio_usuarios/env.example servicios/servicio_usuarios/.env
cp servicios/servicio_productos/env.example servicios/servicio_productos/.env
cp servicios/servicio_pedidos/env.example servicios/servicio_pedidos/.env
cp servicios/servicio_notificaciones/env.example servicios/servicio_notificaciones/.env
cp servicios/servicio_chatbot/env.example servicios/servicio_chatbot/.env
cp servicios/servicio_recomendacion/env.example servicios/servicio_recomendacion/.env
```

#### 3. Instalación de Dependencias
```bash
# API Gateway
cd api_gateway
composer install

# Servicios
cd ../servicios/servicio_usuarios
composer install

cd ../servicio_productos
composer install

cd ../servicio_pedidos
composer install

cd ../servicio_notificaciones
composer install

cd ../servicio_chatbot
composer install

cd ../servicio_recomendacion
composer install
```

#### 4. Inicialización del Sistema
Ejecutar script de inicio:
```bash
iniciar_servicios.bat
```

Alternativamente, iniciar manualmente cada servicio en terminales separadas:
```bash
# API Gateway
cd api_gateway/publico
php -S localhost:8000

# Servicios (en terminales separadas)
cd servicios/servicio_usuarios/publico
php -S localhost:8003

cd servicios/servicio_productos/publico
php -S localhost:8002

# Continuar para cada servicio...
```

## Estructura del Proyecto

```
Pizzeria-Pedidos/
├── api_gateway/           # API Gateway (Puerto 8000)
├── servicios/             # Microservicios
│   ├── servicio_usuarios/     # Gestión de usuarios (Puerto 8003)
│   ├── servicio_productos/    # Gestión de productos (Puerto 8002)
│   ├── servicio_pedidos/      # Gestión de pedidos (Puerto 8004)
│   ├── servicio_notificaciones/ # Notificaciones (Puerto 8005)
│   ├── servicio_chatbot/      # Chatbot (Puerto 8006)
│   └── servicio_recomendacion/ # Recomendaciones (Puerto 8007)
├── frontend/              # Interfaz web
├── configuracion/         # Configuraciones globales
├── pizzeria_bd.sql        # Base de datos completa
└── iniciar_servicios.bat  # Script de inicio
```

## Especificación de Endpoints

### API Gateway (http://localhost:8000)
- `POST /login` - Autenticación de usuarios
- `POST /registro` - Registro de nuevos usuarios
- `GET /productos/pizzas` - Obtención de catálogo de pizzas
- `GET /pedidos` - Consulta de pedidos (requiere autenticación)
- `GET /usuarios` - Gestión de usuarios (requiere autenticación)

### Servicios Directos
- **Usuarios**: http://localhost:8003
- **Productos**: http://localhost:8002
- **Pedidos**: http://localhost:8004
- **Notificaciones**: http://localhost:8005
- **Chatbot**: http://localhost:8006
- **Recomendación**: http://localhost:8007

## Interfaz de Usuario

### Acceso al Frontend
URL principal: http://localhost/frontend/

### Páginas Disponibles
- `index.html` - Página principal del sistema
- `login.html` - Interfaz de autenticación
- `registro.html` - Formulario de registro de usuarios
- `panel_admin.html` - Panel de administración del sistema

## Sistema de Autenticación

El sistema implementa autenticación basada en JWT (JSON Web Tokens) siguiendo las mejores prácticas de seguridad (Jones et al., 2015):

- **Almacenamiento**: Tokens guardados en localStorage del navegador
- **Duración**: Tokens con validez de 1 hora
- **Transmisión**: Envío automático en header `Authorization: Bearer <token>`

## Análisis de Problemas y Soluciones

### Error: "Token de autenticación no proporcionado"
**Causa**: Usuario no autenticado o token expirado
**Solución**: Verificar estado de autenticación y renovar token JWT

### Error: "Servicio no encontrado"
**Causa**: Microservicio no ejecutándose o puerto incorrecto
**Solución**: Verificar estado de todos los servicios y configuración de puertos

### Error de Conexión a Base de Datos
**Causa**: XAMPP no ejecutándose o configuración incorrecta
**Solución**: 
- Verificar ejecución de XAMPP
- Revisar configuración en `configuracion/base_de_datos.php`
- Confirmar existencia de base de datos `pizzeria_bd`
- Importar archivo `pizzeria_bd.sql` en phpMyAdmin

### Error: "Archivo .env no encontrado"
**Causa**: Variables de entorno no configuradas
**Solución**: Copiar archivos `env.example` a `.env` en cada servicio

## Consideraciones de Desarrollo

### Configuración de Entorno
- **Modo Debug**: Activado por defecto en desarrollo
- **CORS**: Configurado para permitir todas las origenes en desarrollo
- **Logs**: Errores mostrados en pantalla en modo debug
- **Base de Datos**: MySQL con XAMPP por defecto

### Buenas Prácticas Implementadas
- Separación de responsabilidades mediante microservicios
- Autenticación centralizada con JWT
- Manejo de errores consistente
- Documentación de API completa

## Contribución al Proyecto

### Proceso de Contribución
1. Realizar fork del proyecto
2. Crear rama para nueva funcionalidad
3. Implementar cambios con commits descriptivos
4. Realizar push a la rama
5. Abrir Pull Request para revisión

### Estándares de Código
- Seguir convenciones de nomenclatura PHP PSR-12
- Documentar funciones y clases
- Implementar pruebas unitarias
- Mantener cobertura de código

## Conclusiones

El Sistema de Pizzería demuestra la efectividad de la arquitectura de microservicios para aplicaciones de gestión de restaurantes. La implementación de JWT para autenticación, API Gateway para enrutamiento, y una interfaz web moderna proporciona una base sólida para sistemas similares.

### Limitaciones Identificadas
- Dependencia de XAMPP para desarrollo local
- Configuración manual de múltiples servicios
- Falta de contenedores Docker para despliegue

### Trabajo Futuro
- Implementación de contenedores Docker
- Integración con sistemas de pago
- Desarrollo de aplicación móvil
- Implementación de análisis de datos en tiempo real

## Referencias

American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.). American Psychological Association.

Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)*. RFC 7519. https://tools.ietf.org/html/rfc7519

Newman, S. (2021). *Building microservices: Designing fine-grained systems* (2nd ed.). O'Reilly Media.

Richardson, C. (2018). *Microservices patterns: With examples in Java*. Manning Publications.

---

**Versión del Sistema**: 1.0  
**Fecha de Publicación**: Enero 2025  
**Licencia**: MIT License  
**Autores**: Equipo de Desarrollo de Sistemas 