export interface GetSpaceDto {
  id: number;
  name: string;
  /** URL of the currently active space avatar */
  avatarUrl?: string | null;
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
  /** avatarUrl from bazar-persona/users */
  avatarUrl?: string | null;
  creator: boolean;
  role?: SimpleRoleDto;
}

export interface GetUsersInSpaceResponse {
  users: UserInSpaceDto[];
}


export type SpaceAvatarStatus = 'PENDING' | 'SUCCESS' | 'ERROR';

export interface SpaceAvatarUploadTicketDtoResponse {
  avatarId: number;
  /** Pre-signed URL to which the binary file must be PUT */
  uploadUrl: string;
}

export interface SpaceAvatarDto {
  id: number;
  status: SpaceAvatarStatus;
  /** Public download URL, present once the upload succeeded */
  url?: string | null;
  createdAt?: string;
}

export interface GetSpaceAvatarsResponse {
  avatars?: SpaceAvatarDto[];
}
