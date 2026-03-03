import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, ACTIVITY_MULTIPLIERS, DEFICIT_OPTIONS } from '@/lib/types';
import { saveProfile, getProfile } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';

const SetupPage = () => {
  const navigate = useNavigate();
  const existing = getProfile();

  const [height, setHeight] = useState(existing?.height?.toString() || '');
  const [weight, setWeight] = useState(existing?.weight?.toString() || '');
  const [age, setAge] = useState(existing?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(existing?.gender || 'male');
  const [activity, setActivity] = useState(existing?.activityLevel || 'sedentary');
  const [deficit, setDeficit] = useState(existing?.deficitLevel || 'moderate');
  const [result, setResult] = useState<{ bmr: number; tdee: number; target: number } | null>(
    existing ? { bmr: existing.bmr, tdee: existing.tdee, target: existing.dailyTarget } : null
  );

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!h || !w || !a) return;

    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

    const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
    const deficitKcal = DEFICIT_OPTIONS.find(d => d.value === deficit)!.kcal;
    const target = Math.round(tdee - deficitKcal);

    const profile: UserProfile = {
      height: h, weight: w, age: a, gender,
      activityLevel: activity as UserProfile['activityLevel'],
      deficitLevel: deficit as UserProfile['deficitLevel'],
      bmr: Math.round(bmr), tdee, dailyTarget: target,
    };
    saveProfile(profile);
    setResult({ bmr: Math.round(bmr), tdee, target });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto text-3xl">🥗</div>
          <h1 className="text-2xl font-bold">AI 减脂助手</h1>
          <p className="text-muted-foreground text-sm">设置你的基础信息，开始健康减脂之旅</p>
        </div>

        <Card className="rounded-2xl card-elevated border-0">
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">身高 (cm)</Label>
                <Input type="number" placeholder="170" value={height} onChange={e => setHeight(e.target.value)} className="rounded-xl h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">体重 (kg)</Label>
                <Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} className="rounded-xl h-12 text-base" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">年龄</Label>
                <Input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} className="rounded-xl h-12 text-base" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">性别</Label>
                <RadioGroup value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} className="flex gap-2 pt-1">
                  {[{ value: 'male', label: '👨 男' }, { value: 'female', label: '👩 女' }].map(opt => (
                    <label key={opt.value} className={`flex-1 text-center py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${gender === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <RadioGroupItem value={opt.value} className="sr-only" />
                      {opt.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">活动量</Label>
              <RadioGroup value={activity} onValueChange={(v) => setActivity(v as typeof activity)} className="grid grid-cols-2 gap-2">
                {[
                  { value: 'sedentary', label: '🪑 久坐' },
                  { value: 'light', label: '🚶 轻度' },
                  { value: 'moderate', label: '🏃 中度' },
                  { value: 'intense', label: '💪 高强度' },
                ].map(opt => (
                  <label key={opt.value} className={`text-center py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${activity === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    {opt.label}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">减脂强度</Label>
              <RadioGroup value={deficit} onValueChange={(v) => setDeficit(v as typeof deficit)} className="grid grid-cols-3 gap-2">
                {DEFICIT_OPTIONS.map(opt => (
                  <label key={opt.value} className={`flex flex-col items-center gap-0.5 py-3 rounded-xl cursor-pointer text-sm font-medium transition-all ${deficit === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <RadioGroupItem value={opt.value} className="sr-only" />
                    <span>{opt.label}</span>
                    <span className={`text-[10px] ${deficit === opt.value ? 'opacity-80' : 'text-muted-foreground'}`}>-{opt.kcal} kcal</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button onClick={calculate} className="w-full rounded-2xl h-14 text-base font-semibold" size="lg">
              生成每日目标
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="rounded-2xl card-elevated border-0 bg-gradient-to-br from-primary to-primary/80">
            <CardContent className="pt-6 pb-5">
              <div className="grid grid-cols-3 gap-4 text-center text-primary-foreground">
                <div>
                  <p className="text-xs opacity-70">BMR</p>
                  <p className="text-xl font-bold calorie-number">{result.bmr}</p>
                  <p className="text-xs opacity-70">kcal</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">TDEE</p>
                  <p className="text-xl font-bold calorie-number">{result.tdee}</p>
                  <p className="text-xs opacity-70">kcal</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">每日目标</p>
                  <p className="text-xl font-bold calorie-number">{result.target}</p>
                  <p className="text-xs opacity-70">kcal</p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full mt-5 rounded-2xl h-12 font-semibold"
                onClick={() => navigate('/')}
              >
                开始使用 →
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SetupPage;
