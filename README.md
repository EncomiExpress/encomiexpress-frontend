# EncomiExpress - Frontend

Panel web administrativo para la gestión operativa de OsvaldoC Mensajería y Logística S.A.S., empresa especializada en el transporte de encomiendas. Diseñada como una herramienta centralizada para administradores, que permite gestionar ventas, encomiendas, rutas, conductores, vehículos y anticipos, complementando la aplicación móvil orientada a la gestión y legalización de anticipos.

---

## Características Implementadas

| Rol | Funcionalidades |
|------|----------------|
| **Administrador** | - Gestión completa de usuarios <br> - Asignación de roles y permisos <br> - Administración de clientes, conductores y propietarios <br> - Control de flota vehicular <br> - Programación de rutas y destinos <br> - Gestión de encomiendas y ventas <br> - Control de anticipos y excedentes <br> - Medición de desempeño del sistema |
| **General** | - Inicio de sesión <br> - Cierre de sesión <br> - Navegación basada en permisos <br> - Dashboard de indicadores |

---

## Stack Tecnológico

- React 19 + JavaScript (ES6+)
- Vite — Herramienta de construcción rápida
- Material UI (MUI) v7 — Componentes de React para Material Design
  - `@mui/material/styles` — `ThemeProvider` + `createTheme` para sistema de theming centralizado
  - `@emotion/react` & `@emotion/styled` — Styling engine de MUI
- React Router v7 — Enrutamiento de aplicaciones
- React Context — Gestión de estado global
- Fetch API — Cliente HTTP nativo para peticiones al backend

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
│   ├── services/              # Servicios API (auth, ventas, clientes, etc.)
│   └── config/                # Configuración (API URL, constantes)
│
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

## Paleta de Colores

Todos los colores se definen de forma centralizada en `src/shared/styles/theme.js` mediante `createTheme()` de MUI y se consumen a través del `ThemeProvider`.

| Nombre | Color | Uso |
|-------|-------|-----|
| `primary.main` | `#CC1818` | Rojo principal — acciones destacadas, botones primarios, acentos |
| `primary.light` | `#FFE8E8` | Rojo claro — fondos sutiles, chips |
| `primary.dark` | `#b91c1c` | Rojo oscuro — hover de botones |
| `secondary.main` | `#1A2E6E` | Azul oscuro — navegación, encabezados, elementos secundarios |
| `secondary.light` | `#2a3f8f` | Azul claro |
| `text.primary` | `#1a0e0c` | Texto principal |
| `text.secondary` | `#8A94A6` | Texto secundario / muted |
| `text.dark` | `#212121` | Texto oscuro (headings) |
| `background.default` | `#F5F6FA` | Fondo general |
| `background.subtle` | `#F9F9F9` | Hover de filas |
| `divider` | `#E0E0E0` | Bordes y divisores |
| `gradient.navbar` | `linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)` | Barra superior decorativa |
| `gradient.primary` | `linear-gradient(135deg, #CC1818, #dc2626)` | Fondos de encabezado de formulario |

---

## Componentes Destacados

| Componente | Descripción | Características |
|------------|-------------|-----------------|
| **Header** | Barra superior de la app administrador | Título de la sección activa, colores del tema |
| **Sidebar** | Navegación principal con secciones colapsables | Avatar con iniciales, logout integrado, secciones: General, Personas, Transporte, Finanzas, Paquetes |
| **Layout** | Layout de la pantalla de autenticación | Fondo decorativo con gradiente hero, colores del tema |
| **LayoutAdmin** | Layout principal con barra decorativa | Barra superior `linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)` |
| **LoadingScreen** | Pantalla de carga con identidad de marca | Logo centrado, animación de spinner, fondo con colores primarios del sistema |
| **FormularioEstandarizado** | Librería de componentes de formulario | FormField, FormSelect, PasswordField, PrimaryButton, SecondaryButton, FormHeader con gradiente |

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
| **ThemeProvider + createTheme (MUI)** | Sistema de theming centralizado en `theme.js`; preparado para dark mode y cambio de paleta sin tocar componentes |
| **Context API vs Redux** | React Context es suficiente para este tamaño de aplicación; evita complejidad adicional |
| **fetchWithAuth centralizado** | Single source of truth para manejo de errores (401 auto-logout, 403 manejo silencioso) |
| **fetch nativo vs Axios** | fetch API es nativo del browser; evita dependencia adicional para el scope actual |
| **Componentes sin estado (presentacionales)** | Separación clara: Context maneja lógica de negocio, Components solo UI |

---

## Variables de Entorno

Creá un archivo `.env` en la raíz del proyecto:

```dotenv
# URL del Backend API
VITE_API_URL=http://localhost:3000/api
```

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/EncomiExpress/encomiexpress-frontend.git
cd encomiexpress-frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar servidor de desarrollo
npm run dev

# 4. Construir para producción
npm run build

# 5. Previsualizar build de producción
npm run preview
```

---

## Repositorios relacionados

| Repositorio | Descripción | Stack |
|---|---|---|
| [encomiexpress-backend](https://github.com/EncomiExpress/encomiexpress-backend) | API REST del sistema | Node.js · Express · PostgreSQL · Sequelize |
| [encomiexpress-mobile](https://github.com/EncomiExpress/encomiexpress-mobile) | Aplicación móvil para conductores | Flutter · Dart |

---

Desarrollado con apoyo de herramientas de inteligencia artificial Claude (Anthropic) y Kilo Code.
