'use server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { HomepageConfig } from '@/lib/homepage'

export async function saveHomepageConfig(config: HomepageConfig) {
  const session = await getAdminSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.siteSettings.upsert({
    where:  { key: 'homepage_config' },
    update: { value: JSON.stringify(config) },
    create: { key: 'homepage_config', value: JSON.stringify(config) },
  })

  revalidatePath('/')
}
