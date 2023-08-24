import { db } from "@/lib/db";
import { ProductValidator } from "@/lib/validators/product-validator";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
    req: Request, {params}: {params: {storeId: string}}) {
    try {
        const  { userId } = auth()

         const body = await req.json()
         const {
            name,
            images, 
            price, 
            categoryId, 
            colorId, 
            sizeId, 
            isArchived, 
            isFeatured

        } = ProductValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!name) {
            return new NextResponse('Name is required', {status: 400})
        }
        if (!images || !images.length) {
            return new NextResponse('Images are required', {status: 400})
        }
        if (!price) {
            return new NextResponse('Price is required', {status: 400})
        }
        if (!categoryId) {
            return new NextResponse('Category Id is required', {status: 400})
        }
        if (!colorId) {
            return new NextResponse('Color Id is required', {status: 400})
        }
        if (!sizeId) {
            return new NextResponse('Size Id is required', {status: 400})
        }
       
        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 400})
        }

        const storeByUserId = await db.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse('Unauthorised', {status: 403})
        }


        // register storename
        const product = await db.product.create({
            data: {
                name,
                price, 
                categoryId, 
                colorId, 
                sizeId, 
                isArchived, 
                isFeatured,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: {url: string}) => image)
                        ],
                    },
                },
            },
        })

        return NextResponse.json(product);
        
    } catch (error) {
        
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid request data passed', {status: 422} )
        }

        return new NextResponse(
            'Could not post to store at this time, try again later', 
            {
                status: 500
            }
        )
    }
}


export async function GET(req: Request, {params}: {params: {storeId: string}}) {
    try {

        const { searchParams } = new URL(req.url)
        const categoryId = searchParams.get('categoryId') || undefined
        const colorId = searchParams.get('colorId') || undefined
        const sizeId = searchParams.get('sizeId') || undefined
        const isFeatured = searchParams.get('isFeatured')
    
        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 400})
        }


        const products = await db.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false,
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true,

            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(products);
        
    } catch (error) {
        
        if (error instanceof z.ZodError) {
            return new NextResponse('Invalid request data passed', {status: 422} )
        }

        return new NextResponse(
            'Could not post to store at this time, try again later', 
            {
                status: 500
            }
        )
    }
}