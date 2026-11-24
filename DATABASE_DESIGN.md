# CU Services Portal — SQLite storage

The API persists portal records in a local SQLite database. Tables are
relational: fields are stored in columns, and tags are stored in their own
table. `admin_audit_logs.details` is the only JSON-formatted data field.

## Database file and schema reset

The default file is `server/portal.sqlite`. Set `SQLITE_DB_PATH` to an absolute
or project-relative path to use a different location. SQLite uses WAL mode and
a 5-second busy timeout.

Schema version 2 uses SQLite `INTEGER PRIMARY KEY AUTOINCREMENT` IDs. On the
first start after this schema change, the API rebuilds its earlier JSON-payload
schema empty. The legacy `server/data.json` file has been deleted; browser
local storage is not imported.

## Tables

| Table | Contents |
| --- | --- |
| `service_groups` | Group fields and integer ID |
| `services` | Service fields, integer ID, integer group reference |
| `service_tags` | One row per service tag |
| `portal_notices` | Notice title, message, links, schedule, and status |
| `users` | Admin profile, role, password, and status fields |
| `service_clicks` | Integer click ID, service details, timestamp, IP, and device |
| `admin_audit_logs` | Audit columns; `details` may contain JSON |
| `service_health_checks` | Latest health status per service |
| `portal_settings` | Individual font setting columns |

IDs are returned to the frontend as decimal strings for API compatibility, but
are integer primary keys in SQLite.

## First administrator

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first API launch. Optional
fields are `ADMIN_FULL_NAME` and `ADMIN_DEPARTMENT`. The API creates this
account only when the users table is empty; it has no built-in credentials.

## Click tracking

Portal visits are recorded by `POST /api/clicks` and saved in `service_clicks`.
The admin dashboard loads persisted click history on sign-in, displays total
clicks and per-service counts, and can clear click history. The API retains up
to 5,000 click records.

## Viewing the database

Use DB Browser for SQLite or SQLiteStudio on the server to inspect the database
file. The admin page's **Database** tab shows the file path and schema; this
application does not expose a phpMyAdmin-like web database client. Stop the
API before manually editing or copying the database.
