// Los iPhone (y algunos Android con "formato eficiente" activado) guardan las
// fotos de la cámara en HEIC/HEIF. Ningún navegador puede decodificar ese
// formato en un <img> — ni para la vista previa local (blob:) ni una vez
// subida a Supabase Storage, así que sin esto la foto queda rota siempre,
// no solo en la previsualización.
function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') return true;
  // Algunos navegadores móviles no setean el MIME type de HEIC correctamente
  // (queda vacío o "application/octet-stream"), así que también revisamos la extensión.
  return /\.hei[cf]$/i.test(file.name);
}

/** Si el archivo es HEIC/HEIF lo convierte a JPEG; si no, lo devuelve tal cual. */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  const heic2any = (await import('heic2any')).default;
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.hei[cf]$/i, '.jpg');
  return new File([blob], newName, { type: 'image/jpeg' });
}

/** Aplica convertHeicIfNeeded a una lista de archivos en paralelo. */
export async function convertHeicFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(convertHeicIfNeeded));
}
