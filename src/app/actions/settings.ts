'use server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function saveHomepageSettings(data: {
  feature1Title: string; feature1Desc: string
  feature2Title: string; feature2Desc: string
  feature3Title: string; feature3Desc: string
  feature4Title: string; feature4Desc: string
  brandStoryTitle: string
  brandStoryText: string
  phone: string
}) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized')

  const entries = [
    { key: 'feature1_title', value: data.feature1Title },
    { key: 'feature1_desc',  value: data.feature1Desc },
    { key: 'feature2_title', value: data.feature2Title },
    { key: 'feature2_desc',  value: data.feature2Desc },
    { key: 'feature3_title', value: data.feature3Title },
    { key: 'feature3_desc',  value: data.feature3Desc },
    { key: 'feature4_title', value: data.feature4Title },
    { key: 'feature4_desc',  value: data.feature4Desc },
    { key: 'brand_story_title', value: data.brandStoryTitle },
    { key: 'brand_story_text',  value: data.brandStoryText },
    { key: 'phone', value: data.phone },
  ]

  await Promise.all(
    entries.map((e) =>
      prisma.siteSettings.upsert({
        where: { key: e.key },
        update: { value: e.value },
        create: { key: e.key, value: e.value },
      })
    )
  )

  revalidatePath('/')
  revalidatePath('/admin/homepage')
}
