import { db } from "@/lib/db";
import { SettingsFormValidator } from "@/lib/validators/settings-form";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(req: Request, { params }: { params: {storeId: string}}) {
    try {
        const { userId } = auth()

        const body = await req.json()

        const { name } = SettingsFormValidator.parse(body)


        if (!userId) {
            return new NextResponse('Unauthenticated user', {status: 401})
        }

        if (!name) {
            return new NextResponse('Storename is required', {status: 400})
        }

        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 402})
        }

        const store = await db.store.updateMany({
            where: {
                id: params.storeId,
                userId,
            },
            data: {
                name,

            }
        })

        return NextResponse.json(store)

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


export async function DELETE(req: Request, { params }: { params: {storeId: string}}) {
    try {
        const { userId } = auth()

        if (!userId) {
            return new NextResponse('Unauthenticated user', {status: 401})
        }

        if (!params.storeId) {
            return new NextResponse('StoreId is required', {status: 402})
        }

        const store = await db.store.deleteMany({
            where: {
                id: params.storeId,
                userId,
            },
            
        })

        return NextResponse.json(store)

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