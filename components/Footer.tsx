import Link from "next/link";

const Footer = () => {
  return (
    <footer className="mt-40 border-t border-cyan-500/10 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand Section */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              DevEvent
            </h2>

            <p className="mt-3 text-muted-foreground text-sm leading-6">
              The hub for developers to discover hackathons,
              meetups, conferences, and opportunities worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>

            <ul className="space-y-3 text-muted-foreground list-none">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition duration-300">
                  Home
                </Link>
              </li>

              <li>
                <Link href="/events" className="hover:text-cyan-400 transition duration-300">
                  Events
                </Link>
              </li>

              <li>
                <Link href="/create-event" className="hover:text-cyan-400 transition duration-300">
                  Create Event
                </Link>
              </li>

              <li>
                <Link href="/my-bookings" className="hover:text-cyan-400 transition duration-300">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>

            <ul className="space-y-3 text-muted-foreground list-none">
              <li>
                <a
                  href="https://github.com/niharika-mente"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition duration-300"
                >
                  GitHub
                </a>
              </li>

              <li>
                <a
                  href="https://www.linkedin.com/in/niharika-mente-473434323/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition duration-300"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-10 border-t border-cyan-500/10 pt-5 text-center text-muted-foreground text-sm">
          <p>Connecting developers with opportunities.</p>

          <p className="mt-2">
            © 2026 DevEvent. Built for hackers, dreamers, and builders.
          </p>
        </div>

      </div>
    </footer>
  )
}

export default Footer;
