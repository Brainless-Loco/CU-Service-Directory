# CU Services Portal

## Run locally

1. Install Node.js 20.19+ or 22.12+ and run `npm install`.
2. Copy `.env.example` to `.env` and set `ADMIN_EMAIL` and a strong
   `ADMIN_PASSWORD`.
3. Start the API with `npm run server`.
4. In another terminal, run `npm run dev` and open the Vite URL.

The API creates `server/portal.sqlite` on first startup. Set `SQLITE_DB_PATH`
to change its location. The application starts with empty portal tables; it
does not load demo data or import the old JSON store.

## Admin and database tools

Open `/admin/auth` to sign in with the account configured in `.env`. The
admin dashboard is available at `/admin/dashboard` after authentication.
Existing admin features are in the dashboard's **Database** tab.

To browse or edit SQLite directly, install [DB Browser for SQLite](https://sqlitebrowser.org/)
or SQLiteStudio on the server and open the database file. SQLite has no
database-server login or phpMyAdmin-equivalent web portal in this application.
The dashboard displays the database path and schema; do not make manual edits
while the API is running.

See [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) for the table layout, database
location, and empty-database behavior.
