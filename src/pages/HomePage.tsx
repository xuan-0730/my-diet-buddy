import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getProfile, getTodayRecord, getStreakDays } from '@/lib/storage';
import { MEAL_LABELS, MealRecord } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CalendarDays, TrendingUp, Settings } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const [todayRecord, setTodayRecord] = useState(getTodayRecord());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!profile) {
      navigate('/setup');
      return;
    }
    setTodayRecord(getTodayRecord());
    setStreak(getStreakDays(profile.dailyTarget));
  }, []);

  if (!profile) return null;

  const target = profile.dailyTarget;
  const consumed = todayRecord?.totalCalories || 0;
  const remaining = Math.max(0, target - consumed);
  const progress = Math.min(1, consumed / target);
  const isOver = consumed > target;

  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-28">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">你好 👋</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'yyyy年M月d日 EEEE')}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/setup')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Calorie Ring - Green gradient card like reference */}
        <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 card-elevated-lg">
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="hsla(0,0%,100%,0.2)" strokeWidth="12" />
                <circle
                  cx="70" cy="70" r="58" fill="none"
                  stroke={isOver ? "hsl(var(--warning))" : "white"}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
                <span className="text-5xl calorie-number">
                  {isOver ? `-${consumed - target}` : remaining}
                </span>
                <span className="text-sm opacity-80 mt-1">kcal</span>
              </div>
            </div>
          </div>

          <div className="flex justify-around mt-4 text-primary-foreground">
            <div className="text-center">
              <p className="text-xs opacity-70">目标</p>
              <p className="text-lg font-bold calorie-number">{target}</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-xs opacity-70">已摄入</p>
              <p className="text-lg font-bold calorie-number">{consumed}</p>
            </div>
            <div className="w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-xs opacity-70">剩余</p>
              <p className="text-lg font-bold calorie-number">{remaining}</p>
            </div>
          </div>
        </div>

        {/* Record Button */}
        <Button className="w-full gap-2 rounded-2xl h-14 text-base font-semibold" onClick={() => navigate('/record')}>
          <Camera className="h-5 w-5" /> 记录饮食
        </Button>

        {/* Today's meals */}
        {todayRecord && todayRecord.meals.length > 0 && (
          <Card className="rounded-2xl card-elevated border-0">
            <CardContent className="pt-5 pb-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">今日已记录</p>
              {todayRecord.meals.map((meal: MealRecord) => {
                const info = MEAL_LABELS[meal.type];
                return (
                  <div key={meal.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                        {info.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{info.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.foods.map(f => f.name).join('、')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold calorie-number">{meal.totalCalories} <span className="text-xs font-normal text-muted-foreground">kcal</span></span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Streak */}
        {streak > 0 && (
          <Card className="rounded-2xl card-elevated border-0">
            <CardContent className="py-4 flex items-center justify-center gap-2">
              <span className="text-2xl">🔥</span>
              <span className="text-sm font-medium">连续达标 <strong className="text-lg calorie-number text-primary">{streak}</strong> 天</span>
            </CardContent>
          </Card>
        )}

        {/* Nav buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 rounded-2xl h-12 border-0 bg-card card-elevated font-semibold" onClick={() => navigate('/calendar')}>
            <CalendarDays className="h-4 w-4 text-primary" /> 历史日历
          </Button>
          <Button variant="outline" className="gap-2 rounded-2xl h-12 border-0 bg-card card-elevated font-semibold" onClick={() => navigate('/trends')}>
            <TrendingUp className="h-4 w-4 text-primary" /> 趋势分析
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
