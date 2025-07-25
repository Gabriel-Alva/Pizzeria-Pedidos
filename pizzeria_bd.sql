-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 25-07-2025 a las 03:57:49
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pizzeria_bd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `nombre_cliente` varchar(255) NOT NULL,
  `correo_cliente` varchar(255) NOT NULL,
  `telefono_cliente` varchar(20) DEFAULT NULL,
  `direccion_entrega` text NOT NULL,
  `monto_total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','confirmado','preparando','listo','entregado','cancelado') DEFAULT 'pendiente',
  `estado_pago` enum('pendiente','pagado','fallido') DEFAULT 'pendiente',
  `metodo_pago` varchar(50) DEFAULT NULL,
  `hora_entrega_estimada` timestamp NULL DEFAULT NULL,
  `hora_entrega_real` timestamp NULL DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `empleado_id`, `nombre_cliente`, `correo_cliente`, `telefono_cliente`, `direccion_entrega`, `monto_total`, `estado`, `estado_pago`, `metodo_pago`, `hora_entrega_estimada`, `hora_entrega_real`, `notas`, `creado_en`, `actualizado_en`) VALUES
(13, NULL, NULL, 'Gabriel Alvarez', 'gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 24.90, 'entregado', 'pagado', 'efectivo', NULL, NULL, 'nn', '2025-07-12 22:35:04', '2025-07-12 22:52:22'),
(14, NULL, NULL, 'Juan', 'juan@gmail.com', '987 654 321', 'Av. El Salvador E-5', 34.90, 'entregado', 'pagado', 'tarjeta', NULL, NULL, 'Sin cebolla', '2025-07-12 23:00:09', '2025-07-12 23:01:05'),
(15, NULL, NULL, 'Gabriel Alvarez', 'Gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 54.90, 'entregado', 'pagado', 'efectivo', '2025-07-12 23:34:00', '2025-07-12 23:36:00', NULL, '2025-07-12 23:01:59', '2025-07-12 23:36:38'),
(16, NULL, NULL, 'Gabriel Alvarez', 'Gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 104.50, 'entregado', 'pagado', 'tarjeta', NULL, NULL, NULL, '2025-07-14 02:20:14', '2025-07-14 02:56:58'),
(17, NULL, NULL, 'Gabriel Alvarez', 'Gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 168.00, 'entregado', 'pagado', 'tarjeta', NULL, NULL, NULL, '2025-07-14 02:29:24', '2025-07-20 01:06:47'),
(18, NULL, NULL, 'Gabriel', 'Gabriel@gmail.com', '914035205', 'Av. Primavera C-8', 227.40, 'entregado', 'pagado', 'tarjeta', NULL, NULL, NULL, '2025-07-20 00:26:48', '2025-07-20 00:27:44'),
(23, NULL, NULL, 'Cliente Prueba', 'prueba@test.com', '123456789', 'Calle de Prueba 123', 12.99, 'preparando', 'pagado', 'efectivo', NULL, NULL, NULL, '2025-07-20 00:44:25', '2025-07-20 23:21:54'),
(26, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 626', 'Av. Primavera C-8', 30.00, 'entregado', 'pendiente', NULL, NULL, NULL, NULL, '2025-07-24 01:47:54', '2025-07-24 02:25:39'),
(28, 7, NULL, 'Gabriel', 'Gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 29.90, 'preparando', 'pendiente', 'Efectivo', NULL, NULL, NULL, '2025-07-24 21:31:11', '2025-07-24 23:16:14'),
(29, NULL, NULL, 'Ana', 'Ana@gmail.com', '914 035 205', 'Av. Garcilaso  F-2', 25.00, 'entregado', 'pagado', 'efectivo', NULL, NULL, 'sin sebolla', '2025-07-24 22:07:55', '2025-07-24 23:32:07'),
(30, 7, NULL, 'Gabriel', 'Gabriel@gmail.com', '957 146 262', 'Av. Primavera C-8', 84.90, 'pendiente', 'pendiente', 'Efectivo', NULL, NULL, NULL, '2025-07-24 23:38:42', '2025-07-24 23:38:42'),
(31, NULL, NULL, 'Alberto', 'albert@gmail.com', '984 135 149', 'Av. Garcilaso  F-2', 30.00, 'pendiente', 'pendiente', 'tarjeta', NULL, NULL, NULL, '2025-07-24 23:51:57', '2025-07-24 23:51:57'),
(32, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 262', 'Av. Primavera C-8', 29.90, 'pendiente', 'pendiente', 'Efectivo', NULL, NULL, NULL, '2025-07-24 23:53:46', '2025-07-24 23:53:46'),
(33, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 262', 'Av. Primavera C-8', 24.90, 'pendiente', 'pendiente', 'Tarjeta', NULL, NULL, NULL, '2025-07-24 23:54:58', '2025-07-24 23:54:58'),
(34, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 262', 'Av. Primavera C-8', 26.00, 'pendiente', 'pendiente', 'Efectivo', NULL, NULL, NULL, '2025-07-24 23:57:04', '2025-07-24 23:57:04'),
(35, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 262', 'Av. Primavera C-8', 34.90, 'pendiente', 'pendiente', 'Efectivo', NULL, NULL, NULL, '2025-07-24 23:57:29', '2025-07-24 23:57:29'),
(36, 2, NULL, 'Cliente', 'cliente@pizzeria.com', '957 146 262', 'Av. Primavera C-8', 44.40, 'pendiente', 'pendiente', 'Tarjeta', NULL, NULL, NULL, '2025-07-25 00:02:51', '2025-07-25 00:02:51'),
(37, NULL, NULL, 'Alberto', 'albert@gmail.com', '984 135 149', 'Av. Garcilaso  F-2', 24.90, 'pendiente', 'pendiente', 'tarjeta', NULL, NULL, 'sin queso', '2025-07-25 00:05:08', '2025-07-25 00:05:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_items`
--

