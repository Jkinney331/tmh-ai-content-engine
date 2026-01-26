import { randomUUID } from 'crypto'
import { supabaseAdmin, hasServiceKey } from '@/lib/supabaseAdmin'

type UploadResult = {
  path: string
  publicUrl: string
  contentType: string
}

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/

export function isImageDataUrl(value: string) {
  return DATA_URL_RE.test(value)
}

export async function uploadImageDataUrl(options: {
  dataUrl: string
  bucket?: string
  prefix?: string
  cityId?: string | null
}): Promise<UploadResult | null> {
  if (!hasServiceKey) return null

  const match = options.dataUrl.match(DATA_URL_RE)
  if (!match) return null

  const contentType = match[1]
  const base64Data = match[2]
  const fileExt = contentType.split('/')[1] || 'png'
  const safePrefix = options.prefix ? options.prefix.replace(/[^a-z0-9-_]+/gi, '-') : 'generated'
  const citySegment = options.cityId ? options.cityId : 'global'
  const filePath = `${safePrefix}/${citySegment}/${Date.now()}-${randomUUID()}.${fileExt}`

  const buffer = Buffer.from(base64Data, 'base64')
  const bucket = options.bucket || 'images'

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.warn('[Storage] Failed to upload image:', error)
    return null
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl: data.publicUrl,
    contentType,
  }
}
