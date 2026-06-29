// ============================================================
// Utilitario de audio (Fala da Lis) — modo localStorage
//
// Converte um MP3 em data URL para anexar no Admin. Limite RIGIDO (~1MB) para
// nao estourar a quota do localStorage (o conteudo do modulo vive em
// pralis_admin_data). Em PRODUCAO, o MP3 deve ir para Supabase Storage/CDN
// (guardar a URL, nao o base64).
// ============================================================

export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3']
export const MAX_AUDIO_BYTES = 1024 * 1024 // ~1MB

export interface AudioResult {
  dataUrl: string
  bytes: number
}

export async function fileToAudioDataURL(file: File): Promise<AudioResult> {
  const type = file.type || ''
  const isMp3 = ALLOWED_AUDIO_TYPES.includes(type) || file.name.toLowerCase().endsWith('.mp3')
  if (!isMp3) {
    throw new Error('Formato nao suportado. Use MP3.')
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error('MP3 muito grande (max ~1MB). Comprima o audio antes de anexar.')
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(file)
  })
  return { dataUrl, bytes: file.size }
}
