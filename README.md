# EncomiExpress - Frontend

Frontend de la aplicación de gestión de encomiendas y transporte Express.

## 🛠️ Tecnologías

- **React 18** - Biblioteca de JavaScript para construir interfaces de usuario
- **Vite** - Herramienta de construcción rápida
- **Material UI (MUI)** - Componentes de React para Material Design
- **React Router v6** - Enrutamiento de aplicaciones
- **React Context** - Gestión de estado global
- **Axios** - Cliente HTTP para peticiones al backend

## 📋 Requisitos

- Node.js 18+ 
- npm 9+

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── Components/         # Componentes reutilizables
│   ├── FormularioEstandarizado.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   └── Sidebar.jsx
├── Context/            # Contextos de React (estado global)
│   ├── AuthContext.jsx
│   ├── ClienteContext.jsx
│   ├── ConductorContext.jsx
│   ├── VentaContext.jsx
│   └── ...
├── Pages/              # Páginas de la aplicación
│   ├── Cliente/
│   ├── Conductor/
│   ├── Destino/
│   ├── Propietario/
│   ├── Rol/
│   ├── RutaProgramacion/
│   ├── Usuario/
│   ├── Vehiculo/
│   └── Venta/
├── routes/             # Componentes de rutas protegidas
├── services/           # Servicios API
└── config/             # Configuración global
```

## 🎯 Módulos del Sistema

| Módulo | Descripción |
|--------|-------------|
| **Usuarios** | Gestión de usuarios del sistema |
| **Clientes** | Registro y gestión de clientes |
| **Conductores** | Administración de conductores |
| **Propietarios** | Gestión de propietarios de vehículos |
| **Vehículos** | Control de flota vehicular |
| **Destinos** | Catálogo de destinos disponibles |
| **Rutas** | Programación de rutas |
| **Ventas** | Gestión de encomiendas y ventas |
| **Anticipos** | Control de anticipos y excedentes |
| **Medición** | Indicadores de desempeño |

## 🔐 Autenticación

El sistema cuenta con autenticación basada en tokens JWT y control de permisos por roles:
- Administrador
- Gerente  
- Vendedor
- Conductor
- Auxiliar

## 🎨 Estilos

El proyecto utiliza un diseño estandarizado con formulario de múltiples pasos (stepper) para mejorar la experiencia de usuario. Colores principales:
- **Primario:** `#CC1818` (Rojo)
- **Secundario:** `#1A2E6E` (Azul oscuro)

## 📝 Notas de Desarrollo

- Los módulos de ventas tienen datos quemados (mock) para pruebas frontend
- La conexión con el backend se realiza a través de servicios en `/src/services`
- Los contextos proporcionan estado global y funciones de API