CREATE TABLE `pedido_items` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `pizza_id` int(11) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unitario` decimal(10,2) NOT NULL,
  `precio_total` decimal(10,2) NOT NULL,
  `instrucciones_especiales` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `tamano` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido_items`
--

INSERT INTO `pedido_items` (`id`, `pedido_id`, `pizza_id`, `cantidad`, `precio_unitario`, `precio_total`, `instrucciones_especiales`, `creado_en`, `tamano`) VALUES
(10, 13, 1, 1, 24.90, 24.90, NULL, '2025-07-12 22:35:04', 'pequena'),
(11, 14, 1, 1, 34.90, 34.90, NULL, '2025-07-12 23:00:09', 'grande'),
(12, 15, 1, 1, 24.90, 24.90, 'para 6 personas', '2025-07-12 23:01:59', 'pequena'),
(13, 15, 3, 1, 30.00, 30.00, 'sin queso', '2025-07-12 23:01:59', 'mediana'),
(14, 16, 2, 3, 26.50, 79.50, NULL, '2025-07-14 02:20:14', 'pequena'),
(15, 16, 3, 1, 25.00, 25.00, NULL, '2025-07-14 02:20:14', 'pequena'),
(16, 17, 3, 3, 35.00, 105.00, NULL, '2025-07-14 02:29:24', 'grande'),
(17, 17, 2, 2, 31.50, 63.00, NULL, '2025-07-14 02:29:24', 'mediana'),
(18, 18, 2, 1, 26.50, 26.50, NULL, '2025-07-20 00:26:48', 'pequena'),
(19, 18, 1, 1, 24.90, 24.90, NULL, '2025-07-20 00:26:48', 'pequena'),
(20, 18, 7, 1, 26.00, 26.00, NULL, '2025-07-20 00:26:48', 'pequena'),
(21, 18, 3, 6, 25.00, 150.00, NULL, '2025-07-20 00:26:48', 'pequena'),
(28, 23, 1, 1, 12.99, 12.99, NULL, '2025-07-20 00:44:25', 'mediana'),
(31, 26, 3, 1, 30.00, 30.00, NULL, '2025-07-24 01:47:54', 'mediana'),
(33, 28, 1, 1, 29.90, 29.90, NULL, '2025-07-24 21:31:11', 'mediana'),
(34, 29, 3, 1, 25.00, 25.00, NULL, '2025-07-24 22:07:55', 'pequena'),
(35, 30, 3, 2, 30.00, 60.00, NULL, '2025-07-24 23:38:42', 'mediana'),
(36, 30, 1, 1, 24.90, 24.90, NULL, '2025-07-24 23:38:42', 'pequena'),
(37, 31, 3, 1, 30.00, 30.00, NULL, '2025-07-24 23:51:57', 'mediana'),
(38, 32, 1, 1, 29.90, 29.90, NULL, '2025-07-24 23:53:46', 'mediana'),
(39, 33, 1, 1, 24.90, 24.90, NULL, '2025-07-24 23:54:58', 'pequena'),
(40, 34, 7, 1, 26.00, 26.00, NULL, '2025-07-24 23:57:04', 'pequena'),
(41, 35, 1, 1, 34.90, 34.90, NULL, '2025-07-24 23:57:29', 'grande'),
(42, 36, 1, 1, 24.90, 24.90, NULL, '2025-07-25 00:02:51', 'pequeña'),
(43, 36, 20, 1, 19.50, 19.50, NULL, '2025-07-25 00:02:51', 'pequeña'),
(44, 37, 1, 1, 24.90, 24.90, NULL, '2025-07-25 00:05:08', 'pequeña');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pizzas`
--

CREATE TABLE `pizzas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `url_imagen` varchar(500) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT 'pizza',
  `disponible` tinyint(1) DEFAULT 1,
  `ingredientes` text DEFAULT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pizzas`
--

INSERT INTO `pizzas` (`id`, `nombre`, `descripcion`, `precio`, `url_imagen`, `categoria`, `disponible`, `ingredientes`, `creado_en`, `actualizado_en`) VALUES
(1, 'Pizza Clásica', 'Pizza con ingredientes tradicionales', 24.90, 'https://i.pinimg.com/736x/11/4c/fb/114cfb3145787f6198cb3cdc6c6bb611.jpg', 'pizza', 1, 'queso, tomate, orégano', '2025-07-08 22:39:17', '2025-07-24 02:24:07'),
(2, 'Pizza Pepperoni', 'Sabor fuerte y especiado', 26.50, 'https://i.pinimg.com/736x/10/d0/82/10d082f9cbaeefa3e9feb4951b50ef45.jpg', 'pizza', 0, 'queso, pepperoni, salsa de tomate', '2025-07-08 22:39:17', '2025-07-20 00:01:29'),
(3, 'Pizza Hawaiana', 'Con piña y jamón', 25.00, 'https://i.pinimg.com/736x/9d/b7/50/9db750a4eafcf1d1fb551520018c8bf6.jpg', 'pizza', 1, 'piña, jamón, queso', '2025-07-08 22:39:17', '2025-07-08 22:44:59'),
(4, 'Pizza BBQ Pollo', 'Toque dulce y ahumado', 27.90, 'https://i.pinimg.com/736x/96/10/5e/96105e3bc37057ef7b54c51a6772449f.jpg', 'especial', 1, 'pollo, salsa bbq, cebolla, queso', '2025-07-08 22:39:17', '2025-07-08 22:45:21'),
(5, 'Pizza Veggie', 'Ideal para vegetarianos', 23.50, 'https://i.pinimg.com/736x/a2/77/62/a27762213e366ae2e983b1f52eded727.jpg', 'vegana', 1, 'tomate, champiñones, aceitunas, espinaca', '2025-07-08 22:39:17', '2025-07-08 22:45:47'),
(6, 'Pizza Cuatro Quesos', 'Extra de sabor lácteo', 28.00, 'https://i.pinimg.com/736x/c9/77/66/c977662c319a17189c0444080172ccc0.jpg', 'pizza', 1, 'mozzarella, cheddar, parmesano, gorgonzola', '2025-07-08 22:39:17', '2025-07-08 22:46:08'),
(7, 'Pizza Mexicana', 'Picante y sabrosa', 26.00, 'https://i.pinimg.com/736x/3e/b2/71/3eb271b8bc15a234a97685063ca46a44.jpg', 'especial', 1, 'chorizo, jalapeños, cebolla, maíz', '2025-07-08 22:39:17', '2025-07-08 22:46:43'),
(8, 'Pizza Margherita', 'La clásica italiana', 22.00, 'https://i.pinimg.com/736x/a2/74/1c/a2741cd8d94391ea7fdafbb266599c1a.jpg', 'pizza', 1, 'tomate, albahaca, mozzarella', '2025-07-08 22:39:17', '2025-07-08 22:47:12'),
(9, 'Pizza de Cuy', 'Tradicional del Cusco', 35.00, 'https://i.pinimg.com/736x/49/64/a6/4964a6974c42ba4d3cb643f607d7ec09.jpg', 'especial', 1, 'cuy, cebolla, queso, ají amarillo', '2025-07-08 22:39:17', '2025-07-08 22:47:41'),
(10, 'Pizza con Champiñones', 'Delicada y cremosa', 24.00, 'https://i.pinimg.com/736x/fd/08/90/fd08903904b6f96f9a7f4bb5d384696b.jpg', 'pizza', 1, 'champiñones, ajo, queso, perejil', '2025-07-08 22:39:17', '2025-07-08 22:48:00'),
(11, 'Pizza Dulce Chocolate', 'Postre irresistible', 20.00, 'https://i.pinimg.com/736x/4b/1e/e3/4b1ee3771cf101522830685a65348a45.jpg', 'postre', 1, 'masa dulce, chocolate, fresas', '2025-07-08 22:39:17', '2025-07-08 22:48:54'),
(12, 'Pizza de Nutella y Plátano', 'Dulce tentación', 21.50, 'https://i.pinimg.com/736x/7f/60/ca/7f60ca19d5019ba0050195e145c6f236.jpg', 'postre', 1, 'nutella, plátano, crema batida', '2025-07-08 22:39:17', '2025-07-08 22:48:38'),
(13, 'Pizza Mediterránea', 'Fresca y ligera', 25.90, 'https://i.pinimg.com/736x/34/d9/45/34d945ba49f48005cdd31908e8eb2267.jpg', 'vegana', 1, 'aceitunas, tomate seco, rúcula, queso feta', '2025-07-08 22:39:17', '2025-07-08 22:49:26'),
(14, 'Pizza Andina', 'Sabores autóctonos', 30.00, 'https://i.pinimg.com/736x/7f/87/3c/7f873ccf44c2b4bbea94e826f2a649ad.jpg', 'especial', 1, 'quinoa, queso andino, tomate, huacatay', '2025-07-08 22:39:17', '2025-07-08 22:49:49'),
(15, 'Pizza Pollo y Champiñones', 'Deliciosa combinación', 27.00, 'https://i.pinimg.com/736x/e8/d0/9b/e8d09b3a86d947fbd5af52855da2c40a.jpg', 'pizza', 1, 'pollo, champiñones, queso', '2025-07-08 22:39:17', '2025-07-08 22:50:35'),
(16, 'Pizza Tofu y Verduras', 'Opción vegana saludable', 24.00, 'https://i.pinimg.com/736x/cc/a6/db/cca6dbbf1e3727527973758e70b83ea4.jpg', 'vegana', 1, 'tofu, pimiento, calabacín, tomate', '2025-07-08 22:39:17', '2025-07-08 22:51:04'),
(17, 'Pizza Cuy BBQ', 'Fusión moderna', 36.50, 'https://i.pinimg.com/736x/79/8e/3e/798e3eafd45f984cb789530c146f726c.jpg', 'especial', 1, 'cuy, salsa bbq, papas nativas', '2025-07-08 22:39:17', '2025-07-08 22:51:38'),
(18, 'Pizza de Tres Carnes', 'Para carnívoros', 29.90, 'https://i.pinimg.com/736x/fb/b1/5d/fbb15d73e18877190a338cb6180f681d.jpg', 'pizza', 1, 'pollo, carne de res, chorizo, queso', '2025-07-08 22:39:17', '2025-07-13 22:05:42'),
(19, 'Pizza de Ají de Gallina', 'Innovación peruana', 33.00, 'https://i.pinimg.com/736x/e8/8a/41/e88a41d5c437c6aeae168a5ef73a8b6e.jpg', 'especial', 1, 'ají de gallina, aceituna, huevo cocido', '2025-07-08 22:39:17', '2025-07-08 22:53:06'),
(20, 'Pizza de Frutas', 'Dulce y colorida', 19.50, 'https://i.pinimg.com/736x/27/ba/b1/27bab15a34f8637a25dc29813f88ba72.jpg', 'postre', 1, 'piña, kiwi, fresa, salsa de yogurt', '2025-07-08 22:39:17', '2025-07-08 22:53:26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pizzas_favoritas`
--

