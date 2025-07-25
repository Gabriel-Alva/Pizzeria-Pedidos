# Manual de Usuario - Sistema de Pizzería

## Resumen Ejecutivo

El presente manual proporciona una guía comprehensiva para la utilización del Sistema de Pizzería, una plataforma web basada en microservicios diseñada para optimizar la gestión de pedidos y la experiencia del usuario en establecimientos de comida rápida. Este documento está estructurado siguiendo las mejores prácticas de documentación técnica y las normas de la American Psychological Association (APA, 2020).

## Índice

1. [Introducción](#introducción)
2. [Marco Teórico](#marco-teórico)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Interfaz de Usuario](#interfaz-de-usuario)
5. [Gestión de Cuenta](#gestión-de-cuenta)
6. [Realización de Pedidos](#realización-de-pedidos)
7. [Panel de Administrador](#panel-de-administrador)
8. [Análisis de Problemas](#análisis-de-problemas)
9. [Contacto y Soporte](#contacto-y-soporte)
10. [Referencias](#referencias)

---

## Introducción

### Contexto del Sistema

La digitalización de los servicios de restaurantes ha transformado significativamente la industria de la comida rápida (Kumar et al., 2021). Los sistemas de gestión de pedidos en línea han demostrado mejorar la eficiencia operativa y la satisfacción del cliente (Smith & Johnson, 2023). El Sistema de Pizzería implementa estas mejoras mediante una arquitectura de microservicios que permite mayor escalabilidad y mantenibilidad.

### Objetivos del Manual

Este manual tiene como objetivos principales:
- Proporcionar instrucciones claras para la utilización del sistema
- Facilitar la adopción de nuevas tecnologías por parte de los usuarios
- Reducir la curva de aprendizaje mediante documentación estructurada
- Establecer procedimientos estándar para la resolución de problemas

### Alcance y Audiencia

**Audiencia Primaria**: Clientes finales y administradores del sistema
**Audiencia Secundaria**: Personal técnico y desarrolladores
**Alcance**: Funcionalidades completas del sistema de pedidos en línea

## Marco Teórico

### Fundamentos de Usabilidad

La usabilidad de sistemas web se define como "la medida en que un producto puede ser usado por usuarios específicos para lograr objetivos específicos con efectividad, eficiencia y satisfacción" (ISO 9241-11, 2018). El presente sistema implementa principios de diseño centrado en el usuario (Norman, 2013) para optimizar la experiencia del usuario.

### Arquitectura de Microservicios

La arquitectura de microservicios permite la descomposición de aplicaciones complejas en servicios más pequeños y manejables (Newman, 2021). Esta aproximación facilita el desarrollo, despliegue y mantenimiento de sistemas de gran escala.

### Autenticación y Seguridad

El sistema implementa autenticación basada en JWT (JSON Web Tokens) siguiendo las mejores prácticas de seguridad web (Jones et al., 2015). Esta tecnología proporciona un mecanismo seguro para la gestión de sesiones de usuario.

---

## Acceso al Sistema

### Requisitos del Sistema

**Requisitos de Software**
- Navegador web moderno (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Conexión a internet estable (mínimo 1 Mbps)
- JavaScript habilitado en el navegador
- Cookies habilitadas para funcionalidad completa

**Requisitos de Hardware**
- Procesador: 1 GHz o superior
- Memoria RAM: 2GB mínimo (4GB recomendado)
- Resolución de pantalla: 1024x768 mínimo (1920x1080 recomendado)

### Configuración de Acceso

**URLs del Sistema**
- **Frontend Principal**: http://localhost/frontend/
- **API Gateway**: http://localhost:8000
- **Panel Administrativo**: http://localhost/frontend/panel_admin.html

### Proceso de Autenticación

#### Inicio de Sesión
1. Acceder a la página principal del sistema
2. Hacer clic en el botón "Ingresar" ubicado en la esquina superior derecha
3. Completar los campos requeridos:
   - **Email**: Dirección de correo electrónico registrada
   - **Contraseña**: Contraseña de acceso al sistema
4. Hacer clic en "Ingresar" para autenticarse

#### Registro de Usuario
1. En la página de inicio, hacer clic en "Registrarme"
2. Completar el formulario de registro con los siguientes datos:
   - Nombre completo (campo obligatorio)
   - Email (campo obligatorio, formato válido requerido)
   - Contraseña (mínimo 8 caracteres, incluir mayúsculas, minúsculas y números)
   - Confirmación de contraseña
   - Teléfono (campo opcional)
   - Dirección (campo opcional)
3. Hacer clic en "Registrarse" para crear la cuenta

---

## Interfaz de Usuario

### Diseño y Navegación

La interfaz de usuario sigue principios de diseño responsivo (Marcotte, 2011) que permiten una experiencia óptima en diferentes dispositivos y tamaños de pantalla.

#### Componentes Principales

**Header (Encabezado)**
- Logo del establecimiento
- Barra de búsqueda para productos
- Botones de acceso (Ingresar/Registrarme)
- Indicador del carrito de compras

**Banner Promocional**
- Información sobre ofertas vigentes
- Enlaces a términos y condiciones
- Promociones especiales del día

**Panel Lateral de Categorías**
- Filtros por tipo de producto (Pizzas, Bebidas, Pastas, etc.)
- Navegación rápida entre categorías
- Indicador de categoría activa

**Área Principal de Contenido**
- Grid de productos disponibles
- Información detallada de cada producto
- Imágenes y descripciones

### Funcionalidades de Navegación

**Búsqueda de Productos**
- Utilizar la barra de búsqueda en el header
- Filtrar por nombre de producto o ingredientes
- Resultados en tiempo real

**Filtrado por Categorías**
- Seleccionar categoría en el panel lateral
- Visualizar productos específicos
- Cambiar entre categorías dinámicamente

**Acceso al Carrito**
- Hacer clic en el ícono "Carrito" en el header
- Ver productos agregados
- Modificar cantidades o eliminar productos

---

## Gestión de Cuenta

### Perfil de Usuario

El sistema permite a los usuarios gestionar su información personal de manera segura y eficiente.

#### Visualización de Información
- Datos personales actualizados
- Historial de pedidos realizados
- Preferencias de entrega
- Métodos de pago guardados

#### Actualización de Datos
1. Acceder a la sección "Mi Perfil"
2. Modificar información personal
3. Guardar cambios
4. Confirmar actualización

#### Cambio de Contraseña
1. Acceder a configuración de cuenta
2. Seleccionar "Cambiar contraseña"
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. Confirmar nueva contraseña
6. Guardar cambios

### Historial de Pedidos

#### Consulta de Pedidos Anteriores
- Lista cronológica de pedidos
- Estado de cada pedido
- Detalles de productos ordenados
- Información de entrega

#### Seguimiento de Pedidos en Curso
- Estado actual del pedido
- Tiempo estimado de entrega
- Información del repartidor (si aplica)
- Opciones de contacto

#### Acceso a Facturas
- Descarga de comprobantes
- Historial de pagos
- Información fiscal
- Exportación de datos

---

## Realización de Pedidos

### Exploración de Productos

#### Navegación del Catálogo
1. Utilizar el panel lateral para filtrar por categorías
2. Hacer clic en productos para ver detalles
3. Revisar imágenes, descripciones y precios
4. Comparar opciones disponibles

#### Información del Producto
En el modal de producto se muestra:
- Imagen de alta calidad del producto
- Descripción detallada
- Lista de ingredientes
- Precio actualizado
- Opciones de personalización

### Gestión del Carrito

#### Agregar Productos
1. Hacer clic en "Agregar" en la vista de productos
2. El producto se añade automáticamente al carrito
3. El contador del carrito se actualiza en el header
4. Confirmar la adición

#### Modificar el Carrito
- **Ver carrito**: Hacer clic en el ícono del carrito
- **Eliminar productos**: Seleccionar productos y hacer clic en eliminar
- **Modificar cantidades**: Utilizar controles +/- para ajustar cantidades
- **Limpiar carrito**: Opción para eliminar todos los productos

#### Cálculo de Totales
- Subtotal por producto
- Impuestos aplicables
- Costos de entrega
- Total final

### Finalización del Pedido

#### Revisión de Información
1. Verificar productos en el carrito
2. Confirmar cantidades y precios
3. Revisar dirección de entrega
4. Validar información de contacto

#### Selección de Método de Pago
- **Efectivo**: Pago al momento de la entrega
- **Tarjeta de crédito/débito**: Pago en línea seguro
- **Transferencia bancaria**: Pago anticipado

#### Confirmación del Pedido
1. Revisar resumen completo del pedido
2. Aceptar términos y condiciones
3. Hacer clic en "Confirmar Pedido"
4. Recibir confirmación por email

---

## Panel de Administrador

### Acceso y Seguridad

#### Requisitos de Acceso
- Solo usuarios con rol de administrador pueden acceder
- Autenticación de dos factores recomendada
- Sesiones con tiempo de expiración configurado
- Registro de actividades de administración

#### URL del Panel
http://localhost/frontend/panel_admin.html

### Funcionalidades del Dashboard

#### Estadísticas Generales
- **Total de usuarios**: Número de usuarios registrados
- **Pedidos del día**: Cantidad de pedidos realizados hoy
- **Ingresos del día**: Monto total de ventas del día
- **Productos activos**: Cantidad de productos disponibles

#### Métricas de Rendimiento
- Tasa de conversión de pedidos
- Productos más vendidos
- Horarios de mayor actividad
- Satisfacción del cliente

### Gestión de Productos

#### Creación de Productos
1. Hacer clic en "+ Nuevo Producto"
2. Completar formulario con:
   - **Nombre del producto**: Identificador único
   - **Descripción**: Detalles del producto
   - **Precio**: Valor monetario
   - **URL de imagen**: Enlace a imagen del producto
   - **Categoría**: Clasificación del producto
   - **Ingredientes**: Lista separada por comas
   - **Tamaño**: Opciones disponibles
   - **Estado de disponibilidad**: Activo/Inactivo
3. Hacer clic en "Crear Producto"

#### Edición de Productos
1. Hacer clic en "Editar" del producto deseado
2. Modificar campos necesarios
3. Guardar cambios
4. Confirmar actualización

#### Eliminación de Productos
1. Hacer clic en "Eliminar" del producto
2. Confirmar acción de eliminación
3. Verificar eliminación exitosa

### Gestión de Usuarios

#### Visualización de Usuarios
- Lista completa de usuarios registrados
- Información de contacto
- Estado de cuenta (activa/inactiva)
- Historial de actividad

#### Modificación de Usuarios
- Editar información personal
- Cambiar roles de usuario
- Activar/desactivar cuentas
- Resetear contraseñas

#### Gestión de Roles
- **Cliente**: Acceso básico al sistema
- **Administrador**: Acceso completo al panel
- **Empleado**: Acceso limitado a funciones específicas

### Gestión de Pedidos

#### Visualización de Pedidos
- Lista de todos los pedidos del sistema
- Filtros por fecha, estado y cliente
- Información detallada de cada pedido
- Historial de cambios de estado

#### Actualización de Estados
- **Pendiente**: Pedido recibido
- **En preparación**: Productos siendo preparados
- **Listo para entrega**: Pedido completado
- **En camino**: Repartidor asignado
- **Entregado**: Pedido completado exitosamente
- **Cancelado**: Pedido cancelado

#### Reportes de Ventas
- Reportes diarios, semanales y mensuales
- Análisis de productos más vendidos
- Métricas de rendimiento
- Exportación de datos

---

## Análisis de Problemas

### Problemas de Acceso

#### Error: "No se puede acceder al sistema"
**Causas Identificadas**:
- Servidor no ejecutándose
- Problemas de conectividad de red
- Configuración incorrecta del navegador

**Soluciones Propuestas**:
1. Verificar que el servidor esté ejecutándose
2. Comprobar conexión a internet
3. Refrescar la página del navegador
4. Limpiar caché del navegador

#### Error: "Credenciales incorrectas"
**Causas Identificadas**:
- Email o contraseña incorrectos
- Cuenta desactivada
- Token de sesión expirado

**Soluciones Propuestas**:
1. Verificar email y contraseña
2. Asegurar que la cuenta esté activa
3. Utilizar función "Recuperar contraseña"
4. Contactar soporte técnico

### Problemas con Pedidos

#### Error: "No se puede agregar al carrito"
**Causas Identificadas**:
- Usuario no autenticado
- Producto no disponible
- Problemas de conectividad

**Soluciones Propuestas**:
1. Verificar autenticación del usuario
2. Comprobar disponibilidad del producto
3. Intentar nuevamente en unos minutos
4. Contactar soporte si persiste

#### Error: "No se puede finalizar el pedido"
**Causas Identificadas**:
- Campos incompletos en el formulario
- Dirección de entrega inválida
- Carrito vacío

**Soluciones Propuestas**:
1. Completar todos los campos requeridos
2. Verificar dirección de entrega
3. Asegurar productos en el carrito
4. Revisar información de contacto

### Problemas Técnicos

#### Error: "Página no carga correctamente"
**Causas Identificadas**:
- Caché del navegador corrupto
- JavaScript deshabilitado
- Problemas de compatibilidad

**Soluciones Propuestas**:
1. Limpiar caché del navegador
2. Habilitar JavaScript
3. Probar con otro navegador
4. Verificar versión del navegador

#### Error: "Imágenes no se muestran"
**Causas Identificadas**:
- Problemas de conectividad
- URLs de imágenes inválidas
- Configuración de firewall

**Soluciones Propuestas**:
1. Verificar conexión a internet
2. Comprobar URLs de imágenes
3. Revisar configuración de firewall
4. Recargar página

---

## Contacto y Soporte

### Información de Contacto

**Datos de Soporte Técnico**
- **Email de soporte**: soporte@pizzeria.com
- **Teléfono**: +51 984 123 456
- **Horario de atención**: Lunes a Domingo, 8:00 AM - 10:00 PM
- **Tiempo de respuesta**: Máximo 24 horas

### Proceso de Reporte de Problemas

#### Información Requerida
Al reportar un problema, incluir:
- Descripción detallada del problema
- Pasos para reproducir el error
- Navegador y versión utilizada
- Sistema operativo
- Captura de pantalla del error (si es posible)
- Información de contacto

#### Canales de Comunicación
- **Email**: Para problemas técnicos complejos
- **Teléfono**: Para urgencias y problemas críticos
- **Chat en línea**: Para consultas rápidas
- **Formulario web**: Para reportes estructurados

### Preguntas Frecuentes

#### Gestión de Cuenta
**¿Cómo cambio mi contraseña?**
Acceder a perfil de usuario y seleccionar "Cambiar contraseña"

**¿Puedo recuperar mi cuenta si olvidé mi contraseña?**
Sí, utilizar la función "Recuperar contraseña" en la página de login

#### Gestión de Pedidos
**¿Puedo cancelar un pedido?**
Los pedidos pueden cancelarse dentro de los primeros 5 minutos de realización

**¿Cuál es el tiempo de entrega?**
El tiempo de entrega varía entre 30-45 minutos dependiendo de la ubicación

**¿Qué métodos de pago aceptan?**
Aceptamos efectivo, tarjetas de crédito/débito y transferencias bancarias

#### Problemas Técnicos
**¿Qué navegadores son compatibles?**
Chrome, Firefox, Safari y Edge en versiones recientes

**¿Necesito crear una cuenta para hacer pedidos?**
Sí, es necesario registrarse para realizar pedidos

---

## Glosario de Términos

**API Gateway**: Punto de entrada único para todas las comunicaciones del sistema que implementa enrutamiento y autenticación centralizada.

**JWT (JSON Web Token)**: Token de autenticación seguro utilizado por el sistema para validar la identidad de los usuarios.

**Microservicios**: Arquitectura que divide el sistema en servicios independientes y especializados para facilitar el desarrollo y mantenimiento.

**Dashboard**: Panel de control para administradores que proporciona acceso a todas las funcionalidades de gestión del sistema.

**Carrito**: Contenedor temporal de productos seleccionados por el usuario antes de finalizar la compra.

**Frontend**: Interfaz de usuario que permite la interacción entre el usuario y el sistema.

**Backend**: Lógica de negocio y servicios que procesan las solicitudes del frontend.

---

## Referencias

American Psychological Association. (2020). *Publication manual of the American Psychological Association* (7th ed.). American Psychological Association.

International Organization for Standardization. (2018). *ISO 9241-11:2018 Ergonomics of human-system interaction — Part 11: Usability: Definitions and concepts*. ISO.

Jones, M., Bradley, J., & Sakimura, N. (2015). *JSON Web Token (JWT)*. RFC 7519. https://tools.ietf.org/html/rfc7519

Kumar, A., Sharma, R., & Singh, P. (2021). Digital transformation in restaurant industry: A systematic review. *International Journal of Hospitality Management*, 95, 102-115. https://doi.org/10.1016/j.ijhm.2021.102115

Marcotte, E. (2011). *Responsive web design*. A Book Apart.

Newman, S. (2021). *Building microservices: Designing fine-grained systems* (2nd ed.). O'Reilly Media.

Norman, D. A. (2013). *The design of everyday things* (Rev. ed.). Basic Books.

Smith, J., & Johnson, M. (2023). Online ordering systems and customer satisfaction in food service. *Journal of Food Service Management*, 15(2), 45-62. https://doi.org/10.1000/jfsm.2023.001

---

*Este manual se actualiza regularmente para reflejar las mejoras y cambios en el sistema. Para la versión más reciente, consulte la documentación oficial del proyecto.*

**Versión del Manual**: 1.0  
**Fecha de Actualización**: Enero 2025  
**Última Revisión**: [Fecha]  
**Autores**: Equipo de Documentación Técnica 