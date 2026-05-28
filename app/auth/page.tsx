import Link from 'next/link';

const authOptions = [
  {
    title: 'Event Attender',
    badge: 'Explore events',
    description: 'Discover hackathons, meetups, and conferences, then save your spot in seconds.',
    loginHref: '/auth/login',
    signupHref: '/auth/signup',
    accent: 'cyan',
  },
  {
    title: 'Event Organizer',
    badge: 'Create experiences',
    description: 'Launch developer events, manage registrations, and keep your community engaged.',
    loginHref: '/auth/login?role=organizer',
    signupHref: '/auth/organizer/signup',
    accent: 'amber',
  },
] as const;

export default function AuthPage() {
  return (
    <section className="relative overflow-hidden py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(89,222,202,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.14),_transparent_28%)]" />

      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Authentication</p>
          <h1 className="mt-4 text-center">Choose How You Enter DevEvent</h1>
          <p className="mx-auto mt-5 max-w-2xl text-light-100 text-lg max-sm:text-sm">
            Sign in or create an account as an attendee or organizer with a flow tailored to your role.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:auto-rows-fr md:grid-cols-2">
          {authOptions.map((option) => {
            const isOrganizer = option.accent === 'amber';
            const borderClass = isOrganizer ? 'border-amber-400/30 hover:border-amber-400/60' : 'border-cyan-400/30 hover:border-cyan-400/60';
            const badgeClass = isOrganizer ? 'bg-amber-400/10 text-amber-300' : 'bg-cyan-400/10 text-cyan-300';
            const primaryClass = isOrganizer ? 'btn-primary-amber' : 'btn-primary-cyan';
            const secondaryClass = isOrganizer ? 'btn-outline-amber' : 'btn-outline-cyan';

            return (
              <article
                key={option.title}
                className={`glass card-shadow h-full rounded-2xl border p-8 transition-all ${borderClass}`}
              >
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="space-y-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${badgeClass}`}>
                      {option.badge}
                    </span>
                    <div className="min-h-28 space-y-2">
                      <h3>{option.title}</h3>
                      <p className="text-light-100 text-base leading-7">{option.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={option.loginHref} className={`flex flex-1 items-center justify-center text-center text-sm ${secondaryClass}`}>
                      Sign In
                    </Link>
                    <Link href={option.signupHref} className={`flex flex-1 items-center justify-center text-center text-sm ${primaryClass}`}>
                      Sign Up
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
