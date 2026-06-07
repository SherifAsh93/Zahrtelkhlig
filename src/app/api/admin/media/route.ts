import { getAdminSession } from '@/lib/session'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'SherifAsh93/Zahrtelkhlig'
const BRANCH = 'main'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`

const FOLDERS = ['public/images/products', 'public/images/banners', 'public/images/categories']

async function listFolder(folder: string) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${folder}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      next: { revalidate: 0 },
    }
  )
  if (!res.ok) return []
  const files = await res.json()
  if (!Array.isArray(files)) return []
  return files
    .filter((f: { type: string; name: string }) => f.type === 'file' && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
    .map((f: { name: string; path: string; sha: string; size: number }) => ({
      name: f.name,
      path: f.path,
      sha: f.sha,
      size: f.size,
      url: `${CDN_BASE}/${f.path}`,
      folder: folder.replace('public/images/', ''),
    }))
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!GITHUB_TOKEN) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  const results = await Promise.all(FOLDERS.map(listFolder))
  const files = results.flat()
  return Response.json({ files })
}

export async function DELETE(req: Request) {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!GITHUB_TOKEN) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  const { path, sha } = await req.json()
  if (!path || !sha) return Response.json({ error: 'path and sha required' }, { status: 400 })

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({ message: `delete image: ${path}`, sha, branch: BRANCH }),
  })

  if (!res.ok) {
    const err = await res.json()
    return Response.json({ error: err.message || 'Delete failed' }, { status: 500 })
  }
  return Response.json({ ok: true })
}
