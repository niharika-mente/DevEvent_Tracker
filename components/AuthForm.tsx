'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
    type: 'login' | 'signup';
    onSubmit: (data: AuthFormData) => Promise<void>;
    isLoading?: boolean;
    error?: string;
    role?: 'attender' | 'organizer';
}

export interface AuthFormData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'attender' | 'organizer';
}

export default function AuthForm({ type, onSubmit, isLoading = false, error, role = 'attender' }: AuthFormProps) {
    const [formData, setFormData] = useState<AuthFormData>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [localError, setLocalError] = useState<string>('');

    const isOrganizer = role === 'organizer';
    const roleLabel = isOrganizer ? 'Event Organizer' : 'Event Attender';
    const accentClass = isOrganizer ? 'text-amber-400 hover:text-amber-300' : 'text-cyan-400 hover:text-cyan-300';
    const buttonClass = isOrganizer
        ? 'btn-primary-amber w-full disabled:opacity-50 disabled:cursor-not-allowed'
        : 'btn-primary-cyan w-full disabled:opacity-50 disabled:cursor-not-allowed';
    const focusClass = isOrganizer ? 'focus:border-amber-500' : 'focus:border-cyan-500';
    const inputClass = `w-full bg-dark-200 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none ${focusClass}`;
    const nameInputClass = `bg-dark-200 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none ${focusClass}`;
    const signupHref = isOrganizer ? '/auth/organizer/signup' : '/auth/signup';
    const loginHref = isOrganizer ? '/auth/login?role=organizer' : '/auth/login';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setLocalError('');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLocalError('');

        if (!formData.email || !formData.password) {
            setLocalError('Email and password are required');
            return;
        }

        if (type === 'signup') {
            if (!formData.firstName || !formData.lastName) {
                setLocalError('First name and last name are required');
                return;
            }
            if (formData.password.length < 6) {
                setLocalError('Password must be at least 6 characters');
                return;
            }
        }

        try {
            await onSubmit(formData);
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const displayError = error || localError;

    return (
        <div className="w-full">
            <div className="glass card-shadow rounded-2xl border border-border-dark p-8 backdrop-blur-xl">
                <h1 className="mb-2 text-center text-3xl font-bold">
                    {type === 'login' ? 'Welcome Back' : 'Join DevEvent'}
                </h1>
                <p className="mb-2 text-center text-gray-400">
                    {type === 'login'
                        ? `Sign in as ${roleLabel.toLowerCase()}`
                        : `Create your ${roleLabel.toLowerCase()} account`}
                </p>
                <p className="mb-6 text-center text-sm text-gray-500">{roleLabel}</p>

                {displayError && (
                    <div className="mb-4 rounded border border-red-800 bg-red-900/20 p-3 text-sm text-red-200">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {type === 'signup' && (
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={nameInputClass}
                                required
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={nameInputClass}
                                required
                            />
                        </div>
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className={inputClass}
                        required
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={buttonClass}
                    >
                        {isLoading ? 'Loading...' : type === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    {type === 'login' ? (
                        <>
                            Don&apos;t have an account?{' '}
                            <Link href={signupHref} className={accentClass}>
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <Link href={loginHref} className={accentClass}>
                                Sign in
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
