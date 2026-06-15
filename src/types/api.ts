export interface UserDtoResponse {
  id: string;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  userPic: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDtoRequest {
  userName?: string;
  firstName?: string;
  lastName?: string;
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
export interface ActionAttributeDto {
  id: number;
  name: string;
  displayName: string;
  valueType: string;
  value?: string | null;
}

export interface ActionDto {
  id: number;
  code: string;
  name: string;
  resource: string;
  resourceName: string;
  attributes: ActionAttributeDto[];
}

export interface GetActionsResponse {
  actions: ActionDto[];
}

export interface SimpleAttributeDto {
  id: number;
  value: string;
}

export interface SimpleActionDto {
  id: number;
  attributes?: SimpleAttributeDto[];
}

export interface RoleDto {
  id: number;
  name: string | null;
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


