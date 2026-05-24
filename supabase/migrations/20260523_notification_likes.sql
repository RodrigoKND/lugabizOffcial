-- Create notification_likes table for user reactions on notifications
CREATE TABLE IF NOT EXISTS notification_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE notification_likes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all likes"
  ON notification_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON notification_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON notification_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast counting
CREATE INDEX idx_notification_likes_notification_id ON notification_likes(notification_id);
CREATE INDEX idx_notification_likes_user_id ON notification_likes(user_id);
