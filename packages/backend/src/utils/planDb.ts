import { randomUUID } from 'crypto';
import {
  CreateVacationPlanInput,
  UpdateVacationPlanInput,
  VacationPlan,
} from '../models/VacationPlan';
import { getDatabase } from './database';

export function initializeVacationPlansTable(): void {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS vacation_plans (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      budget REAL NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_vacation_plans_user_id
      ON vacation_plans(userId);

    CREATE INDEX IF NOT EXISTS idx_vacation_plans_start_date
      ON vacation_plans(startDate);
  `);
}

export function createVacationPlan(input: CreateVacationPlanInput): VacationPlan {
  const db = getDatabase();
  const now = new Date().toISOString();

  const plan: VacationPlan = {
    id: randomUUID(),
    userId: input.userId,
    name: input.name,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    description: input.description ?? null,
    status: input.status ?? 'planning',
    createdAt: now,
    updatedAt: now,
  };

  const stmt = db.prepare(`
    INSERT INTO vacation_plans (
      id, userId, name, destination, startDate, endDate, budget,
      description, status, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    plan.id,
    plan.userId,
    plan.name,
    plan.destination,
    plan.startDate,
    plan.endDate,
    plan.budget,
    plan.description,
    plan.status,
    plan.createdAt,
    plan.updatedAt
  );

  return plan;
}

export function getVacationPlansByUserId(userId: string): VacationPlan[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT *
    FROM vacation_plans
    WHERE userId = ?
    ORDER BY startDate DESC
  `);

  return stmt.all(userId) as VacationPlan[];
}

export function findVacationPlanById(id: string): VacationPlan | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT *
    FROM vacation_plans
    WHERE id = ?
  `);

  const plan = stmt.get(id) as VacationPlan | undefined;
  return plan || null;
}

export function updateVacationPlanById(
  id: string,
  updates: UpdateVacationPlanInput
): VacationPlan | null {
  const existing = findVacationPlanById(id);
  if (!existing) {
    return null;
  }

  const db = getDatabase();
  const updatedPlan: VacationPlan = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const stmt = db.prepare(`
    UPDATE vacation_plans
    SET
      name = ?,
      destination = ?,
      startDate = ?,
      endDate = ?,
      budget = ?,
      description = ?,
      status = ?,
      updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    updatedPlan.name,
    updatedPlan.destination,
    updatedPlan.startDate,
    updatedPlan.endDate,
    updatedPlan.budget,
    updatedPlan.description ?? null,
    updatedPlan.status,
    updatedPlan.updatedAt,
    updatedPlan.id
  );

  return updatedPlan;
}

export function deleteVacationPlanById(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM vacation_plans
    WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

export function touchVacationPlanUpdatedAt(id: string): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE vacation_plans
    SET updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(new Date().toISOString(), id);
}
