# CU Services Portal

The CU Services Portal is a searchable directory of University of Chittagong
service portals. It includes a public-facing catalog, an authenticated
administration dashboard, and a local SQLite database. The application starts
with empty portal data: it does not load demo records or import the legacy JSON
store.

## Features

### Public portal

- Browse service cards grouped by category.
- Search by service title, description, tags, or portal URL.
- Admins can enter descriptions of up to 30 words; cards display up to 50 words
  for compatibility with existing records.
- Open a portal from its title link or the **Visit Portal** action.
- See status badges for active, disabled, and coming-soon services.
- See portal availability after a server-side health check. Only an HTTP `200`
  response is considered live; other HTTP responses and connection failures are
  shown as down.
- Use the responsive mobile header, including the expandable search control.
- See scheduled notices and maintenance announcements.

Services can have a configurable display order within their category. Lower
numbers appear first.

### Administration

Open `/admin/auth` to sign in. The dashboard includes:

- **Service Catalog:** create, edit, enable/disable, order, and delete service
  cards.
- **Category Groups:** create and order the categories used by the public
  portal.
- **Header Broadcast Notices:** publish and schedule notices, maintenance
  windows, and coming-soon announcements.
- **Users & Credentials:** manage administrator profiles and roles
  (superadmin-only).
- **Click Infographics:** view totals, trends, top services, peak hours, device
  breakdowns, and recent click events; export click data as CSV or clear it.
- **Health & Uptime:** view portal check results and manually check one or all
  portals.
- **Dynamic Font Manager:** select and preview English and Bengali font
  presets.
- **SQLite Database:** view the database path and schema, copy the schema SQL,
  export a JSON configuration backup, or clear portal data (superadmin-only).
- **Audit Ledger:** review administrative actions.

The administration UI uses these roles: `SUPER_ADMIN`,
`MAINTENANCE_SERVICES`, `MAINTENANCE_NOTICES`, `MAINTENANCE_GROUPS`, and
`MAINTENANCE_VIEWER`. Available controls depend on the assigned role. The API
requires authentication for administrative writes, and user-management API
operations are restricted to superadmins.

