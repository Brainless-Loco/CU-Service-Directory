# CU Services Portal — SQLite storage

The API uses a local SQLite database. It creates the database and tables on the
first server start; no database server, SQL import, seed records, or demo clicks
are required.

## Database file

By default the database is `server/portal.sqlite`. Set `SQLITE_DB_PATH` to an
absolute or project-relative path to place it elsewhere. The API enables WAL
mode and a 5-second busy timeout. Keep the database on persistent local storage
and back it up regularly. Stop the API before copying or manually editing the
database file.

## Tables

| Table | Contents |
| --- | --- |
| `services` | Service records stored as JSON payloads |
| `service_groups` | Service group records stored as JSON payloads |
| `portal_notices` | Notice records stored as JSON payloads |
| `users` | Admin account records, with a unique case-insensitive email |
| `service_clicks` | Click events with indexed event timestamps |
| `admin_audit_logs` | Administrative events with indexed timestamps |
| `portal_settings` | Font preferences and service health status |

JSON payloads preserve the existing React/API record shapes while moving all
persistence to SQLite. Click history is capped at 5,000 events and audit
history at 1,000 events by the API.

## First administrator

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the server environment before the
first launch. Optional account fields are `ADMIN_FULL_NAME` and
`ADMIN_DEPARTMENT`. The API creates that account only when the users table is
empty; it does not install a built-in password. Choose a unique, strong
password and do not commit environment files.

If no account is present, admin sign-in is unavailable until an account is
configured. The admin interface can create additional accounts after sign-in.

## Empty database behavior

This migration starts with empty application tables. It does not import the
existing `server/data.json` file or browser local storage and does not create
example services, notices, users, audit entries, or click events. The old JSON
file is left untouched as a separate file and is no longer read by the API.
The admin's **Clear Portal Data** action also clears portal content, analytics,
and settings while retaining admin accounts.

## Viewing the database

SQLite is a database file rather than a database server with a network
connection endpoint. Use DB Browser for SQLite or SQLiteStudio on the server
to inspect the file. The admin page's **Database** tab shows the file path and
schema, but does not expose a phpMyAdmin-like web client. Do not expose a
generic database editor to the public internet.
