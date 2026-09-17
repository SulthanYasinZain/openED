import { GoogleGenAI } from "@google/genai";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type AuthTokenPayload, verifyAccessToken } from "@/lib/session";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let session: AuthTokenPayload;

  try {
    session = await verifyAccessToken(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No PDF file provided",
        },
        {
          status: 400,
        },
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "File must be a PDF",
        },
        {
          status: 400,
        },
      );
    }

    console.log(`Summarizing ${file.name} (${file.size} bytes)`);

    const buffer = await file.arrayBuffer();

    const base64 = Buffer.from(buffer).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64,
          },
        },
        {
          text: `
You are an academic assistant helping a university student.

Analyze the provided PDF and create a useful summary for a
class assignment.

Write the response in clear academic Indonesian.

Include:

1. Judul atau topik utama
2. Ringkasan umum
3. Konsep-konsep penting
4. Poin-poin utama
5. Definisi penting
6. Teori atau metode yang dibahas
7. Temuan atau pembahasan penting
8. Kesimpulan

Rules:
- Only use information contained in the PDF.
- Do not invent information.
- Do not copy the entire PDF.
- Make the explanation easy for a university student to understand.
- Use headings and bullet points where appropriate.
          `,
        },
      ],
    });

    return NextResponse.json({
      summary: response.text,
    });
  } catch (error) {
    console.error("Gemini summarization error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to summarize PDF",
      },
      {
        status: 500,
      },
    );
  }
}
