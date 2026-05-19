import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import CheckoutForm from './CheckoutForm'

export const metadata = { title: 'إتمام الشراء - زهرة الخليج' }

export default async function CheckoutPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login?redirect=/checkout')
  return <CheckoutForm />
}
