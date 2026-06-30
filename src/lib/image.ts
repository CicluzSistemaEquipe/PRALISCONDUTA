// ============================================================
// Utilitario de imagem (modo localStorage)
//
// Converte um File em data URL JA REDIMENSIONADO/COMPRIMIDO, para nao estourar
// a quota do localStorage (~5MB). Em PRODUCAO isto deve ir para Supabase
// Storage/CDN (a imagem fica como URL, nao base64).
// ============================================================

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp']
export const ALLOWED_LABEL = 'JPG, PNG ou WebP'
export const MAX_INPUT_BYTES = 12 * 1024 * 1024 // 12MB de entrada
export const MAX_DIM = 1280 // maior lado apos redimensionar
export const TARGET_MAX_BYTES = 700 * 1024 // ~700KB armazenados (base64)

export interface ImageResult {
  dataUrl: string
  width: number
  height: number
  bytes: number
  /** rotulo do formato final (WEBP/JPEG) realmente armazenado */
  format: string
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Falha ao ler a imagem.'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsDataURL(file)
  })
}

function dataUrlBytes(dataUrl: string): number {
  const i = dataUrl.indexOf(',')
  const b64 = i >= 0 ? dataUrl.slice(i + 1) : dataUrl
  return Math.floor(b64.length * 0.75)
}

/**
 * Valida + redimensiona (<= MAX_DIM) + comprime (ate <= TARGET_MAX_BYTES) e
 * devolve um data URL pronto para salvar no localStorage. Preserva proporcao.
 */
export async function fileToDownscaledDataURL(file: File): Promise<ImageResult> {
  const type = (file.type || '').toLowerCase()
  const ext = (file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]) ?? ''

  // HEIC/HEIF (padrao das fotos de iPhone) nao decodifica no <canvas> da maioria
  // dos navegadores — erro claro com caminho de saida, sem depender de lib.
  if (type.includes('heic') || type.includes('heif') || ext === 'heic' || ext === 'heif') {
    throw new Error('Formato HEIC nao e suportado no navegador. No iPhone, exporte como JPG (Ajustes > Camera > "Mais compativel") ou use JPG/PNG/WebP.')
  }
  // Aceita pelo MIME (incl. alias image/jpg) OU pela extensao quando o type vem
  // vazio (acontece com arrastar/soltar e alguns sistemas).
  const okType = ALLOWED_IMAGE_TYPES.includes(type)
  const okExt = ALLOWED_EXT.includes(ext)
  if (!okType && !okExt) {
    throw new Error(`Formato nao suportado${type ? ` (${type})` : ''}. Use ${ALLOWED_LABEL}.`)
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Imagem muito grande (maximo 12MB). Comprima ou reduza antes de anexar.')
  }

  const img = await loadImage(file)
  let w = img.width
  let h = img.height
  if (w > MAX_DIM || h > MAX_DIM) {
    const r = Math.min(MAX_DIM / w, MAX_DIM / h)
    w = Math.round(w * r)
    h = Math.round(h * r)
  }

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Nao foi possivel processar a imagem.')
  ctx.drawImage(img, 0, 0, w, h)

  const encode = (q: number) => {
    const webp = canvas.toDataURL('image/webp', q)
    return webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', q)
  }

  let quality = 0.85
  let dataUrl = encode(quality)
  while (dataUrlBytes(dataUrl) > TARGET_MAX_BYTES && quality > 0.4) {
    quality -= 0.1
    dataUrl = encode(quality)
  }

  // Canvas vazio/sem suporte (ex.: imagem gigante em alguns navegadores) devolve
  // um data URL minusculo/invalido — falha clara em vez de salvar imagem quebrada.
  if (!dataUrl.startsWith('data:image/') || dataUrlBytes(dataUrl) < 64) {
    throw new Error('Nao foi possivel processar a imagem. Tente outra imagem ou um formato diferente.')
  }

  const format = dataUrl.slice(11, dataUrl.indexOf(';')).toUpperCase() // ex.: WEBP / JPEG
  return { dataUrl, width: w, height: h, bytes: dataUrlBytes(dataUrl), format }
}
