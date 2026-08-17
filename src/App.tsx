import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';
import {
  ArrowLeft,
  ArrowUpRight,
  Binary,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  ExternalLink,
  Filter,
  ListFilter,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { areaLabels, areaOf, datasetVersion, domainOf, domains, problems, taxonomyPath } from './data';
import type { Problem } from './data';

type Status = Problem['status']['public_mathematical_status'];

const statusLabels: Record<Status, string> = {
  open: 'Open',
  partial_progress: 'Partial progress',
  resolved: 'Resolved',
  refuted: 'Refuted',
  corrected: 'Corrected',
  historically_settled: 'Historically settled',
};

const statusTone: Record<Status, string> = {
  open: 'status-open',
  partial_progress: 'status-partial',
  resolved: 'status-resolved',
  refuted: 'status-refuted',
  corrected: 'status-corrected',
  historically_settled: 'status-history',
};

const progressLabels: Record<string, string> = {
  source_statement: 'Source statement',
  prior_result: 'Prior result',
  public_result: 'Public result',
  independent_result: 'Independent result',
  audit: 'Audit',
  this_work: 'This work',
};

function hasThisWork(problem: Problem) {
  return problem.progress.some((entry) => entry.kind === 'this_work');
}

function ClassificationPath({ id }: { id: string }) {
  const path = taxonomyPath(id);
  return (
    <span className="classification-path">
      <span>{path.area}</span><span aria-hidden="true">/</span>
      <span>{path.domain}</span><span aria-hidden="true">/</span>
      <strong>{path.leaf}</strong>
    </span>
  );
}

function renderMathText(body: string) {
  return body.split(/(\$[^$]+\$)/g).map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const formula = part.slice(1, -1);
      const html = katex.renderToString(formula, { throwOnError: false, displayMode: false });
      return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <span key={index}>{part}</span>;
  });
}

