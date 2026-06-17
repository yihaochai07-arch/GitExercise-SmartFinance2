import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type Goal = {
    id: string
    user_id: string
    name: string
    target_amount: number
    current_amount: number
    created_at: string
    target_date: string | null
    category: string
}

type NewGoal = Omit<Goal, 'id' | 'created_at' | 'user_id' | 'current_amount'>

type UseGoalsReturn = {
    goals: Goal[]
    getProgress: (current: number, target: number) => number
    isCompleted: (current: number, target: number) => boolean
    addGoal: (goal: NewGoal) => Promise<Goal | null>
    loading: boolean
    error: string | null
}

export function useGoals(): UseGoalsReturn {
    const { user } = useAuth()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) fetchGoals()
    }, [user])

    async function fetchGoals() {
        if (!user) return
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch goals')
        } finally {
            setLoading(false)
        }
    }

    async function addGoal(goal: NewGoal): Promise<Goal | null> {
        if (!user) {
            setError('Not authenticated')
            return null
        }
        try {
            const { data, error } = await supabase
                .from('goals')
                .insert([{ ...goal, user_id: user.id, current_amount: 0 }])
                .select()
                .single()

            if (error) throw error
            setGoals(prev => [data, ...prev])
            return data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add goal')
            return null
        }
    }

    function getProgress(current: number, target: number) {
        if (target === 0) return 0
        return Math.min(100, (current / target) * 100)
    }

    function isCompleted(current: number, target: number) {
        return current >= target
    }

    return { goals, getProgress, isCompleted, addGoal, loading, error }
}