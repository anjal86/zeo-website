from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def write(relative: str, content: str) -> None:
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def replace_once(relative: str, before: str, after: str) -> None:
    source = read(relative)
    count = source.count(before)
    if count != 1:
        raise RuntimeError(f"Expected one match in {relative}, found {count}: {before[:100]!r}")
    write(relative, source.replace(before, after, 1))


def replace_regex_once(relative: str, pattern: str, replacement: str) -> None:
    source = read(relative)
    updated, count = re.subn(pattern, replacement, source, count=1, flags=re.DOTALL)
    if count != 1:
        raise RuntimeError(f"Expected one regex match in {relative}, found {count}: {pattern}")
    write(relative, updated)


# 1. Make the role contract explicit: only fully supported administrators may log in.
login_route = "next-zeo/app/api/auth/login/route.ts"
replace_once(
    login_route,
    'import { badRequest, ok, serverError, unauthorized } from "@/server/http/api-response";',
    'import { badRequest, forbidden, ok, serverError, unauthorized } from "@/server/http/api-response";',
)
replace_once(
    login_route,
    '    if (!valid) return unauthorized("Invalid credentials");\n\n    await setAdminSession({ id: user.id, email: user.email, name: user.name, role: user.role });',
    '    if (!valid) return unauthorized("Invalid credentials");\n    if (user.role !== "admin") return forbidden("Editor access is not enabled yet");\n\n    await setAdminSession({ id: user.id, email: user.email, name: user.name, role: user.role });',
)


# 2. Persist destination SEO/page-content fields and expose them back to the editor.
catalog = "next-zeo/src/server/repositories/catalog.ts"
replace_once(
    catalog,
    "function serializeDestination(row: DestinationRow) {\n  return {",
    "function serializeDestination(row: DestinationRow) {\n  const seo = parseJsonObject(row.seo);\n  const metadata = parseJsonObject(row.metadata);\n\n  return {",
)
replace_once(
    catalog,
    "    seo: parseJsonObject(row.seo),\n    metadata: parseJsonObject(row.metadata),",
    "    seo,\n    seo_intro: typeof seo.intro === \"string\" ? seo.intro : \"\",\n    seo_best_time: typeof seo.best_time === \"string\" ? seo.best_time : \"\",\n    seo_planning_note: typeof seo.planning_note === \"string\" ? seo.planning_note : \"\",\n    seo_guide_blocks: Array.isArray(seo.guide_blocks) ? seo.guide_blocks : [],\n    seo_faqs: Array.isArray(seo.faqs) ? seo.faqs : [],\n    metadata,",
)

mutations = "next-zeo/src/server/repositories/mutations.ts"
replace_once(
    mutations,
    '''export async function upsertDestination(identifier: string | null, payload: Record<string, unknown>) {
  const title = String(payload.title ?? payload.name ?? "Untitled destination");
  const data = {''',
    '''export async function upsertDestination(identifier: string | null, payload: Record<string, unknown>) {
  const title = String(payload.title ?? payload.name ?? "Untitled destination");
  const inputSeo = payload.seo && typeof payload.seo === "object" && !Array.isArray(payload.seo)
    ? payload.seo as Record<string, unknown>
    : {};
  const hasSeoPayload = payload.seo !== undefined
    || payload.seo_intro !== undefined
    || payload.seo_best_time !== undefined
    || payload.seo_planning_note !== undefined
    || payload.seo_guide_blocks !== undefined
    || payload.seo_faqs !== undefined;
  const seo = {
    ...inputSeo,
    intro: payload.seo_intro ?? inputSeo.intro ?? null,
    best_time: payload.seo_best_time ?? inputSeo.best_time ?? null,
    planning_note: payload.seo_planning_note ?? inputSeo.planning_note ?? null,
    guide_blocks: payload.seo_guide_blocks ?? inputSeo.guide_blocks ?? [],
    faqs: payload.seo_faqs ?? inputSeo.faqs ?? [],
  };
  const data = {''',
)
replace_once(
    mutations,
    '''    related_tours: json(payload.relatedTours ?? payload.related_tours),
    related_activities: json(payload.relatedActivities ?? payload.related_activities),
    featured: bool(payload.featured),''',
    '''    related_tours: json(payload.relatedTours ?? payload.related_tours),
    related_activities: json(payload.relatedActivities ?? payload.related_activities),
    gallery: payload.gallery === undefined ? undefined : json(payload.gallery),
    seo: hasSeoPayload ? json(seo) : undefined,
    metadata: payload.metadata === undefined ? undefined : json(payload.metadata),
    featured: bool(payload.featured),''',
)


