import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export interface SupportSettings {
  enabled: boolean
  title: string
  startHour: string
  endHour: string
  phone: string
  email: string
  illustration: string
  bubbleColor: string
}

export const SUPPORT_DEFAULTS: SupportSettings = {
  enabled: true,
  title: 'Assistance disponible de {startHour} à {endHour} au',
  startHour: '9h',
  endHour: '17h',
  phone: '52.056.778',
  email: '',
  illustration: '',
  bubbleColor: '#4d9538',
}

export function useSupportSettings() {
  const { data, isLoading } = useQuery<SupportSettings>({
    queryKey: ['support-settings'],
    queryFn: async () => {
      const res = await adminApi.getSupportSettings()
      const d = res.data?.data ?? res.data
      return {
        enabled: d?.enabled ?? SUPPORT_DEFAULTS.enabled,
        title: d?.title ?? SUPPORT_DEFAULTS.title,
        startHour: d?.startHour ?? SUPPORT_DEFAULTS.startHour,
        endHour: d?.endHour ?? SUPPORT_DEFAULTS.endHour,
        phone: d?.phone ?? SUPPORT_DEFAULTS.phone,
        email: d?.email ?? SUPPORT_DEFAULTS.email,
        illustration: d?.illustration ?? SUPPORT_DEFAULTS.illustration,
        bubbleColor: d?.bubbleColor ?? SUPPORT_DEFAULTS.bubbleColor,
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: SUPPORT_DEFAULTS,
  })

  return {
    settings: data ?? SUPPORT_DEFAULTS,
    isLoading,
  }
}
