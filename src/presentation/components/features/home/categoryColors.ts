export function getCategoryColor(name: string) {
  const colors: Record<string, string> = {
    default: 'from-primary-400 to-pink-400',
    Comida: 'from-orange-400 to-red-400',
    Bebidas: 'from-amber-400 to-yellow-400',
    Naturaleza: 'from-green-400 to-emerald-400',
    Arte: 'from-purple-400 to-pink-400',
    Música: 'from-violet-400 to-purple-400',
    Deportes: 'from-blue-400 to-cyan-400',
  };
  return colors[name] || colors.default;
}