# 3-4. Centralize lossless tour duration normalization and explicit-only relationships.
write(
    "next-zeo/src/lib/adminTourForm.ts",
    '''export type ExplicitTourRelationships = {
  primaryDestinationId?: number;
  secondaryDestinationIds: number[];
  activityIds: number[];
  relatedDestinations: string[];
  relatedActivities: string[];
};

function optionalPositiveNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function positiveNumberArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(optionalPositiveNumber)
    .filter((item): item is number => item !== undefined);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeTourDurationForEditor(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

export function normalizeTourDurationForSave(value: unknown): string {
  const normalized = normalizeTourDurationForEditor(value).trim();
  return /^\\d+$/.test(normalized) ? `${normalized} days` : normalized;
}

export function getExplicitTourRelationships(details: Record<string, unknown>): ExplicitTourRelationships {
  const legacyDestinationIds = positiveNumberArray(details.destination_ids);
  return {
    primaryDestinationId: optionalPositiveNumber(
      details.primary_destination_id ?? details.destination_id ?? legacyDestinationIds[0],
    ),
    secondaryDestinationIds: positiveNumberArray(details.secondary_destination_ids),
    activityIds: positiveNumberArray(details.activity_ids),
    relatedDestinations: stringArray(details.related_destinations),
    relatedActivities: stringArray(details.related_activities),
  };
}
''',
)

tour_editor = "next-zeo/app/admin/(dashboard)/tours/[id]/page.tsx"
replace_once(
    tour_editor,
    "import LoadingSpinner from '@/components/UI/LoadingSpinner';",
    "import LoadingSpinner from '@/components/UI/LoadingSpinner';\nimport { getExplicitTourRelationships, normalizeTourDurationForEditor, normalizeTourDurationForSave } from '@/lib/adminTourForm';",
)
replace_regex_once(
    tour_editor,
    r"\n  // Disabled auto-detection[\s\S]*?\n  const fetchTourDetails = async \(\) => \{",
    "\n  const fetchTourDetails = async () => {",
)
replace_once(
    tour_editor,
    '''        // Auto-detect destinations and activities if not already set
        const autoDetectedDestinations = autoDetectDestinations(details);
        const autoDetectedActivities = autoDetectActivities(details);

        // Ensure relationship fields are properly initialized
        const formattedDetails = {''',
    '''        const relationships = getExplicitTourRelationships(details);

        // Preserve only relationships that were explicitly stored.
        const formattedDetails = {''',
)
replace_once(
    tour_editor,
    '''          // Parse duration to extract numeric value (e.g., "13 days" -> "13")
          duration: typeof details.duration === 'string'
            ? details.duration.replace(/[^\\d]/g, '') || details.duration
            : details.duration,''',
    '''          duration: normalizeTourDurationForEditor(details.duration),''',
)
replace_once(
    tour_editor,
    '''          primary_destination_id: details.primary_destination_id || details.destination_id || details.destination_ids?.[0] || autoDetectedDestinations.primary,
          secondary_destination_ids: details.secondary_destination_ids || autoDetectedDestinations.secondary,
          activity_ids: details.activity_ids || autoDetectedActivities.ids,
          related_destinations: details.related_destinations || autoDetectedDestinations.names,
          related_activities: details.related_activities || autoDetectedActivities.names,''',
    '''          primary_destination_id: relationships.primaryDestinationId,
          secondary_destination_ids: relationships.secondaryDestinationIds,
          activity_ids: relationships.activityIds,
          related_destinations: relationships.relatedDestinations,
          related_activities: relationships.relatedActivities,''',
)
replace_once(
    tour_editor,
    '''        // Format duration properly - if it's just a number, add "days"
        duration: formData.duration && !String(formData.duration).includes('day')
          ? `${formData.duration} days`
          : String(formData.duration),''',
    '''        duration: normalizeTourDurationForSave(formData.duration),''',
)


