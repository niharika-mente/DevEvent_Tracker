import { NextRequest } from "next/server";
import { extractTokenFromHeader, verifyToken, type TokenPayload } from "@/lib/auth";

export function getRequestToken(req: NextRequest): string | null {
    return (
        extractTokenFromHeader(req.headers.get("authorization")) ||
        req.cookies.get("authToken")?.value ||
        null
    );
}

export function getRequestAuth(req: NextRequest): TokenPayload | null {
    const token = getRequestToken(req);

    if (!token) {
        return null;
    }

    return verifyToken(token);
}
