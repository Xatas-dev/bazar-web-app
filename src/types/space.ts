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

// ── Invite links & join requests ──

export interface SpaceJoinLinkResponse {
  /** Permanent invite link of the space */
  url: string;
}

/** Public space info available by invite link */
export interface SpacePreviewResponse {
  name: string;
  avatarUrl?: string | null;
}

export interface SpaceJoinRequestResponse {
  /** When the request was submitted */
  createdAt: string;
}

/** Author of a join request. Only userId is guaranteed; profile fields are absent if the user service is unavailable */
export interface JoinRequestUserDto {
  userId: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface JoinRequestDto {
  id: number;
  user: JoinRequestUserDto;
  createdAt: string;
}

export interface JoinRequestsPageResponse {
  items: JoinRequestDto[];
  page: number;
  size: number;
  total: number;
}

/** Exactly one of `requestIds` / `all` must be passed */
export type JoinRequestsSelectionRequest = { requestIds: number[]; all?: never } | { all: true; requestIds?: never };

export interface ApproveJoinRequestsResponse {
  approvedCount: number;
}

export interface RejectJoinRequestsResponse {
  rejectedCount: number;
}
