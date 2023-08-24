import { db } from "@/lib/db";
import { BillboardsFormValidator } from "@/lib/validators/billboards-settings";
import { SizeValidator } from "@/lib/validators/size";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request, {params}: {params: {storeId: string}}) {
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
        const size = await db.size.create({
            data: {
                name,
                value,
                storeId: params.storeId,
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


export async function GET(req: Request, {params}: {params: {storeId: string}}) {
    try {
    
        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 400})
        }


        const sizes = await db.size.findMany({
            where: {
                storeId: params.storeId
            }
        })

        return NextResponse.json(sizes);
        
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