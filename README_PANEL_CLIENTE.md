# Panel de Cliente - Pizzería

## 🍕 Funcionalidades Implementadas

### 1. **Menú de Pizzas Mejorado**
- **Visualización completa**: Todas las pizzas disponibles con información detallada
- **Búsqueda en tiempo real**: Buscar pizzas por nombre, ingredientes o descripción
- **Filtros avanzados**: Ordenar por nombre, precio, calificaciones y popularidad
- **Categorías**: Filtrado por categorías de pizzas
- **Diseño responsivo**: Adaptado para móviles y tablets

### 2. **Sistema de Favoritos** ❤️
- **Agregar/Quitar favoritos**: Botón de corazón en cada tarjeta de pizza
- **Sección dedicada**: Vista especial para pizzas favoritas
- **Persistencia**: Los favoritos se guardan en la base de datos
- **Sincronización**: Estado actualizado en tiempo real

### 3. **Sistema de Calificaciones** ⭐
- **Calificación visual**: Estrellas interactivas (1-5 estrellas)
- **Modal de calificación**: Interfaz dedicada para calificar pizzas
- **Promedio de calificaciones**: Muestra el promedio de todas las calificaciones
- **Persistencia**: Las calificaciones se guardan en la base de datos

### 4. **Carrito de Compras Mejorado** 🛒
- **Interfaz visual**: Imágenes de productos en el carrito
- **Información detallada**: Precio unitario y total por producto
- **Gestión de cantidades**: Agregar múltiples unidades
- **Cálculo automático**: Total actualizado en tiempo real
- **Persistencia local**: Carrito guardado en localStorage

### 5. **Gestión de Pedidos** 📋
- **Historial completo**: Todos los pedidos del usuario
- **Estados visuales**: Colores diferentes para cada estado del pedido
- **Información detallada**: Fecha, items, precios y totales
- **Actualización automática**: Se actualiza al realizar nuevos pedidos

### 6. **Perfil de Usuario** 👤
- **Información personal**: Datos del usuario mostrados claramente
- **Estadísticas**: Total de pedidos, monto gastado y favoritos
- **Cambio de contraseña**: Modal seguro para actualizar credenciales
- **Diseño limpio**: Interfaz moderna y fácil de usar

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno con variables CSS y flexbox/grid
- **JavaScript ES6+**: Funcionalidad interactiva y asíncrona
- **Font Awesome**: Iconos para favoritos y calificaciones
- **Responsive Design**: Adaptado para todos los dispositivos

### Backend
- **PHP**: Lógica de servidor
- **Slim Framework**: API RESTful
- **MySQL**: Base de datos relacional
- **JWT**: Autenticación segura

## 📁 Estructura de Archivos

```
frontend/
├── panel_cliente.html          # Página principal del panel
├── css/
│   └── panel_cliente.css       # Estilos del panel
└── js/
    └── cliente_panel.js        # Lógica JavaScript

servicios/
├── servicio_productos/         # API de productos
├── servicio_recomendacion/     # API de favoritos y calificaciones
└── servicio_pedidos/          # API de pedidos
```

## 🔧 Configuración y Uso

### 1. **Iniciar Servicios**
```bash
# Ejecutar el script de inicio
./iniciar_servicios.sh
```

### 2. **Acceder al Panel**
- Navegar a `http://localhost/frontend/panel_cliente.html`
- Iniciar sesión con credenciales de cliente
- El panel se cargará automáticamente

### 3. **Funcionalidades Principales**

#### **Navegación**
- **Mi Perfil**: Información personal y estadísticas
- **Menú**: Catálogo completo de pizzas con búsqueda y filtros
- **Mis Favoritos**: Pizzas marcadas como favoritas
- **Carrito**: Gestión de productos para compra
- **Mis Pedidos**: Historial de pedidos realizados

#### **Interacciones**
- **Favoritos**: Click en el corazón para agregar/quitar
- **Calificaciones**: Click en las estrellas para calificar
- **Búsqueda**: Escribir en el campo de búsqueda
- **Filtros**: Seleccionar ordenamiento en el dropdown

## 🎨 Características de Diseño

### **Colores**
- **Principal**: Verde (#2ecc40)
- **Acento**: Naranja (#ff9800)
- **Favoritos**: Rojo (#ff4757)
- **Estrellas**: Dorado (#ffd700)

### **Responsive**
- **Desktop**: Layout completo con sidebar fijo
- **Tablet**: Sidebar colapsable
- **Móvil**: Menú hamburguesa y layout adaptado

### **Animaciones**
- **Hover effects**: En tarjetas y botones
- **Transiciones suaves**: Para cambios de estado
- **Notificaciones**: Animaciones de entrada/salida

## 🔒 Seguridad

### **Autenticación**
- Verificación de JWT en cada petición
- Redirección automática si no está autenticado
- Validación de rol de cliente

### **Validación**
- Validación de datos en frontend y backend
- Sanitización de inputs
- Manejo de errores robusto

## 📊 Base de Datos

### **Tablas Principales**
- `pizzas`: Información de productos
- `usuario_pizza_interacciones`: Favoritos y calificaciones
- `pedidos`: Historial de pedidos
- `usuarios`: Datos de usuarios

### **Relaciones**
- Usuario → Interacciones (1:N)
- Pizza → Interacciones (1:N)
- Usuario → Pedidos (1:N)

## 🚀 Próximas Mejoras

### **Funcionalidades Planificadas**
- [ ] Notificaciones push para estado de pedidos
- [ ] Recomendaciones personalizadas
- [ ] Historial de calificaciones
- [ ] Filtros avanzados por ingredientes
- [ ] Modo oscuro
- [ ] Exportar historial de pedidos

### **Optimizaciones**
- [ ] Lazy loading de imágenes
- [ ] Caché de productos
- [ ] Compresión de assets
- [ ] Service Worker para offline

## 📝 Notas de Desarrollo

### **Comentarios en Español**
Todos los comentarios en el código están en español, siguiendo las preferencias del usuario.

### **Estructura Modular**
El código está organizado en módulos separados para facilitar el mantenimiento:
- **Configuración**: Variables y inicialización
- **Navegación**: Manejo de secciones
- **Productos**: Gestión del catálogo
- **Favoritos**: Sistema de favoritos
- **Calificaciones**: Sistema de ratings
- **Carrito**: Gestión del carrito
- **Pedidos**: Historial y gestión

### **Manejo de Errores**
- Try-catch en todas las operaciones asíncronas
- Mensajes de error descriptivos
- Fallbacks para datos faltantes
- Validación de respuestas del servidor

---

**Desarrollado con ❤️ para la Pizzería** 