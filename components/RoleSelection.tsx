'use client';

import { UserRole } from '@/database';

interface RoleSelectionProps {
    selectedRole: UserRole | null;
    onRoleSelect: (role: UserRole) => void;
}

export default function RoleSelection({ selectedRole, onRoleSelect }: RoleSelectionProps) {
    const roles: { id: UserRole; title: string; description: string; icon: string }[] = [
        {
            id: 'attender',
            title: 'Event Attender',
            description: 'Browse, discover, and register for exciting dev events',
            icon: '👥',
        },
        {
            id: 'organizer',
            title: 'Event Organizer',
            description: 'Create and manage events for the developer community',
            icon: '🎯',
        },
    ];

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 backdrop-blur">
                <h1 className="text-3xl font-bold mb-2 text-center">Choose Your Role</h1>
                <p className="text-gray-400 text-center mb-8">
                    Select how you'd like to participate in DevEvent
                </p>

                <div className="space-y-4">
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => onRoleSelect(role.id)}
                            className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                                selectedRole === role.id
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-cyan-400 hover:bg-cyan-400/5'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">{role.icon}</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{role.title}</h3>
                                    <p className="text-sm text-gray-400">{role.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    disabled={!selectedRole}
                    className={`w-full mt-6 py-2 rounded font-semibold transition-colors ${
                        selectedRole
                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Continue as {selectedRole === 'attender' ? 'Attender' : selectedRole === 'organizer' ? 'Organizer' : 'Selected Role'}
                </button>
            </div>
        </div>
    );
}