CREATE TABLE `pizzas_favoritas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `pizza_id` int(11) NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pizzas_favoritas`
--

INSERT INTO `pizzas_favoritas` (`id`, `usuario_id`, `pizza_id`, `fecha_agregado`) VALUES
(35, 2, 6, '2025-07-24 02:18:27'),
(37, 2, 8, '2025-07-24 02:18:29'),
(40, 2, 5, '2025-07-24 02:21:47'),
(41, 2, 4, '2025-07-24 02:21:48'),
(45, 7, 1, '2025-07-24 21:26:20'),
(46, 7, 3, '2025-07-24 21:26:22'),
(48, 7, 5, '2025-07-24 22:01:06'),
(49, 7, 6, '2025-07-24 22:01:06'),
(50, 7, 4, '2025-07-24 22:01:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `rol` enum('cliente','administrador','empleado') DEFAULT 'cliente',
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `correo`, `contrasena_hash`, `nombre`, `apellido`, `rol`, `telefono`, `activo`, `creado_en`, `actualizado_en`) VALUES
(2, 'cliente@pizzeria.com', '$2y$10$VsiRvd7ptB1D/7FUimKgC.9c2BXXfvVPdnPRqrKEdnbsqwWvEpkX.', 'Cliente', 'Regular', 'cliente', '984 123 677', 1, '2025-07-04 16:06:06', '2025-07-24 21:56:15'),
(3, 'admin@pizzeria.com', '$2y$10$1cEAlPCztcyv9VBz0eyOp.4dGmHsWgsJ0Sb5gnmdoq9fZjbDMc0hm', 'Admin', 'Principal', 'administrador', '123456789', 1, '2025-07-04 19:55:37', '2025-07-04 19:58:13'),
(4, 'empleado@pizzeria.com', '$2y$10$kKX2LzXa7ekjfdokcU02IuMuvYZ.GAZHJ5HfGYxJdZTbKYXhDIqhi', 'Empleado', 'Pizzeria', 'empleado', '987654321', 1, '2025-07-04 19:55:37', '2025-07-04 19:59:03'),
(7, 'Gabriel@gmail.com', '$2y$10$a1VCa2QBBUW8vosIT6iwIuoJsCziZy5jFsRzOhcfckL.IAVquN95G', 'Gabriel', 'Alvarez', 'cliente', '984 135 149', 1, '2025-07-24 21:25:31', '2025-07-24 21:56:38');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_pizza_interacciones`
--

CREATE TABLE `usuario_pizza_interacciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `pizza_id` int(11) NOT NULL,
  `tipo_interaccion` enum('vista','favorito','calificacion','pedido','agregado_carrito') NOT NULL,
  `valor_interaccion` decimal(3,2) DEFAULT NULL,
  `fecha_interaccion` timestamp NOT NULL DEFAULT current_timestamp(),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario_pizza_interacciones`
--

INSERT INTO `usuario_pizza_interacciones` (`id`, `usuario_id`, `pizza_id`, `tipo_interaccion`, `valor_interaccion`, `fecha_interaccion`, `creado_en`) VALUES
(1, 2, 14, 'calificacion', 5.00, '2025-07-15 01:40:22', '2025-07-15 01:40:22'),
(2, 2, 2, 'calificacion', 4.00, '2025-07-23 00:12:09', '2025-07-23 00:12:09'),
(3, 2, 1, 'calificacion', 4.00, '2025-07-23 00:12:14', '2025-07-23 00:12:14'),
(4, 2, 3, 'calificacion', 4.00, '2025-07-23 00:12:29', '2025-07-23 00:12:29'),
(5, 2, 6, 'calificacion', 4.00, '2025-07-23 00:12:33', '2025-07-23 00:12:33'),
(6, 2, 4, 'calificacion', 3.00, '2025-07-23 01:18:46', '2025-07-23 01:18:46'),
(7, 2, 5, 'calificacion', 1.00, '2025-07-23 01:19:31', '2025-07-23 01:19:31'),
(8, 2, 11, 'calificacion', 1.00, '2025-07-23 01:30:34', '2025-07-23 01:30:34'),
(9, 2, 19, 'calificacion', 4.00, '2025-07-23 23:45:14', '2025-07-23 23:45:14'),
(10, 2, 9, 'calificacion', 2.00, '2025-07-24 00:43:43', '2025-07-24 00:43:43'),
(11, 7, 1, 'calificacion', 4.00, '2025-07-24 21:26:18', '2025-07-24 21:26:18'),
(12, 7, 2, 'calificacion', 4.00, '2025-07-24 21:31:25', '2025-07-24 21:31:25'),
(13, 7, 3, 'calificacion', 4.00, '2025-07-24 21:31:28', '2025-07-24 21:31:28'),
(14, 7, 4, 'calificacion', 2.00, '2025-07-24 21:31:30', '2025-07-24 21:31:30'),
(15, 7, 5, 'calificacion', 4.00, '2025-07-24 21:31:32', '2025-07-24 21:31:32');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedidos_usuario_id` (`usuario_id`),
  ADD KEY `idx_pedidos_estado` (`estado`),
  ADD KEY `idx_pedidos_estado_pago` (`estado_pago`),
  ADD KEY `fk_pedidos_empleado` (`empleado_id`);

