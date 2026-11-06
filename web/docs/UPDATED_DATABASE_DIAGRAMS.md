# ResearchLens SQL database diagrams

These are diagrams of the relational database tables defined by the project's
SQL files only. They do not model the Next.js application, APIs, embedding
model, or Qdrant/vector store.

- [Chen-notation ER diagram](./researchlens_chen_er.svg) — rectangles for
  entities, ovals for attributes, diamonds for relationships, and relationship
  cardinalities.
- [Relational schema diagram](./researchlens_relational_schema.svg) — SQL
  tables with columns, primary keys, foreign keys, composite keys, and unique
  constraints.

The diagrams include tables from `database/01_schema.sql`,
`database/04_member2_advanced.sql`, and `database/04b_extractions.sql`, including
`SAVED_PAPER`, `PAPER_AUDIT_LOG`, and the Data Matrix tables. The audit table's
`paper_id` intentionally has no foreign key so deleted papers' audit records
remain available.
