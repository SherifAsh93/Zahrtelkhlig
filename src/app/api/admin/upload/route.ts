import { getAdminSession } from '@/lib/session'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'SherifAsh93/Zahrtelkhlig'
const BRANCH = 'main'
const BASE_PATH = 'public/images/products'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (!GITHUB_TOKEN) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  const contentType = req.headers.get('content-type') || ''

  let base64Content: string
  let extension = 'jpg'
  let originalName = ''

  if (contentType.includes('multipart/form-data')) {
    // File upload from device
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase()
    extension = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '') ? (ext === 'jpeg' ? 'jpg' : ext!) : 'jpg'
    originalName = file.name

    const bytes = await file.arrayBuffer()
    base64Content = Buffer.from(bytes).toString('base64')
  } else {
    // URL download
    const { url } = await req.json()
    if (!url) return Response.json({ error: 'No URL provided' }, { status: 400 })

    try {
      const imgRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      if (!imgRes.ok) return Response.json({ error: 'Failed to fetch image from URL' }, { status: 400 })

      const urlPath = new URL(url).pathname
      const ext = urlPath.split('.').pop()?.toLowerCase()
      extension = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '') ? (ext === 'jpeg' ? 'jpg' : ext!) : 'jpg'

      const bytes = await imgRes.arrayBuffer()
      base64Content = Buffer.from(bytes).toString('base64')
    } catch {
      return Response.json({ error: 'Invalid URL or could not download image' }, { status: 400 })
    }
  }

  // Generate unique filename
  const filename = `img_${Date.now()}.${extension}`
  const filePath = `${BASE_PATH}/${filename}`

  // Upload to GitHub
  const githubRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: `upload product image: ${originalName || filename}`,
      content: base64Content,
      branch: BRANCH,
    }),
  })

  if (!githubRes.ok) {
    const err = await githubRes.json()
    return Response.json({ error: err.message || 'GitHub upload failed' }, { status: 500 })
  }

  const cdnUrl = `${CDN_BASE}/${filePath}`
  return Response.json({ url: cdnUrl, filename })
}
