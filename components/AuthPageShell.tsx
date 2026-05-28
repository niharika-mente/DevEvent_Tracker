import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthPageShellProps {
    title: string;
    accentClass: string;
    hoverClass: string;
    children: ReactNode;
}

export default function AuthPageShell({ title, accentClass, hoverClass, children }: AuthPageShellProps) {
    return (
        <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-6">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h2 className={`mb-2 text-sm font-semibold ${accentClass}`}>{title}</h2>
                    <p className="text-sm text-gray-400">
                        <Link href="/auth" className={hoverClass}>
                            Back to Auth
                        </Link>
                    </p>
                </div>
                {children}
            </div>
        </section>
    );
}
