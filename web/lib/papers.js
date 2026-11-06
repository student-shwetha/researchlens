// All research-paper SQL used by the web app lives here.
// Reads use the v_paper_details VIEW (../database/04). Writes go to the base tables
// inside a single transaction so a paper is never half-saved.
import { query, withTransaction } from './db.js';
import { HttpError } from './errors.js';

export async function listPapers() {
  return query(
    `SELECT paper_id, title, publication_year, journal, authors, topics, domains, times_cited
       FROM v_paper_details
      ORDER BY publication_year DESC, paper_id DESC`
  );
}

export async function getPapersByIds(ids) {
  if (!ids.length) return [];
  return query(
    `SELECT paper_id, title, publication_year, journal, authors, topics, domains, times_cited
       FROM v_paper_details WHERE paper_id IN (?)`,
    [ids]
  );
}

export async function getPaper(id) {
  const rows = await query('SELECT * FROM v_paper_details WHERE paper_id = ?', [id]);
  if (!rows.length) return null;
  const paper = rows[0];

  const [authors, topics, keywords, cites, citedBy] = await Promise.all([
    query(
      `SELECT a.author_id, a.name, a.affiliation, pa.author_order
         FROM paper_author pa JOIN author a ON a.author_id = pa.author_id
        WHERE pa.paper_id = ? ORDER BY pa.author_order, a.name`,
      [id]
    ),
    query(
      `SELECT t.topic_id, t.topic_name, s.subdomain_name, d.domain_name
         FROM paper_topic pt
         JOIN research_topic t     ON t.topic_id = pt.topic_id
         JOIN research_subdomain s ON s.subdomain_id = t.subdomain_id
         JOIN research_domain d    ON d.domain_id = s.domain_id
        WHERE pt.paper_id = ? ORDER BY d.domain_name, t.topic_name`,
      [id]
    ),
    query(
      `SELECT k.keyword_id, k.keyword_name
         FROM paper_keyword pk JOIN keyword k ON k.keyword_id = pk.keyword_id
        WHERE pk.paper_id = ? ORDER BY k.keyword_name`,
      [id]
    ),
    query(
      `SELECT p.paper_id, p.title, p.publication_year, c.citation_context
         FROM citation c JOIN research_paper p ON p.paper_id = c.cited_paper_id
        WHERE c.citing_paper_id = ? ORDER BY p.publication_year DESC`,
      [id]
    ),
    query(
      `SELECT p.paper_id, p.title, p.publication_year, c.citation_context
         FROM citation c JOIN research_paper p ON p.paper_id = c.citing_paper_id
        WHERE c.cited_paper_id = ? ORDER BY p.publication_year DESC`,
      [id]
    ),
  ]);

  return { ...paper, authorList: authors, topicList: topics, keywordList: keywords, cites, citedBy };
}

export async function getSavedPaperIds(userId) {
  const rows = await query('SELECT paper_id FROM saved_paper WHERE user_id = ?', [userId]);
  return rows.map((row) => Number(row.paper_id));
}

export async function listSavedPapers(userId) {
  return query(
    `SELECT sp.saved_paper_id, sp.paper_id, sp.saved_at, v.title, v.publication_year, v.journal,
            v.authors, v.topics, v.domains, v.times_cited
       FROM saved_paper sp
       JOIN v_paper_details v ON v.paper_id = sp.paper_id
      WHERE sp.user_id = ?
      ORDER BY sp.saved_at DESC, sp.saved_paper_id DESC`,
    [userId]
  );
}

export async function savePaperForUser(userId, paperId) {
  const exists = await query(
    'SELECT saved_paper_id FROM saved_paper WHERE user_id = ? AND paper_id = ?',
    [userId, paperId]
  );
  if (exists.length) return { savedPaperId: exists[0].saved_paper_id, alreadySaved: true };

  const res = await query(
    'INSERT INTO saved_paper (user_id, paper_id) VALUES (?, ?)',
    [userId, paperId]
  );
  return { savedPaperId: res.insertId, alreadySaved: false };
}

export async function unsavePaperForUser(userId, paperId) {
  const res = await query('DELETE FROM saved_paper WHERE user_id = ? AND paper_id = ?', [userId, paperId]);
  return { removed: res.affectedRows > 0 };
}

