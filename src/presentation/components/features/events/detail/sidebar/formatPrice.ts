import type { EventDetailSidebarProps } from '@domain/entities/props/EventSidebarProps';

export function formatPrice(event: EventDetailSidebarProps['event']): string {
  if (event.priceOptions && event.priceOptions.length > 0) {
    return `Desde Bs. ${Math.min(...event.priceOptions.map(o => o.price))}`;
  }
  return `Bs. ${event.price}`;
}
