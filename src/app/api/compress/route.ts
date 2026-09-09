import { compress } from "@quicktoolsone/pdf-compress";

export async function POST(req: Reqeust) {
  const file = await req.file;

  const result = await compress(file, {
    preset: "balanced",
  });

  return;
}