export async function getPaperRecommendations(paperId, limit = 5) {
  const current = await getPaper(paperId);
  if (!current) return [];

  const rows = await query(
    `SELECT paper_id, title, publication_year, journal, authors, topics, domains, times_cited
       FROM v_paper_details
      WHERE paper_id <> ?
      ORDER BY publication_year DESC, paper_id DESC
      LIMIT 250`,
    [paperId]
  );

  const currentTopicSet = new Set((current.topicList || []).map((t) => String(t.topic_name).trim().toLowerCase()));
  const currentAuthorSet = new Set((current.authorList || []).map((a) => String(a.name).trim().toLowerCase()));

  return rows
    .map((paper) => {
      const topicList = String(paper.topics || '').split(', ').filter(Boolean);
      const authorList = String(paper.authors || '').split(', ').filter(Boolean);
      const topicMatches = topicList.filter((topic) => currentTopicSet.has(topic.trim().toLowerCase())).length;
      const authorMatches = authorList.filter((author) => currentAuthorSet.has(author.trim().toLowerCase())).length;
      const score = topicMatches * 2 + authorMatches;
      return { ...paper, score };
    })
    .filter((paper) => paper.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.times_cited || 0) - Number(a.times_cited || 0) || Number(b.publication_year || 0) - Number(a.publication_year || 0))
    .slice(0, limit);
}

/** Lookup lists for forms and search filters. */
export async function getMeta() {
  const [domains, topics, authors, years] = await Promise.all([
    query('SELECT domain_id, domain_name FROM research_domain ORDER BY domain_name'),
    query(
      `SELECT t.topic_id, t.topic_name, s.subdomain_name, d.domain_id, d.domain_name
         FROM research_topic t
         JOIN research_subdomain s ON s.subdomain_id = t.subdomain_id
         JOIN research_domain d    ON d.domain_id = s.domain_id
        ORDER BY d.domain_name, s.subdomain_name, t.topic_name`
    ),
    query('SELECT author_id, name FROM author ORDER BY name'),
    query(
      `SELECT MIN(publication_year) AS min_year, MAX(publication_year) AS max_year
         FROM research_paper`
    ),
  ]);
  return { domains, topics, authors, years: years[0] };
}

// ---------------------------------------------------------------------
// Writes (ADMIN only - checked in the API route)
// ---------------------------------------------------------------------

async function writeLinks(q, paperId, input) {
  // Topics
  const topicRows = input.topic_ids.map((t) => [paperId, t]);
  await q('INSERT INTO paper_topic (paper_id, topic_id) VALUES ?', [topicRows]);

  // Authors: reuse an existing author with the same name, otherwise create one.
  const authorRows = [];
  for (const [index, name] of input.authors.entries()) {
    const existing = await q('SELECT author_id FROM author WHERE name = ? ORDER BY author_id LIMIT 1', [name]);
    let authorId = existing[0]?.author_id;
    if (!authorId) {
      const res = await q('INSERT INTO author (name) VALUES (?)', [name]);
      authorId = res.insertId;
    }
    authorRows.push([paperId, authorId, index + 1]);
  }
  await q('INSERT INTO paper_author (paper_id, author_id, author_order) VALUES ?', [authorRows]);

  // Keywords: create any that are new, then link them.
  if (input.keywords.length) {
    await q('INSERT IGNORE INTO keyword (keyword_name) VALUES ?', [input.keywords.map((k) => [k])]);
    const kw = await q('SELECT keyword_id FROM keyword WHERE keyword_name IN (?)', [input.keywords]);
    await q('INSERT INTO paper_keyword (paper_id, keyword_id) VALUES ?', [kw.map((k) => [paperId, k.keyword_id])]);
  }
}

// research_paper's only UNIQUE column is doi, so a duplicate-key error there
// always means the DOI is taken.
function doiTaken(err) {
  if (err?.errno === 1062) throw new HttpError(409, 'A paper with this DOI already exists.');
  throw err;
}

