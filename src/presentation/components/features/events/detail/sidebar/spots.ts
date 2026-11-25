// Texto corto de cupos para la tarjeta de acción. Sin límite (capacity <= 0) no se muestra nada.
export function spotsLabel(capacity: number, attendeeCount: number): string | null {
  if (capacity <= 0) return null;
  const left = capacity - attendeeCount;
  if (left <= 0) return 'Cupo lleno';
  if (left === 1) return 'Queda 1 cupo';
  return `${left} cupos disponibles`;
}
