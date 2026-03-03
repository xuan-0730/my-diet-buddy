import { useNavigate } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { getAllRecords, getProfile } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';

const TrendsPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();

  if (!profile) {
    navigate('/setup');
    return null;
  }

  const target = profile.dailyTarget;
  const records = getAllRecords();

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, 'yyyy-MM-dd');
    const rec = records[key];
    return {
      day: format(d, 'EEE'),
      date: key,
      calories: rec?.totalCalories || 0,
      hasData: !!(rec && rec.meals.length > 0),
    };
  });

  const daysWithData = last7.filter(d => d.hasData);
  const avg = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / daysWithData.length)
    : 0;
  const onTargetDays = daysWithData.filter(d => d.calories <= target).length;
  const overDays = daysWithData.filter(d => d.calories > target);
  const avgOver = overDays.length > 0
    ? Math.round(overDays.reduce((s, d) => s + (d.calories - target), 0) / overDays.length)
    : 0;

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">📈 7天趋势分析</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4 text-center">每日目标: {target} kcal</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                  <ReferenceLine y={target} stroke="hsl(var(--primary))" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {last7.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={!entry.hasData ? 'hsl(var(--muted))' : entry.calories > target ? 'hsl(var(--danger))' : 'hsl(var(--primary))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">7天平均</p>
                <p className="text-xl font-bold calorie-number">{avg}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">达标天数</p>
                <p className="text-xl font-bold calorie-number text-primary">{onTargetDays}/{daysWithData.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">平均超标</p>
                <p className={`text-xl font-bold calorie-number ${avgOver > 0 ? 'text-destructive' : 'text-primary'}`}>
                  {avgOver > 0 ? `+${avgOver}` : '0'}
                </p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendsPage;