# 5. Prevent blank overwrite after failed Settings/Director initial loads and provide retry.
settings = "next-zeo/app/admin/(dashboard)/settings/page.tsx"
replace_once(
    settings,
    "    const [error, setError] = useState<string | null>(null);\n    const [form, setForm] = useState({",
    "    const [error, setError] = useState<string | null>(null);\n    const [loadedSuccessfully, setLoadedSuccessfully] = useState(false);\n    const [loadAttempt, setLoadAttempt] = useState(0);\n    const [form, setForm] = useState({",
)
replace_once(
    settings,
    '''    useEffect(() => {
        (async () => {
            try {
                const d = await adminFetch<any>(`${api}/contact`);
                setForm(prev => ({
                    phone: { primary: d.phone?.primary || '', whatsapp: d.phone?.whatsapp || '' },
                    email: { primary: d.email?.primary || '' },
                    address: { full: d.address?.full || '' },
                    social: { facebook: d.social?.facebook || '', instagram: d.social?.instagram || '', twitter: d.social?.twitter || '', youtube: d.social?.youtube || '', linkedin: d.social?.linkedin || '' },
                    company: { name: d.company?.name || 'Zeo Tourism' },
                }));
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, []);''',
    '''    useEffect(() => {
        let active = true;
        setError(null);
        setLoadedSuccessfully(false);
        (async () => {
            try {
                const d = await adminFetch<any>(`${api}/contact`);
                if (!active) return;
                setForm({
                    phone: { primary: d.phone?.primary || '', whatsapp: d.phone?.whatsapp || '' },
                    email: { primary: d.email?.primary || '' },
                    address: { full: d.address?.full || '' },
                    social: { facebook: d.social?.facebook || '', instagram: d.social?.instagram || '', twitter: d.social?.twitter || '', youtube: d.social?.youtube || '', linkedin: d.social?.linkedin || '' },
                    company: { name: d.company?.name || 'Zeo Tourism' },
                });
                setLoadedSuccessfully(true);
            } catch (err: unknown) {
                if (active) setError(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [loadAttempt]);''',
)
replace_once(
    settings,
    "        e.preventDefault(); setSaving(true); setError(null);",
    "        e.preventDefault();\n        if (!loadedSuccessfully) { setError('Settings were not loaded. Retry before saving.'); return; }\n        setSaving(true); setError(null);",
)
replace_once(
    settings,
    "disabled={saving} className=\"bg-green-600",
    "disabled={saving || !loadedSuccessfully} className=\"bg-green-600",
)
replace_once(
    settings,
    '''            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}''',
    '''            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span>{!loadedSuccessfully && <button type="button" onClick={() => { setLoading(true); setLoadAttempt(value => value + 1); }} className="ml-auto text-sm font-medium underline">Retry</button>}</div>}''',
)

director = "next-zeo/app/admin/(dashboard)/director/page.tsx"
replace_once(
    director,
    "    const [error, setError] = useState<string | null>(null);\n    const [form, setForm] = useState({ name: '', title: '', message: '', image_url: '' });",
    "    const [error, setError] = useState<string | null>(null);\n    const [loadedSuccessfully, setLoadedSuccessfully] = useState(false);\n    const [loadAttempt, setLoadAttempt] = useState(0);\n    const [form, setForm] = useState({ name: '', title: '', message: '', image_url: '' });",
)
replace_once(
    director,
    '''    useEffect(() => {
        (async () => {
            try { const d = await adminFetch<any>(`${api}/director-message`); if (d) setForm({ name: d.name || '', title: d.title || '', message: d.message || '', image_url: d.image_url || '' }); }
            catch { /* ignore */ } finally { setLoading(false); }
        })();
    }, []);''',
    '''    useEffect(() => {
        let active = true;
        setError(null);
        setLoadedSuccessfully(false);
        (async () => {
            try {
                const d = await adminFetch<any>(`${api}/director-message`);
                if (!active) return;
                setForm({ name: d?.name || '', title: d?.title || '', message: d?.message || '', image_url: d?.image_url || '' });
                setLoadedSuccessfully(true);
            } catch (err: unknown) {
                if (active) setError(err instanceof Error ? err.message : 'Failed to load director message');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [loadAttempt]);''',
)
replace_once(
    director,
    "        e.preventDefault(); setSaving(true); setError(null);",
    "        e.preventDefault();\n        if (!loadedSuccessfully) { setError('Director message was not loaded. Retry before saving.'); return; }\n        setSaving(true); setError(null);",
)
replace_once(
    director,
    "disabled={saving} className=\"bg-green-600",
    "disabled={saving || !loadedSuccessfully} className=\"bg-green-600",
)
replace_once(
    director,
    '''            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}''',
    '''            {error && <div className="bg-red-50 border p-4 flex items-center gap-2 text-red-800"><AlertCircle className="w-5 h-5" /><span>{error}</span>{!loadedSuccessfully && <button type="button" onClick={() => { setLoading(true); setLoadAttempt(value => value + 1); }} className="ml-auto text-sm font-medium underline">Retry</button>}</div>}''',
)


