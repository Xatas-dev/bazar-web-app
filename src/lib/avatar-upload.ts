/** Error raised by avatar upload flows (space and user); `message` is user-facing (Russian). */
export class AvatarUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarUploadError';
  }
}
