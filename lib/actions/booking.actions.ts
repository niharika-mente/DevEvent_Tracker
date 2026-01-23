'use server';

import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database";

interface CreateBookingParams {
    eventId: string;
    slug: string;
    email: string;
}

export async function createBooking({ eventId, slug, email }: CreateBookingParams) {
    try {
        await connectToDatabase();

        // Check if booking already exists
        const existingBooking = await Booking.findOne({ eventId, email });

        if (existingBooking) {
            return { success: false, error: 'You have already booked this event' };
        }

        // Create new booking
        const booking = await Booking.create({
            eventId,
            email,
        });

        return { success: true, booking: JSON.parse(JSON.stringify(booking)) };
    } catch (error) {
        console.error('Error creating booking:', error);
        return { success: false, error: 'Failed to create booking' };
    }
}

export async function getBookingsByEventId(eventId: string) {
    try {
        await connectToDatabase();

        const bookings = await Booking.find({ eventId });

        return { success: true, bookings: JSON.parse(JSON.stringify(bookings)) };
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
