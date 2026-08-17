import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('data/problems');
const files = fs.readdirSync(root).filter((file) => file.endsWith('.json')).sort();
const taxonomy = JSON.parse(fs.readFileSync('data/taxonomy.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('data/manifest.json', 'utf8'));
const taxonomyIds = new Set(taxonomy.domains.flatMap((domain) => domain.children.map((child) => child.id)));
const areaIds = new Set(taxonomy.areas.map((area) => area.id));
const ids = new Set();
const records = [];
const forbidden = ['/data_600G/', 'solved_open_questions', 'LeanCipher', 'private_solution'];
for (const domain of taxonomy.domains) {
  if (!areaIds.has(domain.area)) throw new Error(`taxonomy domain ${domain.id} has unknown area ${domain.area}`);
}
for (const file of files) {
  const record = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  records.push({file, record});
  if (ids.has(record.id)) throw new Error(`duplicate id: ${record.id}`);
  ids.add(record.id);
  if (`${record.id}.json` !== file) throw new Error(`${file} does not match record id ${record.id}`);
  const serialized = JSON.stringify(record);
  for (const token of forbidden) {
    if (serialized.includes(token)) throw new Error(`${file} contains forbidden token ${token}`);
  }
  for (const key of ['schema_version', 'id', 'group_id', 'title', 'summary', 'formal_statement', 'scope', 'classification', 'source', 'status', 'progress', 'artifacts', 'lean', 'relations']) {
    if (!(key in record)) throw new Error(`${file} is missing required field ${key}`);
  }
  if (record.classification.taxonomy_version !== taxonomy.taxonomy_version) {
    throw new Error(`${file} uses taxonomy ${record.classification.taxonomy_version}, expected ${taxonomy.taxonomy_version}`);
  }
  if (!taxonomyIds.has(record.classification.primary)) throw new Error(`${file} has unknown primary taxonomy id`);
  for (const secondary of record.classification.secondary) {
    if (!taxonomyIds.has(secondary)) throw new Error(`${file} has unknown secondary taxonomy id ${secondary}`);
  }
  if (record.status.disclosure === 'solution_withheld' && record.progress.some((entry) => entry.kind === 'public_result')) {
    throw new Error(`${file} exposes a public_result while its disclosure is solution_withheld`);
  }
  for (const entry of record.progress) {
    if (entry.kind !== 'this_work') continue;
    if (entry.citation_labels.length !== 0) throw new Error(`${file} identifies anonymous This work progress`);
    if (/(https?:|www\.|eprint|doi|arxiv|@)/i.test(JSON.stringify(entry))) {
      throw new Error(`${file} leaks an identifier in anonymous This work progress`);
    }
  }
  if (record.lean.available_in_repo) throw new Error(`${file} claims Lean code is vendored in the first release`);
}
for (const {file, record} of records) {
  for (const relation of ['related', 'supersedes', 'superseded_by']) {
    for (const target of record.relations[relation]) {
      if (!ids.has(target)) throw new Error(`${file} has dangling ${relation} relation ${target}`);
    }
  }
}
if (manifest.record_count !== files.length) throw new Error('manifest record_count does not match public records');
if (manifest.taxonomy_version !== taxonomy.taxonomy_version) throw new Error('manifest taxonomy version does not match taxonomy');
const manifestIds = [...manifest.records].sort();
const recordIds = [...ids].sort();
if (JSON.stringify(manifestIds) !== JSON.stringify(recordIds)) throw new Error('manifest record list does not match public records');
console.log(`Public data check passed: ${files.length} records, ${ids.size} unique ids.`);
