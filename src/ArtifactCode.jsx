import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Dumbbell, Calendar, LayoutGrid, HardDrive, Settings, AlertTriangle, Check, Palette } from 'lucide-react';

// تعريف الثيمات المتاحة
const THEMES = {
  classic: {
    id: 'classic',
    name: 'البرتقالي الكلاسيكي',
    bg: 'bg-[#09090b]',
    surface: 'bg-zinc-900',
    accent: 'text-orange-500',
    accentBg: 'bg-orange-600',
    accentHover: 'hover:bg-orange-500',
    accentLight: 'bg-orange-500/10',
    border: 'border-white/5',
    gradient: 'from-orange-400 to-orange-600'
  },
  ocean: {
    id: 'ocean',
    name: 'أزرق المحيط',
    bg: 'bg-[#020617]',
    surface: 'bg-slate-900',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-600',
    accentHover: 'hover:bg-cyan-500',
    accentLight: 'bg-cyan-500/10',
    border: 'border-cyan-500/10',
    gradient: 'from-cyan-400 to-blue-600'
  },
  emerald: {
    id: 'emerald',
    name: 'الأخضر الزمردي',
    bg: 'bg-[#022c22]',
    surface: 'bg-[#064e3b]',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-500',
    accentLight: 'bg-emerald-500/10',
    border: 'border-emerald-500/10',
    gradient: 'from-emerald-400 to-green-600'
  },
  royal: {
    id: 'royal',
    name: 'البنفسجي الملكي',
    bg: 'bg-[#0f0728]',
    surface: 'bg-[#1e1045]',
    accent: 'text-purple-400',
    accentBg: 'bg-purple-600',
    accentHover: 'hover:bg-purple-500',
    accentLight: 'bg-purple-500/10',
    border: 'border-purple-500/10',
    gradient: 'from-purple-400 to-indigo-600'
  },
  lava: {
    id: 'lava',
    name: 'الحمم الحمراء',
    bg: 'bg-[#0c0000]',
    surface: 'bg-[#210000]',
    accent: 'text-red-500',
    accentBg: 'bg-red-600',
    accentHover: 'hover:bg-red-500',
    accentLight: 'bg-red-500/10',
    border: 'border-red-500/10',
    gradient: 'from-red-400 to-red-700'
  }
};

