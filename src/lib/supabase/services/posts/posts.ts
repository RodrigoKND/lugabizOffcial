/*
  Requires these tables in Supabase — run once in the SQL editor:

  CREATE TABLE business_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    description TEXT NOT NULL,
    flash_offer JSONB,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES business_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL CHECK (emoji IN ('heart','fire','wow','clap')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
  );

  ALTER TABLE business_posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "read posts" ON business_posts FOR SELECT USING (true);
  CREATE POLICY "owner insert" ON business_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "owner update" ON business_posts FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "owner delete" ON business_posts FOR DELETE USING (auth.uid() = user_id);

  CREATE POLICY "read reactions" ON post_reactions FOR SELECT USING (true);
  CREATE POLICY "user react" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "user unreact" ON post_reactions FOR DELETE USING (auth.uid() = user_id);
  CREATE POLICY "user change reaction" ON post_reactions FOR UPDATE USING (auth.uid() = user_id);
*/

import { supabase } from '@lib/supabase/client';
import { BusinessPost, CreatePostData, PostReactionCounts } from '@domain/entities/Post';

function transformPost(row: any, userId?: string): BusinessPost {
  const reactions: any[] = row.reactions || [];
  const counts: PostReactionCounts = { heart: 0, fire: 0, wow: 0, clap: 0 };
  let userReaction: BusinessPost['userReaction'] = null;

  for (const r of reactions) {
    if (r.emoji in counts) counts[r.emoji as keyof PostReactionCounts]++;
    if (userId && r.user_id === userId) userReaction = r.emoji;
  }

  return {
    id: row.id,
    userId: row.user_id,
    placeId: row.place_id ?? undefined,
    businessName: row.place?.name ?? row.user?.name ?? 'Negocio',
    userAvatar: row.user?.avatar ?? undefined,
    images: row.images || [],
    description: row.description,
    flashOffer: row.flash_offer ?? undefined,
    reactionsCount: counts,
    userReaction,
    commentsCount: row.comments_count ?? 0,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function getPosts(limit = 20, offset = 0, userId?: string): Promise<BusinessPost[]> {
  try {
    const { data, error } = await supabase
      .from('business_posts')
      .select(`*, user:users(name, avatar), place:places(name), reactions:post_reactions(user_id, emoji)`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return (data || []).map((row) => transformPost(row, userId));
  } catch {
    return [];
  }
}

export async function createPost(data: CreatePostData): Promise<BusinessPost | null> {
  const { data: row, error } = await supabase
    .from('business_posts')
    .insert({
      user_id: data.userId,
      place_id: data.placeId ?? null,
      images: data.images,
      description: data.description,
      flash_offer: data.flashOffer ?? null,
    })
    .select(`*, user:users(name, avatar), place:places(name), reactions:post_reactions(user_id, emoji)`)
    .single();

  if (error) throw error;
  return transformPost(row, data.userId);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('business_posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function reactToPost(
  postId: string,
  userId: string,
  emoji: 'heart' | 'fire' | 'wow' | 'clap',
): Promise<void> {
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('id, emoji')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.emoji === emoji) {
      await supabase.from('post_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('post_reactions').update({ emoji }).eq('id', existing.id);
    }
  } else {
    await supabase.from('post_reactions').insert({ post_id: postId, user_id: userId, emoji });
  }
}

export async function claimFlashOffer(postId: string): Promise<{ claimedSlots: number }> {
  const { data, error } = await supabase.rpc('claim_flash_offer', { p_post_id: postId })
  if (error) throw error
  const result = data as { success?: boolean; error?: string; claimedSlots?: number }
  if (result.error) throw new Error(result.error)
  return { claimedSlots: result.claimedSlots ?? 0 }
}

export async function uploadPostImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const name = `posts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('images').upload(name, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('images').getPublicUrl(name).data.publicUrl;
}

export const postsService = {
  getPosts,
  createPost,
  deletePost,
  reactToPost,
  claimFlashOffer,
  uploadPostImage,
};
