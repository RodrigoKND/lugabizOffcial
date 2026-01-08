export const METTERS: { metters: number; zoom: number }[] = [
  {
    metters: 500,
    zoom: 16,
  },
  {
    metters: 2000,
    zoom: 14,
  },
  {
    metters: 5000,
    zoom: 13,
  },
  {
    metters: 10000,
    zoom: 12,
  },
  {
    metters: 30000,
    zoom: 11,
  },
] as const;

export const DISTANCES_PLACES = [
    { name: 'cerca', value: 500, h3Radius: 1 },
    { name: '5 km', value: 5000, h3Radius: 3 },
    { name: '10 km', value: 10000, h3Radius: 5 },
    { name: '15 km', value: 15000, h3Radius: 7 },
    { name: '20 km', value: 20000, h3Radius: 8 },
    { name: '25 km', value: 25000, h3Radius: 9 },
    { name: '30 km', value: 30000, h3Radius: 10 }
] as const;