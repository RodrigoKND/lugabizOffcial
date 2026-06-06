import { Place } from '@domain/entities';

export function transformPlaceData(place: any): Place {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    address: place.address,
    category: place.category ? {
      id: place.category.id,
      name: place.category.name,
      icon: place.category.icon,
      color: place.category.color,
      description: place.category.description,
    } : { id: '', name: 'Sin categoría', icon: 'Store', color: '#8B5CF6', description: '' },
    socialGroups: (place.place_social_groups || [])
      .filter((psg: any) => psg?.social_group)
      .map((psg: any) => ({
        id: psg.social_group.id,
        name: psg.social_group.name,
        icon: psg.social_group.icon,
        color: psg.social_group.color,
        description: psg.social_group.description,
      })),
    image: place.image,
    rating: place.rating,
    reviewCount: place.review_count,
    reviews:
      place.reviews?.map((review: any) => ({
        id: review.id,
        userId: review.user_id,
        userName: review.user?.name || 'Usuario',
        userAvatar: review.user?.avatar,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date(review.created_at),
      })) || [],
    featured: place.featured,
    createdAt: new Date(place.created_at),
    authorId: place.author_id,
    authorName: place.author?.name,
    authorAvatar: place.author?.avatar,
    savedCount: place.saved_count,
    latitude: place.latitude,
    longitude: place.longitude,
    coords: place.coords,
    amenities: place.amenities,
    gallery: place.gallery,
    viewsCount: place.views_count,
  };
}