# Regression coverage for the five fixes.
write(
    "next-zeo/tests/production-regressions.test.ts",
    '''import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

import {
  getExplicitTourRelationships,
  normalizeTourDurationForEditor,
  normalizeTourDurationForSave,
} from "@/lib/adminTourForm";
import { authorizeRoles, type AdminSession } from "@/server/auth/require-admin";

const file = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("App Router favicon exists as a valid icon at /favicon.ico", async () => {
  const faviconPath = new URL("../app/favicon.ico", import.meta.url);
  const favicon = await readFile(faviconPath);
  assert.ok((await stat(faviconPath)).size > 0);
  assert.deepEqual([...favicon.subarray(0, 4)], [0, 0, 1, 0]);

  const layout = await file("../app/layout.tsx");
  assert.doesNotMatch(layout, /(?:^|["'])x\\/favicon\\.ico/);
});

test("admin navigation does not link to the missing users route", async () => {
  const sidebar = await file("../src/components/Admin/AdminSidebar.tsx");
  assert.doesNotMatch(sidebar, /["']\\/admin\\/users["']/);
});

test("only supported administrator accounts may enter the portal", async () => {
  const loginRoute = await file("../app/api/auth/login/route.ts");
  assert.match(loginRoute, /user\\.role !== ["']admin["']/);
  assert.match(loginRoute, /Editor access is not enabled yet/);
});

test("admin posts authorization allows admins", async () => {
  const result = await authorizeRoles(["admin"], async () => session("admin"));
  assert.equal(result.ok, true);
});

test("admin posts authorization rejects editors with 403", async () => {
  const result = await authorizeRoles(["admin"], async () => session("editor"));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 403);
});

test("admin posts authorization rejects unauthenticated users with 401", async () => {
  const result = await authorizeRoles(["admin"], async () => null);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.response.status, 401);
});

test("destination SEO editor fields are persisted and serialized", async () => {
  const mutations = await file("../src/server/repositories/mutations.ts");
  const catalog = await file("../src/server/repositories/catalog.ts");
  for (const field of ["seo_intro", "seo_best_time", "seo_planning_note", "seo_guide_blocks", "seo_faqs"]) {
    assert.match(mutations, new RegExp(field));
    assert.match(catalog, new RegExp(field));
  }
});

test("tour duration normalization preserves descriptive values", () => {
  assert.equal(normalizeTourDurationForEditor("4 nights / 5 days"), "4 nights / 5 days");
  assert.equal(normalizeTourDurationForSave("4 nights / 5 days"), "4 nights / 5 days");
  assert.equal(normalizeTourDurationForSave("13"), "13 days");
  assert.equal(normalizeTourDurationForSave("3–4 hours"), "3–4 hours");
});

test("tour relationships use stored IDs only and never infer from copy", () => {
  assert.deepEqual(getExplicitTourRelationships({
    title: "Everest Base Camp Trek",
    location: "Everest, Nepal",
    primary_destination_id: null,
    secondary_destination_ids: [],
    activity_ids: [],
  }), {
    primaryDestinationId: undefined,
    secondaryDestinationIds: [],
    activityIds: [],
    relatedDestinations: [],
    relatedActivities: [],
  });

  assert.deepEqual(getExplicitTourRelationships({
    primary_destination_id: "4",
    secondary_destination_ids: [5, "6"],
    activity_ids: [7],
    related_destinations: ["Tibet"],
    related_activities: ["Pilgrimage"],
  }), {
    primaryDestinationId: 4,
    secondaryDestinationIds: [5, 6],
    activityIds: [7],
    relatedDestinations: ["Tibet"],
    relatedActivities: ["Pilgrimage"],
  });
});

test("settings and director editors block saving after failed initial loads", async () => {
  for (const path of [
    "../app/admin/(dashboard)/settings/page.tsx",
    "../app/admin/(dashboard)/director/page.tsx",
  ]) {
    const source = await file(path);
    assert.match(source, /loadedSuccessfully/);
    assert.match(source, /Retry/);
    assert.match(source, /disabled=\\{saving \\|\\| !loadedSuccessfully\\}/);
  }
});

function session(role: AdminSession["role"]): AdminSession {
  return {
    id: 1,
    email: `${role}@example.test`,
    name: role,
    role,
    isAdmin: role === "admin",
  };
}
''',
)

# Remove this one-shot codemod and its workflow from the resulting commit.
workflow = ROOT / ".github/workflows/apply-admin-phase-1-5-fixes.yml"
script = Path(__file__)
if workflow.exists():
    workflow.unlink()
if script.exists():
    script.unlink()

print("Applied admin phase 1-5 fixes")
