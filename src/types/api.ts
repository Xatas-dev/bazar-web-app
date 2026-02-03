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
