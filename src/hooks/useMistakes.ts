import { useState, useEffect, useCallback } from 'react'
import { mistakesApi } from '../services/api'
import type { Mistake } from '../types'

export function useMistakes() {
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [loading, setLoading] = useState(true)

  const loadMistakes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await mistakesApi.list({ limit: 100 })
      setMistakes(res.data)
    } catch (err) {
      console.error('Failed to load mistakes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMistakes()
  }, [loadMistakes])

  return { mistakes, loading, refresh: loadMistakes }
}

export function useMistake(id: string | undefined) {
  const [mistake, setMistake] = useState<Mistake | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    mistakesApi.get(id)
      .then(res => setMistake(res.data))
      .catch(err => console.error('Failed to load mistake:', err))
      .finally(() => setLoading(false))
  }, [id])

  return { mistake, loading, setMistake }
}
