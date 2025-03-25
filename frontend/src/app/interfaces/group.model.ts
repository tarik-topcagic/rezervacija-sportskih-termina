export interface Group {
  id: number;
  name: string;
  description: string;
  adminId: string;
  imageUrl: string;
  createdAt: Date;
  memberships?: GroupMembership[];
  membersCount?: number; 
}

export interface GroupMembership {
  id: number;
  groupId: number;
  userId: string;
  status: MembershipStatus;
  joinedAt: Date;
}

export enum MembershipStatus {
  Pending = 0,
  Invited = 1,
  Accepted = 2
}