import { UserProfile, DailyRecord, MealRecord } from './types';
import { format } from 'date-fns';

const PROFILE_KEY = 'diet-profile';
const RECORDS_KEY = 'diet-records';

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getAllRecords(): Record<string, DailyRecord> {
  const raw = localStorage.getItem(RECORDS_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function getDailyRecord(date: string): DailyRecord | null {
  const all = getAllRecords();
  return all[date] || null;
}

export function getTodayRecord(): DailyRecord | null {
  return getDailyRecord(format(new Date(), 'yyyy-MM-dd'));
}

export function addMealToDay(date: string, meal: MealRecord, target: number) {
  const all = getAllRecords();
  const day = all[date] || { date, meals: [], totalCalories: 0, target };
  day.meals.push(meal);
  day.totalCalories = day.meals.reduce((sum, m) => sum + m.totalCalories, 0);
  day.target = target;
  all[date] = day;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));
}

export function removeMealFromDay(date: string, mealId: string) {
  const all = getAllRecords();
  const day = all[date];
  if (!day) return;
  day.meals = day.meals.filter(m => m.id !== mealId);
  day.totalCalories = day.meals.reduce((sum, m) => sum + m.totalCalories, 0);
  all[date] = day;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(all));
}

export function getStreakDays(target: number): number {
  let streak = 0;
  const all = getAllRecords();
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const rec = all[key];
    if (!rec || rec.meals.length === 0) {
      if (i === 0) continue; // today might not have records yet
      break;
    }
    if (rec.totalCalories <= target) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
