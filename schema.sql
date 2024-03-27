CREATE DATABASE parking_onzas;

USE parking_onzas;

CREATE TABLE usuarios (
  id_usuario int AUTO_INCREMENT PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  apellidos varchar(100) NOT NULL,
  domicilio varchar(100) NOT NULL,
  clave_electoral varchar(18) UNIQUE NOT NULL,
  contraseña varchar(30) NOT NULL,
  foto varchar(255) NOT NULL
)

CREATE TABLE vehiculo (
  id_vehiculo int AUTO_INCREMENT PRIMARY KEY,
  placa varchar(8) UNIQUE NOT NULL,
  no_serie varchar(17) UNIQUE NOT NULL,
  marca varchar(50) NOT NULL,
  modelo varchar(50) NOT NULL,
  color varchar(50) NOT NULL,
  id_usuario int NOT NULL,
  FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
)

CREATE TABLE usuario_pri (
  id_usuario_p int AUTO_INCREMENT PRIMARY KEY,
  tipo_usuario varchar(30) NOT NULL,
  nombre varchar(30) NOT NULL,
  apellidos varchar(30) NOT NULL,
  domicilio varchar(30) NOT NULL,
  clave_electoral_pri varchar(18) UNIQUE NOT NULL,
  contrasena varchar(30) NOT NULL
)

CREATE TABLE qr (
  id_qr int AUTO_INCREMENT PRIMARY KEY,
  id_vehiculo int NOT NULL,
  qr varchar(255) NOT NULL,
  FOREIGN KEY(id_vehiculo) REFERENCES vehiculo(id_vehiculo)
)

CREATE TABLE historial (
  id_historial int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  hora timestamp NOT NULL DEFAULT current_timestamp(),
  estado varchar(10) NOT NULL,
  id_qr int(11) NOT NULL,
  id_usuario_p int(11) NOT NULL,
  FOREIGN KEY(id_qr)REFERENCES qr(id_qr) ON DELETE CASCADE,
  FOREIGN KEY(id_usuario_p)REFERENCES usuario_pri(id_usuario_p)
)