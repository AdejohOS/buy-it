'use client'

import { AlertModal } from '@/components/modals/alert-modal';
import { ApiAlert } from '@/components/ui/api-alert';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Headings from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useOrigin } from '@/hooks/use-origin';
import { toast } from '@/hooks/use-toast';

import { SettingsFormValidator, SettingsRequest } from '@/lib/validators/settings-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Store } from '@prisma/client'
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Trash } from 'lucide-react';


import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

interface SettingsFormProps {
  initialData: Store;
}

const SettingsForm = ({initialData}: SettingsFormProps) => {

  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState<boolean>(false)

  const origin = useOrigin()

  const form = useForm<SettingsRequest>({
    resolver: zodResolver(SettingsFormValidator),
    defaultValues: initialData
    
  })

  const {mutate: updateRecord, isLoading} = useMutation({
    mutationFn: async ({name}: SettingsRequest) => {
      const payload: SettingsRequest = {name}

      const { data } = await axios.patch(`/api/stores/${params.storeId}`, payload)
      router.refresh()
    },

    onSuccess: () => {
      toast({
        description: 'Storename updated successfully.'
      })
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return toast({
            description: 'Unauthenticated user',
            variant: 'destructive',
        })
        }
      }

      toast({
        title: 'There was an error.',
        description: 'Could not update store',
        variant: 'destructive'
    })
    }
  })

  // i intend to change this below to a tanstack react query use mutation function
  // when i fully grasp how to have two function in a single useMutation

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push('/')
      toast({
        description: 'Store deleted successfully'
      });
      
    } catch (error) {

      toast({
        description: 'Make sure you removed all products and categories'
      })
      
    } finally {
      setLoading(false)
      setOpen(false)
    }

  }

  return (
    <div className='flex flex-col gap-3'>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        isLoading={loading}
      />

      <div className='flex items-center justify-between'>
        <Headings
          title='Settings'
          description='Manage store preferences'
        />
        <Button
          variant='destructive'
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash className='w-4 h-4'/>
        </Button>
      </div>

      <Separator/>

      <Form {...form}>
          <form onSubmit={form.handleSubmit((e) => updateRecord(e))} className='space-y-8 w-full'>
              <div className='grid grid-cols-3 gap-8'>
                  <FormField
                    name='name'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Name: </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Store name'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />
              </div>
              <Button
                isLoading={isLoading}
                type='submit'
                className='ml-auto'
              >
                Save changes
              </Button>
          </form>
      </Form>

      <Separator />

      <ApiAlert 
        title='NEXT_PUBLIC_API_URL' 
        description={`${origin}/api/${params.storeId}`}
        variant='public'
      />


    </div>
    
  )
}

export default SettingsForm