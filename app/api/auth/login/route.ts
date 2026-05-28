import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/database/user.model";
import { generateToken, type TokenPayload } from "@/lib/auth";

interface LoginPayload {
    email: string;
    password: string;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const payload: LoginPayload = await req.json();

        // Validate required fields
        if (!payload.email || !payload.password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email (include password for verification)
        const user = await User.findOne({ email: payload.email.toLowerCase() }).select("+password");

        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(payload.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json(
                { message: "Your account is inactive" },
                { status: 403 }
            );
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const tokenPayload: TokenPayload = {
            userId: user._id?.toString() || "",
            email: user.email,
            role: user.role,
        };

        const token = generateToken(tokenPayload);

        // Return response with token
        const response = NextResponse.json(
            {
                message: "Login successful",
                user: {
                    _id: user._id?.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                token,
            },
            { status: 200 }
        );

        // Set httpOnly cookie for secure token storage
        response.cookies.set("authToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { message, error: message },
            { status: 500 }
        );
    }
}
