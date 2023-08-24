import { db } from "@/lib/db";
import { ColorValidator } from "@/lib/validators/color-validator";

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: Request, {params}: {params: {colorId: string}}) {
    try {
    
        if (!params.colorId) {
            return new NextResponse('Color Id is required', {status: 400})
        }

        const color = await db.color.findUnique({
            where: {
                id: params.colorId 
            }
        })

        return NextResponse.json(color);
        
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

export async function PATCH(req: Request, {params}: {params: {storeId: string, colorId: string}}) {
    try {
        const  { userId } = auth()

         const body = await req.json()
         const { name, value } = ColorValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthticated', {status: 401})
        }

        if (!name) {
            return new NextResponse('Name is required', {status: 400})
        }
        if (!value) {
            return new NextResponse('Value is required', {status: 400})
        }
        if (!params.colorId) {
            return new NextResponse('Color Id is required', {status: 400})
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

        const color = await db.color.updateMany({
            where: {
                id: params.colorId,
            },
            data: {
                name,
                value,
            }
        })

        return NextResponse.json(color);
        
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
    {params}: {params: {storeId: string, colorId: string}}
    ) {

    try {

        const {  userId } = auth();

        if ( !userId ) {
            return new NextResponse('Unauthenticated', {status: 401})
        }
    
        if (!params.colorId) {
            return new NextResponse('Color Id is required', {status: 400})
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


        const color = await db.color.deleteMany({
            where: {
                id: params.colorId 
            }
        });

        return NextResponse.json(color);
        
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