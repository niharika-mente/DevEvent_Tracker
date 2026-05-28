'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm, { type AuthFormData } from '@/components/AuthForm';
import AuthPageShell from '@/components/AuthPageShell';
import type { UserRole } from '@/database';

export default function OrganizerSignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const selectedRole: UserRole = 'organizer';

    const handleSignup = async (formData: AuthFormData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    role: selectedRole,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Signup failed');
            }

            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }

            router.push('/organizer/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthPageShell
            title="Event Organizer"
            accentClass="text-amber-400"
            hoverClass="hover:text-amber-400"
        >
            <AuthForm
                type="signup"
                role={selectedRole}
                onSubmit={handleSignup}
                isLoading={isLoading}
                error={error}
            />
        </AuthPageShell>
    );
}

