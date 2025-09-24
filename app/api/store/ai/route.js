import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";
import { authSeller } from "@/middlewares/authSeller";

async function main(base64Image, mimeType) {
  //   const imagePath = "Path/to/agi/image.jpeg";
  //   const base64Image = await encodeImage(imagePath);
  const messages = [
    {
      role: "system",
      content: `
      Your are a product listing assistant for an e-commerce store.
      Your job is to analyze an image of a product and generate structured data. 
      Respond ONLY with raw JSON (no code block, no markdown, no explanation). 
      The JSON must strictly follow this schema:
      {"name":string, // short product name
      "description":string // marketing-friendly description of the product
      }
      Strictly follow the JSON schema and provide only the raw JSON string as your response.
    `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Anlyze this image and return name + description.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: messages,
  });

  const raw = response.choices[0].message.content;

  console.log("res");
  console.log(raw);
  console.log("res");

  // remove ```json or ``` wrappers if present

  // const cleaned =  raw.replace(/```json```/g,"").trim()

  const startIndex = raw.indexOf("{");
  const endIndex = raw.lastIndexOf("}");

  let cleaned = "";
  if (startIndex !== -1 && endIndex !== -1) {
    // Extract the text between the first '{' and last '}'
    cleaned = raw.substring(startIndex, endIndex + 1);
  } else {
    // If no JSON block is found, assume the whole response might be it
    cleaned = raw.trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new Error("AI did not return vaild JSON");
  }

  return parsed;
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { baseImage, mimeType } = await request.json();
    const result = await main(baseImage, mimeType);

    console.log(result)
    return NextResponse.json({ ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
