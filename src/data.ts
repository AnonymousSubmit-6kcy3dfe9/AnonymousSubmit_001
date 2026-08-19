import balancedEight from '../data/problems/balanced-eight-variable-nonlinearity.json';
import carlet13314 from '../data/problems/carlet-13-3-14-affine-derivatives.json';
import carlet1377 from '../data/problems/carlet-13-7-7-layer-algebraic-immunity.json';
import stabilityOp1 from '../data/problems/carlet-stability-op1.json';
import stabilityOp2 from '../data/problems/carlet-stability-op2.json';
import tuDeng from '../data/problems/tu-deng-conjecture.json';
import vectorial from '../data/problems/vectorial-nonlinearity-beyond-nyberg.json';
import koelsch from '../data/problems/koelsch-f4-direct-xor.json';
import gfn3840 from '../data/problems/derbez-gfn-38-40-branch-diffusion.json';
import derbezEuler from '../data/problems/derbez-euler-expanded-equivalence.json';
import tezcan from '../data/problems/tezcan-ozbudak-differential-factor.json';
import bogdanov from '../data/problems/bogdanov-dcufn-dplus1-active-sboxes.json';
import kaleyski from '../data/problems/kaleyski-conjecture21-second-identity.json';
import manifest from '../data/manifest.json';
import taxonomy from '../data/taxonomy.json';

export type ProblemStatus = 'open' | 'partial_progress' | 'resolved' | 'refuted' | 'corrected' | 'historically_settled';

export type SourceKind = 'explicit_open_problem' | 'explicit_conjecture' | 'open_challenge' | 'public_thesis_conjecture';
export type PublicVerificationStatus = 'none' | 'computer_checked' | 'externally_claimed' | 'externally_reproducible' | 'repository_checked';
export type PeerReviewStatus = 'not_submitted' | 'preprint' | 'under_review' | 'published' | 'independently_audited';
export type ArtifactRole = 'canonical_manuscript' | 'source_code' | 'verifier' | 'data' | 'superseded_draft';
export type ArtifactVisibility = 'not_listed' | 'external_link' | 'repository_file';

export interface Citation {
  role: 'original_source' | 'prior_progress' | 'resolution' | 'independent_resolution';
  label: string;
  locator?: string;
  doi?: string;
  eprint?: string;
  url?: string;
}

export interface Artifact {
  role: ArtifactRole;
  visibility: ArtifactVisibility;
  url?: string;
  sha256?: string;
  license?: string;
}

export interface Problem {
  schema_version: string;
  id: string;
  group_id: string;
  title: string;
  summary: string;
  formal_statement: { format: string; body: string };
  scope: { domain: string; assumptions: string[]; parameters: string[]; unresolved_remainder: string };
  classification: { taxonomy_version: string; primary: string; secondary: string[]; tags: string[] };
  source: {
    kind: SourceKind;
    citations: Citation[];
  };
  status: {
    public_mathematical_status: ProblemStatus;
    public_verification_status: PublicVerificationStatus;
    peer_review_status: PeerReviewStatus;
    disclosure: string;
    last_reviewed: string;
  };
  progress: Array<{ date: string; kind: string; summary: string; citation_labels: string[] }>;
  artifacts: Artifact[];
  lean: {
    status: string;
    available_in_repo: boolean;
    path?: string;
    commit?: string;
    lean_version?: string;
    mathlib_version?: string;
    trusted_base?: string;
    replay_command?: string;
    source_tree_sha256?: string;
    source_tree_file_count?: number;
  };
  relations: { related: string[]; supersedes: string[]; superseded_by: string[] };
}

export const problems = [
  balancedEight,
  carlet13314,
  carlet1377,
  stabilityOp1,
  stabilityOp2,
  tuDeng,
  vectorial,
  koelsch,
  gfn3840,
  derbezEuler,
  tezcan,
  bogdanov,
  kaleyski,
] as unknown as Problem[];

export const datasetVersion = manifest.dataset_version;

type TaxonomyArea = { id: string; label: string };
type TaxonomyDomain = { id: string; area: string; label: string; children: Array<{ id: string; label: string }> };

export const areas = taxonomy.areas as TaxonomyArea[];
export const domains = taxonomy.domains as TaxonomyDomain[];
export const areaLabels: Record<string, string> = Object.fromEntries(areas.map((area) => [area.id, area.label]));
export const domainLabels: Record<string, string> = Object.fromEntries(domains.map((domain) => [domain.id, domain.label]));
export const taxonomyLabels: Record<string, string> = Object.fromEntries(
  domains.flatMap((domain) => domain.children.map((child) => [child.id, child.label])),
);

export function domainOf(id: string): string {
  return id.split('.')[0];
}

export function areaOf(id: string): string {
  return domains.find((domain) => domain.id === domainOf(id))?.area ?? 'other';
}

export function taxonomyPath(id: string) {
  const domainId = domainOf(id);
  const areaId = areaOf(id);
  return {
    areaId,
    area: areaLabels[areaId] ?? areaId,
    domainId,
    domain: domainLabels[domainId] ?? domainId,
    leaf: taxonomyLabels[id] ?? id,
  };
}
