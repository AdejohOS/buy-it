'use client'

import { AlertModal } from '@/components/modals/alert-modal';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Headings from '@/components/ui/heading';
import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useOrigin } from '@/hooks/use-origin';
import { toast } from '@/hooks/use-toast';
import { BillboardsFormValidator, BillboardsRequest } from '@/lib/validators/billboards-settings';


import { zodResolver } from '@hookform/resolvers/zod';
import { Billboard } from '@prisma/client'
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Trash } from 'lucide-react';


import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

interface BillboardsFormProps {
  initialData: Billboard | null;
}

const BillboardsForm = ({initialData}: BillboardsFormProps) => {

  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState<boolean>(false)

  const origin = useOrigin()

  const title = initialData ? 'Edit billboard' : 'Create billboard';
  const description = initialData ? 'Edit a billboard' : 'Add a new billboard'; 
  const toastMessage = initialData ? 'Billboard updated' : 'Billboard created'; 
  const action = initialData ? 'Save' : 'Create'; 

  const form = useForm<BillboardsRequest>({
    resolver: zodResolver(BillboardsFormValidator),
    defaultValues: initialData || {
      label: '',
      imageUrl: ''
    }
    
  })

  const {mutate: updateRecord, isLoading} = useMutation({
    mutationFn: async ({label, imageUrl}: BillboardsRequest) => {
      const payload: BillboardsRequest = {label, imageUrl}
       
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, payload)
      } else {

        await axios.post(`/api/${params.storeId}/billboards`, payload)
      }

      router.refresh()
      router.push(`/${params.storeId}/billboards`)
    },

    onSuccess: () => {
      toast({description: (toastMessage) })
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
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`)
      router.refresh()
      router.push(`/${params.storeId}/billboards`)
      toast({
        description: 'Billboard deleted successfully'
      });
      
    } catch (error) {

      toast({
        description: 'Make sure you removed all categories using this billboard'
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
          title={title}
          description={description}
        />
        { initialData && (
          <Button
            variant='destructive'
            size="sm"
            onClick={() => setOpen(true)}
        >
            <Trash className='w-4 h-4'/>
          </Button>
        )}
        
      </div>

      <Separator/>

      <Form {...form}>
          <form onSubmit={form.handleSubmit((e) => updateRecord(e))} className='space-y-8 w-full'>
              

                  <FormField
                    name='imageUrl'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Background image: </FormLabel>
                        <FormControl>

                          <ImageUpload
                           value={field.value ? [field.value] : []}
                           disabled={loading}
                           onChange={(url) => field.onChange(url)}
                           onRemove={() => field.onChange("")}
                           />

                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />
                  <FormField
                    name='label'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Label: </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Billboard label'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />
              
              <Button
                isLoading={isLoading}
                type='submit'
                className='ml-auto'
              >
                {action}
              </Button>
          </form>
      </Form>

    </div>
    
  )
}

export default BillboardsForm