import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, Dumbbell, Calendar, LayoutGrid, HardDrive, Settings, AlertTriangle, Check, Palette, Search, Activity, List, Edit3, PlayCircle, Upload, Film, X, RefreshCw, Github, CheckCircle2 } from 'lucide-react';

// --- إعدادات التحديث (يجب تعديلها لتناسب مستودعك) ---
const APP_VERSION = '1.3.0'; // الإصدار الجديد للتجربة
const GITHUB_CONFIG = {
  USERNAME: 'hemoIQ',
  REPO: 'Hemo-exercises',
  BRANCH: 'main'
};

// --- إعدادات قاعدة البيانات (IndexedDB) لحفظ الفيديوهات والصور الكبيرة ---
const DB_NAME = 'GymTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'media';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveMediaToDB = async (file) => {
  try {
    const db = await initDB();
    const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const item = { id, file, type: file.type, date: Date.now() };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(item);
      request.onsuccess = () => resolve(id);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("Error saving media:", err);
    throw err;
  }
};

const getMediaFromDB = async (id) => {
  if (!id) return null;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result ? request.result.file : null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    console.error("Error retrieving media:", err);
    return null;
  }
};

const deleteMediaFromDB = async (id) => {
  if (!id) return;
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error("Error deleting media:", err);
  }
};

// --- مكون عرض الوسائط (صورة أو فيديو) ---
const MediaThumbnail = ({ mediaId, legacyImage, alt, className }) => {
  const [src, setSrc] = useState(legacyImage || null);
  const [type, setType] = useState(legacyImage ? 'image' : null);
  const [loading, setLoading] = useState(!legacyImage && !!mediaId);

  useEffect(() => {
    let isActive = true;
    let objectUrl = null;

    const loadMedia = async () => {
      if (mediaId) {
        setLoading(true);
        const file = await getMediaFromDB(mediaId);
        if (isActive && file) {
          objectUrl = URL.createObjectURL(file);
          setSrc(objectUrl);
          setType(file.type.startsWith('video') ? 'video' : 'image');
          setLoading(false);
        } else if (isActive) {
          setLoading(false);
        }
      }
    };

    if (mediaId && !src) {
      loadMedia();
    } else if (!mediaId && legacyImage) {
      setSrc(legacyImage);
      setType('image');
      setLoading(false);
    }

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, legacyImage]);

  if (loading) return (
    <div className={`animate-pulse bg-white/5 flex items-center justify-center ${className}`}>
      <Activity className="w-6 h-6 text-white/20 animate-spin" />
    </div>
  );

  if (type === 'video') {
    return (
      <div className={`relative ${className} bg-black flex items-center justify-center overflow-hidden`}>
        <video
          src={src}
          className="w-full h-full object-cover pointer-events-none"
          muted
          playsInline
          autoPlay
          loop
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    );
  }

  if (src) {
    return <img src={src} alt={alt} className={`${className} object-cover`} loading="lazy" />;
  }

  return (
    <div className={`${className} flex flex-col items-center justify-center bg-white/5 opacity-50`}>
      <Dumbbell className="w-8 h-8 mb-2 opacity-50" />
    </div>
  );
};

// --- التطبيق الرئيسي ---

// تصميم زجاجي فاخر (Apple Style)
const THEMES = {
  apple: {
    id: 'apple',
    name: 'Apple Glass',
    bg: 'bg-[#000000]',
    surface: 'bg-zinc-800/40 backdrop-blur-3xl saturate-150 border-white/10',
    accent: 'text-blue-500',
    accentBg: 'bg-blue-600',
    accentHover: 'hover:bg-blue-500',
    accentLight: 'bg-blue-500/10',
    border: 'border-white/5',
    gradient: 'from-blue-500 to-purple-600'
  },
  classic: {
    id: 'classic',
    name: 'Dark Matter',
    bg: 'bg-[#09090b]',
    surface: 'bg-zinc-900/60 backdrop-blur-2xl border-white/5',
    accent: 'text-orange-500',
    accentBg: 'bg-orange-600',
    accentHover: 'hover:bg-orange-500',
    accentLight: 'bg-orange-500/10',
    border: 'border-white/5',
    gradient: 'from-orange-400 to-red-600'
  },
  minimal: {
    id: 'minimal',
    name: 'Pure Black',
    bg: 'bg-black',
    surface: 'bg-white/5 backdrop-blur-md border-white/5',
    accent: 'text-white',
    accentBg: 'bg-white',
    accentHover: 'hover:bg-zinc-200',
    accentLight: 'bg-white/10',
    border: 'border-white/10',
    gradient: 'from-white to-zinc-500'
  }
};

