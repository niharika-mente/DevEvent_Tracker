'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createEvent } from "@/lib/actions/create-event.actions";
import { captureEvent, captureException } from "@/lib/posthog/helpers";
import { POSTHOG_EVENTS } from "@/lib/posthog/events";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),

  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters"),

  image: z.string().url("Enter a valid image URL"),

  overview: z
    .string()
    .min(20, "Overview must be at least 20 characters"),

  date: z.string().min(1, "Date is required"),

  time: z.string().min(1, "Time is required"),

  location: z.string().min(2, "Location is required"),

  mode: z.enum(["online", "offline", "hybrid"], "Select event mode"),
  type: z.enum(["hackathon", "conference", "workshop", "meetup"], "Select event type"),

  targetAudience: z
    .string()
    .min(5, "Target audience is required"),

  agenda: z
    .string()
    .min(10, "Agenda is required"),

  organizer: z
    .string()
    .min(2, "Organizer name is required"),

  tags: z.string().min(2, "Add at least one tag"),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEventForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
  try {

    const result = await createEvent(data);

    if (result.success) {

      toast.success("Event created successfully!");
      captureEvent(POSTHOG_EVENTS.EVENT_CREATED, {
        type: data.type,
        mode: data.mode,
        location: data.location,
      });

      reset();

    } else {

      toast.error(result.error || "Failed to create event");
      captureEvent(POSTHOG_EVENTS.EVENT_CREATION_FAILED, {
        reason: result.error || "unknown",
        type: data.type,
        mode: data.mode,
      });

    }

  } catch (error) {

    console.error(error);

    toast.error("Something went wrong");
    captureException(error instanceof Error ? error : new Error("event_creation_exception"));

  }
};
const inputStyles = `
  w-full p-3 rounded-xl
  bg-background/80 text-foreground placeholder:text-muted-foreground
  border border-border
  focus:outline-none
  focus:border-cyan-400/40
  focus:ring-2
  focus:ring-cyan-500/20
  transition-all duration-300
`;
const selectStyles = `
  ${inputStyles}
  bg-background
  cursor-pointer
`;

const sectionStyles = `
  rounded-2xl
  border border-cyan-500/20
  bg-card/70
  backdrop-blur-sm
  p-6
  space-y-6
`;

