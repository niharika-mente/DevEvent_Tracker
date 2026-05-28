import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href='/' className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>

        <ul>
          <li className="list-none"><Link href="/">Home</Link></li>
          <li className="list-none"><Link href="/opportunities">Hub</Link></li>
          <li className="list-none"><Link href="/hackathons">Hackathons</Link></li>
          <li className="list-none"><Link href="/internships">Internships</Link></li>
          <li className="list-none"><Link href="/jobs">Jobs</Link></li>
          <li className="list-none">
            <Link href="/admin"
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(93,254,202,0.1)', color: '#5dfeca', border: '1px solid rgba(93,254,202,0.25)' }}>
              Admin
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;