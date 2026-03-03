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
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">🥗 AI 减脂助手</h1>
          <p className="text-muted-foreground text-sm">设置你的基础信息</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>身高 (cm)</Label>
                <Input type="number" placeholder="170" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>体重 (kg)</Label>
                <Input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>年龄</Label>
                <Input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>性别</Label>
                <RadioGroup value={gender} onValueChange={(v) => setGender(v as 'male' | 'female')} className="flex gap-4 pt-2">
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal">男</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal">女</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>活动量</Label>
              <RadioGroup value={activity} onValueChange={(v) => setActivity(v as typeof activity)} className="grid grid-cols-2 gap-2">
                {[
                  { value: 'sedentary', label: '久坐' },
                  { value: 'light', label: '轻度活动' },
                  { value: 'moderate', label: '中度活动' },
                  { value: 'intense', label: '高强度' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-2">
                    <RadioGroupItem value={opt.value} id={opt.value} />
                    <Label htmlFor={opt.value} className="font-normal text-sm cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>减脂强度</Label>
              <RadioGroup value={deficit} onValueChange={(v) => setDeficit(v as typeof deficit)} className="grid grid-cols-3 gap-2">
                {DEFICIT_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex flex-col items-center gap-1 bg-secondary rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <RadioGroupItem value={opt.value} id={`def-${opt.value}`} />
                      <Label htmlFor={`def-${opt.value}`} className="font-normal text-sm cursor-pointer">{opt.label}</Label>
                    </div>
                    <span className="text-xs text-muted-foreground">-{opt.kcal} kcal</span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button onClick={calculate} className="w-full" size="lg">
              生成每日目标
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">BMR</p>
                  <p className="text-lg font-bold calorie-number">{result.bmr}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TDEE</p>
                  <p className="text-lg font-bold calorie-number">{result.tdee}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">每日目标</p>
                  <p className="text-lg font-bold calorie-number text-primary">{result.target}</p>
                  <p className="text-xs text-muted-foreground">kcal</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/')}>
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
