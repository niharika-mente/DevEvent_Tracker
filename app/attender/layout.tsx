import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";

export default async function AttenderLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const token = (await cookies()).get("authToken")?.value;

    if (!token) {
        redirect("/auth/login");
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        redirect("/auth/login");
    }

    if (decoded.role !== "attender") {
        redirect("/organizer/dashboard");
    }

    return <>{children}</>;
}