// مكون الشعار المصمم برمجياً (SVG Logo) متأثر بالثيم
const AppLogo = ({ theme }) => (
  <div className="relative flex items-center justify-center w-10 h-10">
    <div className={`absolute inset-0 ${theme.accentLight} blur-lg rounded-full animate-pulse`}></div>
    <svg viewBox="0 0 24 24" className={`w-8 h-8 ${theme.accent} relative z-10`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // حالة الثيم (القيمة الافتراضية هي classic)
  const [currentTheme, setCurrentTheme] = useState(THEMES.classic);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null, title: '' });
  
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseImage, setNewExerciseImage] = useState('');

  // --- التحميل من الذاكرة المحلية (Offline Storage) ---
  useEffect(() => {
    const savedDays = localStorage.getItem('gym_days');
    const savedExercises = localStorage.getItem('gym_exercises');
    const savedTheme = localStorage.getItem('gym_theme');
    
    if (savedDays) {
      try { setDays(JSON.parse(savedDays)); } catch (e) { console.error("Error loading days", e); }
    }
    if (savedExercises) {
      try { setExercises(JSON.parse(savedExercises)); } catch (e) { console.error("Error loading exercises", e); }
    }
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(THEMES[savedTheme]);
    }
  }, []);

  // --- الحفظ التلقائي عند أي تغيير ---
  useEffect(() => {
    if (days.length > 0 || localStorage.getItem('gym_days')) {
      localStorage.setItem('gym_days', JSON.stringify(days));
    }
  }, [days]);

  useEffect(() => {
    if (exercises.length > 0 || localStorage.getItem('gym_exercises')) {
      localStorage.setItem('gym_exercises', JSON.stringify(exercises));
    }
  }, [exercises]);

  const changeTheme = (themeKey) => {
    setCurrentTheme(THEMES[themeKey]);
    localStorage.setItem('gym_theme', themeKey);
    setIsSettingsOpen(false);
  };

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

  const promptDeleteDay = (day, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'day',
      id: day.id,
      title: day.title
    });
  };

  const promptDeleteExercise = (ex, e) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      type: 'exercise',
      id: ex.id,
      title: ex.name
    });
  };

  const executeDelete = () => {
    if (deleteConfirm.type === 'day') {
      const updatedDays = days.filter(d => d.id !== deleteConfirm.id);
      const updatedEx = exercises.filter(ex => ex.dayId !== deleteConfirm.id);
      setDays(updatedDays);
      setExercises(updatedEx);
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
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setNewExerciseImage(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredExercises = exercises.filter(ex => ex.dayId === selectedDay?.id);

  return (
    <div className={`min-h-screen ${currentTheme.bg} text-zinc-100 font-sans pb-10 transition-colors duration-500`} dir="rtl">
      {/* Header */}
      <header className={`${currentTheme.surface}/50 backdrop-blur-xl border-b ${currentTheme.border} p-4 sticky top-0 z-40`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          {selectedDay ? (
            <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-2xl transition-all active:scale-90">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <AppLogo theme={currentTheme} />
          )}
          
          <div className="flex flex-col items-center">
            <h1 className={`text-lg font-black tracking-tight bg-gradient-to-l ${currentTheme.gradient} bg-clip-text text-transparent`}>
              {selectedDay ? selectedDay.title : "نادي الأبطال"}
            </h1>
            {!selectedDay && <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">OFFLINE TRACKER</span>}
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-zinc-500 hover:text-white transition-colors">
            <Palette className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5">
        {!selectedDay ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white text-xl font-bold">جدولك الأسبوعي</h2>
                <p className="text-zinc-500 text-xs mt-1">لديك {days.length} أيام مسجلة</p>
              </div>
              <button 
                onClick={() => setIsAddingDay(true)}
                className={`${currentTheme.accentBg} ${currentTheme.accentHover} text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90`}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            {days.length === 0 && !isAddingDay && (
              <div className={`text-center py-24 ${currentTheme.surface}/30 rounded-[2.5rem] border ${currentTheme.border}`}>
                <div className={`${currentTheme.surface}/50 rounded-full flex items-center justify-center mx-auto mb-6 w-20 h-20`}>
                  <Dumbbell className={`w-10 h-10 text-zinc-600`} />
                </div>
                <p className="text-zinc-400 font-medium text-lg">لا يوجد أيام حالياً</p>
                <button onClick={() => setIsAddingDay(true)} className={`${currentTheme.accent} text-sm mt-2 font-bold hover:underline`}>اضغط لإضافة يوم جديد</button>
              </div>
            )}

            <div className="grid gap-4">
              {days.map((day) => (
                <div 
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className={`relative overflow-hidden ${currentTheme.surface} border ${currentTheme.border} p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all shadow-2xl shadow-black`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${currentTheme.accentLight} rounded-[1.2rem] flex items-center justify-center ${currentTheme.accent} group-hover:${currentTheme.accentBg} group-hover:text-white transition-all duration-300`}>
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-white group-hover:translate-x-[-4px] transition-transform">{day.title}</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">
                        {exercises.filter(ex => ex.dayId === day.id).length} تمارين محفوظة
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => promptDeleteDay(day, e)}
                    className="relative z-10 p-3 text-zinc-700 hover:text-red-500 transition-colors active:scale-125"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white text-xl font-black">التمارين</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">تمارين {selectedDay.title}</p>
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
                <div key={ex.id} className={`${currentTheme.surface} rounded-[1.8rem] overflow-hidden border ${currentTheme.border} relative group shadow-2xl`}>
                  <div className="aspect-[4/5] bg-zinc-800/20 flex items-center justify-center overflow-hidden">
                    {ex.image ? (
                      <img src={ex.image} alt={ex.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-[10px] font-bold text-center">بدون صورة</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${currentTheme.surface}/80 backdrop-blur-sm border-t ${currentTheme.border}`}>
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

      {/* Settings / Theme Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] p-8 border ${currentTheme.border} shadow-2xl`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white">اختر المظهر</h2>
              <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-500 hover:text-white">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className="grid gap-4">
              {Object.keys(THEMES).map((key) => {
                const theme = THEMES[key];
                const isActive = currentTheme.id === theme.id;
                return (
                  <button 
                    key={key}
                    onClick={() => changeTheme(key)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isActive ? `border-${theme.accent.split('-')[1]}-500 ${theme.accentLight}` : 'border-white/5 bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full ${theme.accentBg}`}></div>
                      <span className={`font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>{theme.name}</span>
                    </div>
                    {isActive && <Check className={`w-5 h-5 ${theme.accent}`} />}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(false)}
              className={`w-full mt-8 p-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold active:scale-95 transition-all`}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className={`${currentTheme.surface} w-full max-w-xs rounded-[2.5rem] p-8 border border-red-500/20 shadow-2xl text-center`}>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black mb-2 text-white">حذف نهائي؟</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              سيتم حذف <span className="text-white font-bold">"{deleteConfirm.title}"</span> تماماً.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full bg-red-600 text-white p-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all">تأكيد الحذف</button>
              <button onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' })} className="w-full bg-zinc-800 text-zinc-400 p-4 rounded-2xl font-bold active:scale-95 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Day Modal */}
      {isAddingDay && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] p-8 border ${currentTheme.border} shadow-2xl`}>
            <div className={`w-16 h-16 ${currentTheme.accentBg} rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto shadow-lg`}>
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-center mb-6">تسمية اليوم</h2>
            <input 
              autoFocus
              type="text"
              placeholder="مثلاً: يوم الصدر"
              className={`w-full ${currentTheme.bg} border ${currentTheme.border} rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent.split('-')[1]}-500 mb-6 text-center font-bold`}
              value={newDayTitle}
              onChange={(e) => setNewDayTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddDay()}
            />
            <div className="flex gap-4">
              <button onClick={handleAddDay} className={`flex-[2] ${currentTheme.accentBg} text-white p-5 rounded-2xl font-black shadow-lg active:scale-95 transition-all`}>تأكيد</button>
              <button onClick={() => setIsAddingDay(false)} className="flex-1 bg-zinc-800 text-zinc-400 p-5 rounded-2xl font-bold active:scale-95 transition-all text-xs">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {isAddingExercise && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] p-8 border ${currentTheme.border} shadow-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-black text-center mb-6 text-white">إضافة تمرين</h2>
            
            <div className="mb-6">
              <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 ${currentTheme.border} border-dashed rounded-[1.5rem] cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden bg-zinc-900/50`}>
                {newExerciseImage ? (
                  <img src={newExerciseImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className={`w-6 h-6 ${currentTheme.accent}`} />
                    </div>
                    <p className="text-xs text-zinc-500 font-bold italic">ارفع صورة التمرين</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="mb-8">
              <input 
                type="text"
                placeholder="اسم التمرين"
                className={`w-full ${currentTheme.bg} border ${currentTheme.border} rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent.split('-')[1]}-500 font-bold text-center`}
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button onClick={handleAddExercise} className={`flex-[2] ${currentTheme.accentBg} text-white p-5 rounded-2xl font-black shadow-lg active:scale-95 transition-all`}>حفظ</button>
              <button onClick={() => setIsAddingExercise(false)} className="flex-1 bg-zinc-800 text-zinc-400 p-5 rounded-2xl font-bold active:scale-95 transition-all text-xs">رجوع</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}