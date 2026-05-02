interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Date;
  endDate?: Date;
  availableDays?: string[];
  availableHours?: { start: string; end: string };
  category: string;
  organizer: { name: string; avatar: string; isNew: boolean };
  likes: number;
  comments: number;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival de Comida Local 🍔',
    description: 'Descubre los mejores sabores de nuestra región con food trucks, chefs locales y música en vivo.',
    location: 'Plaza Central',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    startDate: new Date('2026-01-20'),
    endDate: new Date('2026-01-22'),
    availableDays: ['Lun', 'Mar', 'Mié'],
    availableHours: { start: '18:00', end: '23:00' },
    category: 'Gastronomía',
    organizer: { name: 'Municipalidad', avatar: 'https://i.pravatar.cc/150?img=1', isNew: true },
    likes: 1543,
    comments: 89
  },
  {
    id: '2',
    title: 'Noche de Jazz en Vivo 🎷',
    description: 'Una velada inolvidable con las mejores bandas de jazz de la ciudad.',
    location: 'Teatro Municipal',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-15'),
    availableDays: ['Vie'],
    availableHours: { start: '20:00', end: '23:30' },
    category: 'Música',
    organizer: { name: 'Centro Cultural', avatar: 'https://i.pravatar.cc/150?img=2', isNew: false },
    likes: 892,
    comments: 45
  },
  {
    id: '3',
    title: 'Feria de Artesanías 🎨',
    description: 'Encuentra piezas únicas hechas a mano por artesanos locales.',
    location: 'Parque del Arte',
    imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800',
    startDate: new Date('2026-01-18'),
    endDate: new Date('2026-01-25'),
    availableDays: ['Sáb', 'Dom'],
    availableHours: { start: '10:00', end: '19:00' },
    category: 'Arte',
    organizer: { name: 'Colectivo Artesanal', avatar: 'https://i.pravatar.cc/150?img=3', isNew: true },
    likes: 2341,
    comments: 156
  },
  {
    id: '4',
    title: 'Mercado Nocturno ✨',
    description: 'Compras, comida y entretenimiento bajo las estrellas.',
    location: 'Paseo Comercial',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
    startDate: new Date('2026-01-14'),
    endDate: new Date('2026-01-28'),
    availableDays: ['Vie', 'Sáb'],
    availableHours: { start: '19:00', end: '01:00' },
    category: 'Mercado',
    organizer: { name: 'Comerciantes Unidos', avatar: 'https://i.pravatar.cc/150?img=4', isNew: false },
    likes: 1876,
    comments: 203
  },
  {
    id: '5',
    title: 'Yoga al Amanecer 🧘',
    description: 'Sesión de yoga gratuita con vista al mar.',
    location: 'Playa Norte',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    startDate: new Date('2026-01-16'),
    endDate: new Date('2026-01-30'),
    availableDays: ['Sáb', 'Dom'],
    availableHours: { start: '06:00', end: '07:30' },
    category: 'Bienestar',
    organizer: { name: 'Yoga Center', avatar: 'https://i.pravatar.cc/150?img=5', isNew: true },
    likes: 756,
    comments: 34
  },
  {
    id: '6',
    title: 'Cine bajo las Estrellas 🎬',
    description: 'Películas clásicas proyectadas al aire libre.',
    location: 'Plaza Mayor',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    startDate: new Date('2026-01-17'),
    endDate: new Date('2026-01-24'),
    availableDays: ['Jue', 'Vie'],
    availableHours: { start: '21:00', end: '23:30' },
    category: 'Cine',
    organizer: { name: 'Cinéfilos Unidos', avatar: 'https://i.pravatar.cc/150?img=6', isNew: false },
    likes: 1234,
    comments: 67
  },
];