import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FoodItem, MealType, MEAL_LABELS, MealRecord } from '@/lib/types';
import { addMealToDay, getProfile } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const COMMON_FOODS = [
  { name: '米饭', portions: ['半碗', '一碗', '两碗'], calories: [130, 260, 520] },
  { name: '鸡胸肉', portions: ['半份', '一份', '两份'], calories: [90, 180, 360] },
  { name: '西兰花', portions: ['半份', '一份'], calories: [25, 50] },
  { name: '鸡蛋', portions: ['1个', '2个'], calories: [75, 150] },
  { name: '牛奶', portions: ['半杯', '一杯'], calories: [60, 120] },
  { name: '面包', portions: ['1片', '2片'], calories: [80, 160] },
  { name: '苹果', portions: ['半个', '一个'], calories: [40, 80] },
  { name: '酸奶', portions: ['一杯'], calories: [120] },
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const RecordPage = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [foods, setFoods] = useState<(FoodItem & { portionIdx: number })[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  if (!profile) {
    navigate('/setup');
    return null;
  }

  const addFood = (foodTemplate: typeof COMMON_FOODS[0]) => {
    setFoods(prev => [...prev, {
      id: genId(),
      name: foodTemplate.name,
      portion: foodTemplate.portions[0],
      calories: foodTemplate.calories[0],
      portionIdx: 0,
    }]);
    setShowPicker(false);
  };

  const addCustomFood = () => {
    setFoods(prev => [...prev, {
      id: genId(),
      name: '',
      portion: '一份',
      calories: 0,
      portionIdx: 0,
    }]);
  };

  const updateFood = (id: string, updates: Partial<FoodItem & { portionIdx: number }>) => {
    setFoods(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeFood = (id: string) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const changePortionForTemplate = (food: typeof foods[0], idx: number) => {
    const template = COMMON_FOODS.find(t => t.name === food.name);
    if (template && template.portions[idx]) {
      updateFood(food.id, {
        portionIdx: idx,
        portion: template.portions[idx],
        calories: template.calories[idx],
      });
    }
  };

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);

  const handleConfirm = () => {
    if (foods.length === 0) return;
    const meal: MealRecord = {
      id: genId(),
      type: mealType,
      foods: foods.map(({ id, name, portion, calories }) => ({ id, name, portion, calories })),
      totalCalories,
      timestamp: Date.now(),
    };
    addMealToDay(format(new Date(), 'yyyy-MM-dd'), meal, profile.dailyTarget);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">记录饮食</h1>
        </div>

        {/* Meal type */}
        <Card>
          <CardContent className="pt-4">
            <Label className="mb-2 block">餐次</Label>
            <RadioGroup value={mealType} onValueChange={(v) => setMealType(v as MealType)} className="flex gap-2 flex-wrap">
              {(Object.entries(MEAL_LABELS) as [MealType, { label: string; emoji: string }][]).map(([key, val]) => (
                <div key={key} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 cursor-pointer transition-colors ${mealType === key ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                  <RadioGroupItem value={key} id={`meal-${key}`} className="sr-only" />
                  <Label htmlFor={`meal-${key}`} className="cursor-pointer text-sm font-normal">
                    {val.emoji} {val.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Food items */}
        {foods.map((food) => {
          const template = COMMON_FOODS.find(t => t.name === food.name);
          return (
            <Card key={food.id}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={food.name}
                    onChange={e => updateFood(food.id, { name: e.target.value })}
                    placeholder="食物名称"
                    className="flex-1 mr-2"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeFood(food.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {template ? (
                  <RadioGroup
                    value={food.portionIdx.toString()}
                    onValueChange={v => changePortionForTemplate(food, parseInt(v))}
                    className="flex gap-2 flex-wrap"
                  >
                    {template.portions.map((p, idx) => (
                      <div key={idx} className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-colors ${food.portionIdx === idx ? 'bg-primary/15 text-primary font-medium' : 'bg-secondary'}`}>
                        <RadioGroupItem value={idx.toString()} id={`${food.id}-p${idx}`} className="sr-only" />
                        <Label htmlFor={`${food.id}-p${idx}`} className="cursor-pointer text-sm">{p}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={food.portion}
                      onChange={e => updateFood(food.id, { portion: e.target.value })}
                      placeholder="份量"
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={food.calories || ''}
                      onChange={e => updateFood(food.id, { calories: parseInt(e.target.value) || 0 })}
                      placeholder="热量 kcal"
                      className="w-28"
                    />
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                )}
                <p className="text-right text-sm font-semibold calorie-number">{food.calories} kcal</p>
              </CardContent>
            </Card>
          );
        })}

        {/* Add food */}
        {showPicker ? (
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-3">选择常见食物</p>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_FOODS.map(f => (
                  <Button key={f.name} variant="outline" size="sm" className="justify-start" onClick={() => addFood(f)}>
                    {f.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-2 text-sm" onClick={() => { addCustomFood(); setShowPicker(false); }}>
                + 自定义食物
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowPicker(true)}>
            <Plus className="h-4 w-4" /> 添加食物
          </Button>
        )}

        {/* Total & Confirm */}
        {foods.length > 0 && (
          <div className="space-y-3">
            <div className="text-center py-3">
              <span className="text-sm text-muted-foreground">本次总热量</span>
              <p className="text-2xl calorie-number text-primary">{totalCalories} kcal</p>
            </div>
            <Button className="w-full" size="lg" onClick={handleConfirm}>
              确认记录
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordPage;
