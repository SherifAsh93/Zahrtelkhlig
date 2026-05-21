'use server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { HomepageConfig } from '@/lib/homepage'

export async function saveHomepageConfig(config: HomepageConfig) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized')

  await prisma.siteSettings.upsert({
    where:  { key: 'homepage_config' },
    update: { value: JSON.stringify(config) },
    create: { key: 'homepage_config', value: JSON.stringify(config) },
  })

  revalidatePath('/')
}
