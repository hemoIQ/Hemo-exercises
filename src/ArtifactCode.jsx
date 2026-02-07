import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Dumbbell, Calendar, LayoutGrid, HardDrive, Settings, AlertTriangle } from 'lucide-react';

// مكون الشعار المصمم برمجياً (SVG Logo)
const AppLogo = () => (
  <div className="relative flex items-center justify-center w-10 h-10">
    <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full animate-pulse"></div>
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-orange-500 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15h12M6 9h12M18 6v12M6 6v12M3 12h3M18 12h3" />
    </svg>
  </div>
);

export default function App() {
  // --- حالات النظام (State) ---
  const [days, setDays] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  
  // حالة نافذة التأكيد المخصصة للحذف
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null, title: '' });
  
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseImage, setNewExerciseImage] = useState('');

  // --- التحميل من الذاكرة المحلية (Offline Storage) ---
  useEffect(() => {
    const savedDays = localStorage.getItem('gym_days');
    const savedExercises = localStorage.getItem('gym_exercises');
    
    if (savedDays) setDays(JSON.parse(savedDays));
    if (savedExercises) setExercises(JSON.parse(savedExercises));
  }, []);

  // --- الحفظ التلقائي عند أي تغيير ---
  useEffect(() => {
    localStorage.setItem('gym_days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('gym_exercises', JSON.stringify(exercises));
  }, [exercises]);

  // --- العمليات (Handlers) ---
  const handleAddDay = () => {
    if (!newDayTitle.trim()) return;
    const newDay = {
      id: Date.now().toString(),
      title: newDayTitle,
      createdAt: Date.now()
    };
    setDays([...days, newDay]);
    setNewDayTitle('');
    setIsAddingDay(false);
  };

  // فتح نافذة التأكيد لحذف اليوم
  const promptDeleteDay = (day, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'day',
      id: day.id,
      title: day.title
    });
  };

  // فتح نافذة التأكيد لحذف التمرين
  const promptDeleteExercise = (ex, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'exercise',
      id: ex.id,
      title: ex.name
    });
  };

  // تنفيذ الحذف الفعلي بعد التأكيد
  const executeDelete = () => {
    if (deleteConfirm.type === 'day') {
      setDays(days.filter(d => d.id !== deleteConfirm.id));
      setExercises(exercises.filter(ex => ex.dayId !== deleteConfirm.id));
      if (selectedDay?.id === deleteConfirm.id) setSelectedDay(null);
    } else if (deleteConfirm.type === 'exercise') {
      setExercises(exercises.filter(ex => ex.id !== deleteConfirm.id));
    }
    setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' });
  };

  const handleAddExercise = () => {
    if (!newExerciseName.trim() || !selectedDay) return;
    const newEx = {
      id: Date.now().toString(),
      name: newExerciseName,
      image: newExerciseImage,
      dayId: selectedDay.id,
      createdAt: Date.now()
    };
    setExercises([...exercises, newEx]);
    setNewExerciseName('');
    setNewExerciseImage('');
    setIsAddingExercise(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExerciseImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredExercises = exercises.filter(ex => ex.dayId === selectedDay?.id);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans pb-24" dir="rtl">
      {/* Header المطور */}
      <header className="bg-zinc-900/50 backdrop-blur-xl border-b border-white/5 p-4 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex items-center justify-between">
          {selectedDay ? (
            <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-2xl transition-all active:scale-90">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <AppLogo />
          )}
          
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-l from-orange-400 to-orange-600 bg-clip-text text-transparent">
              {selectedDay ? selectedDay.title : "نادي الأبطال"}
            </h1>
            {!selectedDay && <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">OFFLINE TRACKER</span>}
          </div>

          <button className="p-2 text-zinc-500 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5">
        {!selectedDay ? (
          /* قائمة الأيام بتصميم جديد */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold">جدولك الأسبوعي</h2>
                <p className="text-zinc-500 text-xs mt-1">لديك {days.length} أيام مسجلة</p>
              </div>
              <button 
                onClick={() => setIsAddingDay(true)}
                className="bg-orange-600 hover:bg-orange-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(234,88,12,0.3)] transition-all active:scale-90"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {days.length === 0 && !isAddingDay && (
              <div className="text-center py-24 bg-zinc-900/30 rounded-[2.5rem] border border-white/5">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="w-10 h-10 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium text-lg">لا يوجد بيانات حالياً</p>
                <button onClick={() => setIsAddingDay(true)} className="text-orange-500 text-sm mt-2 font-bold hover:underline">اضغط هنا لإضافة يومك الأول</button>
              </div>
            )}

            <div className="grid gap-4">
              {days.map((day) => (
                <div 
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all hover:border-orange-500/30 shadow-2xl shadow-black"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-500/10 rounded-[1.2rem] flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white group-hover:translate-x-[-4px] transition-transform">{day.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">
                          {exercises.filter(ex => ex.dayId === day.id).length} تمارين محملة
                        </p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => promptDeleteDay(day, e)}
                    className="relative z-10 p-3 text-zinc-700 hover:text-red-500 transition-colors active:scale-125"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  {/* تأثير خلفية خفيف */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Dumbbell className="w-32 h-32 rotate-[-15deg]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* شبكة التمارين الاحترافية */
          <div className="animate-in fade-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white text-xl font-black">التمارين</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">عرض تمارين اليوم</p>
              </div>
              <button 
                onClick={() => setIsAddingExercise(true)}
                className="bg-white text-black px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-black shadow-xl transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> تمرين جديد
              </button>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {filteredExercises.map((ex) => (
                <div key={ex.id} className="bg-[#121214] rounded-[1.8rem] overflow-hidden border border-white/5 relative group shadow-2xl">
                  <div className="aspect-[4/5] bg-zinc-800/20 flex items-center justify-center overflow-hidden">
                    {ex.image ? (
                      <img src={ex.image} alt={ex.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-[10px] font-bold">بدون صورة</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-zinc-900/80 backdrop-blur-sm border-t border-white/5">
                    <h4 className="font-bold text-sm text-white truncate">{ex.name}</h4>
                  </div>
                  <button 
                    onClick={(e) => promptDeleteExercise(ex, e)}
                    className="absolute top-3 left-3 p-2 bg-black/40 backdrop-blur-xl rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all border border-white/10 active:scale-125"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* نافذة التأكيد المخصصة للحذف (Custom Confirmation Modal) */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-xs rounded-[2.5rem] p-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">هل أنت متأكد؟</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              سيتم حذف <span className="text-white font-bold">"{deleteConfirm.title}"</span> بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete}
                className="w-full bg-red-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-red-900/20 active:scale-95 transition-all"
              >
                نعم، احذف الآن
              </button>
              <button 
                onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' })}
                className="w-full bg-zinc-800 text-zinc-400 p-4 rounded-2xl font-bold active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة يوم */}
      {isAddingDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#18181b] w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-16 h-16 bg-orange-600 rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto shadow-lg shadow-orange-900/40">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-center mb-6">تسمية اليوم</h2>
            <input 
              autoFocus
              type="text"
              placeholder="مثلاً: تمارين الظهر والبطن"
              className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6 text-center font-bold"
              value={newDayTitle}
              onChange={(e) => setNewDayTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDay()}
            />
            <div className="flex gap-4">
              <button onClick={handleAddDay} className="flex-[2] bg-orange-600 text-white p-5 rounded-2xl font-black shadow-lg shadow-orange-900/20 active:scale-95 transition-all">تأكيد</button>
              <button onClick={() => setIsAddingDay(false)} className="flex-1 bg-zinc-800 text-zinc-400 p-5 rounded-2xl font-bold active:scale-95 transition-all text-xs">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة تمرين */}
      {isAddingExercise && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-[#18181b] w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-center mb-6">تفاصيل التمرين</h2>
            
            <div className="mb-6">
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-white/5 border-dashed rounded-[1.5rem] cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden bg-zinc-900/50">
                {newExerciseImage ? (
                  <img src={newExerciseImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-xs text-zinc-500 font-bold">اضغط لإضافة صورة</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="mb-8">
              <input 
                type="text"
                placeholder="اسم التمرين (مثلاً: Squats)"
                className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-center"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button onClick={handleAddExercise} className="flex-[2] bg-orange-600 text-white p-5 rounded-2xl font-black shadow-lg shadow-orange-900/20 active:scale-95 transition-all">حفظ التمرين</button>
              <button onClick={() => setIsAddingExercise(false)} className="flex-1 bg-zinc-800 text-zinc-400 p-5 rounded-2xl font-bold active:scale-95 transition-all text-xs">رجوع</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav / Status */}
      <div className="fixed bottom-0 left-0 right-0 p-5 z-40">
        <div className="max-w-md mx-auto bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-4 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
           <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-xl">
              <HardDrive className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black text-orange-500 uppercase">الذاكرة نشطة</span>
           </div>
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">تحديث الحذف v2.1</p>
        </div>
      </div>
    </div>
  );
}