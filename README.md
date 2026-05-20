# ⚡ InventarioPro Platform

<p align="center">
  <img src="frontend/src/assets/evidencias/emi2.png" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js">
  <img src="https://img.shields.io/badge/MariaDB-Database-003545?style=for-the-badge&logo=mariadb">
  <img src="https://img.shields.io/badge/CSS3-UI-1572B6?style=for-the-badge&logo=css3">
  <img src="https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express">
</p>

---

# 📖 Descripción General

InventarioPro es una solución de software empresarial Full-Stack diseñada para la gestión centralizada de almacenes, el control operativo de stock en tiempo real y el análisis de transacciones comerciales mediante un ecosistema informático unificado.

El sistema implementa una arquitectura desacoplada basada en una API RESTful y persistencia de datos relacional sobre MariaDB, lo que garantiza la integridad referencial y auditorías operativas automatizadas del negocio.

La plataforma integra:
- Panel Administrativo de Control (Dashboard General)
- Gestión de Catálogo de Productos (CRUD Completo)
- Módulo de Caja Dinámica (Carrito de Compras y Ventas)
- Bitácora Avanzada de Auditorías con Registro de Eventos
- Sistema de Control de Acceso y Sesión de Usuarios
- Sincronización Local Multipantalla (Laptop y Dispositivos Móviles)

---

# 🛠️ Especificación Técnica del Stack

## 🖥️ Frontend (SPA)
- **React.js** → Arquitectura basada en componentes reutilizables y manejo de estados dinámicos.
- **React Scripts** → Entorno de compilación y empaquetado optimizado para el servidor cliente.
- **CSS3 Personalizado** → Interfaz responsiva con temática oscura (*Dark Mode*) estilizada para entornos de administración y ERP.
- **Fetch API** → Consumo asíncrono de los endpoints expuestos por la API REST del backend.

## ⚙️ Backend (REST API)
- **Node.js** → Entorno de ejecución asíncrono de JavaScript en el servidor.
- **Express.js** → Framework modular para el enrutamiento y gestión de peticiones HTTP.
- **Cors** → Mecanismo de seguridad perimetral para habilitar el intercambio de recursos de origen cruzado.
- **Express Static Middleware** → Despliegue y entrega de recursos físicos y assets multimedia desde el servidor.

## 🗄️ Base de Datos
- **MariaDB Server** → Motor de almacenamiento transaccional para la persistencia de datos.
- **Integridad Referencial** → Restricciones avanzadas mediante Llaves Foráneas (`FOREIGN KEY`) para resguardar el historial relacional de ventas y detalles.
- **Consultas Agregadas** → Inyección de queries complejos (`SUM`, `COUNT`, `GROUP BY`) para la automatización de KPIs analíticos en el panel principal.

---

# 📂 Arquitectura del Proyecto

```text
📁 InventarioPro/
├── 📁 backend/
│   ├── 📁 public/
│   │   └── 📁 assets/
│   │       └── 📁 productos/ # Almacenamiento físico de imágenes de productos
│   ├── 📁 uploads/           # Cargas auxiliares del servidor
│   └── 📄 server.js          # Punto de entrada de la API REST y Endpoints
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/    # Componentes modulares (Carrito, ListaProductos, etc.)
│   │   ├── 📁 assets/
│   │   │   └── 📁 evidencias/# Capturas de pantalla utilizadas en la documentación
│   │   ├── 📄 App.js         # Enrutamiento y lógica principal del cliente React
│   │   ├── 📄 Login.jsx      # Control de acceso e inicio de sesión
│   │   └── 📄 index.css      # Estilos generales de la interfaz
│   │
│   └── 📁 public/
│       ├── 📄 index.html     # Plantilla de renderizado HTML5
│       └── 📄 favicon.ico    # Icono de la pestaña del sistema
│
└── 📄 README.md