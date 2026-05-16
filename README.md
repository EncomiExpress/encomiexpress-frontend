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
- Material UI (MUI) — Componentes de React para Material Design
- @emotion/react & @emotion/styled — Styling para MUI
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
│   │   └── pages/             # Login, Register
│   ├── dashboard/             # Panel principal con indicadores
│   │   └── pages/
│   ├── clientes/              # Gestión de clientes
│   │   └── pages/
│   ├── ventas/                # Gestión de ventas/encomiendas
│   │   └── pages/
│   ├── conductores/           # Administración de conductores
│   │   └── pages/
│   ├── destinos/              # Catálogo de ubicaciones
│   │   └── pages/
│   ├── propietarios/          # Gestión de propietarios de vehículos
│   │   └── pages/
│   ├── rutas/                 # Programación de rutas
│   │   └── pages/
│   ├── vehiculos/             # Gestión de vehículos
│   │   └── pages/
│   ├── usuarios/              # Gestión de usuarios
│   │   └── pages/
│   ├── roles/                 # Gestión de roles y permisos
│   │   └── pages/
│   ├── anticipos/             # Control de anticipos y excedentes
│   │   └── pages/
│   └── medicionDesempeno/     # Indicadores de desempeño
│       └── pages/
│
├── shared/                    # Recursos compartidos entre features
│   ├── contexts/              # Contextos globales (estado con React Context)
│   ├── components/            # Componentes reutilizables
│   ├── services/              # Servicios API (auth, ventas, clientes, etc.)
│   ├── styles/                # Estilos globales
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

| Nombre | Color | Uso |
|---|---|---|
| `primary` | `#CC1818` | Rojo principal - acciones y elementos destacados |
| `secondary` | `#1A2E6E` | Azul oscuro - elementos secundarios y navegación |
| `bgGray` | `#F5F6FA` | Fondo general de la aplicación |
| `cardBg` | `#FFFFFF` | Tarjetas y superficies |
| `textMain` | `#1E293B` | Texto principal |

---

## Componentes Destacados

| Componente | Descripción | Características |
|------------|-------------|-----------------|
| **LoadingScreen** | Pantalla de carga con identidad de marca | Logo centrado, animación de spinner, fondo con colores primarios del sistema |
| **FormularioEstandarizado** | Librería de componentes de formulario | FormField, FormSelect, PasswordField, PrimaryButton, SecondaryButton, FormHeader con gradiente |
| **Sidebar** | Navegación principal con secciones colapsables | Avatar con iniciales, logout integrado, secciones: General, Personas, Transporte, Finanzas, Paquetes |
| **LayoutAdmin** | Layout principal con barra decorativa | Barra superior `linear-gradient(90deg, #1a2e6e, #CC1818, #1a2e6e)` |

---

## Decisiones de Diseño

| Decisión | Justificación |
|----------|---------------|
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
