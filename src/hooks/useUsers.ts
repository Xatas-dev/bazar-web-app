import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { personaAxiosInstance } from '@/lib/axios'
import { UserDtoResponseV2, GetUsersDtoRequest } from '@/types/api'

export const useUsers = (ids: string[]) => {
  return useQuery({
    queryKey: ['users', ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];

      const requestDto: GetUsersDtoRequest = { ids };

      const response = await personaAxiosInstance.get<UserDtoResponseV2[]>('/v2/users', {
        params: {
          ...requestDto
        },
        paramsSerializer: {
            indexes: null
        }
      });
      return response.data
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5 // 5 minutes
  })
}

/** Minimum query length the persona search accepts */
export const USER_SEARCH_MIN_LENGTH = 3

export const useSearchUsers = (searchTerm: string) => {
  const term = searchTerm.trim()
  const enabled = term.length >= USER_SEARCH_MIN_LENGTH

  return useQuery({
    queryKey: ['users', 'search', term],
    queryFn: async () => {
      const requestDto: GetUsersDtoRequest = { search: term };

      const response = await personaAxiosInstance.get<UserDtoResponseV2[]>('/v2/users', {
        params: {
            ...requestDto
        }
      });
      return response.data
    },
    enabled,
    // Keep the previous results on screen while the next query loads, instead of flashing empty
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}
