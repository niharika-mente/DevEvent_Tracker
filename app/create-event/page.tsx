"use client";

import { useCallback, useState, type FormEvent } from "react";
import CategorySelect from "@/components/create-event/CategorySelect";
import EventBannerUpload from "@/components/create-event/EventBannerUpload";
import SuccessToast from "@/components/create-event/SuccessToast";

const inputClassName =
  "bg-dark-200 rounded-[6px] px-5 py-2.5 w-full text-foreground placeholder:text-light-200/60 border border-transparent transition-all duration-200 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClassName = "text-light-100 text-sm font-medium";

const HOURS_24 = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

const CreateEventPage = () => {
  const [category, setCategory] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [showToast, setShowToast] = useState(false);

  const dismissToast = useCallback(() => setShowToast(false), []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowToast(true);
  };

  return (
    <>
      <SuccessToast
        message="Event Created Successfully"
        visible={showToast}
        onDismiss={dismissToast}
      />

      <section className="flex flex-col items-center w-full max-w-3xl mx-auto min-w-0">
        <h1 className="text-center">
          Create Your
          <br />
          Dev Event
        </h1>
        <p className="text-center mt-5 text-light-100 text-lg max-sm:text-sm">
          Share your hackathon, meetup, or conference with the community
        </p>

        <div className="mt-12 w-full min-w-0 bg-dark-100 border-dark-200 card-shadow flex flex-col gap-6 rounded-[10px] border px-5 py-8 sm:px-8 transition-shadow duration-300 hover:shadow-[0px_4px_50px_0px_#5dfeca22]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 min-w-0">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className={labelClassName}>
                Event Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. React Conf 2026"
                className={inputClassName}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className={labelClassName}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Tell attendees what your event is about..."
                className={`${inputClassName} resize-y min-h-[100px]`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="date" className={labelClassName}>
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-2">
                <span id="time-label" className={labelClassName}>
                  Time <span className="text-light-200 font-normal">(24h)</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id="time-hour"
                    aria-labelledby="time-label"
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    required
                    className={`${inputClassName} cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>
                      Hour
                    </option>
                    {HOURS_24.map((h) => (
                      <option key={h} value={h} className="bg-dark-100">
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    id="time-minute"
                    aria-labelledby="time-label"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    required
                    className={`${inputClassName} cursor-pointer appearance-none`}
                  >
                    <option value="" disabled>
                      Min
                    </option>
                    {MINUTES.map((m) => (
                      <option key={m} value={m} className="bg-dark-100">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="hidden"
                  name="time"
                  value={hour && minute ? `${hour}:${minute}` : ""}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="location" className={labelClassName}>
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                placeholder="e.g. San Francisco, CA"
                className={inputClassName}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category" className={labelClassName}>
                Event Category
              </label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>

            <EventBannerUpload />

            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 active:scale-[0.98] w-full cursor-pointer rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-100"
            >
              Create Event
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default CreateEventPage;
