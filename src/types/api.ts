export interface UserDtoResponseV2 {
  id: string;
  username: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDtoRequestV2 {
  displayName: string;
}

export interface GetUsersDtoRequest {
  ids?: string[];
  search?: string;
}


export interface AddUserToSpaceDtoRequest {
  userId: string;
  spaceId: number;
}

// Authorization API Types

export interface ActionDto {
  id: number;
  code: string;
  name: string;
  resource: string;
  resourceName: string;
}

export interface GetActionsResponse {
  actions: ActionDto[];
}

export interface SimpleActionDto {
  id: number;
}

export interface RoleDto {
  id: number;
  name: string | null;
  description?: string | null;
  isVisible: boolean;
  createdBy: string;
  spaceId: number | null;
  actions?: ActionDto[];
}

export interface CreateRoleRequest {
  spaceId: number;
  name: string;
  isVisible: boolean;
  actions: SimpleActionDto[];
}

export interface UpdateRoleRequest {
  name: string;
  isVisible: boolean;
  actions: SimpleActionDto[];
}

export interface RoleNameDto {
  id: number;
  name: string;
  userId: string;
  isVisible: boolean;
  // Indicates the user is the creator of the space and should have full access regardless of role
  isCreator?: boolean;
}

export interface GetRoleNamesResponse {
  roles: RoleNameDto[];
}


