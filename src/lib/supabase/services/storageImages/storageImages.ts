import { supabase } from '@lib/supabase';

export const storageService = {
  async uploadFile(file: File, folder: string = 'places'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async uploadMultipleFiles(files: File[], folder: string = 'places'): Promise<string[]> {
    const uploads = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploads);
  },

  async uploadPlaceImage(file: File, placeId?: string): Promise<string> {
    return this.uploadFile(file, `places/${placeId || 'general'}`);
  },

  async uploadUserAvatar(file: File, userId: string): Promise<string> {
    return this.uploadFile(file, `avatars/${userId}`);
  },

  async uploadEventImage(file: File, eventId?: string): Promise<string> {
    return this.uploadFile(file, `events/${eventId || 'general'}`);
  },

  async deleteImage(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) throw error;
  },

  async deleteImagesByUrls(urls: string[]): Promise<void> {
    const paths = urls.map(url => {
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/');
        const idx = parts.indexOf('images');
        return idx !== -1 ? parts.slice(idx + 1).join('/') : url;
      } catch {
        return url;
      }
    }).filter(Boolean);
    if (!paths.length) return;
    await supabase.storage.from('images').remove(paths);
  },

  async getImageUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  },

  validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: `El archivo no puede superar los ${maxSizeMB}MB` };
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF' };
    }
    return { valid: true };
  },

  validateMultipleFiles(files: File[], maxFiles: number = 5, maxTotalMB: number = 10): { valid: boolean; error?: string } {
    if (files.length > maxFiles) {
      return { valid: false, error: `Máximo ${maxFiles} imágenes permitidas` };
    }
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const maxTotal = maxTotalMB * 1024 * 1024;
    if (totalSize > maxTotal) {
      return { valid: false, error: `El tamaño total no puede superar los ${maxTotalMB}MB` };
    }
    for (const file of files) {
      const result = this.validateFile(file);
      if (!result.valid) return result;
    }
    return { valid: true };
  },
};
