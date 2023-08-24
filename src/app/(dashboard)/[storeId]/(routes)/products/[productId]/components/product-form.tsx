'use client'

import { AlertModal } from '@/components/modals/alert-modal';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Headings from '@/components/ui/heading';
import ImageUpload from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useOrigin } from '@/hooks/use-origin';
import { toast } from '@/hooks/use-toast';
import { ProductRequest, ProductValidator } from '@/lib/validators/product-validator';


import { zodResolver } from '@hookform/resolvers/zod';
import { Category, Color, Image, Product, Size } from '@prisma/client'

import axios from 'axios';
import { Trash } from 'lucide-react';


import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

interface ProductFormProps {
  initialData: Product & {
    images: Image[]
  } | null;
  categories: Category[]
  sizes: Size[]
  colors: Color[]
}

const ProductForm = ({initialData, categories, sizes, colors}: ProductFormProps) => {

  const [open, setOpen] = useState<boolean>(false)
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState<boolean>(false)

  const origin = useOrigin()

  const title = initialData ? 'Edit product' : 'Create product';
  const description = initialData ? 'Edit a product' : 'Add a new product'; 
  const toastMessage = initialData ? 'Product updated' : 'Product created'; 
  const action = initialData ? 'Save' : 'Create'; 

  const defaultValues = initialData ? {
    ...initialData,
    price: parseFloat(String(initialData?.price)),
  } : {

    name: '',
    images: [],
    price: 0,
    categoryId: '',
    colorId: '',
    sizeId: '',
    isFeatured: false,
    isArchived: false,

  }

  const form = useForm<ProductRequest>({
    resolver: zodResolver(ProductValidator),
    defaultValues 
  });

  const onSubmit = async (payload: ProductRequest) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, payload)
      } else {

        await axios.post(`/api/${params.storeId}/products`, payload)
      }
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast({description: (toastMessage) })
    } catch (error) {
      toast({
        title: 'There was an error.',
        description: 'Could not update product',
        variant: 'destructive'
    })
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast({
        description: 'Product deleted successfully'
      });
      
    } catch (error) {

      toast({
        title: 'Something went wrong',
        description: 'Please check network connection and try again'
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 w-full'>
              

                  <FormField
                    name='images'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Images: </FormLabel>
                        <FormControl>

                          <ImageUpload
                           value={field.value.map((image) => image.url)}
                           disabled={loading}
                           onChange={(url) => field.onChange([...field.value, {url}])}
                           onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                           />

                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />
                <div className='grid grid-cols-3 gap-8'>
                  <FormField
                    name='name'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Name: </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Product name'
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='price'
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Product price: </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='9.99'
                            {...field}
                            disabled={loading}
                            type='number'
                          />
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='categoryId' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Category: </FormLabel>
                        <FormControl>
                          <Select 
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue 
                                  defaultValue={field.value} 
                                  placeholder="Select a category"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                            
                          </Select>
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='sizeId' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Size: </FormLabel>
                        <FormControl>
                          <Select 
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue 
                                  defaultValue={field.value} 
                                  placeholder="Select a size"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sizes.map((size) => (
                                <SelectItem
                                  key={size.id}
                                  value={size.id}
                                >
                                  {size.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                            
                          </Select>
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='colorId' 
                    control={form.control}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel> Color: </FormLabel>
                        <FormControl>
                          <Select 
                            disabled={loading}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue 
                                  defaultValue={field.value} 
                                  placeholder="Select a color"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {colors.map((color) => (
                                <SelectItem
                                  key={color.id}
                                  value={color.id}
                                >
                                  {color.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                            
                          </Select>
                        </FormControl>
                        <FormMessage/>
                        </FormItem>
                        )}
                  />

                  <FormField
                    name='isFeatured'
                    control={form.control}
                    render={({field}) => (
                      <FormItem className='flex flex-row space-y-0 border p-4
                                          items-start space-x-3 rounded-md'
                      >
                        <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>
                            Featured:
                          </FormLabel>
                          <FormDescription className='text-xs'>
                            If checked, this product wii appear on the homepage.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    name='isArchived'
                    control={form.control}
                    render={({field}) => (
                      <FormItem className='flex flex-row space-y-0 border p-4
                                          items-start space-x-3 rounded-md'
                      >
                        <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>
                            Archived:
                          </FormLabel>
                          <FormDescription className='text-xs'>
                            If checked, this product will not appear anywhere in the store.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

              </div>
              <Button
                isLoading={loading}
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

export default ProductForm