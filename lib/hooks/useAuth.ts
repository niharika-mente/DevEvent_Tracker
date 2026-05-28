'use client';

import { useEffect, useState, useCallback } from 'react';
import type { IUser } from '@/database';

interface AuthUser extends Partial<IUser> {
    _id?: string;
    role?: 'attender' | 'organizer';
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/auth/me', {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {},
            });

            if (!response.ok) {
                localStorage.removeItem('authToken');
                setUser(null);
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const data = await response.json();

            if (data.user?._id) {
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('authToken');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();

        // Listen for storage changes (e.g., from another tab or login)
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkAuth]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, []);

    const hasRole = useCallback(
        (role: 'attender' | 'organizer') => {
            return user?.role === role;
        },
        [user]
    );

    return {
        user,
        isLoading,
        isAuthenticated,
        logout,
        hasRole,
    };
}
