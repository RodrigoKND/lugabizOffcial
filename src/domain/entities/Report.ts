export interface Report {
  id: string;
  targetType: 'review' | 'event_comment' | 'user';
  targetId: string;
  reporterId: string;
  reporterName?: string;
  reason: string;
  createdAt: Date;
}

export interface CreateReportData {
  targetType: 'review' | 'event_comment' | 'user';
  targetId: string;
  reporterId: string;
  reason: string;
}

export interface FlaggedContent {
  targetId: string;
  targetType: 'review' | 'event_comment';
  reportCount: number;
  content: string;
  authorId: string;
  authorName: string;
  latestReason: string;
}
