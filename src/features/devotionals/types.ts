// src/features/devotionals/types.ts

export interface Organization {
  id: string;
  name: string;
  description?: string;
  contactEmail: string;
  websiteUrl?: string;
  logoUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Devotional {
  id: string;
  orgId?: string;
  organization?: Organization;
  title: string;
  body: string;
  verseRef: string;
  verseText?: string;
  authorName: string;
  authorTitle?: string;
  theme?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  scheduledFor?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface DevotionalSubmission {
  orgName: string;
  contactEmail: string;
  websiteUrl?: string;
  authorName: string;
  authorTitle?: string;
  title: string;
  body: string;
  verseRef: string;
  theme?: string;
  scheduledFor?: string;
}
