import { supabase } from '@lib/supabase/client'

const FUNCTION_NAME = 'generate-description'

export async function generateDescription(
  name: string,
  category: string,
  type: 'place' | 'event',
): Promise<{ description?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { name, category, type },
    })

    if (error) return { error: error.message }
    if (data?.error) return { error: data.error }
    if (!data?.description) return { error: 'No se pudo generar la descripción' }

    return { description: data.description }
  } catch (e: any) {
    return { error: e?.message ?? 'Error al generar la descripción' }
  }
}
