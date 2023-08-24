import { db } from "@/lib/db";
import { BillboardsFormValidator } from "@/lib/validators/billboards-settings";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request, {params}: {params: {billboardId: string}}) {
    try {
    
        if (!params.billboardId) {
            return new NextResponse('Billboard Id is required', {status: 400})
        }

        const billboard = await db.billboard.findUnique({
            where: {
                id: params.billboardId 
            }
        })

        return NextResponse.json(billboard);
        
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

export async function PATCH(req: Request, {params}: {params: {storeId: string, billboardId: string}}) {
    try {
        const  { userId } = auth()

         const body = await req.json()
         const { label, imageUrl } = BillboardsFormValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!label) {
            return new NextResponse('Label is required', {status: 400})
        }
        if (!imageUrl) {
            return new NextResponse('Image is required', {status: 400})
        }
        if (!params.billboardId) {
            return new NextResponse('Billboard Id is required', {status: 400})
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

        const billboard = await db.billboard.updateMany({
            where: {
                id: params.billboardId,
            },
            data: {
                label,
                imageUrl
            }
        })

        return NextResponse.json(billboard);
        
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
    {params}: {params: {storeId: string, billboardId: string}}
    ) {

    try {

        const {  userId } = auth();

        if ( !userId ) {
            return new NextResponse('Unauthenticated', {status: 401})
        }
    
        if (!params.billboardId) {
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


        const billboard = await db.billboard.deleteMany({
            where: {
                id: params.billboardId 
            }
        });

        return NextResponse.json(billboard);
        
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