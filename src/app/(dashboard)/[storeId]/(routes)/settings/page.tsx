import SettingsForm from '@/app/(dashboard)/[storeId]/(routes)/settings/components/SettingsForm'
import { db } from '@/lib/db'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import React from 'react'

interface SettingsPageProps {
    params: {
        storeId: string,
    }
}
const SettingsPage = async ({params}: SettingsPageProps) => {

    const { userId } = auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const store = await db.store.findFirst({
        where: {
            id: params.storeId,
            userId
        }
    })

    if (!store) {
        redirect('/')
    }
  return (
    <div className='flex-col'>
        <div className='flex-1 p-8 pt-6'>
            <SettingsForm initialData={store}/>
        </div>
    </div>
  )
}

export default SettingsPage