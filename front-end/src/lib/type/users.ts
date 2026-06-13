import { RoleEnum } from "./enum";

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: RoleEnum;
  courseCount?: number;
  postedPosts?: number;
};

export type RegisterUser = {
  username: string; // validate "^[a-zA-Z][a-zA-Z0-9]{2,31}$"
  email: string; // validate mail
  password: string; // validate "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
  fullName: string;
  role?: RoleEnum | null;
};

export type EnrollmentUserResponse = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  enrolledAt: string | null;
};
