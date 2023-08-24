import { db } from "@/lib/db";
import { BillboardsFormValidator } from "@/lib/validators/billboards-settings";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request, {params}: {params: {storeId: string}}) {
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

        const labelName = await db.billboard.findFirst({
            where: {
                label: label
            }
        })

        if (labelName) {
            return new NextResponse('Labelname already in use, try another', {status: 409})
        }

        // register storename
        const billboard = await db.billboard.create({
            data: {
                label,
                imageUrl,
                storeId: params.storeId
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


export async function GET(req: Request, {params}: {params: {storeId: string}}) {
    try {
    
        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 400})
        }


        const billboards = await db.billboard.findMany({
            where: {
                storeId: params.storeId
            }
        })

        return NextResponse.json(billboards);
        
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