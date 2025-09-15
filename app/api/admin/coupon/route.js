import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { authAdmin } from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Add new coupon
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { newCoupon: coupon } = await request.json();

    console.log(coupon);

    coupon.code = coupon.code.toUpperCase();

    await prisma.coupon.create({ data: coupon }).then(async (c) => {
      // Run Inngest function to delete coupon on expiry
      await inngest.send({
        name: "clerk/coupon.expired",
        data: {
          code: c.code,
          expires_at: c.expiresAt,
        },
      });
    });

    // you can also do it like this
    /* 
    const createdCoupon = await prisma.coupon.create({ data: coupon });

  // Run Inngest function to delete coupon on expiry
  await inngest.send({
    name: "clerk/coupon.expired",
    data: {
      code: createdCoupon.code,
      expires_at: createdCoupon.expiresAt,
    },
  });
    */

    return NextResponse.json({ message: "coupon added successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error?.code || error?.message },
      { status: 400 }
    );
  }
}

// Delete coupon /api/coupon?id=couponId

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;

    const code = searchParams.get("code");

    await prisma.coupon.delete({ where: { code } });

    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error?.code || error?.message },
      { status: 400 }
    );
  }
}

// Get all coupons

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const isAdmin = await authAdmin(userId);

    if (!isAdmin) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({});

    return NextResponse.json({ coupons });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error?.code || error?.message },
      { status: 400 }
    );
  }
}
