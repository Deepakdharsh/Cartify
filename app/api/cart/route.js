import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// update user cart 
export async function POST(request){
    try {
        
        const {userId} = getAuth(request)
        const {cartItems} = await request.json()
        
        // save the cart to the user object
        
        const updatedData = await prisma.user.update({
            where:{id:userId},
            data:{cart:cartItems}
        })

        return NextResponse.json({message:"cart updated"})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.message},{status:400})
    }
}

// get user cart 
export async function GET(request){
    try {
        const {userId} = getAuth(request)
         
        const user = await prisma.user.findUnique({
            where:{id:userId}
        })

        return NextResponse.json({cart:user.cart})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error:error.message},{status:400})
    }
}