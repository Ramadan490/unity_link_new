// types/announcement.ts
export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorRole: 'super_admin' | 'board_member' | 'community_member';
  createdAt: string;
}
