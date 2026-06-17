import { supabase } from '@lib/supabase/client'

const FUNCTION_NAME = 'generate-description'
const FALLBACK_MSG = 'No se pudo generar la descripcion, intenta de nuevo'

export async function generateDescription(
  name: string,
  category: string,
  type: 'place' | 'event',
): Promise<{ description?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { name, category, type },
    })

    if (error) {
      console.error('[generateDescription] invoke error:', error)
      return { error: FALLBACK_MSG }
    }
    if (data?.error) {
      console.error('[generateDescription] fn error:', data.error)
      return { error: FALLBACK_MSG }
    }
    if (!data?.description) return { error: FALLBACK_MSG }

    return { description: data.description }
  } catch (e) {
    console.error('[generateDescription] exception:', e)
    return { error: FALLBACK_MSG }
  }
}
