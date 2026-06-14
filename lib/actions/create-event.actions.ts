'use server';

import connectToDatabase from "@/lib/mongodb";
import { Event } from "@/database";
import { revalidatePath } from "next/cache";

type CreateEventInput = {
  title: string;
  shortDescription: string;
  overview: string;
  image: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  eventType: string;     
  type: string;
  targetAudience: string;
  agenda: string;
  organizer: string;
  tags: string;
};

export async function createEvent(data: CreateEventInput)  {
  try {
    await connectToDatabase();

    const event = await Event.create({
      title: data.title,
      description: data.shortDescription,
      overview: data.overview,
      image: data.image,

      venue: data.location,
      location: data.location,

      date: data.date,
      time: data.time,
      mode: data.mode,
      type: data.eventType,   
    
    

      audience: data.targetAudience,
     
      agenda: data.agenda
        .split("\n")
        .map((item: string) => item.trim())
        .filter(Boolean),

      organizer: data.organizer,

      tags: data.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean),
    });

    revalidatePath("/");

    return {
      success: true,
      event: JSON.parse(JSON.stringify(event)),
    };
  } catch (error: any) {
  console.error("Create Event Error:", error);

  const message =
    error?.errors?.[0]?.message ||  // Mongoose validation error
    error?.message ||               // General JS error
    "Failed to create event";       // Fallback

  return {
    success: false,
    error: message,
  };
}
}