const buttonStyles = `
  w-full md:w-fit
  px-8 py-4
  rounded-xl
  bg-cyan-500/20
  border border-cyan-400/20
  transition-all duration-300
  hover:scale-105
  hover:bg-cyan-500/30
  hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
  hover:-translate-y-1
  cursor-pointer
`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-10 space-y-8 max-w-3xl"
    >

      {/* BASIC INFO */}
      <div className={sectionStyles}>
        {/* Closing div for Audience & Agenda */}
        <h2 className="text-2xl font-bold">Basic Info</h2>

        <div>
          <label htmlFor="title-input" className="block mb-2">Event Title</label>

          <input
            type="text"
            id="title-input"
            placeholder="Global AI Hackathon 2024"
            {...register("title")}
            className={inputStyles}/>

          {errors.title && (
            <p className="text-red-400 text-sm mt-2">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="short-description-input" className="block mb-2">Short Description</label>

          <input
            type="text"
            id="short-description-input"
            placeholder="A premier hackathon for developers worldwide."
            {...register("shortDescription")}
            className={inputStyles}/>

          {errors.shortDescription && (
            <p className="text-red-400 text-sm mt-2">
              {errors.shortDescription.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="image-input" className="block mb-2">Banner Image URL</label>

          <input
            type="text"
            id="image-input"
            placeholder="https://example.com/image.png"
            {...register("image")}
            className={inputStyles}/>

          {errors.image && (
            <p className="text-red-400 text-sm mt-2">
              {errors.image.message}
            </p>
          )}
        </div>
      </div>

      {/* EVENT DETAILS */}
<div className={sectionStyles}>
  <h2 className="text-2xl font-bold">Event Details</h2>

        <div>
          <label htmlFor="overview-input" className="block mb-2">Overview</label>

          <textarea
            id="overview-input"
            rows={5}
            placeholder="Describe your event..."
            {...register("overview")}
            className={`${inputStyles} resize-none`}/>

          {errors.overview && (
            <p className="text-red-400 text-sm mt-2">
              {errors.overview.message}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="date-input" className="block mb-2">Date</label>

            <input
              type="date"
              id="date-input"
              {...register("date")}
            className={inputStyles}/>

            {errors.date && (
              <p className="text-red-400 text-sm mt-2">
                {errors.date.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="time-input" className="block mb-2">Time</label>

            <input
              type="time"
              id="time-input"
              {...register("time")}
              className={inputStyles}/>

        <p className="text-sm text-gray-500/80 mt-2">Use your local time format (e.g. 01:30 PM)</p>
            {errors.time && (
              <p className="text-red-400 text-sm mt-2">
                {errors.time.message}
              </p>
              
            )}
          </div>
        </div>

        <div>
          <label htmlFor="location-input" className="block mb-2">Location</label>

          <input
            type="text"
            id="location-input"
            placeholder="Bangalore, India"
            {...register("location")}
            className={inputStyles}/>

          {errors.location && (
            <p className="text-red-400 text-sm mt-2">
              {errors.location.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="mode-select" className="block mb-2">Mode</label>

          <select
                id="mode-select"
                {...register("mode")}
                className={selectStyles}>
            <option value="">
  Select Mode
</option>

        <option value="online">Online</option>
        <option value="offline">Offline</option>
        <option value="hybrid">Hybrid</option>
          </select>

          {errors.mode && (
            <p className="text-red-400 text-sm mt-2">
              {errors.mode.message}
            </p>
          )}
          <div>
  <label htmlFor="event-type-select" className="block mb-2">
    Event Type
  </label>

  <select
    id="event-type-select"
    {...register("type")}
    className={selectStyles}
  >
    <option value="">Select Type</option>
    <option value="hackathon">Hackathon</option>
    <option value="conference">Conference</option>
    <option value="workshop">Workshop</option>
    <option value="meetup">Meetup</option>
  </select>

  {errors.type && (
    <p className="text-red-400 text-sm mt-2">
      {errors.type.message}
    </p>
  )}
</div>
</div>
      {/* AUDIENCE & AGENDA */}
      <div className={sectionStyles}>
      {/* Closing div for Audience & Agenda */}
      </div>
      {/* Closing div for Audience & Agenda */}
        <h2 className="text-2xl font-bold">Audience & Agenda</h2>

        <div>
          <label htmlFor="target-audience-input" className="block mb-2">Target Audience</label>

          <input
            type="text"
            id="target-audience-input"
            placeholder="Developers, AI Researchers..."
            {...register("targetAudience")}
            className={inputStyles}/>

          {errors.targetAudience && (
            <p className="text-red-400 text-sm mt-2">
              {errors.targetAudience.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="agenda-input" className="block mb-2">Agenda</label>

          <textarea
            rows={6}
            id="agenda-input"
            placeholder="09:00 - Keynote..."
            {...register("agenda")}
            className={`${inputStyles} resize-none`}/>

          {errors.agenda && (
            <p className="text-red-400 text-sm mt-2">
              {errors.agenda.message}
            </p>
          )}
        </div>
      </div> {/* Closing div for Organizer */}

      {/* ORGANIZER */}
      <div className={sectionStyles}>
        <h2 className="text-2xl font-bold">Organizer</h2>

        <div>
          <label htmlFor="organizer-input" className="block mb-2">Organizer Name</label>

          <input
            type="text"
            id="organizer-input"
            placeholder="Google Cloud"
            {...register("organizer")}
            className={inputStyles}/>

          {errors.organizer && (
            <p className="text-red-400 text-sm mt-2">
              {errors.organizer.message}
            </p>
          )}
        </div>

        <div>
  <label htmlFor="tags-input" className="block mb-2">Tags</label>

  <input
    type="text"
    id="tags-input"
    placeholder="AI, Cloud, DevOps"
    {...register("tags")}
    className={inputStyles}/>

  <p className="text-sm text-gray-500/80 mt-2">Separate tags with commas</p>

  {errors.tags && (
    <p className="text-red-400 text-sm mt-2">{errors.tags.message}</p>
  )}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-center">
        <button
          type="submit"
          className={buttonStyles}>
          Create Event
        </button>
      </div>
    
    </form>
    );
  };
     
export default CreateEventForm;
