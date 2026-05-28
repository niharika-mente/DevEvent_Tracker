import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User, { type UserRole } from "@/database/user.model";
import { generateToken, type TokenPayload } from "@/lib/auth";

interface SignupPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const payload: SignupPayload = await req.json();

        // Validate required fields
        if (!payload.email || !payload.password || !payload.firstName || !payload.lastName || !payload.role) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate role
        if (payload.role !== "attender" && payload.role !== "organizer") {
            return NextResponse.json(
                { message: "Invalid role. Must be 'attender' or 'organizer'" },
                { status: 400 }
            );
        }

        // Validate password length
        if (payload.password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: payload.email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = await User.create({
            email: payload.email.toLowerCase(),
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
            role: payload.role,
            isActive: true,
        });

        // Generate token
        const tokenPayload: TokenPayload = {
            userId: newUser._id?.toString() || "",
            email: newUser.email,
            role: newUser.role,
        };

        const token = generateToken(tokenPayload);

        // Return response with token
        const response = NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    _id: newUser._id?.toString(),
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                },
                token,
            },
            { status: 201 }
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
        console.error("Signup error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            { message, error: message },
            { status: 500 }
        );
    }
}
