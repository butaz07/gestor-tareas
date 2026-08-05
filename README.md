# Gestor de Tareas

Aplicación web con login y CRUD de tareas, construida como base para pruebas
automatizadas con Selenium (Tarea 4).

## Stack
- Node.js + Express
- EJS (vistas)
- lowdb (base de datos JSON, sin dependencias nativas)
- express-session (autenticación)
- express-validator (validaciones de formulario)

## Instalación y ejecución

```bash
npm install
npm start
```

La app corre en http://localhost:3000

## Usuario de prueba (sembrado automáticamente)
- **Usuario:** admin
- **Contraseña:** Admin123

## Funcionalidades
- Login / Logout
- Crear tarea (título, descripción, fecha límite)
- Listar tareas
- Editar tarea
- Eliminar tarea

## Reglas de validación (usadas en las pruebas de límites)
- El título es obligatorio
- El título no puede superar los 50 caracteres
- La fecha límite es obligatoria y no puede ser anterior a hoy
