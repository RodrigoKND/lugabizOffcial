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

