export interface OwnerInsight {
  placeId: string;
  name: string;
  image?: string;
  // `views` es el total acumulado del lugar; el resto cuenta solo los últimos días pedidos.
  views: number;
  plans: number;
  jallalla: number;
  bien: number;
  ahi: number;
  picks: number;
  picksWon: number;
}
