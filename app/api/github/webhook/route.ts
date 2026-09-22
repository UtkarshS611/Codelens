import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const payload = await req.json();

    console.log("Received GitHub webhook payload");
    console.log(JSON.stringify(payload, null, 2));

    return Response.json({
        received: true,
    })
}