import { query } from './db.js';

const FIELD_KEYS = ['summary', 'methodology', 'sample_size', 'limitations'];

function splitList(value) {
  return value ? value.split(', ').filter(Boolean) : [];
}

function toField(row) {
  return {
    text: row.extracted_text,
    numericValue: row.numeric_value == null ? null : Number(row.numeric_value),
    quote: row.source_quote,
    section: row.source_section,
    confidence: row.confidence == null ? null : Number(row.confidence),
    origin: row.origin,
  };
}

export async function getMatrixData() {
  const [paperRows, extractionRows, claimRows] = await Promise.all([
    query(
      `SELECT paper_id, title, publication_year, journal, authors, topics, domains
         FROM v_paper_details ORDER BY publication_year DESC, paper_id DESC`
    ),
    query(
      `SELECT e.paper_id, e.field_key, e.extracted_text, e.numeric_value,
              e.source_quote, e.source_section, e.confidence, e.origin
         FROM paper_extraction e
         JOIN research_paper p ON p.paper_id = e.paper_id
        ORDER BY e.paper_id, e.field_key`
    ),
    query(
      `SELECT c.claim_text, c.basis, s.paper_id, s.stance
         FROM matrix_claim c
         LEFT JOIN matrix_claim_stance s ON s.claim_id = c.claim_id
        ORDER BY c.claim_id, s.paper_id`
    ),
  ]);

  const fieldsByPaper = new Map();
  for (const row of extractionRows) {
    const id = Number(row.paper_id);
    if (!fieldsByPaper.has(id)) fieldsByPaper.set(id, {});
    fieldsByPaper.get(id)[row.field_key] = toField(row);
  }

  const papers = paperRows.map((row) => {
    const id = Number(row.paper_id);
    const fields = fieldsByPaper.get(id) ?? {};
    return {
      id,
      title: row.title,
      year: row.publication_year == null ? null : Number(row.publication_year),
      journal: row.journal,
      authors: row.authors ?? '',
      topics: splitList(row.topics),
      domains: splitList(row.domains),
      fields,
      sampleN: fields.sample_size?.numericValue ?? null,
    };
  });

  const claimsByText = new Map();
  for (const row of claimRows) {
    if (!claimsByText.has(row.claim_text)) {
      claimsByText.set(row.claim_text, { claim: row.claim_text, basis: row.basis, stances: {} });
    }
    if (row.paper_id != null) {
      claimsByText.get(row.claim_text).stances[Number(row.paper_id)] = row.stance;
    }
  }

  return { papers, claims: [...claimsByText.values()] };
}

const STOP_WORDS = new Set([
  'about', 'after', 'against', 'among', 'and', 'are', 'compare', 'does', 'from',
  'how', 'into', 'main', 'show', 'that', 'the', 'their', 'these', 'this', 'those',
  'used', 'using', 'what', 'which', 'with', 'were', 'where', 'when', 'why', 'paper',
  'papers', 'study', 'studies', 'research', 'related', 'find', 'showing',
]);

function questionTokens(question) {
  const words = question.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  const useful = words.filter((word) => !STOP_WORDS.has(word));
  return useful.length ? useful : words;
}

function normalizeToken(token) {
  if (/^optim(?:izer|izers|ization|izations|ize|izes|ized|izing)$/.test(token)) return 'optim';
  if (token.length > 4 && token.endsWith('ies')) return `${token.slice(0, -3)}y`;
  if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

function fieldIntent(question) {
  const q = question.toLowerCase();
  if (/sample|participant|population|size|cohort/.test(q)) {
    return { key: 'sample_size', terms: ['sample', 'participant', 'population', 'size', 'cohort'] };
  }
  if (/method|approach|design|technique/.test(q)) {
    return { key: 'methodology', terms: ['method', 'approach', 'design', 'technique'] };
  }
  if (/limitation|weakness|caveat/.test(q)) {
    return { key: 'limitations', terms: ['limitation', 'weakness', 'caveat'] };
  }
  if (/summary|abstract|overview/.test(q)) {
    return { key: 'summary', terms: ['summary', 'abstract', 'overview'] };
  }
  return null;
}

function fieldPriority(question, fieldKey) {
  return fieldIntent(question)?.key === fieldKey;
}

export async function answerMatrixQuestion(question, paperIds) {
  const rows = await query(
    `SELECT p.paper_id, p.title, e.field_key, e.extracted_text, e.numeric_value, e.origin
       FROM research_paper p
       JOIN paper_extraction e ON e.paper_id = p.paper_id
      WHERE p.paper_id IN (?) AND e.field_key IN (?)
        AND e.origin <> 'unavailable'
      ORDER BY p.paper_id, e.field_key`,
    [paperIds, FIELD_KEYS]
  );
  const tokens = questionTokens(question);
  const intent = fieldIntent(question);
  const topicTokens = intent
    ? tokens.filter((token) => !intent.terms.some((term) => token.startsWith(term)))
    : tokens;
  const normalizedTopicTokens = topicTokens.map(normalizeToken);
  const categoryOnlyQuestion = Boolean(intent && topicTokens.length === 0);
  const bestByPaper = new Map();

  for (const row of rows) {
    const text = row.extracted_text ?? '';
    const searchableTokens = new Set(
      `${row.title} ${text} ${row.numeric_value ?? ''}`
        .toLowerCase()
        .match(/[a-z0-9]{3,}/g)
        ?.map(normalizeToken) ?? []
    );
    const matches = normalizedTopicTokens.filter((token) => searchableTokens.has(token)).length;
    const priority = fieldPriority(question, row.field_key);
    if (!matches && !(categoryOnlyQuestion && priority)) continue;

    const candidate = {
      row,
      score: matches / Math.max(normalizedTopicTokens.length, 1) + (priority ? 0.1 : 0),
    };
    const paperId = Number(row.paper_id);
    const current = bestByPaper.get(paperId);
    if (!current || candidate.score > current.score) bestByPaper.set(paperId, candidate);
  }

  const ranked = [...bestByPaper.values()]
    .sort((a, b) => b.score - a.score || Number(a.row.paper_id) - Number(b.row.paper_id))
    .slice(0, 5);

  const citations = ranked.map(({ row, score }) => ({
    paperId: Number(row.paper_id),
    title: row.title,
    snippet: row.field_key === 'sample_size' && row.numeric_value != null
      ? `${row.extracted_text} (recorded value: ${row.numeric_value})`
      : row.extracted_text,
    score: Math.min(1, score),
    origin: row.origin,
  }));

  if (!citations.length) {
    return {
      answer: intent?.key === 'sample_size' || intent?.key === 'limitations'
        ? 'The selected papers do not have verified sample-size or limitations extractions yet. Their catalog abstracts do not report these details; review the linked full texts before drawing conclusions.'
        : 'No matching extracted fields were found for those selected papers. Try a question about summaries, methods, sample sizes, or limitations.',
      citations: [],
    };
  }

  const sampleQuestion = /sample|participant|population|size|cohort/i.test(question);
  const hasDemoValue = citations.some((item) => item.origin === 'demo');
  const demoNotice = hasDemoValue
    ? 'Synthetic demo assumptions below are not reported by the papers and must not be cited as findings. '
    : '';
  const answer = demoNotice + (sampleQuestion
    ? `Sample-size information in the selected papers: ${citations.map((item) => `${item.title}: ${item.snippet}`).join('; ')}.`
    : `The closest matching extracted information is in ${citations.map((item) => item.title).join('; ')}.`);
  return { answer, citations };
}
