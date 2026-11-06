# ResearchLens

ResearchLens is a research-paper discovery platform built for the DBMS Experiential Learning Level 3 project. It combines relational paper metadata and application data with semantic discovery over a vector database.

## Repository layout

- [`database/`](./database/) — MySQL schema, sample data, advanced SQL, tests, and migrations.
- [`web/`](./web/) — Next.js application, API routes, and complete application setup instructions.

## Run locally

1. Install Node.js 20.6 or newer and Docker Desktop.
2. Open a terminal in `web/`, copy `.env.example` to `.env.local`, and set your own database password and random `JWT_SECRET` (at least 32 characters). Never commit `.env.local`.
3. From `web/`, start MySQL and Qdrant:

   ```powershell
   docker compose --env-file .env.local up -d
   ```

4. Still in `web/`, install dependencies, verify the services, index papers, and run Next.js:

   ```powershell
   npm install
   npm run check-setup
   npm run index-papers
   npm run dev
   ```

5. Open <http://localhost:3000>. Register a student account. To enable admin features, follow the role-promotion instructions in [`web/README.md`](./web/README.md).

See [`web/README.md`](./web/README.md) for feature details, database setup options, API documentation, security notes, and troubleshooting.

## Database documentation

The [Chen-notation ER diagram](./web/docs/researchlens_chen_er.svg) and [relational schema diagram](./web/docs/researchlens_relational_schema.svg) describe the SQL schema only. Qdrant and semantic search are documented separately in the application README.
