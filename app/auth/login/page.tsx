'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm, { type AuthFormData } from '@/components/AuthForm';
import AuthPageShell from '@/components/AuthPageShell';
import type { UserRole } from '@/database';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const selectedRole: UserRole = searchParams.get('role') === 'organizer' ? 'organizer' : 'attender';

    const handleLogin = async (formData: AuthFormData) => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Login failed');
            }

            if (data.user?.role && data.user.role !== selectedRole) {
                throw new Error(`This account is registered as an ${data.user.role}, not a ${selectedRole}.`);
            }

            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }

            router.push(data.user?.role === 'organizer' ? '/organizer/dashboard' : '/attender/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const isOrganizer = selectedRole === 'organizer';

    return (
        <AuthPageShell
            title={isOrganizer ? 'Event Organizer' : 'Event Attender'}
            accentClass={isOrganizer ? 'text-amber-400' : 'text-cyan-400'}
            hoverClass={isOrganizer ? 'hover:text-amber-400' : 'hover:text-cyan-400'}
        >
            <AuthForm
                type="login"
                role={selectedRole}
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
            />
        </AuthPageShell>
    );
}

