'use server';

import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database";
import { revalidatePath } from "next/cache";

interface CreateBookingParams {
    eventId: string;
    slug: string;
    email: string;
}

export async function createBooking({ eventId, slug, email }: CreateBookingParams) {
    try {
        await connectToDatabase();
        const cleanEmail = email.toLowerCase().trim();

        // Check for existing booking to prevent duplicates
        const existingBooking = await Booking.findOne({
            eventId,
            email: cleanEmail,
        });

        if (existingBooking) {
            return { success: false, error: 'You have already booked this event' };
        }

        // Create new booking
        const booking = await Booking.create({
            eventId,
            email: cleanEmail,
        });

        // Revalidate caches after booking
        revalidatePath(`/events/${slug}`);
        revalidatePath("/");

        return { success: true, booking: JSON.parse(JSON.stringify(booking)) };
    } catch (error: unknown) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            return { success: false, error: 'You have already booked this event' };
        }
        console.error('Error creating booking:', error);
        return { success: false, error: 'Failed to create booking' };
    }
}

export async function getBookingsByEventId(eventId: string, page = 1, limit = 50) {
    try {
        await connectToDatabase();

        const safePage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
        const safeLimit = Math.min(100, Math.max(1, isNaN(Number(limit)) ? 50 : Number(limit)));
        const skip = (safePage - 1) * safeLimit;

        const [bookings, total] = await Promise.all([
            Booking.find({ eventId }).skip(skip).limit(safeLimit),
            Booking.countDocuments({ eventId })
        ]);

        const totalPages = Math.ceil(total / safeLimit);

        return { 
            success: true, 
            bookings: JSON.parse(JSON.stringify(bookings)),
            page: safePage,
            limit: safeLimit,
            total,
            totalPages
        };
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return { success: false, error: 'Failed to fetch bookings' };
    }
}

export async function getBookingsCountByEventId(eventId: string) {
    try {
        await connectToDatabase();

        const count = await Booking.countDocuments({ eventId });

        return { success: true, count };
    } catch (error) {
        console.error('Error fetching booking count:', error);
        return { success: false, error: 'Failed to fetch booking count' };
    }
}

// Add these function blocks to the very bottom of booking.actions.ts
export async function getBookingsByEmail(email: string, page = 1, limit = 50) {
  try {
    await connectToDatabase();

    // Clean string formats to match registry criteria
    const cleanEmail = email.toLowerCase().trim();
    
    const safePage = Math.max(1, isNaN(Number(page)) ? 1 : Number(page));
    const safeLimit = Math.min(100, Math.max(1, isNaN(Number(limit)) ? 50 : Number(limit)));
    const skip = (safePage - 1) * safeLimit;
    
    // Fetch user bookings and populate referenced Event model properties
    const bookings = await Booking.find({ email: cleanEmail })
      .populate('eventId') 
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit);
      
    return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
  } catch (error) {
    console.error("Fetch bookings server action failed:", error);
    return { success: false, error: 'Failed to retrieve bookings.' };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    await connectToDatabase();

    const result = await Booking.findByIdAndDelete(bookingId);
    if (!result) {
      return { success: false, error: 'Booking registration record not found.' };
    }

    // Revalidate caches after deletion
    revalidatePath("/");
    revalidatePath("/my-bookings");

    return { success: true, message: 'Registration cancelled successfully.' };
  } catch (error) {
    console.error("Delete booking server action failed:", error);
    return { success: false, error: 'Failed to safely remove booking record.' };
  }
}

