export interface GetSpaceDto {
  id: number;
  name: string;
}

export interface GetSpacesResponse {
  spaces: GetSpaceDto[];
}

export interface SimpleRoleDto {
  id: number;
  name: string;
  isVisible: boolean;
}

export interface UserInSpaceDto {
  userId: string;
  spaceId: number;
  username: string;
  displayName: string;
  creator: boolean;
  role?: SimpleRoleDto;
}

export interface GetUsersInSpaceResponse {
  users: UserInSpaceDto[];
}

