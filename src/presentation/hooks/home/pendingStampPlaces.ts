interface PlaceLike { id: string; name: string; image?: string; rating?: number }

// Lugares aún sin sello, mejor valorados primero.
export function pendingStampPlaces<T extends PlaceLike>(places: T[], stampedIds: Set<string>, limit = 6): T[] {
  return places
    .filter(p => !stampedIds.has(String(p.id)))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit);
}
