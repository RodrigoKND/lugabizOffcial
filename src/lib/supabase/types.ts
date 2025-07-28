// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          avatar?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          description?: string;
        };
      };
      social_groups: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          description?: string;
        };
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string;
          address: string;
          category_id: string;
          image?: string;
          rating: number;
          review_count: number;
          featured: boolean;
          author_id: string;
          saved_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          address: string;
          category_id: string;
          image?: string;
          rating?: number;
          review_count?: number;
          featured?: boolean;
          author_id: string;
          saved_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          address?: string;
          category_id?: string;
          image?: string;
          rating?: number;
          review_count?: number;
          featured?: boolean;
          saved_count?: number;
          updated_at?: string;
        };
      };
      place_social_groups: {
        Row: {
          id: string;
          place_id: string;
          social_group_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          social_group_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          social_group_id?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rating?: number;
          comment?: string;
          updated_at?: string;
        };
      };
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          place_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
        };
      };
    };
  };
}

// Application Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  category: Category;
  socialGroups: SocialGroup[];
  image?: string;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  featured: boolean;
  createdAt: Date;
  authorId: string;
  savedCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreatePlaceData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  socialGroupIds: string[];
  image?: string;
  authorId: string;
}