function readHash() {
  const match = window.location.hash.match(/^#question\/(.+)$/);
  return match?.[1] ?? null;
}

function App() {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('all');
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [selectedId, setSelectedId] = useState<string | null>(readHash());
  const [sort, setSort] = useState<'alphabetical' | 'reviewed'>('alphabetical');

  useEffect(() => {
    const handleHash = () => setSelectedId(readHash());
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    window.setTimeout(() => document.querySelector('.detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  }, [selectedId]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...problems]
      .filter((problem) => area === 'all' || areaOf(problem.classification.primary) === area)
      .filter((problem) => domain === 'all' || domainOf(problem.classification.primary) === domain)
      .filter((problem) => status === 'all' || problem.status.public_mathematical_status === status)
      .filter((problem) => {
        if (!normalized) return true;
        const classification = taxonomyPath(problem.classification.primary);
        return [problem.title, problem.summary, classification.area, classification.domain, classification.leaf, problem.classification.tags.join(' ')].join(' ').toLowerCase().includes(normalized);
      })
      .sort((a, b) => sort === 'alphabetical'
        ? a.title.localeCompare(b.title)
        : b.status.last_reviewed.localeCompare(a.status.last_reviewed));
  }, [area, domain, query, sort, status]);

  const selected = problems.find((problem) => problem.id === selectedId) ?? null;

  function openProblem(id: string) {
    window.location.hash = `question/${id}`;
    setSelectedId(id);
  }

  function closeProblem() {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setSelectedId(null);
  }

  const areaCounts = Object.entries(areaLabels).map(([id, label]) => ({
    id,
    label,
    count: problems.filter((problem) => areaOf(problem.classification.primary) === id).length,
  }));
  const domainCounts = domains
    .filter((item) => area === 'all' || item.area === area)
    .map((item) => ({
      ...item,
      count: problems.filter((problem) => domainOf(problem.classification.primary) === item.id).length,
    }));
  const llmAidedCount = problems.filter(hasThisWork).length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CryptoFrontierAtlas home" onClick={() => closeProblem()}>
          <span className="brand-mark"><Binary size={19} strokeWidth={2.4} /></span>
          <span>CryptoFrontierAtlas</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a className="topnav-link active" href="#atlas">Atlas</a>
          <a className="topnav-link" href="#method">Method</a>
          <a className="topnav-link" href="https://github.com/AnonymousSubmit-6kcy3dfe9/AnonymousSubmit_001" target="_blank" rel="noreferrer">
            Repository <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="masthead" id="atlas">
          <div className="masthead-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Cryptography / research index</div>
            <h1>CPF: The Open Problems in Cryptography</h1>
            <p className="masthead-lede">A source-aware atlas of open questions, formal statements, and public evidence in cryptography. The current release covers symmetric cryptography.</p>
          </div>
          <div className="signal-panel" aria-label="Dataset snapshot">
            <div className="signal-head"><span>Dataset snapshot</span><span className="signal-live"><span /> v{datasetVersion}</span></div>
            <div className="signal-number">{problems.length.toString().padStart(2, '0')}</div>
            <div className="signal-label">public problem records</div>
            <div className="signal-rule" />
            <div className="signal-grid">
              <div><strong>{Object.keys(areaLabels).length.toString().padStart(2, '0')}</strong><span>areas</span></div>
              <div><strong>{problems.filter((problem) => problem.status.public_mathematical_status === 'partial_progress').length.toString().padStart(2, '0')}</strong><span>partial</span></div>
              <div><strong>{llmAidedCount.toString().padStart(2, '0')}</strong><span>LLM-aid proved</span></div>
            </div>
          </div>
        </section>

        <section className="workspace" aria-label="Question atlas">
          <aside className="sidebar">
            <div className="sidebar-label"><Filter size={15} /> Browse by area</div>
            <div className="domain-list">
              <button className={`domain-button ${area === 'all' && domain === 'all' ? 'selected' : ''}`} onClick={() => { setArea('all'); setDomain('all'); }}>
                <span className="domain-swatch all-swatch" />
                <span>All questions</span><strong>{problems.length}</strong>
              </button>
              {areaCounts.map((item) => (
                <button key={item.id} className={`domain-button ${area === item.id ? 'selected' : ''}`} onClick={() => { setArea(item.id); setDomain('all'); }}>
                  <span className={`domain-swatch ${item.id}`} />
                  <span>{item.label}</span><strong>{item.count}</strong>
                </button>
              ))}
            </div>

            <div className="sidebar-divider compact-divider" />
            <div className="sidebar-label">Research domain</div>
            <div className="domain-list subdomain-list">
              <button className={`domain-button ${domain === 'all' ? 'selected' : ''}`} onClick={() => setDomain('all')}>
                <span className="domain-swatch all-domains-swatch" />
                <span>All research domains</span><strong>{area === 'all' ? problems.length : problems.filter((problem) => areaOf(problem.classification.primary) === area).length}</strong>
              </button>
              {domainCounts.map((item) => (
                <button key={item.id} className={`domain-button ${domain === item.id ? 'selected' : ''}`} onClick={() => { setArea(item.area); setDomain(item.id); }}>
                  <span className={`domain-swatch ${item.id}`} />
                  <span>{item.label}</span><strong>{item.count}</strong>
                </button>
              ))}
            </div>

            <div className="sidebar-divider" />
            <div className="sidebar-label"><SlidersHorizontal size={15} /> Status</div>
            <label className="select-wrap">
              <span className="sr-only">Filter by mathematical status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value as 'all' | Status)}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="partial_progress">Partial progress</option>
                <option value="resolved">Resolved</option>
                <option value="refuted">Refuted</option>
              </select>
              <ChevronDown size={15} />
            </label>

            <div className="sidebar-note">
              <Sparkles size={16} />
              <p>Every record keeps its original scope visible. A partial result is never presented as a complete resolution.</p>
            </div>
          </aside>

          <section className="results-column">
            <div className="results-toolbar">
              <div>
                <div className="section-kicker">Question index</div>
                <h2>{filtered.length} <span>records in view</span></h2>
              </div>
              <div className="toolbar-actions">
                <label className="search-box">
                  <Search size={17} />
                  <span className="sr-only">Search questions</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, topic, or term" />
                  {query && <button className="icon-button compact" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}
                </label>
                <label className="sort-wrap">
                  <ListFilter size={15} />
                  <span className="sr-only">Sort records</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value as 'alphabetical' | 'reviewed')}>
                    <option value="alphabetical">A - Z</option>
                    <option value="reviewed">Recently reviewed</option>
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>
            </div>

            <div className="record-list">
              {filtered.map((problem, index) => (
                <button className={`record-row ${selectedId === problem.id ? 'active' : ''}`} key={problem.id} onClick={() => openProblem(problem.id)}>
                  <span className="record-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="record-main">
                    <span className="record-topline">
                      <span className={`status-pill ${statusTone[problem.status.public_mathematical_status]}`}><span />{statusLabels[problem.status.public_mathematical_status]}</span>
                      {hasThisWork(problem) && <span className="work-pill">This work</span>}
                      <ClassificationPath id={problem.classification.primary} />
                    </span>
                    <strong>{problem.title}</strong>
                    <span className="record-summary">{problem.summary}</span>
                    <span className="record-tags">{problem.classification.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</span>
                  </span>
                  <ArrowUpRight className="record-arrow" size={18} />
                </button>
              ))}
              {!filtered.length && <div className="empty-state"><Search size={24} /><strong>No questions match this view.</strong><span>Try a broader term or reset the filters.</span></div>}
            </div>
          </section>
        </section>

        <section className={`detail-panel ${selected ? 'is-open' : ''}`} aria-live="polite">
          {selected ? <Detail problem={selected} onClose={closeProblem} /> : <EmptyDetail />}
        </section>

        <section className="method-band" id="method">
          <div className="method-heading"><div className="section-kicker">Atlas method</div><h2>Trace the question before the claim.</h2></div>
          <div className="method-grid">
            <div><span>01</span><strong>Source</strong><p>Every record starts from a public problem, conjecture, or challenge with a citation trail.</p></div>
            <div><span>02</span><strong>Scope</strong><p>Parameters, assumptions, and unresolved remainder stay attached to the formal statement.</p></div>
            <div><span>03</span><strong>Evidence</strong><p>Mathematical progress, computation, review, and Lean availability are separate signals.</p></div>
          </div>
        </section>
      </main>

      <footer className="footer"><span>CryptoFrontierAtlas / cryptography</span><span>Dataset v{datasetVersion} <span className="footer-dot" /> CC BY 4.0 metadata</span></footer>
    </div>
  );
}

