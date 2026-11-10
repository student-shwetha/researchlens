# ResearchLens

**An intelligent research paper discovery and semantic analysis system** — DBMS Level 3 project.

| | |
|---|---|
| Team | Shwetha S (PES1UG24CS452) · Pratistha Majumder (PES1UG25CS831) |
| Relational DB | MySQL 8.0 — papers, authors, topics hierarchy, citations, users, search history |
| Second DB paradigm | **Qdrant vector database** — 384-dim embeddings of every paper for meaning-based search |
| Application | Next.js 15 (App Router) + React 19, API routes, JWT sessions, bcrypt passwords |

---

## Features

**Research-paper module (Member 1)**
- Paper list and detail pages: title, abstract, year, DOI, journal, PDF link, authors (in order), topics (domain › subdomain › topic), keywords, *cites* and *cited by* lists.
- Add / Edit forms (ADMIN only). Authors and keywords that don't exist yet are created automatically. Everything is written in **one transaction**.
- Admins can upload one PDF at a time (up to 25 MB), then manually enter its paper details. Uploaded files are served to signed-in users and stored locally under `storage/uploads/`; back up that directory with the database.
- Delete with a confirmation dialog (ADMIN only). Links cascade (`ON DELETE CASCADE`), the vector is removed from Qdrant, and a trigger writes an audit row.

