

'use client'

import { useStoreModal } from "@/hooks/use-store-modal"
import { zodResolver } from '@hookform/resolvers/zod'


import Modal from "@/components/ui/modal"
import { useForm } from "react-hook-form"

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

import { useState } from "react"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { StoreRequest, StoreValidator } from "@/lib/validators/store"
import { useMutation } from "@tanstack/react-query"



export const Test = () => {

    const storeModal = useStoreModal()
    
    const form = useForm<StoreRequest>({
        resolver: zodResolver(StoreValidator),
        defaultValues: {
            name: '',
        }
    });

    const {mutate: createStore, isLoading} = useMutation({
        mutationFn: async ({name}: StoreRequest) => {
            const payload: StoreRequest = {name}

            const { data } = await axios.post(`/api/store`, payload)
            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        description: 'Store already exist, please try another',
                        variant: 'destructive',
                    })
                }
            }

            toast({
                title: 'There was an error.',
                description: 'Could not create store',
                variant: 'destructive'
            })
        },

        onSuccess: () => {
            return toast({
                description: `Store created successfully`,
            })
        }
    })

    return (
        <Modal
            title="Create store"
            description="Add a new store to manage products and categories"
            isOpen={storeModal.isOpen}
            onClose={storeModal.onClose}
        >
            <div>
                <div className='space-y-4 py-2 pb-4'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((e) => createStore(e))}>
                            <FormField
                                name='name'
                                control={form.control}
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel className='sr-only' htmlFor='name'>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                id='name'
                                                placeholder='E-commerece'
                                                {...field}
                                                disabled={isLoading} 
                                            />
                                            <FormDescription>
                                                Create a store
                                            </FormDescription>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                                
                            <div className='pt-6 space-x-2 flex items-center justiify-end w-full'>
                                    <Button
                                        disabled={isLoading} 
                                        variant='outline'
                                        onClick={storeModal.onClose}
                                    >
                                            Cancel 
                                    </Button>

                                    <Button
                                        isLoading={isLoading} 
                                        type='submit'
                                    > Create 
                                    </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    )
}



const onSubmit = async (values: StoreRequest) => {
    try {
        setIsLoading(true)

        const response = await axios.post(`/api/stores`, values)
        toast({
            description: 'Store created successfully',
        })

    } catch (error) {
        toast({
            title: 'Something went wrong',
            description: 'cannot create store, try again later',
            variant: 'destructive',
        })

    } finally {
        setIsLoading(false)
    }
}
