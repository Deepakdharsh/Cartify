
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

// Get Dashboard data for a seller (total sales, total orders, total products , total earnings)

export async function GET(request){
    try {
        const {userId} = getAuth(request)

        const storeId = await authSeller(userId)

        // Get all orders for seller

        const orders = await prisma.order.findMany({
            where:{storeId}
        })

        // Get all products with ratings for seller

        const products = await prisma.product.findMany({where:{storeId}})

        const ratings =  await prisma.rating.findMany({
            where:{productId:{in:products.map(p=>p.id)}},
            include:{user:true,product:true}
        })

        const DashboardData = {
            ratings,
            toOrders:orders.length,
            totalEarnings:Math.round(orders.reduce((acc,order)=>acc+order.totalPrice,0)),
            totalProducts:products.length,
        }

        return NextResponse.json({DashboardData})
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message},{status:400});
    }
}   
