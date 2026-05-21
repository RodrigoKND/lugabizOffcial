export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar?: string;
          phone?: string;
          bio?: string;
          is_owner?: boolean;
          owner_business_name?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          avatar?: string;
          phone?: string;
          bio?: string;
          is_owner?: boolean;
          owner_business_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar?: string;
          phone?: string;
          bio?: string;
          is_owner?: boolean;
          owner_business_name?: string;
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
          latitude?: number;
          longitude?: number;
          coords?: number[];
          amenities?: string[];
          gallery?: string[];
          views_count?: number;
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
          latitude?: number;
          longitude?: number;
          coords?: number[];
          amenities?: string[];
          gallery?: string[];
          views_count?: number;
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
          latitude?: number;
          longitude?: number;
          coords?: number[];
          amenities?: string[];
          gallery?: string[];
          views_count?: number;
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
      events: {
        Row: {
          id: string;
          name: string;
          description: string;
          address: string;
          category_id: string;
          image?: string;
          date_start: string;
          time_start: string;
          time_end?: string;
          price?: number;
          capacity?: number;
          is_free?: boolean;
          tags?: string[];
          coords: number[];
          user_id: string;
          attendees_count?: number;
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
          date_start: string;
          time_start: string;
          time_end?: string;
          price?: number;
          capacity?: number;
          is_free?: boolean;
          tags?: string[];
          coords: number[];
          user_id: string;
          attendees_count?: number;
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
          date_start?: string;
          time_start?: string;
          time_end?: string;
          price?: number;
          capacity?: number;
          is_free?: boolean;
          tags?: string[];
          coords?: number[];
          attendees_count?: number;
          updated_at?: string;
        };
      };
      events_tags: {
        Row: {
          id: string;
          event_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
      };
      event_attendance: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          shared_by?: string;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          shared_by?: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          confirmed?: boolean;
          shared_by?: string;
        };
      };
      event_shares: {
        Row: {
          id: string;
          event_id: string;
          shared_by: string;
          shared_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          shared_by: string;
          shared_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
        };
      };
      place_surveys: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          is_nearby: boolean;
          rating?: number;
          would_recommend?: boolean;
          comment?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          place_id: string;
          is_nearby: boolean;
          rating?: number;
          would_recommend?: boolean;
          comment?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rating?: number;
          would_recommend?: boolean;
          comment?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Record<string, unknown>;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Record<string, unknown>;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          read?: boolean;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
        };
      };
    };
  };
}
