import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personaAxiosInstance } from '@/lib/axios'
import { useUserStore } from '@/store/userStore'
import { useEffect } from 'react'
import { UserDtoResponseV2, UpdateProfileDtoRequestV2 } from '@/types/api'

export const useUser = () => {
  const { setUser, setLoading } = useUserStore()

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', 'iam'],
    queryFn: async () => {
      const response = await personaAxiosInstance.get<UserDtoResponseV2>('/v2/users/iam')
      return response.data
    },
    retry: false,
    staleTime: Infinity,
  })

  useEffect(() => {
    setLoading(isLoading)
    if (data) {
      setUser(data)
    } else if (isError) {
      setUser(null)
    }
  }, [data, isLoading, isError, setUser, setLoading])

  return { user: data, isLoading, isError, error }
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: async (data: UpdateProfileDtoRequestV2) => {
      const response = await personaAxiosInstance.patch<UserDtoResponseV2>('/v2/users/iam', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user', 'iam'], data);
      setUser(data);
    }
  });
}
