import { db } from "@/lib/db";
import { BillboardsFormValidator } from "@/lib/validators/billboards-settings";
import { CategoryFormValidator } from "@/lib/validators/category-validator";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
    req: Request, {params}: {params: {categoryId: string}}) {
    try {
    
        if (!params.categoryId) {
            return new NextResponse('Category Id is required', {status: 400})
        }

        const category = await db.category.findUnique({
            where: {
                id: params.categoryId 
            }, 
            include: {
                billboard: true
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

export async function PATCH(
    req: Request, {params}: {params: {
        storeId: string, categoryId: string}})
        {

    try {
        const  { userId } = auth()

         const body = await req.json()
         const { name, billboardId } = CategoryFormValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!name) {
            return new NextResponse('Name is required', {status: 400})
        }
        if (!billboardId) {
            return new NextResponse('Billboard is required', {status: 400})
        }
        if (!params.categoryId) {
            return new NextResponse('CategoryId is required', {status: 400})
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

        const category = await db.category.updateMany({
            where: {
                id: params.categoryId,
            },
            data: {
                name,
                billboardId,
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

export async function DELETE(
    req: Request,
    {params}: {params: {storeId: string, categoryId: string}}
    ) {

    try {

        const { userId } = auth();

        if ( !userId ) {
            return new NextResponse('Unauthenticated', {status: 401})
        }
    
        if (!params.categoryId) {
            return new NextResponse('Billboard Id is required', {status: 400})
        }

        const storeByUserId = await db.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse('Unauthorised', {status: 403})
        }


        const category = await db.category.deleteMany({
            where: {
                id: params.categoryId 
            }
        });

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