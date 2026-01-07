import { useQuery } from '@tanstack/react-query'
import { personaAxiosInstance } from '@/lib/axios'
import { UserDtoResponse, GetUsersDtoRequest } from '@/types/api'

export const useUsers = (ids: string[]) => {
  return useQuery({
    queryKey: ['users', ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];

      const requestDto: GetUsersDtoRequest = { ids };

      const response = await personaAxiosInstance.get<UserDtoResponse[]>('/users', {
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

export const useSearchUsers = (searchTerm: string) => {
  return useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return [];

      const requestDto: GetUsersDtoRequest = { search: searchTerm };

      const response = await personaAxiosInstance.get<UserDtoResponse[]>('/users', {
        params: {
            ...requestDto
        }
      });
      return response.data
    },
    enabled: searchTerm.length >= 3
  })
}
