export interface Event {
    title: string;
    image: string;
    location: string;
    date: string;
    time: string;
    slug: string;
}

export const events: Event[] = [
    {
        image: "/images/event1.png",
        title: "React Conf 2026",
        slug: "react-conf-2026",
        location: "San Francisco, CA",
        date: "March 15-16, 2026",
        time: "9:00 AM - 6:00 PM",
    },
    {
        image: "/images/event2.png",
        title: "AI & Machine Learning Summit",
        slug: "ai-ml-summit-2026",
        location: "New York, NY",
        date: "April 22-24, 2026",
        time: "10:00 AM - 7:00 PM",
    },
    {
        image: "/images/event3.png",
        title: "DevOps World Conference",
        slug: "devops-world-2026",
        location: "Austin, TX",
        date: "May 8-10, 2026",
        time: "8:30 AM - 5:30 PM",
    },
    {
        image: "/images/event4.png",
        title: "Web3 & Blockchain Hackathon",
        slug: "web3-blockchain-hackathon",
        location: "Miami, FL",
        date: "June 5-7, 2026",
        time: "24-hour event",
    },
    {
        image: "/images/event5.png",
        title: "Mobile Dev Summit",
        slug: "mobile-dev-summit-2026",
        location: "Seattle, WA",
        date: "July 12-13, 2026",
        time: "9:00 AM - 6:00 PM",
    },
    {
        image: "/images/event6.png",
        title: "Cloud Native Conference",
        slug: "cloud-native-conf-2026",
        location: "Boston, MA",
        date: "August 20-22, 2026",
        time: "9:30 AM - 6:30 PM",
    },
];
