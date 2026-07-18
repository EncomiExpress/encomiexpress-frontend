# EncomiExpress - Frontend

Panel web administrativo para la gestión operativa de OsvaldoC Mensajería y Logística S.A.S., empresa especializada en el transporte de encomiendas. Diseñada como una herramienta centralizada para administradores, que permite gestionar ventas, encomiendas, rutas, conductores, vehículos y anticipos, complementando la aplicación móvil orientada a la gestión y legalización de anticipos.

---

## Integrantes del Equipo

- Santiago Suárez Durán
- Sebastian Valencia Peréz
- Valeria Paz Arana
- Yeferson Andres Moreno Granda

---

## Índice

- [Características Implementadas](#características-implementadas)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura Limpia](#arquitectura-limpia)
- [Sistema de Navegación](#sistema-de-navegación)
- [Modos de Navegación](#modos-de-navegación)
- [Sistema de Tema](#sistema-de-tema)
- [Componentes Destacados](#componentes-destacados)
- [Decisiones de Diseño](#decisiones-de-diseño)
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Variables de Entorno](#variables-de-entorno)
- [Instalación](#instalación)
- [Ejecutar en Entorno Local](#ejecutar-en-entorno-local)
- [Repositorios relacionados](#repositorios-relacionados)
- [Licencia](#licencia)

---

## Características Implementadas

| Rol | Funcionalidades |
|------|----------------|
| **Administrador** | - Gestión completa de usuarios <br> - Asignación de roles y permisos <br> - Administración de clientes, conductores y propietarios <br> - Control de flota vehicular <br> - Programación de rutas y destinos <br> - Gestión de encomiendas y ventas <br> - Control de anticipos y excedentes <br> - Medición de desempeño del sistema <br> - Descarga de guía de envío en PDF <br> - Exportación a Excel de los datos registrados |
| **General** | - Inicio de sesión <br> - Cierre de sesión <br> - Navegación basada en permisos <br> - Dashboard de indicadores <br> - Modo oscuro / modo claro <br> - Paleta de colores personalizable (rojo / azul) <br> - Dos modos de navegación: Sidebar y Top Nav |

---

## Stack Tecnológico

- React 19 + JavaScript (ES6+)
- Vite — Herramienta de construcción rápida
- Material UI (MUI) v7 — Componentes de React para Material Design
- React Router v7 — Enrutamiento de aplicaciones
- React Context — Gestión de estado global
- Fetch API — Cliente HTTP nativo para peticiones al backend
- Recharts — Gráficas del Dashboard
- jsPDF + jsbarcode — Generación de la guía de envío en PDF con código de barras
- ExcelJS — Exportación de listados a Excel con formato y marca propia

---

## Arquitectura limpia

El proyecto sigue un patrón **feature-based** que separa las funcionalidades por dominio, manteniendo el código organizado y escalable:

```bash
src/
│
├── features/                  # Módulos funcionales de la aplicación
│   ├── auth/                  # Autenticación y gestión de usuarios
│   ├── dashboard/             # Panel principal con indicadores
│   ├── clientes/              # Gestión de clientes
│   ├── ventas/                # Gestión de ventas/encomiendas
│   ├── conductores/           # Administración de conductores
│   ├── destinos/              # Catálogo de ubicaciones
│   ├── propietarios/          # Gestión de propietarios de vehículos
│   ├── rutas/                 # Programación de rutas
│   ├── vehiculos/             # Gestión de vehículos
│   ├── usuarios/              # Gestión de usuarios
│   ├── roles/                 # Gestión de roles y permisos
│   └── anticipos/             # Control de anticipos y excedentes
│
├── shared/                    # Recursos compartidos entre features
│   ├── styles/                # Tema centralizado (theme.js con createTheme)
│   ├── contexts/              # Contextos globales (estado con React Context)
│   ├── components/            # Componentes reutilizables
│   ├── hooks/                 # Hooks personalizados
│   ├── services/              # Servicios API (auth, ventas, clientes, etc.)
│   ├── utils/                 # Formatters, colores por estado, export a Excel/PDF
│   └── config/                # Configuración (API URL, constantes, secciones de nav)
│
├── assets/                    # Imágenes estáticas (logos, ilustraciones)
├── App.jsx                    # Providers anidados y configuración
├── AppRoutes.jsx              # Definición de rutas protegidas
└── main.jsx                   # Punto de entrada
```

### Principios de Arquitectura Implementados

- **Feature-based Structure**: Cada dominio funcional tiene su propia carpeta con sus páginas
- **Context API**: Gestión de estado global centralizada en `shared/contexts/`
- **Providers anidados**: Inyección de dependencias en `App.jsx` para disponibilidad global
- **Control de permisos**: Sistema basado en permisos granulares (`PERMISOS.*`)
- **Navegación protegida**: `PrivateRoute` con verificación de permisos automática

---

## Sistema de Navegación

La aplicación utiliza un patrón de navegación basado en permisos que verifica el acceso a cada sección:

1. **Pantalla de Login**
   - Punto de entrada para todos los usuarios
   - Autenticación con JWT

2. **Rutas protegidas**
   - Verificación de autenticación de usuario
   - Control de permisos por ruta (`PERMISOS.*`)

3. **Navegación interna**
   - `Dashboard`: Panel principal con indicadores
   - `Clientes`: CRUD completo de clientes
   - `Conductores`: Administración de conductores
   - `Propietarios`: Gestión de propietarios de vehículos
   - `Vehículos`: Control de flota
   - `Destinos`: Catálogo de ubicaciones
   - `Rutas`: Programación de rutas
   - `Usuarios`: Gestión de cuentas de usuario
   - `Roles`: Asignación de permisos
   - `Ventas`: Gestión de encomiendas
   - `Anticipos`: Control de anticipos y excedentes

La navegación se implementa utilizando `react-router-dom` v7 con rutas programáticas y `PrivateRoute` para verificación de permisos.

---

## Modos de Navegación

El panel soporta dos modos de navegación que el usuario puede alternar desde la paleta de configuración (ícono de paleta en el Header):

| Modo | Descripción |
|------|-------------|
| **Sidebar** | Menú lateral colapsable con secciones jerárquicas. Muestra saludo, nombre y fecha/hora debajo. |
| **Top Nav** | Barra de navegación horizontal superior. Muestra logo, saludo y fecha/hora en tiempo real. |

La preferencia se guarda automáticamente en `localStorage` y se restaura al volver a la aplicación.

---

## Sistema de Tema

El tema se gestiona en `ThemeContext.jsx` y se aplica globalmente vía `ThemeProvider` de MUI.

### Modos de color
| Modo | Descripción |
|------|-------------|
| **Claro** | Fondo blanco / gris claro, texto oscuro |
| **Oscuro** | Fondo oscuro, texto claro — implementado completamente |

### Paletas disponibles
| Paleta | Color primario | Color secundario |
|--------|---------------|-----------------|
| **Roja** | `#CC1818` | `#1A2E6E` |
| **Azul** | `#1A2E6E` | `#CC1818` |

Todos los colores se definen de forma centralizada en `src/shared/styles/theme.js` mediante `createTheme()` y se consumen a través del `ThemeProvider`.

---

## Componentes Destacados

| Componente | Descripción |
|------------|-------------|
| **Header** | Barra superior con avatar, cambio de contraseña, logout y paleta de configuración (colores + modo de navegación) |
| **Sidebar** | Menú lateral colapsable con secciones jerárquicas, saludo personalizado y fecha/hora en tiempo real |
| **TopNav** | Barra horizontal superior con logo, saludo, secciones de navegación y fecha/hora en tiempo real |
| **LayoutAdmin** | Layout principal que renderiza Sidebar o TopNav según la preferencia del usuario |
| **LoadingScreen** | Pantalla de carga con animación de camión y logo de marca |
| **FormularioEstandarizado** | Librería interna de componentes de formulario (FormField, FormSelect, PasswordField, etc.) |
| **SessionExpiredDialog** | Aviso modal cuando el token expira en medio de una sesión activa |

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| **ThemeProvider + createTheme (MUI)** | Sistema de theming centralizado en `theme.js`; soporta dark mode y cambio de paleta sin tocar componentes |
| **Context API vs Redux** | React Context es suficiente para este tamaño de aplicación; evita complejidad adicional |
| **fetch nativo vs Axios** | fetch API es nativo del browser; evita dependencia adicional para el scope actual |
| **Preferencias en localStorage** | El modo de navegación y la paleta de colores persisten entre sesiones sin necesidad de backend |

---
## Requisitos del Sistema

| Requisito | Versión mínima | Notas |
|---|---|---|
| Node.js | 18 | Requerido por Vite 7 |
| npm | Incluido con Node.js | Gestor de paquetes |
| Git | Cualquiera | Para clonar el repositorio |

Además necesitas el [backend de EncomiExpress](https://github.com/EncomiExpress/encomiexpress-backend) corriendo (local o remoto) — sin él, el panel no tiene de dónde traer datos.

---

## Variables de Entorno

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Si tu backend corre en un puerto o dominio distinto a `localhost:3000`, ajusta `VITE_API_URL` en tu `.env` — si no la defines, el frontend usa ese valor por defecto.

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/EncomiExpress/encomiexpress-frontend.git
cd encomiexpress-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

---

## Ejecutar en Entorno Local

```bash
# Servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar el build de producción
npm run preview
```

---

## Repositorios relacionados

| Repositorio | Descripción | Stack |
|---|---|---|
| [encomiexpress-backend](https://github.com/EncomiExpress/encomiexpress-backend) | API REST del sistema | Node.js · Express · PostgreSQL · Sequelize |
| [encomiexpress-mobile](https://github.com/EncomiExpress/encomiexpress-mobile) | Aplicación móvil para conductores | Flutter · Dart |

---

## Licencia

Este proyecto está bajo la licencia MIT — ver el archivo [LICENSE](./LICENSE) para más detalles.

---

Desarrollado con apoyo de herramientas de inteligencia artificial Claude (Anthropic) y Kilo Code.