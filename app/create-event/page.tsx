import CreateEventForm from "@/components/CreateNewEvent";


const CreateEventPage = () => {
  return (
    <section className="mt-10 flex flex-col items-center px-6">

  <div className="w-full max-w-4xl">

    <h1 className="text-4xl font-bold text-center">
      Create New Event
    </h1>

    <p className="mt-4 text-muted-foreground text-center">
      Submit your hackathon, meetup, or conference.
    </p>

    <CreateEventForm />

  </div>

</section>
  );
};

export default CreateEventPage;
