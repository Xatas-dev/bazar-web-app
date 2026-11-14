import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { personaAxiosInstance } from '@/lib/axios'
import { useUserStore } from '@/store/userStore'
import { useEffect } from 'react'
import { UserDtoResponseV2, UpdateProfileDtoRequestV2, AvatarUploadTicketDtoResponse } from '@/types/api'

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

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  // Poll the iam endpoint until avatarUrl reflects the freshly uploaded file:
  // - updating an existing avatar -> wait until the URL changes
  // - uploading a first avatar     -> wait until the URL is present
  const pollForAvatar = async (previousAvatarUrl: string | null): Promise<UserDtoResponseV2> => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const TIMEOUT_MS = 30000;
    const INTERVAL_MS = 2000;
    const start = Date.now();

    while (Date.now() - start < TIMEOUT_MS) {
      await delay(INTERVAL_MS);
      const response = await personaAxiosInstance.get<UserDtoResponseV2>('/v2/users/iam');
      const { avatarUrl } = response.data;

      if (previousAvatarUrl) {
        if (avatarUrl && avatarUrl !== previousAvatarUrl) return response.data;
      } else if (avatarUrl) {
        return response.data;
      }
    }

    throw new Error('Avatar update timed out');
  };

  return useMutation({
    mutationFn: async (file: File) => {
      // Read the current avatar at mutation time to detect the change
      const previousAvatarUrl = useUserStore.getState().user?.avatarUrl ?? null;

      // 1. Request a pre-signed S3 upload URL from the persona service
      const { data } = await personaAxiosInstance.post<AvatarUploadTicketDtoResponse>('/v1/users/iam/avatar', {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
      });

      // 2. PUT the binary file directly to the pre-signed URL
      const putResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error('Avatar upload to storage failed');
      }

      // 3. Wait for the backend to assign the new avatarUrl
      return pollForAvatar(previousAvatarUrl);
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', 'iam'], updatedUser);
      setUser(updatedUser);
    }
  });
}
