import mongoose, { Model, Schema, HydratedDocument } from "mongoose";
import crypto from "crypto";

/**
 * Unified schema for all opportunity types: hackathons, internships, jobs.
 * All data from different sources is normalized into this structure.
 */
export interface IOpportunity {
  _id?: string;
  title: string;
  company: string;
  /** "hackathon" | "internship" | "job" */
  type: "hackathon" | "internship" | "job";
  location: string;
  isRemote: boolean;
  /** Stipend for internships, prize pool for hackathons */
  stipend: string;
  /** Salary range for jobs */
  salaryMin?: number;
  salaryMax?: number;
  /** Application / registration deadline */
  deadline?: Date;
  skills: string[];
  tags: string[];
  applyLink: string;
  /** Source platform name e.g. "Unstop", "HackerEarth", "Devfolio" */
  source: string;
  logo: string;
  description: string;
  /** Date the opportunity was originally posted */
  postedAt: Date;
  /** Duration for internships (e.g. "3 months") */
  duration?: string;
  /** Number of views on this platform */
  views: number;
  /** Number of times bookmarked */
  bookmarks: number;
  /** Marked true if deadline has passed */
  isExpired: boolean;
  /** Pinned as featured (hackathons only) */
  isFeatured: boolean;
  /** Auto-computed trending flag updated by cron job */
  isTrending: boolean;
  /** MD5 hash of title+company+source — used for duplicate detection */
  hash: string;
  /** Original ID from the source platform */
  externalId?: string;
  /** Number of applicants/registrants on source */
  registerCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OpportunityDocument = HydratedDocument<IOpportunity>;

/**
 * Generates a deduplication hash from key fields.
 * Two opportunities with the same hash are considered duplicates.
 */
export function generateOpportunityHash(
  title: string,
  company: string,
  source: string
): string {
  const raw = `${title.trim().toLowerCase()}|${company.trim().toLowerCase()}|${source.trim().toLowerCase()}`;
  return crypto.createHash("md5").update(raw).digest("hex");
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["hackathon", "internship", "job"],
      required: [true, "Type is required"],
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
      index: true,
    },
    stipend: {
      type: String,
      default: "Not disclosed",
    },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    deadline: {
      type: Date,
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    applyLink: {
      type: String,
      required: [true, "Apply link is required"],
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      trim: true,
      index: true,
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    postedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    duration: { type: String },
    views: {
      type: Number,
      default: 0,
    },
    bookmarks: {
      type: Number,
      default: 0,
    },
    isExpired: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    hash: {
      type: String,
      unique: true,
      index: true,
    },
    externalId: { type: String },
    registerCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: auto-generate hash and set isRemote based on location.
 */
OpportunitySchema.pre("save", function () {
  // Generate dedup hash
  if (!this.hash || this.isModified("title") || this.isModified("company") || this.isModified("source")) {
    this.hash = generateOpportunityHash(this.title, this.company, this.source);
  }

  // Auto-detect remote from location string
  if (this.isModified("location") || this.isNew) {
    const loc = this.location.toLowerCase();
    if (loc.includes("remote") || loc.includes("online") || loc.includes("work from home")) {
      this.isRemote = true;
    }
  }

  // Auto-expire if deadline has passed
  if (this.deadline && new Date(this.deadline) < new Date()) {
    this.isExpired = true;
  }
});

/**
 * Text index for full-text search across title, company, description.
 */
OpportunitySchema.index({ title: "text", company: "text", description: "text", skills: "text" });

/**
 * Compound index for the most common query pattern.
 */
OpportunitySchema.index({ type: 1, isExpired: 1, postedAt: -1 });

const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>("Opportunity", OpportunitySchema);

export default Opportunity;
