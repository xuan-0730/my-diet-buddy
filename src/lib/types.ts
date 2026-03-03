export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  deficitLevel: 'light' | 'moderate' | 'aggressive';
  bmr: number;
  tdee: number;
  dailyTarget: number;
}

export interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealRecord {
  id: string;
  type: MealType;
  foods: FoodItem[];
  totalCalories: number;
  timestamp: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  meals: MealRecord[];
  totalCalories: number;
  target: number;
}

export const MEAL_LABELS: Record<MealType, { label: string; emoji: string }> = {
  breakfast: { label: '早餐', emoji: '🍞' },
  lunch: { label: '午餐', emoji: '🍚' },
  dinner: { label: '晚餐', emoji: '🍽️' },
  snack: { label: '加餐', emoji: '🍎' },
};

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: '久坐',
  light: '轻度活动',
  moderate: '中度活动',
  intense: '高强度',
};

export const DEFICIT_OPTIONS = [
  { value: 'light', label: '轻度', kcal: 300 },
  { value: 'moderate', label: '中度', kcal: 500 },
  { value: 'aggressive', label: '激进', kcal: 700 },
] as const;

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  intense: 1.725,
};