**Authentication, search and the second database (Member 2)**
- Register / login with **bcrypt** password hashes; httpOnly JWT session cookie (8 h).
- Two roles: **STUDENT** (browse, search, save searches) and **ADMIN** (+ add/edit/delete papers, change roles, rebuild vector index, view audit log). Roles are enforced **on the server in every API route** and re-read from MySQL on each request.
- Search by keywords (MySQL **FULLTEXT** index on title+abstract + keyword table), title or author, with **domain / topic / year-range filters**.
- Every search is written to `search_history` (query, type, timestamp, result count). Searches can be **saved** to `saved_search`, listed, re-run and removed.
- **Personal library**: students can save papers to a personal reading list and revisit them later from the My Library page.
- **Recommended papers**: each paper page includes a lightweight related-paper recommendation block based on shared topics/authors.
- **Semantic search** (Qdrant): describe an idea in plain words and get papers with similar meaning, even with no shared words. Results are limited to the top matches scoring at least 0.35 cosine similarity, so weak matches are omitted. Optional year filter on the vector payload.
- **Similar papers** panel on every paper page (nearest neighbours of that paper's vector).
- **Data Matrix** with searchable extraction fields, filters, CSV export, source details and a selected-paper question panel that ranks matching extracted information and returns at most one result per paper. Abstract-based notes are distinguished from verified full-text extractions. Five papers can have conspicuously labeled synthetic sample-size/limitations examples for UI demonstrations; these are assumptions, not paper-reported results.

**Advanced SQL — 6 distinct concepts**

| # | Concept | Object(s) | File | Owner |
|---|---|---|---|---|
| 1 | Stored procedure | `sp_add_paper` | `sql/03_member1_advanced.sql` | Member 1 |
| 2 | Transaction (COMMIT / ROLLBACK via EXIT HANDLER) | inside `sp_add_paper`; app uses transactions for add/edit | `sql/03…`, `lib/db.js` | Member 1 |
| 3 | Stored function | `fn_citation_count` | `sql/03…` | Member 1 |
| 4 | Full-text index + search | `ft_paper_title_abstract`, `MATCH … AGAINST` | `sql/01…`, `lib/papers.js` | Member 1 |
| 5 | Triggers | 6 triggers: data cleaning, validation (`SIGNAL`), audit trail | `sql/04_member2_advanced.sql` | Member 2 |
| 6 | Views | `v_paper_details`, `v_topic_statistics`, `v_user_search_activity` | `sql/04…` | Member 2 |

Plus constraints (PK, FK with cascade, UNIQUE, NOT NULL, CHECK), B-tree indexes, `EXPLAIN`, JOIN / GROUP BY / HAVING / sub-query examples (`sql/02…`) and negative tests (`sql/05…`).

---

## Project structure

```
researchlens/
├── sql/
│   ├── 01_schema.sql                      tables, constraints, indexes, FULLTEXT index
│   ├── 02_sample_data_and_queries.sql     sample data, DML demo, JOIN/GROUP BY/HAVING/sub-query/EXPLAIN
│   ├── 03_member1_advanced.sql            stored procedure + transaction, stored function
│   ├── 04_member2_advanced.sql            triggers, audit table, views
│   ├── 04b_extractions.sql                Data Matrix extraction and demo-claim tables
│   ├── 05_validation_and_negative_tests.sql   statements that MUST fail (run with --force)
│   ├── 06_correct_gpt3_paper_links.sql    repair the GPT-3 sample record
│   ├── 07_repair_sample_paper_links.sql   repair/remove placeholder sample links
│   ├── 08_replace_synthetic_papers.sql    replace synthetic rows with sourceable papers
│   ├── 09_allow_uploaded_pdf_urls.sql     permit authenticated local PDF upload URLs
│   ├── 10_saved_paper_library.sql         add the library table to an existing database
│   ├── 11_matrix_abstract_coverage.sql    replace old demo cells with explicit abstract/full-text coverage
│   └── 12_matrix_synthetic_demo_values.sql synthetic example values for five papers
├── app/                                   Next.js pages and API routes (app/api/**/route.js)
├── components/                            React components (forms, search UI, …)
├── lib/
│   ├── db.js           MySQL pool + transaction helper
│   ├── auth.js         session + requireUser / requireAdmin
│   ├── token.js        JWT sign/verify (also used by middleware)
│   ├── validate.js     input validation
│   ├── papers.js       all paper / search SQL
│   ├── matrix.js       Data Matrix queries and extraction-field matching
│   ├── embeddings.js   all-MiniLM-L6-v2 embeddings (runs locally)
│   ├── qdrant.js       Qdrant REST client
│   └── vector.js       MySQL ⇄ Qdrant sync + semantic queries
├── scripts/
│   ├── index-papers.mjs   build the vector index from MySQL
│   ├── check-setup.mjs    health check for the demo
│   └── refresh-matrix-coverage.mjs update extraction coverage on an existing DB
├── middleware.js                          redirects for logged-out users / students on admin pages
├── docker-compose.yml                     MySQL 8 + Qdrant
├── .env.example                           copy to .env.local
└── docs/original/                         Lab 4 submission (ER diagram, relational schema, first script)
```

---

## Setup

Requirements: **Node.js 20.6+**, and either **Docker Desktop** (easiest) or a local **MySQL 8.0.16+**.

### 1. Start the databases

**Option A — Docker (recommended).** First do step 2 below (create `.env.local` with your own `DB_PASSWORD`), then from the project folder:

```bash
docker compose --env-file .env.local up -d
```

This starts MySQL on port 3306 with the root password taken from `.env.local` (no password is written in any source file), runs the numbered schema, sample-data and migration scripts automatically, and starts Qdrant on port 6333. The final sample-data migration replaces the remaining synthetic records so every seeded paper has a sourceable DOI and PDF.

**Option B — MySQL installed on your machine.** Open the MySQL command-line client in the project folder and run, in order:

```sql
SOURCE sql/01_schema.sql;
SOURCE sql/02_sample_data_and_queries.sql;
SOURCE sql/03_member1_advanced.sql;
SOURCE sql/04_member2_advanced.sql;
SOURCE sql/04b_extractions.sql;
SOURCE sql/06_correct_gpt3_paper_links.sql;
SOURCE sql/07_repair_sample_paper_links.sql;
SOURCE sql/08_replace_synthetic_papers.sql;
SOURCE sql/09_allow_uploaded_pdf_urls.sql;
SOURCE sql/11_matrix_abstract_coverage.sql;
```

(MySQL Workbench works too: open each file and run it with the ⚡ button.) Then start Qdrant either with Docker only for Qdrant — `docker run -p 6333:6333 qdrant/qdrant:v1.20.0` — or by downloading the Qdrant binary for your OS from <https://github.com/qdrant/qdrant/releases> and running it.

If you already have the database set up, run `SOURCE sql/04b_extractions.sql;` once to add the Data Matrix tables and demo claims. Then run `SOURCE sql/07_repair_sample_paper_links.sql;`, `SOURCE sql/08_replace_synthetic_papers.sql;`, `SOURCE sql/09_allow_uploaded_pdf_urls.sql;`, and `SOURCE sql/11_matrix_abstract_coverage.sql;` to repair links and refresh matrix coverage. Alternatively, after configuring `.env.local`, run `npm run refresh-matrix-coverage`. This replaces demo extraction cells with abstract-based summaries/method notes and explicit full-text-needed states; it does not invent sample sizes or limitations.

If the database was created before the personal library feature was added, run
`SOURCE sql/10_saved_paper_library.sql;` to add its table without dropping or
changing existing data. The script is safe to run when the table already exists.

To add five clearly labeled synthetic sample-size/limitations examples for a UI demo, run `npm run seed-matrix-demo` after `npm run refresh-matrix-coverage`. These assumed values are not source findings and must not be cited or submitted as actual paper extractions. The database script is also available as `SOURCE sql/12_matrix_synthetic_demo_values.sql;`.

### 2. Configure

```bash
cp .env.example .env.local      # Windows: copy .env.example .env.local
```

Edit `.env.local`: set `DB_PASSWORD` (your MySQL root password, or any new password if you use Docker) and a random `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Install, index, run

```bash
npm install
npm run refresh-matrix-coverage # update abstract/full-text coverage (safe to rerun)
npm run seed-matrix-demo        # optional synthetic examples; not paper-reported data
npm run check-setup      # verifies MySQL objects, Qdrant and JWT_SECRET
npm run index-papers     # embeds every paper into Qdrant (first run downloads the ~23 MB model)
npm run dev
```

Open <http://localhost:3000>.

### Create the first admin

The sample-data SQL does not create user accounts or default passwords. Register with your own email and a strong password in the app, then promote that account from a trusted local shell:

```powershell
$env:ADMIN_EMAIL = "your-email@example.com"
npm run promote-admin
Remove-Item Env:ADMIN_EMAIL
```

On macOS/Linux, use `ADMIN_EMAIL="your-email@example.com" npm run promote-admin`. The command only promotes an existing account; it never creates an account or accepts a password. New web registrations are always STUDENT.

If you are creating the first admin, start the app, register your own account, then run the promotion command from a trusted shell. If this database was initialized before demo accounts were removed from the sample SQL, its old accounts are still present. Remove or reset those accounts before exposing the app publicly; `npm run check-setup` flags their presence. Changing the SQL file does not alter an existing database.

### Running the negative tests

```bash
mysql -u root -p --force researchlens < sql/05_validation_and_negative_tests.sql
```

Each `EXPECT ERROR` statement must fail (CHECK, FK, UNIQUE, NOT NULL, trigger `SIGNAL`, rollback inside the procedure); the final count shows the data is unchanged.

---

## How the vector feature works

1. For each paper the server builds a text = title + abstract + keywords + topics (`lib/embeddings.js`).
2. The open-source **all-MiniLM-L6-v2** sentence-transformer (run locally with transformers.js, no API key) turns it into a **384-number vector**, mean-pooled and L2-normalised.
3. The vector is stored in the Qdrant collection `paper_embeddings` with **point id = `paper_id`** and a small payload (title, year, journal, topics, domains).
4. **Semantic search**: the query text is embedded the same way and Qdrant returns the nearest vectors by **cosine similarity** (optionally filtered by `publication_year` in the payload). The ids are then joined back to MySQL (`v_paper_details`) for authors, topics and citation counts.
5. **Similar papers**: Qdrant's query API is given the paper's own point id and returns its nearest neighbours, excluding itself.
6. MySQL stays the source of truth. Adding or editing a paper re-embeds it; deleting removes its vector. If Qdrant is down, the paper is still saved and the UI shows a warning; *Admin → Rebuild vector index* (or `npm run index-papers`) re-syncs everything.

**Why Qdrant?** The project needs "find papers that *mean* the same thing", which keyword/FULLTEXT search cannot do. That requires nearest-neighbour search over high-dimensional vectors; Qdrant is purpose-built for it (HNSW index, cosine distance, payload filtering), runs locally as one container/binary, and has a simple REST API. MySQL 8 has no native vector index.

---

## API reference

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | create STUDENT account |
| POST | `/api/auth/login` · `/api/auth/logout` | public | session cookie |
| GET | `/api/auth/me` | any | current user |
| GET | `/api/papers` | logged in | list papers (from `v_paper_details`) |
| POST | `/api/papers` | ADMIN | add paper (transaction) + index vector |
| POST | `/api/papers/uploads` | ADMIN | upload a PDF for manual paper entry |
| GET | `/api/papers/uploads/:id` | logged in | view an uploaded PDF |
| GET | `/api/papers/:id` | logged in | full paper details |
| PUT / DELETE | `/api/papers/:id` | ADMIN | edit / delete paper (+ vector sync) |
| GET | `/api/matrix` | logged in | papers, extraction fields and demo consensus labels |
| POST | `/api/matrix/ask` | logged in | rank stored extraction fields for selected papers |
| GET | `/api/meta` | logged in | domains, topics, authors for forms/filters |
| GET | `/api/search?q=&type=&domain=&topic=&yearFrom=&yearTo=` | logged in | search + write `search_history` |
| GET / DELETE | `/api/history` | logged in (own rows) | list / clear history |
| GET / POST | `/api/saved-searches` | logged in (own rows) | list / save |
| DELETE | `/api/saved-searches/:id` | owner only | remove |
| POST | `/api/semantic/search` | logged in | vector search |
| GET | `/api/semantic/similar/:id` | logged in | nearest papers to a paper |
| GET | `/api/semantic/status` | logged in | Qdrant status |
| POST | `/api/semantic/reindex` | ADMIN | rebuild vectors |
| PATCH | `/api/admin/users/:id` | ADMIN | change role |

---

## Security notes

- Passwords: bcrypt (cost 10, salted); never stored or returned in plain text. Login gives the same error for an unknown email and a wrong password.
- Sessions: HS256-signed JWT in an **httpOnly, SameSite=Lax** cookie (`Secure` in production).
- Authorization: checked server-side in every API route (`requireUser` / `requireAdmin`); the user's role is read fresh from MySQL each request. Students can only see/delete their own history and saved searches (`WHERE user_id = ?`).
- SQL injection: every query uses `?` placeholders.
- Database credentials and secrets come only from environment variables in `.env.local` (git-ignored); `lib/db.js` and `docker-compose.yml` contain no passwords.
- Database-level validation: CHECK constraints, NOT NULL, UNIQUE, foreign keys, and triggers that reject blank titles, malformed DOIs and PDF URLs other than HTTP(S) links or valid local-upload paths.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Cannot reach the MySQL database" | MySQL not running, or wrong `DB_*` values in `.env.local`. |
| `ER_NOT_SUPPORTED_AUTH_MODE` | Use a MySQL 8 server (mysql2 supports `caching_sha2_password`). |
| Error creating `fn_citation_count` (binary logging) | Run `SET GLOBAL log_bin_trust_function_creators = 1;` once as root, then re-run `sql/03`. |
| "Vector DB offline" warnings | Start Qdrant, then `npm run index-papers`. |
| First semantic search is slow | The embedding model is downloaded and loaded once (~23 MB); later queries are fast. |
| Docker MySQL didn't load the SQL | Init scripts run only on an empty volume: `docker compose down -v && docker compose --env-file .env.local up -d`. |
| "DB_HOST is not set" | Create `.env.local` from `.env.example`. |
