import { db } from "@/lib/db";
import { BillboardsFormValidator } from "@/lib/validators/billboards-settings";
import { SizeValidator } from "@/lib/validators/size";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request, {params}: {params: {sizeId: string}}) {
    try {
    
        if (!params.sizeId) {
            return new NextResponse('Size Id is required', {status: 400})
        }

        const size = await db.size.findUnique({
            where: {
                id: params.sizeId 
            }
        })

        return NextResponse.json(size);
        
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

export async function PATCH(req: Request, {params}: {params: {storeId: string, sizeId: string}}) {
    try {
        const  { userId } = auth()

         const body = await req.json()
         const { name, value } = SizeValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!name) {
            return new NextResponse('Name is required', {status: 400})
        }
        if (!value) {
            return new NextResponse('Value is required', {status: 400})
        }
        if (!params.sizeId) {
            return new NextResponse('Size Id is required', {status: 400})
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

        const size = await db.size.updateMany({
            where: {
                id: params.sizeId,
            },
            data: {
                name,
                value,
            }
        })

        return NextResponse.json(size);
        
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
    {params}: {params: {storeId: string, sizeId: string}}
    ) {

    try {

        const {  userId } = auth();

        if ( !userId ) {
            return new NextResponse('Unauthenticated', {status: 401})
        }
    
        if (!params.sizeId) {
            return new NextResponse('Size Id is required', {status: 400})
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


        const size = await db.size.deleteMany({
            where: {
                id: params.sizeId 
            }
        });

        return NextResponse.json(size);
        
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