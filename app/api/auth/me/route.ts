import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { getRequestAuth } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const decoded = getRequestAuth(req);

        if (!decoded) {
            return NextResponse.json(
                { message: "Invalid token" },
                { status: 401 }
            );
        }

        // Fetch user data
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: "User profile retrieved",
                user: JSON.parse(JSON.stringify(user)),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { message: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}
