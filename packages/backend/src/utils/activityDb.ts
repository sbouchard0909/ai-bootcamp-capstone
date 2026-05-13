import { randomUUID } from 'crypto';
import { Activity, CreateActivityInput, UpdateActivityInput } from '../models/Activity';
import { getDatabase } from './database';

export function initializeActivitiesTable(): void {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      planId TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT,
      endTime TEXT,
      cost REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      location TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (planId) REFERENCES vacation_plans(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_activities_plan_id
      ON activities(planId);

    CREATE INDEX IF NOT EXISTS idx_activities_date
      ON activities(date);
  `);
}

export function createActivity(input: CreateActivityInput): Activity {
  const db = getDatabase();
  const now = new Date().toISOString();

  const activity: Activity = {
    id: randomUUID(),
    planId: input.planId,
    name: input.name,
    date: input.date,
    startTime: input.startTime ?? null,
    endTime: input.endTime ?? null,
    cost: input.cost,
    category: input.category,
    description: input.description ?? null,
    location: input.location ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const stmt = db.prepare(`
    INSERT INTO activities (
      id, planId, name, date, startTime, endTime, cost, category,
      description, location, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    activity.id,
    activity.planId,
    activity.name,
    activity.date,
    activity.startTime,
    activity.endTime,
    activity.cost,
    activity.category,
    activity.description,
    activity.location,
    activity.createdAt,
    activity.updatedAt
  );

  return activity;
}

export function getActivitiesByPlanId(planId: string): Activity[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT *
    FROM activities
    WHERE planId = ?
    ORDER BY date ASC, COALESCE(startTime, '99:99') ASC, createdAt ASC
  `);

  return stmt.all(planId) as Activity[];
}

export function findActivityByIdAndPlanId(id: string, planId: string): Activity | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT *
    FROM activities
    WHERE id = ? AND planId = ?
  `);

  const row = stmt.get(id, planId) as Activity | undefined;
  return row || null;
}

export function updateActivityByIdAndPlanId(
  id: string,
  planId: string,
  updates: UpdateActivityInput
): Activity | null {
  const existing = findActivityByIdAndPlanId(id, planId);
  if (!existing) {
    return null;
  }

  const db = getDatabase();
  const updated: Activity = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    UPDATE activities
    SET
      name = ?,
      date = ?,
      startTime = ?,
      endTime = ?,
      cost = ?,
      category = ?,
      description = ?,
      location = ?,
      updatedAt = ?
    WHERE id = ? AND planId = ?
  `);

  stmt.run(
    updated.name,
    updated.date,
    updated.startTime ?? null,
    updated.endTime ?? null,
    updated.cost,
    updated.category,
    updated.description ?? null,
    updated.location ?? null,
    updated.updatedAt,
    id,
    planId
  );

  return updated;
}

export function deleteActivityByIdAndPlanId(id: string, planId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM activities
    WHERE id = ? AND planId = ?
  `);

  const result = stmt.run(id, planId);
  return result.changes > 0;
}

export function getTotalActivityCostByPlanId(planId: string): number {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT COALESCE(SUM(cost), 0) as total
    FROM activities
    WHERE planId = ?
  `);

  const row = stmt.get(planId) as { total: number };
  return row.total;
}
