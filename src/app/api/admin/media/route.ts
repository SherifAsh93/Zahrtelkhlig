import { getAdminSession } from '@/lib/session'
import { promises as fs } from 'fs'
import path from 'path'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'SherifAsh93/Zahrtelkhlig'
const BRANCH = 'main'
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}`

const FOLDERS = ['products', 'banners', 'categories']

async function listFolder(folderName: string) {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', folderName)
    const entries = await fs.readdir(dir)
    const imageFiles = entries.filter(name => /\.(jpg|jpeg|png|webp|gif)$/i.test(name))

    const stats = await Promise.all(
      imageFiles.map(async name => {
        try {
          const stat = await fs.stat(path.join(dir, name))
          return { name, size: stat.size }
        } catch {
          return { name, size: 0 }
        }
      })
    )

    // Sort newest first using the timestamp embedded in filename (img_1234567890.jpg)
    stats.sort((a, b) => {
      const tsA = parseInt(a.name.split('_')[1]?.split('.')[0] || '0')
      const tsB = parseInt(b.name.split('_')[1]?.split('.')[0] || '0')
      return tsB - tsA
    })

    return stats.map(({ name, size }) => ({
      name,
      path: `public/images/${folderName}/${name}`,
      url: `${CDN_BASE}/public/images/${folderName}/${name}`,
      folder: folderName,
      size,
    }))
  } catch {
    return []
  }
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const results = await Promise.all(FOLDERS.map(listFolder))
  const files = results.flat()
  return Response.json({ files })
}

export async function DELETE(req: Request) {
  const session = await getAdminSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (!GITHUB_TOKEN) return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })

  const { path: filePath } = await req.json()
  if (!filePath) return Response.json({ error: 'path required' }, { status: 400 })

  // Fetch current SHA from GitHub (required for deletion)
  const getRes = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
  )
  if (!getRes.ok) return Response.json({ error: 'File not found on GitHub' }, { status: 404 })
  const fileInfo = await getRes.json()

  const delRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({ message: `delete image: ${filePath}`, sha: fileInfo.sha, branch: BRANCH }),
  })

  if (!delRes.ok) {
    const err = await delRes.json()
    return Response.json({ error: err.message || 'Delete failed' }, { status: 500 })
  }
  return Response.json({ ok: true })
}
