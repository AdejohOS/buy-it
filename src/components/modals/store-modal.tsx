'use client'

import { useStoreModal } from "@/hooks/use-store-modal"
import { zodResolver } from '@hookform/resolvers/zod'


import Modal from "@/components/ui/modal"
import { useForm } from "react-hook-form"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useState } from "react"
import axios, { AxiosError } from "axios"
import { toast } from "@/hooks/use-toast"
import { StoreRequest, StoreValidator } from "@/lib/validators/store"
import { useMutation } from "@tanstack/react-query"



export const StoreModal = () => {

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

            const { data } = await axios.post('/api/stores', payload)

            window.location.assign(`/${data.id}`)
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
                                        <FormLabel>Name:</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='E-commerce'
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className='pt-6 space-x-2 flex items-center justify-end w-full'>
                                    <Button
                                        variant='outline'
                                        onClick={storeModal.onClose}
                                        disabled={isLoading}
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