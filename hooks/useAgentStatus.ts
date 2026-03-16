'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useAgentStatus() {
  const { data, error, isLoading } = useSWR('/api/status', fetcher, {
    refreshInterval: 10000,
  })
  return { data, error, isLoading }
}

export function useCronJobs() {
  const { data, error, isLoading } = useSWR('/api/cron', fetcher, {
    refreshInterval: 30000,
  })
  return { data, error, isLoading }
}

export function useCosts() {
  const { data, error, isLoading } = useSWR('/api/costs', fetcher, {
    refreshInterval: 60000,
  })
  return { data, error, isLoading }
}
