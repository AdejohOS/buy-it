import { db } from "@/lib/db";
import { CategoryFormValidator } from "@/lib/validators/category-validator";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
    req: Request,
    {params}: {params: {storeId: string}})
    {

    try {
        const  { userId } = auth()

         const body = await req.json()
         const { name, billboardId } = CategoryFormValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!name) {
            return new NextResponse('name is required', {status: 400})
        }
        if (!billboardId) {
            return new NextResponse('Billboard is required', {status: 400})
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

        const categoryName = await db.category.findFirst({
            where: {
                name: name
            }
        })

        if (categoryName) {
            return new NextResponse('Labelname already in use, try another', {status: 409})
        }

        // register storename
        const category = await db.category.create({
            data: {
                name,
                billboardId,
                storeId: params.storeId
            }
        })

        return NextResponse.json(category);
        
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
    
        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 400})
        }


        const categories = await db.category.findMany({
            where: {
                storeId: params.storeId
            }
        })

        return NextResponse.json(categories);
        
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