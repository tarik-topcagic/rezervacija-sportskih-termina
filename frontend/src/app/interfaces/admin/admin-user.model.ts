export interface AdminUserDto {
  id: string;
  userName: string | null;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  lockoutEnd: string | null;
  emailConfirmed: boolean;
  createdAt: string | null;
  roles: string[];
}
