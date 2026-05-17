import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authorizationAxiosInstance } from '@/lib/axios';
import {
  GetActionsResponse,
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  GetRoleNamesResponse,
} from '@/types/api';

// API Functions
const getActions = async (spaceId: number): Promise<GetActionsResponse> => {
  const { data } = await authorizationAxiosInstance.get<GetActionsResponse>('/v1/actions', {
    params: { spaceId }
  });
  return data;
};

// Get list of all roles in a space - NEW endpoint
const getRoles = async (spaceId: number): Promise<{ roles: Array<{ id: number; name: string; spaceId: number; scope: string; isVisible: boolean; createdBy?: string | null }> }> => {
  const { data } = await authorizationAxiosInstance.get('/v1/roles', {
    params: { spaceId }
  });
  return data;
};

// Get full role details with all action information - NEW endpoint with path parameter
const getRole = async (spaceId: number, roleId: number): Promise<RoleDto> => {
  const { data } = await authorizationAxiosInstance.get<RoleDto>(`/v1/roles/${roleId}`, {
    params: { spaceId }
  });
  // Ensure actions field exists
  return {
    ...data,
    actions: data.actions || []
  };
};

// Get roles for specific users in a space - NEW endpoint path
const getUserRoles = async (spaceId: number, userIds?: string[]): Promise<GetRoleNamesResponse> => {
  const params: any = { spaceId };
  if (userIds && userIds.length > 0) {
    params.userIds = userIds.join(',');
  }
  const { data } = await authorizationAxiosInstance.get<GetRoleNamesResponse>('/v1/space-users/roles', {
    params
  });
  return data;
};

const createRole = async (payload: CreateRoleRequest): Promise<RoleDto> => {
  const { data } = await authorizationAxiosInstance.post<RoleDto>('/v1/roles', payload);
  return {
    ...data,
    actions: data.actions || []
  };
};

const updateRole = async ({
  spaceId,
  roleId,
  payload,
}: {
  spaceId: number;
  roleId: number;
  payload: UpdateRoleRequest;
}): Promise<RoleDto> => {
  const { data } = await authorizationAxiosInstance.put<RoleDto>('/v1/roles', payload, {
    params: { spaceId, roleId }
  });
  return {
    ...data,
    actions: data.actions || []
  };
};


const assignRoleToUser = async ({
  spaceId,
  userId,
  roleId,
}: {
  spaceId: number;
  userId: string;
  roleId: number;
}): Promise<void> => {
  await authorizationAxiosInstance.patch('/v1/space-users/roles', undefined, {
    params: { spaceId, userId, roleId }
  });
};

// Hooks

export const useGetActions = (spaceId: number) => {
  return useQuery({
    queryKey: ['actions', spaceId],
    queryFn: () => getActions(spaceId),
    enabled: !!spaceId,
  });
};

// Get all available roles for a space
export const useGetRoles = (spaceId: number, enabled = true) => {
  return useQuery({
    queryKey: ['roles', spaceId],
    queryFn: () => getRoles(spaceId),
    enabled: !!spaceId && enabled,
  });
};

// Get full role details with all action information
export const useGetRole = (spaceId: number, roleId?: number) => {
  return useQuery({
    queryKey: ['role', spaceId, roleId],
    queryFn: () => getRole(spaceId, roleId!),
    enabled: !!spaceId && !!roleId,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: (newRole) => {
      // Invalidate roles list for the space
      queryClient.invalidateQueries({
        queryKey: ['roles', newRole.spaceId],
      });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRole,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roles', variables.spaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['role', variables.spaceId, variables.roleId],
      });
    },
  });
};

// Get roles for specific users in a space
export const useGetUserRoles = (spaceId: number, userIds: string[]) => {
  return useQuery({
    queryKey: ['user-roles', spaceId, userIds],
    queryFn: () => getUserRoles(spaceId, userIds),
    enabled: !!spaceId && userIds.length > 0,
  });
};

export const useAssignRoleToUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignRoleToUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['roles', variables.spaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-roles', variables.spaceId],
      });
    },
  });
};

