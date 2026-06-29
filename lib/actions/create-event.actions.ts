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
  mode: "online" | "offline" | "hybrid";
  type: "hackathon" | "conference" | "workshop" | "meetup";
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
      type: data.type,

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
    revalidatePath("/events");

    return {
      success: true,
      event: JSON.parse(JSON.stringify(event)),
    };
  } catch (error: unknown) {
  console.error("Create Event Error:", error);

  const message =
    (error instanceof Error && error.message) ||
    "Failed to create event";       // Fallback

  return {
    success: false,
    error: message,
  };
}
}
