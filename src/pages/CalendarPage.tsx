import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getAllRecords, getProfile, removeMealFromDay } from '@/lib/storage';
import { MEAL_LABELS, DailyRecord, MealRecord } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const CalendarPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DailyRecord | null>(null);
  const [records, setRecords] = useState(getAllRecords());

  if (!profile) {
    navigate('/setup');
    return null;
  }

  const target = profile.dailyTarget;
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // Monday = 0
  const startDayOfWeek = (getDay(monthStart) + 6) % 7;

  const handleDeleteMeal = (date: string, mealId: string) => {
    removeMealFromDay(date, mealId);
    const updated = getAllRecords();
    setRecords(updated);
    const dayRec = updated[date];
    if (dayRec && dayRec.meals.length > 0) {
      setSelectedDay(dayRec);
    } else {
      setSelectedDay(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">📅 饮食记录日历</h1>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold">{format(currentMonth, 'yyyy年 M月')}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="rounded-2xl card-elevated border-0">
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map(day => {
                const key = format(day, 'yyyy-MM-dd');
                const rec = records[key];
                const hasData = rec && rec.meals.length > 0;
                const onTarget = hasData && rec.totalCalories <= target;
                const isToday = key === format(new Date(), 'yyyy-MM-dd');

                return (
                  <button
                    key={key}
                    onClick={() => hasData && setSelectedDay(rec)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-xs gap-0.5 transition-colors
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      ${hasData ? (onTarget ? 'bg-primary/15 text-primary' : 'bg-destructive/10 text-destructive') : 'hover:bg-secondary'}
                    `}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    {hasData && <span className="text-[10px]">{onTarget ? '✅' : '❌'}</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-center">
              <span>✅ 达标</span>
              <span>❌ 超标</span>
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Dialog */}
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-sm">
            {selectedDay && (
              <>
                <DialogHeader>
                  <DialogTitle>📅 {selectedDay.date}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">目标</p>
                      <p className="font-semibold calorie-number">{selectedDay.target}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">摄入</p>
                      <p className="font-semibold calorie-number">{selectedDay.totalCalories}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">
                        {selectedDay.totalCalories <= selectedDay.target ? '节省' : '超出'}
                      </p>
                      <p className={`font-semibold calorie-number ${selectedDay.totalCalories > selectedDay.target ? 'text-destructive' : 'text-primary'}`}>
                        {selectedDay.totalCalories <= selectedDay.target ? '-' : '+'}
                        {Math.abs(selectedDay.target - selectedDay.totalCalories)}
                      </p>
                    </div>
                  </div>

                  {selectedDay.meals.map((meal: MealRecord) => (
                    <div key={meal.id} className="flex items-center justify-between py-2 border-b border-border">
                      <div>
                        <p className="text-sm font-medium">{MEAL_LABELS[meal.type].emoji} {MEAL_LABELS[meal.type].label}</p>
                        <p className="text-xs text-muted-foreground">{meal.foods.map(f => f.name).join('、')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm calorie-number">{meal.totalCalories} kcal</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteMeal(selectedDay.date, meal.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CalendarPage;
