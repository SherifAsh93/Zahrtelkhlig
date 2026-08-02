const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const MEDIA_UPLOAD_API_KEY = process.env.MEDIA_UPLOAD_API_KEY
const REPO = 'SherifAsh93/Zahrtelkhlig'
const BRANCH = 'main'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`
const VALID_FOLDERS = ['products', 'banners', 'categories']

export async function POST(req: Request) {
  // Bearer token auth
  const auth = req.headers.get('authorization') || ''
  if (!MEDIA_UPLOAD_API_KEY || auth !== `Bearer ${MEDIA_UPLOAD_API_KEY}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!GITHUB_TOKEN) {
    return Response.json({ error: 'GITHUB_TOKEN not configured on server' }, { status: 500 })
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Failed to parse form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No file field in form data' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return Response.json({ error: 'File must be an image' }, { status: 400 })
  }

  const folderParam = formData.get('folder') as string | null
  const folder = folderParam && VALID_FOLDERS.includes(folderParam) ? folderParam : 'products'

  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const extension = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(rawExt)
    ? (rawExt === 'jpeg' ? 'jpg' : rawExt)
    : 'jpg'

  let base64Content: string
  try {
    const bytes = await file.arrayBuffer()
    base64Content = Buffer.from(bytes).toString('base64')
  } catch {
    return Response.json({ error: 'Failed to read file' }, { status: 400 })
  }

  const filename = `img_${Date.now()}.${extension}`
  const filePath = `public/images/${folder}/${filename}`

  const githubRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `upload image via API: ${filename}`,
      content: base64Content,
      branch: BRANCH,
    }),
  })

  if (!githubRes.ok) {
    const err = await githubRes.json().catch(() => ({}))
    return Response.json({ error: err.message || 'GitHub upload failed' }, { status: 500 })
  }

  const url = `${CDN_BASE}/${filePath}`
  return Response.json({ url, id: filename, path: filePath, folder }, { status: 201 })
}
