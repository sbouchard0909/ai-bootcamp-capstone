export type ActivityCategory = 'dining' | 'sightseeing' | 'accommodation' | 'transport' | 'entertainment' | 'other';

export interface Activity {
  id: string;
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

export interface CreateActivityData {
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  cost: number;
  category: ActivityCategory;
  description?: string;
  location?: string;
}

export interface UpdateActivityData {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  cost?: number;
  category?: ActivityCategory;
  description?: string;
  location?: string;
}

export interface CategoryConfig {
  label: string;
  icon: string;
  color: string;
}

export const ACTIVITY_CATEGORIES: Record<ActivityCategory, CategoryConfig> = {
  dining: { label: 'Dining', icon: '🍽️', color: 'blue' },
  sightseeing: { label: 'Sightseeing', icon: '🏛️', color: 'green' },
  accommodation: { label: 'Accommodation', icon: '🏨', color: 'purple' },
  transport: { label: 'Transport', icon: '🚗', color: 'orange' },
  entertainment: { label: 'Entertainment', icon: '🎭', color: 'pink' },
  other: { label: 'Other', icon: '📌', color: 'gray' },
};
