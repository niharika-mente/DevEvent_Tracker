'use server';

import connectToDatabase from "@/lib/mongodb";
import { User, type IUser, type UserRole } from "@/database";
import { generateToken, type TokenPayload } from "@/lib/auth";

/**
 * Register a new user
 */
export async function registerUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole
): Promise<{ success: boolean; message: string; user?: Partial<IUser>; token?: string }> {
    try {
        await connectToDatabase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return { success: false, message: "User with this email already exists" };
        }

        // Create new user
        const newUser = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role,
            isActive: true,
        });

        await newUser.save();

        // Generate token
        const tokenPayload: TokenPayload = {
            userId: newUser._id?.toString() || "",
            email: newUser.email,
            role: newUser.role,
        };

        const token = generateToken(tokenPayload);

        // Return user data (excluding password)
        const userResponse = {
            _id: newUser._id?.toString(),
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
        };

        return { success: true, message: "User registered successfully", user: userResponse, token };
    } catch (error) {
        console.error("Registration error:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Registration failed",
        };
    }
}

/**
 * Login user
 */
export async function loginUser(
    email: string,
    password: string
): Promise<{ success: boolean; message: string; user?: Partial<IUser>; token?: string }> {
    try {
        await connectToDatabase();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

        if (!user) {
            return { success: false, message: "Invalid email or password" };
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return { success: false, message: "Invalid email or password" };
        }

        if (!user.isActive) {
            return { success: false, message: "Your account is inactive" };
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

        // Return user data (excluding password)
        const userResponse = {
            _id: user._id?.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };

        return { success: true, message: "Login successful", user: userResponse, token };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Login failed" };
    }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<{ success: boolean; user?: Partial<IUser> }> {
    try {
        await connectToDatabase();

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return { success: false };
        }

        return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
        console.error("Get user error:", error);
        return { success: false };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<IUser>
): Promise<{ success: boolean; message: string; user?: Partial<IUser> }> {
    try {
        await connectToDatabase();

        // Prevent updating sensitive fields
        const { password, role, email, ...safeUpdates } = updates;

        const updatedUser = await User.findByIdAndUpdate(userId, safeUpdates, {
            new: true,
            runValidators: true,
        }).select("-password");

        if (!updatedUser) {
            return { success: false, message: "User not found" };
        }

        return {
            success: true,
            message: "Profile updated successfully",
            user: JSON.parse(JSON.stringify(updatedUser)),
        };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, message: error instanceof Error ? error.message : "Update failed" };
    }
}