export async function createPaper(input) {
  return withTransaction(async (q) => {
    const res = await q(
      `INSERT INTO research_paper (title, publication_year, doi, pdf_url, abstract, journal)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [input.title, input.publication_year, input.doi, input.pdf_url, input.abstract, input.journal]
    ).catch(doiTaken);
    const paperId = res.insertId;
    await writeLinks(q, paperId, input);
    return paperId;
  });
}

export async function updatePaper(id, input) {
  return withTransaction(async (q) => {
    const existing = await q(
      'SELECT paper_id FROM research_paper WHERE paper_id = ? FOR UPDATE',
      [id]
    );
    if (existing.length === 0) throw new HttpError(404, 'Paper not found.');

    await q(
      `UPDATE research_paper
          SET title = ?, publication_year = ?, doi = ?, pdf_url = ?, abstract = ?, journal = ?
        WHERE paper_id = ?`,
      [input.title, input.publication_year, input.doi, input.pdf_url, input.abstract, input.journal, id]
    ).catch(doiTaken);
    // Replace the link rows (simplest correct way to apply edits to M:N lists)
    await q('DELETE FROM paper_topic   WHERE paper_id = ?', [id]);
    await q('DELETE FROM paper_author  WHERE paper_id = ?', [id]);
    await q('DELETE FROM paper_keyword WHERE paper_id = ?', [id]);
    await writeLinks(q, id, input);
    return id;
  });
}

export async function deletePaper(id) {
  // ON DELETE CASCADE removes its topic/author/keyword/citation links;
  // trg_paper_after_delete writes the audit-log row.
  const res = await query('DELETE FROM research_paper WHERE paper_id = ?', [id]);
  if (res.affectedRows === 0) throw new HttpError(404, 'Paper not found.');
}

// ---------------------------------------------------------------------
// Search (Member 2) - keyword / title / author + filters
// ---------------------------------------------------------------------
export async function searchPapers({ q, type, domain, topic, yearFrom, yearTo }) {
  const where = [];
  const params = [];
  let relevanceSql = '0';
  const relevanceParams = [];

  if (q) {
    const like = `%${q}%`;
    if (type === 'title') {
      where.push('p.title LIKE ?');
      params.push(like);
    } else if (type === 'author') {
      where.push(`EXISTS (SELECT 1 FROM paper_author pa JOIN author a ON a.author_id = pa.author_id
                          WHERE pa.paper_id = p.paper_id AND a.name LIKE ?)`);
      params.push(like);
    } else {
      // keyword: FULLTEXT index on (title, abstract) + the keyword table + LIKE fallback
      relevanceSql = 'MATCH(p.title, p.abstract) AGAINST (? IN NATURAL LANGUAGE MODE)';
      relevanceParams.push(q);
      where.push(`(MATCH(p.title, p.abstract) AGAINST (? IN NATURAL LANGUAGE MODE)
                   OR p.title LIKE ?
                   OR EXISTS (SELECT 1 FROM paper_keyword pk JOIN keyword k ON k.keyword_id = pk.keyword_id
                              WHERE pk.paper_id = p.paper_id AND k.keyword_name LIKE ?))`);
      params.push(q, like, like);
    }
  }
  if (domain) {
    where.push(`EXISTS (SELECT 1 FROM paper_topic pt
                          JOIN research_topic t     ON t.topic_id = pt.topic_id
                          JOIN research_subdomain s ON s.subdomain_id = t.subdomain_id
                         WHERE pt.paper_id = p.paper_id AND s.domain_id = ?)`);
    params.push(domain);
  }
  if (topic) {
    where.push('EXISTS (SELECT 1 FROM paper_topic pt WHERE pt.paper_id = p.paper_id AND pt.topic_id = ?)');
    params.push(topic);
  }
  if (yearFrom) {
    where.push('p.publication_year >= ?');
    params.push(yearFrom);
  }
  if (yearTo) {
    where.push('p.publication_year <= ?');
    params.push(yearTo);
  }

  const sql = `
    SELECT v.paper_id, v.title, v.publication_year, v.journal, v.authors, v.topics,
           v.domains, v.keywords, v.times_cited, ${relevanceSql} AS relevance
      FROM research_paper p
      JOIN v_paper_details v ON v.paper_id = p.paper_id
     WHERE ${where.length ? where.join(' AND ') : '1 = 1'}
     ORDER BY relevance DESC, v.publication_year DESC
     LIMIT 100`;
  return query(sql, [...relevanceParams, ...params]);
}

export async function recordSearch(userId, queryText, searchType, resultsCount) {
  await query(
    'INSERT INTO search_history (user_id, query, search_type, results_count) VALUES (?, ?, ?, ?)',
    [userId, queryText, searchType, resultsCount]
  );
}
