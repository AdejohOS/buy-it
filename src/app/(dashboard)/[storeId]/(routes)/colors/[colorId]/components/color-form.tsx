'use client'

import { AlertModal } from '@/components/modals/alert-modal';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Headings from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectLabel } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useOrigin } from '@/hooks/use-origin';
import { toast } from '@/hooks/use-toast';
import { ColorRequest, ColorValidator } from '@/lib/validators/color-validator';

import { SizeRequest, SizeValidator } from '@/lib/validators/size';


import { zodResolver } from '@hookform/resolvers/zod';
import { Color } from '@prisma/client'
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { Trash } from 'lucide-react';


import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

interface ColorFormProps {
  initialData: Color | null;
  
}

const ColorForm = ({initialData}: ColorFormProps) => {

  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState<boolean>(false)

  const origin = useOrigin()

  const title = initialData ? 'Edit color' : 'Create color';
  const description = initialData ? 'Edit a color' : 'Add a new color'; 
  const toastMessage = initialData ? 'Color updated' : 'Color created'; 
  const action = initialData ? 'Save' : 'Create'; 

  const form = useForm<ColorRequest>({
    resolver: zodResolver(ColorValidator),
    defaultValues: initialData || {
      name: '',
      value: '',
     
    }
    
  })

  const {mutate: updateRecord, isLoading} = useMutation({
    mutationFn: async ({name, value}: ColorRequest) => {
      const payload: ColorRequest = {name, value}
       
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, payload)
      } else {

        await axios.post(`/api/${params.storeId}/colors`, payload)
      }

      router.refresh()
      router.push(`/${params.storeId}/colors`)
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      router.refresh()
      router.push(`/${params.storeId}/colors`)
      toast({
        description: 'Color deleted successfully'
      });
      
    } catch (error) {

      toast({
        description: 'Make sure you removed all products using this color first'
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
            <div className='grid grid-cols-3 gap-8'>
                  <FormField
                    name='name' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Name: </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Color name'
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='value' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Value: </FormLabel>
                        <FormControl>
                          <div className='flex items-center gap-x-4'>
                            <Input
                              placeholder='Color value'
                              {...field}
                              disabled={isLoading}
                            />
                            <div className='border p-4 rounded-full'
                              style={{backgroundColor: field.value}}
                            />
                          </div>
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
                {action}
              </Button>
          </form>
      </Form>

    </div>
    
  )
}

export default ColorForm
