export interface Memorial {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  date?: string;
  image?: string;

  // Relations
  createdBy?: string; // display name of the user (Profile.name)
  createdById: string; // foreign key -> Profile.id
  communityId: string; // foreign key -> Community.id
}
