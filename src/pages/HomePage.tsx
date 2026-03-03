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

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🥗 今日概览</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), 'yyyy年M月d日')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/setup')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Calorie Ring */}
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                <circle
                  cx="80" cy="80" r="70" fill="none"
                  stroke={isOver ? "hsl(var(--danger))" : "hsl(var(--primary))"}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">剩余热量</span>
                <span className={`text-3xl calorie-number ${isOver ? 'text-danger' : 'text-primary'}`}>
                  {isOver ? `-${consumed - target}` : remaining}
                </span>
                <span className="text-xs text-muted-foreground">kcal</span>
              </div>
            </div>

            <div className="flex justify-around w-full mt-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">目标</p>
                <p className="text-base font-semibold calorie-number">{target}</p>
              </div>
              <div className="w-px bg-border" />
              <div>
                <p className="text-xs text-muted-foreground">已摄入</p>
                <p className="text-base font-semibold calorie-number">{consumed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Button */}
        <Button className="w-full gap-2" size="lg" onClick={() => navigate('/record')}>
          <Camera className="h-5 w-5" /> 记录饮食
        </Button>

        {/* Today's meals */}
        {todayRecord && todayRecord.meals.length > 0 && (
          <Card>
            <CardContent className="pt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground mb-2">今日已记录</p>
              {todayRecord.meals.map((meal: MealRecord) => {
                const info = MEAL_LABELS[meal.type];
                return (
                  <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{info.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{info.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.foods.map(f => f.name).join('、')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold calorie-number">{meal.totalCalories} kcal</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className="text-center py-3">
            <span className="text-sm">🔥 当前连续达标: <strong>{streak}</strong> 天</span>
          </div>
        )}

        {/* Nav buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/calendar')}>
            <CalendarDays className="h-4 w-4" /> 历史日历
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/trends')}>
            <TrendingUp className="h-4 w-4" /> 趋势分析
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
