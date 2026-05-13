export const ACTIVITY_CATEGORIES = [
  'dining',
  'sightseeing',
  'accommodation',
  'transport',
  'entertainment',
  'other',
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export interface Activity {
  id: string;
  planId: string;
  name: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  cost: number;
  category: ActivityCategory;
  description?: string | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityInput {
  planId: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  cost: number;
  category: ActivityCategory;
  description?: string;
  location?: string;
}

export interface UpdateActivityInput {
  name?: string;
  date?: string;
  startTime?: string | null;
  endTime?: string | null;
  cost?: number;
  category?: ActivityCategory;
  description?: string;
  location?: string;
}
