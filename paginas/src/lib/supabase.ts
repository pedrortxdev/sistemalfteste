import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função utilitária para upload de arquivos no Supabase Storage
 */
export async function uploadFile(bucket: string, path: string, file: Buffer | Blob | string) {
  let body: any = file;

  // Se for base64 (assinaturas costumam vir assim do canvas)
  if (typeof file === 'string' && file.startsWith('data:image')) {
    const base64Data = file.split(',')[1];
    body = Buffer.from(base64Data, 'base64');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, body, {
      upsert: true,
      contentType: 'image/png'
    });

  if (error) {
    console.error(`Erro no upload para o bucket ${bucket}:`, error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return publicUrl;
}
