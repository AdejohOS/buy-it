import { db } from "@/lib/db";
import { StoreValidator } from "@/lib/validators/store";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const  { userId } = auth()

         const body = await req.json()
         const { name } = StoreValidator.parse(body);

        if (!userId) {
            return new NextResponse('Unauthorized access', {status: 401})
        }

        if (!name) {
            return new NextResponse('Name is required', {status: 400})
        }

        const storeName = await db.store.findFirst({
            where: {
                name: name
            }
        })

        if (storeName) {
            return new NextResponse('Storename already in use, try another', {status: 409})
        }

        // register storename
        const store = await db.store.create({
            data: {
                name,
                userId,
            }
        })

        return NextResponse.json(store);
        
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