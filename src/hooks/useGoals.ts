import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Goal = {
    id: string
    name: string
    target_amount: number
    current_amount: number
    created_at: string
}

type UseGoalsReturn = {
    goals: Goal[]
    getProgress: (current: number, target: number) => number
    isCompleted: (current: number, target: number) => boolean
    loading: boolean
    error: string | null
}

export function useGoals(): UseGoalsReturn {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchGoals()
    }, [])

    async function fetchGoals() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('goals')
                .select('*')

            if (error) throw error
            setGoals(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch goals')
        } finally {
            setLoading(false)
        }
    }

    function getProgress(current: number, target: number) {
        if (target === 0) return 0
        return (current / target) * 100
    }

    function isCompleted(current: number, target: number) {
        return current >= target
    }

    return { goals, getProgress, isCompleted, loading, error }
}