// زر بتأثيرات حركية ناعمة
const BouncyButton = ({ children, onClick, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`transform transition-all duration-300 ease-out active:scale-95 hover:scale-105 active:rotate-1 ${className}`}
  >
    {children}
  </button>
);

const AppLogo = ({ theme }) => (
  <div className="relative flex items-center justify-center w-12 h-12 transition-transform duration-500 hover:rotate-12">
    <div className={`absolute inset-0 ${theme.accentBg} opacity-20 blur-2xl rounded-full animate-pulse`}></div>
    <div className="relative z-10 bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
      <Dumbbell className={`w-6 h-6 ${theme.accent}`} />
    </div>
  </div>
);

export default function App() {
  const [days, setDays] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMedia, setViewMedia] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(THEMES.apple); // Default to Apple theme
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null, title: '' });

  // States for updates
  const [updateAvailable, setUpdateAvailable] = useState(null);
  const [updateUrl, setUpdateUrl] = useState(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState('');

  const [newDayTitle, setNewDayTitle] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedDays = localStorage.getItem('gym_days');
    const savedExercises = localStorage.getItem('gym_exercises');
    const savedTheme = localStorage.getItem('gym_theme');

    if (savedDays) try { setDays(JSON.parse(savedDays)); } catch (e) { }
    if (savedExercises) try { setExercises(JSON.parse(savedExercises)); } catch (e) { }
    if (savedTheme && THEMES[savedTheme]) setCurrentTheme(THEMES[savedTheme]);

    initDB().catch(console.error);

    // Check for updates silently
    checkForUpdates();
  }, []);

  useEffect(() => {
    localStorage.setItem('gym_days', JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    localStorage.setItem('gym_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    if (!isAddingExercise) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewType(null);
      setSelectedFile(null);
      setNewExerciseName('');
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  }, [isAddingExercise]);

  const checkForUpdates = async (manual = false) => {
    if (GITHUB_CONFIG.USERNAME === 'YOUR_USERNAME') {
      if (manual) setLastCheckMessage('يرجى ضبط إعدادات GitHub في الكود');
      return;
    }

    setIsCheckingUpdate(true);
    setLastCheckMessage('');

    try {
      // Use GitHub Releases API to get the latest release and assets
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/releases/latest`);

      if (response.ok) {
        const releaseData = await response.json();
        const latestVersion = releaseData.tag_name.replace(/^v/, ''); // Remove 'v' prefix

        // Find the APK asset
        const apkAsset = releaseData.assets.find(asset => asset.name.endsWith('.apk'));
        // Use direct link if available, otherwise fallback to release page
        const downloadLink = apkAsset ? apkAsset.browser_download_url : releaseData.html_url;

        if (latestVersion !== APP_VERSION) {
          setUpdateAvailable(latestVersion);
          setUpdateUrl(downloadLink);
          if (manual) setLastCheckMessage(`تحديث جديد متوفر: v${latestVersion}`);
        } else {
          setUpdateAvailable(null);
          setUpdateUrl(null);
          if (manual) setLastCheckMessage('You are using the latest version');
        }
      } else {
        if (manual) setLastCheckMessage('فشل الاتصال بالمستودع');
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      if (manual) setLastCheckMessage('حدث خطأ في الاتصال');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const changeTheme = (themeKey) => {
    setCurrentTheme(THEMES[themeKey]);
    localStorage.setItem('gym_theme', themeKey);
    setIsSettingsOpen(false);
  };

  const handleAddDay = () => {
    if (!newDayTitle.trim()) return;
    const newDay = { id: Date.now().toString(), title: newDayTitle, createdAt: Date.now() };
    setDays([...days, newDay]);
    setNewDayTitle('');
    setIsAddingDay(false);
  };

  const executeDelete = async () => {
    if (deleteConfirm.type === 'day') {
      const dayExercises = exercises.filter(ex => ex.dayId === deleteConfirm.id);
      for (const ex of dayExercises) {
        if (ex.mediaId) await deleteMediaFromDB(ex.mediaId);
      }
      setDays(prev => prev.filter(d => d.id !== deleteConfirm.id));
      setExercises(prev => prev.filter(ex => ex.dayId !== deleteConfirm.id));
      if (selectedDay?.id === deleteConfirm.id) setSelectedDay(null);
    } else if (deleteConfirm.type === 'exercise') {
      const exercise = exercises.find(ex => ex.id === deleteConfirm.id);
      if (exercise?.mediaId) {
        await deleteMediaFromDB(exercise.mediaId);
      }
      setExercises(prev => prev.filter(ex => ex.id !== deleteConfirm.id));
    }
    setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' });
  };

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !selectedDay) return;
    setIsSaving(true);

    try {
      let mediaId = null;
      let mediaType = null;

      if (selectedFile) {
        mediaId = await saveMediaToDB(selectedFile);
        mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';
      }

      const newEx = {
        id: Date.now().toString(),
        name: newExerciseName,
        mediaId: mediaId,
        mediaType: mediaType,
        dayId: selectedDay.id,
        createdAt: Date.now()
      };

      setExercises(prev => [...prev, newEx]);
      setIsAddingExercise(false);
    } catch (error) {
      console.error("Failed to save media:", error);
      alert("حدث خطأ أثناء حفظ الملف. قد تكون المساحة ممتلئة أو الملف كبير جداً.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewType(file.type.startsWith('video') ? 'video' : 'image');
      setSelectedFile(file);
    }
  };

  const filteredExercises = exercises.filter(ex => ex.dayId === selectedDay?.id);

  return (
    <div className={`min-h-screen ${currentTheme.bg} text-white font-sans pb-10 transition-colors duration-700 selection:bg-white/20`} dir="rtl">

      {/* Update Notification - Apple Style Banner */}
      {updateAvailable && (
        <div className="mx-4 mt-4 bg-white/10 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-2xl flex items-center justify-between animate-in slide-in-from-top duration-700 ring-1 ring-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 animate-pulse">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-white">تحديث جديد {updateAvailable}</p>
              <p className="text-xs text-zinc-400 font-medium">إصدار أسرع وأكثر سلاسة</p>
            </div>
          </div>
          <BouncyButton
            onClick={() => window.open(updateUrl || `https://github.com/${GITHUB_CONFIG.USERNAME}/${GITHUB_CONFIG.REPO}/releases/latest`)}
            className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-white/10"
          >
            تحديث
          </BouncyButton>
        </div>
      )}

      {/* Header */}
      <header className={`p-6 sticky top-0 z-40 transition-all duration-500 ${updateAvailable ? 'pt-2' : ''}`}>
        <div className={`max-w-md mx-auto flex items-center justify-between ${currentTheme.surface} p-3 pl-4 pr-3 rounded-[2.5rem] shadow-2xl shadow-black/50 border ${currentTheme.border}`}>
          {selectedDay ? (
            <BouncyButton onClick={() => setSelectedDay(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white">
              <ArrowLeft className="w-5 h-5" />
            </BouncyButton>
          ) : (
            <AppLogo theme={currentTheme} />
          )}

          <h1 className="text-lg font-bold tracking-tight text-white/90">
            {selectedDay ? selectedDay.title : "المكتبة الرياضية"}
          </h1>

          <BouncyButton onClick={() => setIsSettingsOpen(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
            <Settings className="w-5 h-5" />
          </BouncyButton>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pb-24 space-y-6">
        {!selectedDay ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">أيام التمرين</h2>
              <BouncyButton
                onClick={() => setIsAddingDay(true)}
                className={`${currentTheme.accentBg} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg shadow-${currentTheme.accent.split('-')[1]}-500/30`}
              >
                <Plus className="w-6 h-6" />
              </BouncyButton>
            </div>

            <div className="grid gap-4">
              {days.map((day) => (
                <div
                  key={day.id}
                  onClick={() => setSelectedDay(day)}
                  className={`${currentTheme.surface} p-5 rounded-[2.2rem] flex items-center justify-between group cursor-pointer border ${currentTheme.border} hover:bg-white/10 transition-all duration-500`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 bg-gradient-to-br ${currentTheme.gradient} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl skew-x-[-3deg] group-hover:skew-x-0 transition-transform duration-500`}>
                      <span className="text-xl font-black">{day.title.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white mb-1 group-hover:translate-x-[-2px] transition-transform">{day.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium bg-white/5 px-2 py-1 rounded-lg w-fit">
                        <Activity className="w-3 h-3" />
                        {exercises.filter(ex => ex.dayId === day.id).length} تمارين
                      </div>
                    </div>
                  </div>
                  <BouncyButton
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, type: 'day', id: day.id, title: day.title }); }}
                    className="p-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </BouncyButton>
                </div>
              ))}
            </div>

            {days.length === 0 && !isAddingDay && (
              <div className="text-center py-20 opacity-50">
                <p className="text-zinc-500">لا توجد أيام مضافة</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between mb-8 px-2 animate-in fade-in slide-in-from-right duration-500">
            <div className="w-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">{selectedDay.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-zinc-500 text-xs font-medium">تمارين اليوم</p>
                  </div>
                </div>
                <BouncyButton
                  onClick={() => setIsAddingExercise(true)}
                  className="bg-white text-black px-5 py-3 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl shadow-white/5"
                >
                  <Plus className="w-4 h-4" /> تمرين
                </BouncyButton>
              </div>

              <div className="grid gap-5">

                {filteredExercises.map((ex) => (
                  <div
                    key={ex.id}
                    className={`${currentTheme.surface} rounded-[2rem] overflow-hidden border ${currentTheme.border} relative group shadow-2xl cursor-pointer hover:border-white/20 transition-all duration-500 hover:-translate-y-2`}
                    onClick={() => {
                      if (ex.mediaType === 'video' || ex.mediaId || ex.image) {
                        setViewMedia(ex);
                      }
                    }}
                  >
                    <div className="aspect-video bg-black/40 flex items-center justify-center overflow-hidden relative">
                      <MediaThumbnail mediaId={ex.mediaId} legacyImage={ex.image} alt={ex.name} className="w-full h-full transition-transform duration-1000 group-hover:scale-110" />

                      {/* Play Overlay */}
                      {(ex.mediaType === 'video' || (ex.mediaId && ex.mediaId.includes('video'))) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                            <PlayCircle className="w-6 h-6 fill-white text-transparent" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-5 relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-t ${currentTheme.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      <h4 className="font-bold text-lg text-white mb-1 relative z-10">{ex.name}</h4>
                      <p className="text-xs text-zinc-500 relative z-10">اضغط للمشاهدة</p>
                    </div>
                    <BouncyButton
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, type: 'exercise', id: ex.id, title: ex.name }); }}
                      className="absolute top-4 left-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-red-500 hover:bg-black/80 transition-all border border-white/10 z-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </BouncyButton>
                  </div>
                ))}

                {filteredExercises.length === 0 && (
                  <div className="py-24 text-center text-zinc-500 flex flex-col items-center justify-center h-[50vh]">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse border border-white/5">
                      <Dumbbell className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="text-xl font-bold text-zinc-600">القائمة فارغة</p>
                    <button onClick={() => setIsAddingExercise(true)} className="mt-4 text-blue-500 text-sm font-bold hover:underline">أضف تمريناً الآن</button>
                  </div>
                )}
              </div>
            </div>
        )}
          </main>

      {/* Full Screen Media Modal */}
        {viewMedia && (
          <div className="fixed inset-0 bg-black/95 z-[70] flex flex-col justify-center items-center p-4 animate-in fade-in duration-300 backdrop-blur-2xl">
            <BouncyButton
              onClick={() => setViewMedia(null)}
              className="absolute top-6 left-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 backdrop-blur-md border border-white/10"
            >
              <X className="w-6 h-6" />
            </BouncyButton>

            <h2 className="absolute top-8 text-xl font-bold text-white z-40 drop-shadow-lg px-6 py-2 bg-black/40 rounded-2xl backdrop-blur-md border border-white/10">{viewMedia.name}</h2>

            <div className="w-full max-w-5xl aspect-video rounded-[2rem] overflow-hidden shadow-2xl bg-black border border-white/10 relative animate-in zoom-in-95 duration-300">
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <MediaViewerFull mediaId={viewMedia.mediaId} legacyImage={viewMedia.image} />
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-3xl z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] p-8 border ${currentTheme.border} shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-white/10`}>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white">الإعدادات</h2>
                <BouncyButton onClick={() => setIsSettingsOpen(false)} className="bg-white/5 p-3 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white">
                  <X className="w-5 h-5" />
                </BouncyButton>
              </div>

              {/* Update Section */}
              <div className="mb-8 p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">التحديثات</span>
                  <span className="text-xs font-mono text-zinc-600 bg-white/5 px-2 py-1 rounded-lg">v{APP_VERSION}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold">حالة التحديث</p>
                    <p className="text-xs text-zinc-400 mt-1">{lastCheckMessage || "اضغط للفحص"}</p>
                  </div>
                  <BouncyButton
                    onClick={() => checkForUpdates(true)}
                    disabled={isCheckingUpdate}
                    className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
                    {isCheckingUpdate ? '...' : 'فحص'}
                  </BouncyButton>
                </div>
              </div>

              {/* Themes Grid */}
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 block">المظهر</span>
              <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(THEMES).map((key) => {
                  const theme = THEMES[key];
                  const isActive = currentTheme.id === theme.id;
                  return (
                    <button
                      key={key}
                      onClick={() => changeTheme(key)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 active:scale-95 ${isActive ? `border-blue-500/50 bg-blue-500/10` : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl ${theme.accentBg} flex items-center justify-center text-white shadow-lg`}>
                          <Palette className="w-5 h-5" />
                        </div>
                        <span className={`font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>{theme.name}</span>
                      </div>
                      {isActive && <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className={`${currentTheme.surface} w-full max-w-xs rounded-[2.5rem] p-8 border border-red-500/20 shadow-2xl text-center animate-in zoom-in-95 duration-300 ring-1 ring-red-500/10`}>
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 mx-auto animate-bounce border border-red-500/10">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-white">حذف؟</h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">سيتم حذف <span className="text-white font-bold">"{deleteConfirm.title}"</span> ولا يمكن استرجاعه.</p>
              <div className="flex flex-col gap-3">
                <BouncyButton onClick={executeDelete} className="w-full bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl font-black shadow-lg shadow-red-900/20">تأكيد الحذف</BouncyButton>
                <BouncyButton onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' })} className="w-full bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl font-bold border border-white/5">إلغاء</BouncyButton>
              </div>
            </div>
          </div>
        )}

        {/* Add Day Modal */}
        {isAddingDay && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] p-8 border ${currentTheme.border} shadow-2xl animate-in zoom-in-95 duration-300 ring-1 ring-white/10`}>
              <div className={`w-16 h-16 ${currentTheme.accentBg} rounded-[1.5rem] flex items-center justify-center mb-6 mx-auto shadow-lg shadow-${currentTheme.accent.split('-')[1]}-500/20`}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-center mb-6 text-white">يوم جديد</h2>
              <input
                autoFocus
                type="text"
                placeholder="مثلاً: يوم الصدر"
                className={`w-full bg-black/40 border ${currentTheme.border} rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent.split('-')[1]}-500 mb-6 text-center font-bold transition-all duration-300 shadow-inner`}
                value={newDayTitle}
                onChange={(e) => setNewDayTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddDay()}
              />
              <div className="flex gap-4">
                <BouncyButton onClick={handleAddDay} className={`flex-[2] ${currentTheme.accentBg} hover:opacity-90 text-white p-5 rounded-2xl font-black shadow-lg`}>حفظ</BouncyButton>
                <BouncyButton onClick={() => setIsAddingDay(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-5 rounded-2xl font-bold text-xs border border-white/5">إلغاء</BouncyButton>
              </div>
            </div>
          </div>
        )}

        {/* Manual Add Exercise Modal with Video Support */}
        {isAddingExercise && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
            <div className={`${currentTheme.surface} w-full max-w-sm rounded-[2.5rem] border ${currentTheme.border} shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar ring-1 ring-white/10 relative`}>
              <BouncyButton
                onClick={() => setIsAddingExercise(false)}
                className="absolute top-4 left-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white border border-white/5"
              >
                <X className="w-4 h-4" />
              </BouncyButton>

              <div className="p-8 pb-2 text-center sticky top-0 bg-transparent z-10">
                <h2 className="text-2xl font-black text-white">إضافة تمرين</h2>
                <p className="text-zinc-500 text-xs mt-1 font-medium">اختر اسماً وصورة/فيديو</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 ${currentTheme.border} border-dashed rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all duration-500 relative overflow-hidden bg-black/20 group hover:border-white/20 hover:shadow-2xl`}>
                    {previewUrl ? (
                      <>
                        {previewType === 'video' ? (
                          <video src={previewUrl} className="w-full h-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-60" autoPlay muted loop playsInline />
                        ) : (
                          <img src={previewUrl} className="w-full h-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-60" alt="Preview" />
                        )}

                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                          <span className="text-sm font-bold text-white flex items-center gap-2 px-6 py-3 bg-white/10 rounded-2xl border border-white/10 shadow-xl"><Edit3 className="w-4 h-4" /> تغيير</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 transform transition-transform duration-500 group-hover:scale-110">
                        <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 get-started-glow border border-white/5">
                          <Upload className={`w-8 h-8 text-white/50 group-hover:text-white transition-colors`} />
                        </div>
                        <p className="text-sm text-zinc-400 font-bold mb-1">اضغط للرفع</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="اسم التمرين"
                    className={`w-full bg-black/40 border ${currentTheme.border} rounded-2xl p-5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-${currentTheme.accent.split('-')[1]}-500 font-bold text-center transition-all duration-300 shadow-inner`}
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                  />

                  <BouncyButton
                    onClick={handleAddExercise}
                    disabled={!newExerciseName.trim() || isSaving}
                    className={`w-full ${currentTheme.accentBg} hover:opacity-90 text-white p-5 rounded-2xl font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : "حفظ التمرين"}
                  </BouncyButton>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

const MediaViewerFull = ({ mediaId, legacyImage }) => {
  const [src, setSrc] = useState(legacyImage || null);
  const [type, setType] = useState(legacyImage ? 'image' : null);

  useEffect(() => {
    let isActive = true;
    let objectUrl = null;

    if (mediaId) {
      getMediaFromDB(mediaId).then((file) => {
        if (isActive && file) {
          objectUrl = URL.createObjectURL(file);
          setSrc(objectUrl);
          setType(file.type.startsWith('video') ? 'video' : 'image');
        }
      });
    }
    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId]);

  if (!src) return <div className="text-white flex items-center gap-2"><Activity className="animate-spin w-5 h-5" /> جاري التحميل...</div>;

  if (type === 'video') {
    return <video src={src} controls autoPlay loop playsInline className="w-full h-full object-contain" />;
  }
  return <img src={src} className="w-full h-full object-contain" alt="Full view" />;
};