## Technology and tools

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS 4.
- **API:** Node.js and Express 4.
- **Database:** SQLite through `better-sqlite3`; the API uses WAL mode.
- **UI:** Lucide icons and Motion animations.
- **Database clients:** [DB Browser for SQLite](https://sqlitebrowser.org/) or
  [SQLiteStudio](https://sqlitestudio.pl/).

SQLite is a local database file, not a separate database server. This project
does not provide a phpMyAdmin-like web database client. The admin dashboard
shows the file location and schema; use a desktop SQLite client on the server
to inspect the file directly.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Windows, macOS, or Linux

## Local development

### 1. Install dependencies

From the repository root:

```sh
npm install
```

### 2. Configure the environment

Copy `.env.example` to `.env`, then set `ADMIN_EMAIL` and a strong
`ADMIN_PASSWORD`. See [Environment variables](#environment-variables).

### 3. Start the API

In one terminal:

```sh
npm run server
```

The API listens on port `4000` by default and creates
`server/portal.sqlite` when the database file does not exist.

### 4. Start the frontend

In another terminal:

```sh
npm run dev
```

Open <http://localhost:3000>. Vite proxies `/api` requests to
`http://localhost:4000`.

The admin sign-in and dashboard routes are:

- Sign-in: <http://localhost:3000/admin/auth>
- Dashboard: <http://localhost:3000/admin/dashboard>

The dashboard route requires an authenticated admin session.

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `API_PORT` | No | `4000` | Port used by the Express API. |
| `SQLITE_DB_PATH` | No | `server/portal.sqlite` | SQLite file path. Relative paths resolve from the API process working directory. |
| `ADMIN_EMAIL` | First admin only | None | Email for creating the initial admin account. |
| `ADMIN_PASSWORD` | First admin only | None | Password for the initial admin account; use a strong unique value. |
| `ADMIN_FULL_NAME` | No | `Portal Administrator` | Display name for the initial admin account. |
| `ADMIN_DEPARTMENT` | No | `ICT Cell` | Department for the initial admin account. |
| `VITE_API_URL` | No | `/api` | Frontend API base URL; useful when the API is hosted separately. Include `/api`, e.g. `https://api.example.edu/api`. |

The Vite development proxy targets port `4000`. If you change `API_PORT` for
local development, set `VITE_API_URL` to the API's full base URL, such as
`http://localhost:4001/api`.

The API creates the configured initial administrator only when the `users`
table is empty. Changing the environment variables does not replace an
existing administrator. There are no built-in credentials; never put real
credentials in source control or this README.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port `3000`. |
| `npm run server` | Start the Express API. |
| `npm run dev:api` | Alias for `npm run server`. |
| `npm run lint` | Run the TypeScript compiler without emitting files. |
| `npm run build` | Create the production frontend bundle in `dist/`. |
| `npm run preview` | Preview the production frontend bundle locally. |

## SQLite database and data

- Default database: `server/portal.sqlite`.
- Custom location: set `SQLITE_DB_PATH`.
- Schema version: 2.
- Database primary keys are SQLite integers; the API exposes record IDs as
  strings for frontend compatibility.
- Fields are stored in relational columns. Service tags are in a separate
  table. `admin_audit_logs.details` is the only JSON-formatted data field.
- New databases contain the application schema but no sample portal data.
- The legacy `server/data.json` store was removed and is not imported.
- Browser local storage is not a data migration source.

The application tables are:

| Table | Contents |
| --- | --- |
| `service_groups` | Category details and category ordering |
| `services` | Service details, category reference, status, and display order |
| `service_tags` | Service tags and their positions |
| `portal_notices` | Notices, links, schedule, and status |
| `users` | Administrator profiles, roles, and account status |
| `service_clicks` | Portal click events, device, timestamp, and request metadata |
| `service_health_checks` | Latest health result per service |
| `admin_audit_logs` | Administrative actions and optional JSON details |
| `portal_settings` | Persisted portal settings, including font configuration |

The API retains up to 5,000 click events. A schema upgrade that requires a
database rebuild can recreate the schema empty. Back up the database before
upgrading or changing its schema.

### Database tools and backups

Use DB Browser for SQLite or SQLiteStudio on the server and open the database
file. Stop the API before making manual changes or copying the database file.
SQLite WAL mode can create `-wal` and `-shm` sidecar files while the API is
running, so do not copy only the main file while it is open.

The dashboard's JSON export is a configuration export, not a complete SQLite
backup: it includes service, group, notice, and user profile data, with user
password fields masked. It does not replace a database backup.

## Health checks and API

The public portal requests health results from the API after its service list
loads. The API checks active services with HTTP/HTTPS URLs, with a 4-second
timeout and a short shared cache. Only an HTTP `200` response is live; redirects,
other status codes, timeouts, and connection failures are not marked live.
Checks are made by the API so cross-origin browser restrictions do not hide the
remote status code. The API limits checks to public hosts on standard HTTP or
HTTPS ports.

Useful endpoints:

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /api/health` | Public | Check that the local API and SQLite database are available. |
| `GET /api/bootstrap` | Public | Load public services, groups, notices, and font settings. |
| `GET /api/health-checks` | Public | Check active service portals and return their latest status. |
| `POST /api/clicks` | Public | Record a portal click. |
| `POST /api/auth/login` | Public | Sign in and receive an admin bearer token. |
| `/api/admin/*` | Authenticated | Manage admin data and settings. |

The API stores its current admin bearer tokens in memory; restarting the API
invalidates existing sessions, so admins will need to sign in again.

## Production deployment

Build the frontend with:

```sh
npm run build
```

This creates static files in `dist/`. `npm run preview` is intended for local
preview, not as a production web server. For production, serve `dist/` through
your chosen static host or reverse proxy and run the Express API as a separate
service. Route `/api` requests to the API, or set `VITE_API_URL` to the API base
URL when building the frontend for a separate API origin.

Keep the SQLite file on persistent storage, protect `.env` and the database
from public access, use HTTPS for the deployed portal, and back up the database
regularly.

## Documentation

- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md): schema, initialization, and
  database-client guidance.