function EmptyDetail() {
  return <div className="detail-empty"><Code2 size={28} /><strong>Select a question to inspect its formal surface.</strong><span>Source, scope, public progress, and evidence appear here.</span></div>;
}

function Detail({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const sourceCitation = problem.source.citations[0];
  return (
    <div className="detail-inner">
      <div className="detail-topbar"><button className="back-button" onClick={onClose}><ArrowLeft size={16} /> Back to index</button><span className="detail-id">{problem.id}</span></div>
      <div className="detail-heading">
        <div className="record-topline"><span className={`status-pill ${statusTone[problem.status.public_mathematical_status]}`}><span />{statusLabels[problem.status.public_mathematical_status]}</span>{hasThisWork(problem) && <span className="work-pill">This work</span>}<ClassificationPath id={problem.classification.primary} /></div>
        <h2>{problem.title}</h2>
        <p>{problem.summary}</p>
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="detail-section">
            <div className="section-kicker">Formal statement</div>
            <div className="formula-block">{renderMathText(problem.formal_statement.body)}</div>
          </section>
          <section className="detail-section">
            <div className="section-kicker">Scope and boundary</div>
            <div className="scope-list">
              <div><span>Domain</span><strong>{problem.scope.domain}</strong></div>
              <div><span>Assumptions</span><strong>{problem.scope.assumptions.join(' · ')}</strong></div>
              <div><span>Parameters</span><strong>{problem.scope.parameters.join(' · ')}</strong></div>
              <div><span>Unresolved remainder</span><strong>{problem.scope.unresolved_remainder}</strong></div>
            </div>
          </section>
          <section className="detail-section">
            <div className="section-kicker">Progress timeline</div>
            <div className="timeline">
              {problem.progress.map((entry) => <div className={`timeline-item ${entry.kind === 'this_work' ? 'timeline-this-work' : ''}`} key={`${entry.date}-${entry.kind}`}><span className="timeline-date">{entry.date}</span><div><strong>{progressLabels[entry.kind] ?? entry.kind.replaceAll('_', ' ')}</strong><p>{entry.summary}</p>{entry.citation_labels.length > 0 && <span className="citation-ref">{entry.citation_labels.join(' · ')}</span>}</div></div>)}
            </div>
          </section>
        </div>
        <aside className="detail-side">
          <div className="side-block"><div className="section-kicker">Source</div><strong>{sourceCitation.label}</strong>{sourceCitation.locator && <span>{sourceCitation.locator}</span>}{sourceCitation.doi && <a href={`https://doi.org/${sourceCitation.doi}`} target="_blank" rel="noreferrer">DOI <ExternalLink size={13} /></a>}{sourceCitation.url && <a href={sourceCitation.url} target="_blank" rel="noreferrer">Open source <ExternalLink size={13} /></a>}</div>
          <div className="side-block"><div className="section-kicker">Evidence</div><div className="evidence-line"><Check size={15} /><span>Public status</span><strong>{statusLabels[problem.status.public_mathematical_status]}</strong></div><div className="evidence-line"><CircleAlert size={15} /><span>Disclosure</span><strong>{problem.status.disclosure.replaceAll('_', ' ')}</strong></div><div className="evidence-line"><Code2 size={15} /><span>Lean source</span><strong>{problem.lean.available_in_repo ? 'Available' : 'Not publicly available'}</strong></div></div>
          <div className="side-block literature-block"><div className="section-kicker"><BookOpen size={14} /> Literature trail</div>{problem.source.citations.map((citation) => <div className="citation-entry" key={`${citation.role}-${citation.label}`}><strong>{citation.label}</strong><span>{citation.role.replaceAll('_', ' ')}{citation.locator ? ` · ${citation.locator}` : ''}</span>{citation.doi && <a href={`https://doi.org/${citation.doi}`} target="_blank" rel="noreferrer">DOI <ExternalLink size={12} /></a>}{citation.url && <a href={citation.url} target="_blank" rel="noreferrer">Open link <ExternalLink size={12} /></a>}</div>)}</div>
          <div className="side-block"><div className="section-kicker">Topics</div><div className="tag-cloud">{problem.classification.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></div>
          <div className="withheld-note"><ShieldCheck size={16} /><p>Internal solutions and uncleared proof artifacts are intentionally withheld from this release.</p></div>
        </aside>
      </div>
      <div className="detail-footer"><span>Last reviewed {problem.status.last_reviewed}</span><span>Record group: {problem.group_id}</span><a href="https://github.com/AnonymousSubmit-6kcy3dfe9/AnonymousSubmit_001" target="_blank" rel="noreferrer">View repository <ExternalLink size={13} /></a></div>
    </div>
  );
}

export default App;
