/** GET /api/v1/users/me */
export interface UserMe {
  id: number;
  email: string;
  name: string;
}

export interface UserMe {
  id: number;
  email: string;
  name: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
