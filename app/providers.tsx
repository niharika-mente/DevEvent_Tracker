'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

const isPostHogEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_POSTHOG_KEY

if (isPostHogEnabled) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only',
    })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    if (!isPostHogEnabled) return <>{children}</>
    return <PHProvider client={posthog}>{children}</PHProvider>
}
