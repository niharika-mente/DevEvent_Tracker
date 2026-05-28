import mongoose, { Model, Schema, HydratedDocument } from "mongoose";
import bcryptjs from "bcryptjs";

/**
 * User Roles: Attender or Organizer
 */
export type UserRole = "attender" | "organizer";

/**
 * Interface representing the User document fields.
 */
export interface IUser {
    _id?: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profilePicture?: string;
    bio?: string;
    phone?: string;
    company?: string;
    website?: string;
    location?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    eventsOrganized?: mongoose.Types.ObjectId[]; // For organizers only
    eventsAttending?: mongoose.Types.ObjectId[]; // For attenders only
    isVerified?: boolean;
    isActive?: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose document type for User.
 */
export type UserDocument = HydratedDocument<IUser>;

/**
 * Email validation regex pattern.
 * Matches standard email formats like user@example.com.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User Schema Definition.
 */
const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            validate: {
                validator: (email: string) => EMAIL_REGEX.test(email),
                message: "Please provide a valid email address",
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false, // Don't include password by default in queries
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        role: {
            type: String,
            enum: {
                values: ["attender", "organizer"],
                message: "Role must be either 'attender' or 'organizer'",
            },
            required: [true, "Role is required"],
            index: true,
        },
        profilePicture: {
            type: String,
            default: null,
        },
        bio: {
            type: String,
            default: null,
            maxlength: [500, "Bio cannot exceed 500 characters"],
        },
        phone: {
            type: String,
            default: null,
            trim: true,
        },
        company: {
            type: String,
            default: null,
            trim: true,
        },
        website: {
            type: String,
            default: null,
            trim: true,
        },
        location: {
            type: String,
            default: null,
            trim: true,
        },
        socialLinks: {
            twitter: { type: String, default: null },
            linkedin: { type: String, default: null },
            github: { type: String, default: null },
        },
        eventsOrganized: [
            {
                type: Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
        eventsAttending: [
            {
                type: Schema.Types.ObjectId,
                ref: "Event",
            },
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

/**
 * Pre-save middleware to hash password before storing.
 * Only hash if the password field has been modified.
 */
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
});

/**
 * Instance method to compare provided password with hashed password.
 */
UserSchema.methods.comparePassword = async function (
    providedPassword: string
): Promise<boolean> {
    return await bcryptjs.compare(providedPassword, this.password);
};

/**
 * Get the User model, or define it if it doesn't exist.
 */
const User =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>("User", UserSchema);

export default User;
