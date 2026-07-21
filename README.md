# Notes App

Aplicación web para gestionar notas con soporte de categorías y filtros. Arquitectura SPA separada en frontend y backend independientes.

## Características

**_Fase 1_**

- Crear, editar y eliminar notas
- Archivar y desarchivar notas
- Listado de notas activas y archivadas

**_Fase 2_**

- Agregar y quitar categorías a notas
- Filtrar notas por categoría desde el sidebar

## Stack tecnológico

| Capa          | Tecnología                | Versión      |
| ------------- | ------------------------- | ------------ |
| Frontend      | React + TypeScript + Vite | 19 / 5.9 / 7 |
| Estilos       | Tailwind CSS              | 4            |
| HTTP client   | Axios                     | 1.13         |
| Enrutado      | React Router              | 7            |
| Backend       | NestJS + TypeScript       | 11 / 5.7     |
| ORM           | Prisma                    | 6            |
| Base de datos | PostgreSQL (Supabase)     | 16           |
| Runtime       | Node.js                   | ≥ 20.x       |

## Estructura del repositorio

```md
/
├── backend/   # API REST (NestJS) — puerto 3000
├── frontend/  # SPA (React + Vite) — puerto 5173
└── .github/   # Workflows (keep-alive para Supabase free tier)
```

## Autenticación

> Esta app no requiere autenticación. No hay login ni usuario/contraseña.

## Inicio rápido

### Prerrequisitos

- Node.js ≥ 20.x con npm ≥ 10.x
- Cuenta en [Supabase](https://supabase.com) (proyecto PostgreSQL free)
- La base de datos es **PostgreSQL en Supabase** — no hay SQLite local.
- La API del backend debe ser accesible desde el frontend. En desarrollo: `http://localhost:3000/api`. Para producción, configurar `VITE_API_URL` en `frontend/.env.local`.

### Opción A — Script automático (Linux / macOS / Git Bash en Windows)

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x start.sh

# Ejecutar
./start.sh
```

El script hace todo automáticamente:

- Verifica Node.js ≥ 20
- Si los puertos 3000 o 5173 están ocupados, pregunta si querés liberarlos
- Si `backend/.env` no existe, lo crea desde `.env.example` y pide confirmar credenciales
- Instala dependencias, genera el cliente Prisma y sincroniza el schema
- Arranca ambos servidores (Ctrl+C detiene los dos)

### Opción B — Manual

#### 1. Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase (ver sección Variables de entorno)

# Generar cliente Prisma y sincronizar schema
npx prisma generate
npx prisma db push

# Iniciar en modo desarrollo
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.  
Swagger UI en `http://localhost:3000/api/docs`.  
Healthcheck en `http://localhost:3000/api/health`.

> Nota: para borrar todos los datos y empezar limpio, en Supabase ejecutá `TRUNCATE notes, categories, note_categories RESTART IDENTITY CASCADE;` o recreá el proyecto.

#### 2. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# (Opcional) Configurar URL del backend si no es la por defecto
echo "VITE_API_URL=http://localhost:3000/api" > .env.local

# Iniciar en modo desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno (Backend)

| Variable       | Descripción                                                            | Ejemplo                                                                                         |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Cadena de conexión **transaction pooler** de Supabase (puerto 6543)    | `postgresql://postgres.xxx:PASS@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `DIRECT_URL`   | Cadena de conexión **directa/session** de Supabase (puerto 5432)       | `postgresql://postgres.xxx:PASS@aws-0-region.pooler.supabase.com:5432/postgres?sslmode=require` |
| `FRONTEND_URL` | URL del frontend para CORS (coma-separada si son varias)               | `http://localhost:5173,https://tudominio.com`                                                   |
| `PORT`         | Puerto del servidor (default 3000)                                     | `3000`                                                                                          |

> **Importante — SSL:** Supabase exige SSL. Ambas URLs **deben terminar en `&sslmode=require`** (o `?sslmode=require` si no hay query params). El pooler ya trae `?pgbouncer=true`, agregale `&sslmode=require`.

## Despliegue en Render (Blueprint)

El repositorio incluye `render.yaml` para despliegue automático como **Blueprint**:

1. En Render: **New → Blueprint** → conectá el repo `MatiasCarlsson/Notizen`.
2. Render crea tres recursos:
   - **PostgreSQL** (no se usa si usás Supabase, pero el blueprint lo define)
   - **Web Service: notizen-backend** — build + start, `DATABASE_URL` y `DIRECT_URL` como `sync: false` (las completás en el dashboard).
   - **Static Site: notizen-frontend** — build estático, SPA fallback a `index.html`.
3. En el backend, completá las variables de entorno:
   - `DATABASE_URL` = pooler transaction-mode de Supabase + `&sslmode=require`
   - `DIRECT_URL` = directa/session de Supabase + `?sslmode=require`
   - `FRONTEND_URL` = URL del frontend en Render (ej. `https://notizen-frontend.onrender.com`)
4. En el frontend, completá `VITE_API_URL` = URL del backend + `/api` (ej. `https://notizen-backend.onrender.com/api`).
5. Deploy.

> **Nota:** El free tier de Render hace cold-start tras 15 min de inactividad (la primera request tarda ~30-60s). El free tier de Supabase pausa el proyecto tras 7 días sin actividad. Para evitar la pausa de Supabase, el repo incluye un workflow `.github/workflows/keep-alive.yml` que corre `SELECT 1` semanalmente (requiere agregar secret `SUPABASE_DIRECT_URL` en Settings → Secrets del repo).

## Keep-alive Supabase (GitHub Actions)

`.github/workflows/keep-alive.yml` ejecuta una consulta trivial semanalmente para que Supabase no pause la DB. Para que funcione:

1. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
2. Nombre: `SUPABASE_DIRECT_URL` — Valor: tu `DIRECT_URL` de Supabase (con `?sslmode=require`).
3. El workflow corre los lunes a las 04:17 UTC y también se puede lanzar manualmente (*Run workflow*).

## Arquitectura del backend

El backend sigue una separación estricta en capas:

```md
Controller → Service → Repository → Prisma (PostgreSQL)
```

- **Controllers** — reciben las request HTTP y delegan al servicio
- **Services** — contienen la lógica de negocio
- **Repositories** — encapsulan el acceso a la base de datos vía Prisma
- **DTOs** — validan y tipan los datos de entrada con `class-validator`

## Endpoints principales

| Método | Ruta                               | Descripción                           |
| ------ | ---------------------------------- | ------------------------------------- |
| GET    | `/api/notes`                       | Notas activas (acepta `?categoryId=`) |
| GET    | `/api/notes/archived`              | Notas archivadas                      |
| POST   | `/api/notes`                       | Crear nota                            |
| PATCH  | `/api/notes/:id`                   | Editar nota                           |
| DELETE | `/api/notes/:id`                   | Eliminar nota                         |
| PATCH  | `/api/notes/:id/archive`           | Archivar / desarchivar                |
| GET    | `/api/categories`                  | Listar categorías                     |
| POST   | `/api/categories`                  | Crear categoría                       |
| POST   | `/api/notes/:id/categories/:catId` | Agregar categoría a nota              |
| DELETE | `/api/notes/:id/categories/:catId` | Quitar categoría de nota              |

La documentación completa está disponible en Swagger (`/api/docs`).  
Healthcheck: `GET /api/health` → `{ "status": "ok", "db": "up" }`.