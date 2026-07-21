export type ExplicitTourRelationships = {
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
  return /^\d+$/.test(normalized) ? `${normalized} days` : normalized;
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
