import { imagekit } from "@/configs/imagekit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";

// create the store
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    // get the data from the form
    const formData = await request.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const desciption = formData.get("desciption");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const adress = formData.get("adress");
    const image = formData.get("image");

    if (!name || !username || !email || !contact || !adress || !desciption) {
      return NextResponse.json(
        { error: "missing store info" },
        { status: 400 }
      );
    }

    // check if the user already has a store
    const store = await prisma.store.findFirst({ where: { userId } });

    // if the user has a store, return the store status
    if (store) {
      return NextResponse.json({ status: store.status });
    }

    // check if the username is already taken

    const isUsernameTaken = await prisma.store.findFirst({
      where: { username: username.toString().toLowerCase() },
    });

    if (isUsernameTaken) {
      return NextResponse.json(
        { error: "username is already taken" },
        { status: 400 }
      );
    }

    //image upload to imagekit
    const buffer = Buffer.from(await image.arrayBuffer());
    const reponse = await imagekit.upload({
      file: buffer,
      fileName: image.name,
      folder: "logos",
    });

    const optimizedImage = imagekit.url({
      path: reponse.filePath,
      transformation: [
        { quality: "auto" },
        { format: "auto" },
        { width: "512" },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name: name.toString(),
        username: username.toString().toLowerCase(),
        desciption: desciption.toString(),
        email: email.toString(),
        contact: contact.toString(),
        adress: adress.toString(),
        logo: optimizedImage,
      },
    });

    // link store to user

    await prisma.user.update({
      where: { id: userId },
      data: { store: { connect: { id: newStore.id } } },
    });

    return NextResponse.json(
      { message: "applied, waiting for approval" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}

// check is user have already registered a store if yes then send status of store

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    // check if the user already has a store
    const store = await prisma.store.findFirst({ where: { userId } });

    // if the user has a store, return the store status
    if (store) {
      return NextResponse.json({ status: store.status });
    }

    return NextResponse.json({ status: "not registered" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 500 }
    );
  }
}
