import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type Category = {
    id: string
    name: string
    icon: string
    color: string
    created_at: string
}

type UseCategoriesReturn = {
    categories: Category[]
    loading: boolean
    error: string | null
}

export function useCategories(): UseCategoriesReturn {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)


useEffect(() => {
    async function fetchCategories() {
        try {
            setLoading(true)
            setError(null)
            const { data, error: supabaseError } = await supabase
                .from('transaction_categories')
                .select('*')
                .order( 'name' , {ascending: true } )
            
            if (supabaseError) {throw supabaseError}
            setCategories(data ?? [])

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch categories')
            setCategories([])
        } finally {
            setLoading(false)
        }
    }
    fetchCategories()
    
},[])

return { categories , loading , error }
}