--
-- Indices de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pizza_id` (`pizza_id`),
  ADD KEY `idx_pedido_items_pedido_id` (`pedido_id`);

--
-- Indices de la tabla `pizzas`
--
ALTER TABLE `pizzas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pizzas_categoria` (`categoria`),
  ADD KEY `idx_pizzas_disponible` (`disponible`);

--
-- Indices de la tabla `pizzas_favoritas`
--
ALTER TABLE `pizzas_favoritas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_usuario_pizza_favorita` (`usuario_id`,`pizza_id`),
  ADD KEY `idx_pizzas_favoritas_usuario_id` (`usuario_id`),
  ADD KEY `idx_pizzas_favoritas_pizza_id` (`pizza_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_usuarios_correo` (`correo`);

--
-- Indices de la tabla `usuario_pizza_interacciones`
--
ALTER TABLE `usuario_pizza_interacciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_pizza_interacciones_usuario_id` (`usuario_id`),
  ADD KEY `idx_usuario_pizza_interacciones_pizza_id` (`pizza_id`),
  ADD KEY `idx_usuario_pizza_interacciones_tipo` (`tipo_interaccion`),
  ADD KEY `idx_usuario_pizza_interacciones_fecha` (`fecha_interaccion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT de la tabla `pizzas`
--
ALTER TABLE `pizzas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `pizzas_favoritas`
--
ALTER TABLE `pizzas_favoritas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuario_pizza_interacciones`
--
ALTER TABLE `usuario_pizza_interacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pedido_items`
--
ALTER TABLE `pedido_items`
  ADD CONSTRAINT `pedido_items_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_items_ibfk_2` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`);

--
-- Filtros para la tabla `pizzas_favoritas`
--
ALTER TABLE `pizzas_favoritas`
  ADD CONSTRAINT `fk_pizzas_favoritas_pizza` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pizzas_favoritas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuario_pizza_interacciones`
--
ALTER TABLE `usuario_pizza_interacciones`
  ADD CONSTRAINT `usuario_pizza_interacciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `usuario_pizza_interacciones_ibfk_2` FOREIGN KEY (`pizza_id`) REFERENCES `pizzas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
