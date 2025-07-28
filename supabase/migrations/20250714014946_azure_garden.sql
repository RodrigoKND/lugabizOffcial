-- =============================================
-- LUGAVIZ DATABASE SCHEMA
-- =============================================
-- Complete database schema for Lugaviz platform
-- Includes all tables, relationships, indexes, RLS policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can read public user data" ON users
  FOR SELECT USING (true);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can create categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- SOCIAL GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS social_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for social_groups
CREATE POLICY "Anyone can read social groups" ON social_groups
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can create social groups" ON social_groups
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- PLACES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  image TEXT,
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
  featured BOOLEAN DEFAULT FALSE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_count INTEGER DEFAULT 0 CHECK (saved_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for places
CREATE POLICY "Anyone can read places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create places" ON places
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Authors can update their places" ON places
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their places" ON places
  FOR DELETE USING (auth.uid() = author_id);

-- =============================================
-- PLACE SOCIAL GROUPS (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS place_social_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  social_group_id UUID NOT NULL REFERENCES social_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(place_id, social_group_id)
);

-- Enable RLS
ALTER TABLE place_social_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for place_social_groups
CREATE POLICY "Anyone can read place social groups" ON place_social_groups
  FOR SELECT USING (true);

CREATE POLICY "Place authors can manage social groups" ON place_social_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM places 
      WHERE places.id = place_social_groups.place_id 
      AND places.author_id = auth.uid()
    )
  );

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(place_id, user_id) -- One review per user per place
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SAVED PLACES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Enable RLS
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_places
CREATE POLICY "Users can read their saved places" ON saved_places
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save places" ON saved_places
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave places" ON saved_places
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Places indexes
CREATE INDEX IF NOT EXISTS idx_places_category_id ON places(category_id);
CREATE INDEX IF NOT EXISTS idx_places_author_id ON places(author_id);
CREATE INDEX IF NOT EXISTS idx_places_created_at ON places(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_places_rating ON places(rating DESC);
CREATE INDEX IF NOT EXISTS idx_places_saved_count ON places(saved_count DESC);
CREATE INDEX IF NOT EXISTS idx_places_featured ON places(featured) WHERE featured = true;

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Saved places indexes
CREATE INDEX IF NOT EXISTS idx_saved_places_user_id ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_place_id ON saved_places(place_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_created_at ON saved_places(created_at DESC);

-- Place social groups indexes
CREATE INDEX IF NOT EXISTS idx_place_social_groups_place_id ON place_social_groups(place_id);
CREATE INDEX IF NOT EXISTS idx_place_social_groups_social_group_id ON place_social_groups(social_group_id);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_places_name_gin ON places USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_places_description_gin ON places USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_places_address_gin ON places USING gin(to_tsvector('spanish', address));

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at 
  BEFORE UPDATE ON places 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update place rating and review count
CREATE OR REPLACE FUNCTION update_place_rating()
RETURNS TRIGGER AS $$
DECLARE
  place_id_var UUID;
  avg_rating DECIMAL(2,1);
  review_count_var INTEGER;
BEGIN
  -- Get place_id from the trigger
  IF TG_OP = 'DELETE' THEN
    place_id_var := OLD.place_id;
  ELSE
    place_id_var := NEW.place_id;
  END IF;

  -- Calculate new average rating and count
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
    COUNT(*)
  INTO avg_rating, review_count_var
  FROM reviews 
  WHERE place_id = place_id_var;

  -- Update the place
  UPDATE places 
  SET 
    rating = avg_rating,
    review_count = review_count_var,
    updated_at = NOW()
  WHERE id = place_id_var;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Triggers for place rating updates
CREATE TRIGGER update_place_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

CREATE TRIGGER update_place_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_place_rating();

-- Function to update place saved count
CREATE OR REPLACE FUNCTION update_place_saved_count()
RETURNS TRIGGER AS $$
DECLARE
  place_id_var UUID;
  saved_count_var INTEGER;
BEGIN
  -- Get place_id from the trigger
  IF TG_OP = 'DELETE' THEN
    place_id_var := OLD.place_id;
  ELSE
    place_id_var := NEW.place_id;
  END IF;

  -- Calculate new saved count
  SELECT COUNT(*)
  INTO saved_count_var
  FROM saved_places 
  WHERE place_id = place_id_var;

  -- Update the place
  UPDATE places 
  SET 
    saved_count = saved_count_var,
    updated_at = NOW()
  WHERE id = place_id_var;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ language 'plpgsql';

-- Triggers for place saved count updates
CREATE TRIGGER update_place_saved_count_on_save
  AFTER INSERT ON saved_places
  FOR EACH ROW EXECUTE FUNCTION update_place_saved_count();

CREATE TRIGGER update_place_saved_count_on_unsave
  AFTER DELETE ON saved_places
  FOR EACH ROW EXECUTE FUNCTION update_place_saved_count();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default categories
INSERT INTO categories (id, name, icon, color, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Comida', 'UtensilsCrossed', 'bg-gradient-to-br from-orange-400 to-red-500', 'Restaurantes, cafés y lugares para comer'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cultura', 'Palette', 'bg-gradient-to-br from-purple-400 to-indigo-500', 'Museos, galerías y espacios culturales'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Ropa', 'Shirt', 'bg-gradient-to-br from-pink-400 to-rose-500', 'Tiendas de ropa y moda'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Entretenimiento', 'Music', 'bg-gradient-to-br from-yellow-400 to-orange-500', 'Bares, clubs y lugares de diversión'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Servicios', 'Wrench', 'bg-gradient-to-br from-blue-400 to-cyan-500', 'Servicios útiles y profesionales'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Naturaleza', 'TreePine', 'bg-gradient-to-br from-green-400 to-emerald-500', 'Parques, jardines y espacios naturales')
ON CONFLICT (id) DO NOTHING;

-- Insert default social groups
INSERT INTO social_groups (id, name, icon, color, description) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'Familias', 'Users', 'bg-gradient-to-br from-blue-400 to-blue-600', 'Lugares ideales para ir en familia'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Parejas', 'Heart', 'bg-gradient-to-br from-pink-400 to-red-500', 'Lugares románticos para parejas'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Amigos', 'UserCheck', 'bg-gradient-to-br from-yellow-400 to-orange-500', 'Lugares para disfrutar con amigos'),
  ('660e8400-e29b-41d4-a716-446655440004', 'Solo', 'User', 'bg-gradient-to-br from-purple-400 to-indigo-500', 'Lugares perfectos para ir solo'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Negocios', 'Briefcase', 'bg-gradient-to-br from-gray-400 to-gray-600', 'Lugares para reuniones de trabajo'),
  ('660e8400-e29b-41d4-a716-446655440006', 'Estudiantes', 'GraduationCap', 'bg-gradient-to-br from-green-400 to-emerald-500', 'Lugares ideales para estudiar')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for places with all related data
CREATE OR REPLACE VIEW places_with_details AS
SELECT 
  p.*,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  c.description as category_description,
  u.name as author_name,
  u.avatar as author_avatar,
  COALESCE(
    json_agg(
      json_build_object(
        'id', sg.id,
        'name', sg.name,
        'icon', sg.icon,
        'color', sg.color,
        'description', sg.description
      )
    ) FILTER (WHERE sg.id IS NOT NULL), 
    '[]'
  ) as social_groups
FROM places p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN place_social_groups psg ON p.id = psg.place_id
LEFT JOIN social_groups sg ON psg.social_group_id = sg.id
GROUP BY p.id, c.id, u.id;

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.avatar,
  u.created_at,
  COALESCE(places_count.count, 0) as places_published,
  COALESCE(reviews_count.count, 0) as reviews_written,
  COALESCE(saved_count.count, 0) as places_saved
FROM users u
LEFT JOIN (
  SELECT author_id, COUNT(*) as count
  FROM places
  GROUP BY author_id
) places_count ON u.id = places_count.author_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM reviews
  GROUP BY user_id
) reviews_count ON u.id = reviews_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM saved_places
  GROUP BY user_id
) saved_count ON u.id = saved_count.user_id;

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to check if user is place author
CREATE OR REPLACE FUNCTION is_place_author(place_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM places 
    WHERE id = place_id AND author_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can review place
CREATE OR REPLACE FUNCTION can_review_place(place_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- User cannot review their own place
  IF is_place_author(place_id, user_id) THEN
    RETURN FALSE;
  END IF;
  
  -- User cannot review the same place twice
  IF EXISTS (SELECT 1 FROM reviews WHERE place_id = place_id AND user_id = user_id) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Add a comment to indicate schema completion
COMMENT ON SCHEMA public IS 'Lugaviz database schema - Complete with all tables, relationships, indexes, RLS policies, triggers, and initial data';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Lugaviz database schema created successfully!';
  RAISE NOTICE 'Tables: users, categories, social_groups, places, place_social_groups, reviews, saved_places';
  RAISE NOTICE 'Features: RLS policies, triggers, indexes, views, storage bucket, initial data';
END $$;