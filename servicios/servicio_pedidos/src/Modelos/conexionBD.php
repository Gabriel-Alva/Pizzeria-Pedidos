<?php
// sistema_pizzeria/servicios/servicio_pedidos/src/Modelos/ConexionBD.php

namespace App\Modelos;

use PDO;
use PDOException;

class ConexionBD
{
    private static $instancia = null;
    private $conexion;
    private $config;

    private function __construct(array $config)
    {
        $this->config = $config;
        $this->conectar();
    }

    private function conectar()
    {
        $dsn = "{$this->config['driver']}:host={$this->config['host']};dbname={$this->config['database']};charset={$this->config['charset']}";
        $opciones = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->conexion = new PDO($dsn, $this->config['username'], $this->config['password'], $opciones);
        } catch (PDOException $e) {
            die("Error de conexión a la base de datos: " . $e->getMessage());
        }
    }

    public static function obtenerInstancia(array $config): self
    {
        if (self::$instancia === null) { 
            self::$instancia = new self($config);
        }
        return self::$instancia;
    }

    public function obtenerConexion(): PDO
    {
        return $this->conexion;
    }
}