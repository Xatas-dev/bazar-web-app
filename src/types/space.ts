export interface GetSpaceDto {
  id: number;
  name: string;
}

export interface GetSpacesResponse {
  spaces: GetSpaceDto[];
}
