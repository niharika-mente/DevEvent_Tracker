import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function OrganizerLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
        redirect("/auth/login?role=organizer");
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        redirect("/auth/login?role=organizer");
    }

    if (decoded.role !== "organizer") {
        redirect("/attender/dashboard");
    }

    return <>{children}</>;
}
