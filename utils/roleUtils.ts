
import { User } from '../types/user';

export function isSuperAdmin(user: User | null | undefined): user is User & { role: 'super_admin' } {
  return user?.role === 'super_admin';
}

export function isBoardMember(user: User | null | undefined): user is User & { role: 'board_member' } {
  return user?.role === 'board_member';
}

export function isCommunityMember(user: User | null | undefined): user is User & { role: 'community_member' } {
  return user?.role === 'community_member';
}

export function isAdminOrBoard(user: User | null | undefined): user is User & { role: 'super_admin' | 'board_member' } {
  return user?.role === 'super_admin' || user?.role === 'board_member';
}
