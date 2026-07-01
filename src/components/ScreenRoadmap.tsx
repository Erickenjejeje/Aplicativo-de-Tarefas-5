import {
  ArrowLeft,
  Clock,
  History,
  GraduationCap,
  Search,
  ChevronRight,
  ChevronLeft,
  Target,
  Timer,
  ListTodo,
  Lightbulb,
  ClipboardList,
  Calendar,
  BookOpen,
  Plus,
  X,
  Trash2,
  Edit2,
  Check,
  Copy,
  Home,
  CalendarDays,
  Focus,
  MessageCircle,
  User,
  Bell,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScreenTaskHistory } from "./ScreenTaskHistory";
import { useTasks } from "../hooks/useTasks";
import { useProfile } from "../hooks/useProfile";

const AUDIO_URL = "https://files.catbox.moe/jdkqtg.mp3";
let sharedAudioBuffer: AudioBuffer | null = null;
let sharedAudioContext: AudioContext | null = null;

const preloadAudio = async () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    sharedAudioContext = new AudioContextClass();
    
    const response = await fetch(AUDIO_URL);
    const arrayBuffer = await response.arrayBuffer();
    sharedAudioBuffer = await sharedAudioContext.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error("Failed to preload audio:", err);
  }
};

preloadAudio();

export function ScreenRoadmap({ onBack, onNavigate }: { onBack: () => void, onNavigate?: (tab: 'roadmap' | 'home' | 'ai' | 'profile' | 'focus' | 'notifications') => void }) {
  const playPopSound = () => {
    if (!sharedAudioContext || !sharedAudioBuffer) return;
    
    try {
      if (sharedAudioContext.state === 'suspended') {
        sharedAudioContext.resume();
      }
      const source = sharedAudioContext.createBufferSource();
      source.buffer = sharedAudioBuffer;
      
      const gainNode = sharedAudioContext.createGain();
      gainNode.gain.value = 1.5; // Increase volume by 1.5x
      
      source.connect(gainNode);
      gainNode.connect(sharedAudioContext.destination);
      source.start(0);
    } catch (e) {
      console.error("Audio play error", e);
    }
  };

  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 to 6

  const weekDates = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDayOfWeek + index);
    return date;
  });

  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { user } = useProfile();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isEffortDropdownOpen, setIsEffortDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [endMode, setEndMode] = useState<"end_time" | "duration">("end_time");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (selectedTask) {
      const interval = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTask]);

  const [fillingTaskIds, setFillingTaskIds] = useState<string[]>([]);
  const [slidingTaskIds, setSlidingTaskIds] = useState<string[]>([]);
  const [collapsingTaskIds, setCollapsingTaskIds] = useState<string[]>([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    durationStr: "",
    duration: "",
    priority: "",
    category: "",
    date: "",
    effort: "",
    location: "",
    reminderEnabled: false,
    reminderTime: "No horário da tarefa",
    reminderCustomMinutes: "",
    subtasks: [] as { title: string; description: string }[],
  });

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    let style = "light";

    // Convert durationStr to minutes for backwards compatibility, or just store it.
    // We will just store the new fields in the task object.
    
    // Calculate duration in minutes if possible
    let parsedDuration = 30;
    if (endMode === "duration" && newTask.duration) {
       parsedDuration = parseInt(newTask.duration) || 30; 
    }

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: newTask.title,
        description: newTask.description,
        startTime: newTask.startTime || "12:00",
        endTime: newTask.endTime || "",
        durationStr: newTask.durationStr || "",
        duration: parsedDuration,
        style,
        priority: (newTask.priority || "Média") as any,
        category: newTask.category || "Trabalho",
        date: newTask.date,
        effort: newTask.effort || "Média",
        location: newTask.location,
        reminderEnabled: newTask.reminderEnabled,
        reminderTime: newTask.reminderTime,
        reminderCustomMinutes: newTask.reminderCustomMinutes,
        subtasks: newTask.subtasks,
      });
      setEditingTaskId(null);
    } else {
      addTask({
        title: newTask.title,
        description: newTask.description,
        startTime: newTask.startTime || "12:00",
        endTime: newTask.endTime || "",
        durationStr: newTask.durationStr || "",
        duration: parsedDuration,
        style,
        priority: (newTask.priority || "Média") as any,
        category: newTask.category || "Trabalho",
        date: newTask.date,
        effort: newTask.effort || "Média",
        location: newTask.location,
        reminderEnabled: newTask.reminderEnabled,
        reminderTime: newTask.reminderTime,
        reminderCustomMinutes: newTask.reminderCustomMinutes,
        subtasks: newTask.subtasks,
      });
    }

    setNewTask({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      durationStr: "",
      duration: "",
      priority: "",
      category: "",
      date: "",
      effort: "",
      location: "",
      reminderEnabled: false,
      reminderTime: "No horário da tarefa",
      reminderCustomMinutes: "",
      subtasks: [],
    });
    setIsAddingTask(false);
  };

  const calculateEndTime = (start: string, durationMin: number, endTime?: string) => {
    if (endTime) return endTime;
    if (!start) return "";
    try {
      const [hours, minutes] = start.split(":").map(Number);
      const date = new Date(2000, 0, 1, hours, minutes + (durationMin || 0));
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    } catch (e) {
      return "";
    }
  };

  if (isHistoryOpen) {
    return <ScreenTaskHistory onBack={() => setIsHistoryOpen(false)} />;
  }

  const filteredTasks = tasks.filter(
    (task) =>
      !task.completed &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       task.description.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="w-full h-full bg-[#1f1f1f] relative font-sans overflow-hidden flex flex-col">
      <div className="flex-1 w-full flex flex-col relative z-0 min-h-0">
        {/* Header */}
        <div className="w-full pt-4 px-4 flex items-center justify-between z-20 shrink-0 h-[80px] relative bg-[#1f1f1f] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-b border-white/[0.04]">
          {/* Default state elements (Title and History) */}
          <div className={`flex items-center justify-between w-full transition-all duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <h1 className="text-white text-[20px] font-bold leading-tight tracking-tight mt-1">
              Entrada de Tarefas
            </h1>
            <div className="flex items-center gap-0">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center transform hover:scale-105 transition-transform bg-transparent mt-1"
              >
                <Search className="w-5 h-5 text-[#aaaaaa]" />
              </button>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="w-[42px] h-[42px] shrink-0 rounded-full flex items-center justify-center transform hover:scale-105 transition-transform bg-transparent mt-1"
              >
                <History className="w-5 h-5 text-[#aaaaaa]" />
              </button>
            </div>
          </div>

          {/* Expanded Search State */}
          <div className="absolute inset-0 top-4 flex items-center justify-end px-4 pointer-events-none">
            <div className={`flex items-center h-[42px] border border-[#aaaaaa]/20 bg-[#303030] shadow-sm rounded-full transition-all duration-300 ease-out overflow-hidden mt-1 ${isSearchOpen ? 'w-full opacity-100 pointer-events-auto px-2 mr-0' : 'w-[42px] opacity-0 pointer-events-none px-0 mr-[42px]'}`}>
              <Search className="w-5 h-5 text-[#aaaaaa] shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-[15px] font-medium placeholder-[#aaaaaa]/50 text-[#aaaaaa] h-full flex-1 px-3 min-w-0"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="shrink-0 flex items-center justify-center w-8 h-8 outline-none hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-[#aaaaaa]/70" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-0 pt-2 pb-48 relative z-10">
          {filteredTasks.length === 0 && isSearchOpen && (
            <div className="text-center text-[13px] font-medium text-gray-500 py-6 px-6">
              Nenhuma tarefa encontrada.
            </div>
          )}
          {filteredTasks.map((task) => {
            let bgColor = "bg-[#272727]";
            let hoverColor = "hover:opacity-90";
            let textColor = "text-white";
            let descColor = "text-white/70";
            let buttonBg = "bg-white/20";

            return (
              <div
                key={task.id}
                className={`transition-all duration-500 ease-in-out px-4 ${collapsingTaskIds.includes(task.id) ? 'max-h-0 opacity-0 mb-0 overflow-hidden' : 'max-h-[150px] opacity-100 mb-2.5'}`}
              >
                <div
                  onClick={() => setSelectedTask(task)}
                  className={`${bgColor} rounded-[28px] py-4 pl-4 pr-5 flex items-start justify-start shadow-sm cursor-pointer ${hoverColor} transition-all duration-300 ease-out flex-shrink-0 ${slidingTaskIds.includes(task.id) ? 'opacity-0 translate-x-[150%] scale-95' : 'opacity-100 translate-x-0 scale-100'}`}
                >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fillingTaskIds.includes(task.id) || slidingTaskIds.includes(task.id) || collapsingTaskIds.includes(task.id)) return;
                    
                    playPopSound();
                    
                    setFillingTaskIds(prev => [...prev, task.id]);
                    setTimeout(() => {
                        setSlidingTaskIds(prev => [...prev, task.id]);
                        setTimeout(() => {
                            setCollapsingTaskIds(prev => [...prev, task.id]);
                            setTimeout(() => {
                                updateTask(task.id, { completed: true, completedAt: new Date().toISOString() });
                                setFillingTaskIds(prev => prev.filter(t => t !== task.id));
                                setSlidingTaskIds(prev => prev.filter(t => t !== task.id));
                                setCollapsingTaskIds(prev => prev.filter(t => t !== task.id));
                            }, 500);
                        }, 250);
                    }, 250);
                  }}
                  className={`w-[22px] h-[22px] rounded-full border ${fillingTaskIds.includes(task.id) || slidingTaskIds.includes(task.id) ? 'bg-white border-white' : 'border-[#F0F0F0] hover:bg-white/20'} flex items-center justify-center shrink-0 mr-3 transition-all duration-300 group`}
                >
                  <Check className={`w-3.5 h-3.5 ${fillingTaskIds.includes(task.id) || slidingTaskIds.includes(task.id) ? 'text-gray-900 opacity-100 scale-100' : 'text-white opacity-0 scale-50 group-hover:opacity-50'} transition-all duration-300`} />
                </button>
                  <div className="flex flex-col justify-start flex-1 min-w-0">
                    <p
                      className={`${textColor} font-semibold text-[15px] leading-[22px] line-clamp-3 w-full break-words whitespace-normal`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 z-[100] flex flex-col justify-end overflow-hidden"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ 
                y: (isTimePickerOpen || isEndPickerOpen || isDatePickerOpen || isPriorityDropdownOpen || isEffortDropdownOpen || isCategoryDropdownOpen || isReminderDropdownOpen) ? "100%" : 0,
                transition: { type: "spring", damping: 24, stiffness: 200 }
              }}
              exit={{ 
                y: "100%",
                transition: { type: "spring", damping: 24, stiffness: 200 }
              }}
              className="bg-[#272727] w-full max-h-[90vh] rounded-t-[40px] p-6 pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] flex flex-col gap-4 relative"
            >
              {/* Extra background block to prevent detachment during the spring bounce */}
              <div className="absolute top-[98%] left-0 right-0 h-[100px] bg-[#272727] pointer-events-none" />
              
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white">{editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
              <button
                onClick={() => { setIsAddingTask(false); setEditingTaskId(null); }}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] -m-2 p-2 pb-4 flex flex-col gap-4 no-scrollbar">
              <input
                type="text"
                placeholder="Título da Tarefa"
                className="w-full shrink-0 bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] focus:outline-none focus:border-[#ff3838] placeholder-gray-400"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              <textarea
                placeholder="Descrição completa..."
                className="w-full shrink-0 bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] h-[100px] resize-none focus:outline-none focus:border-[#ff3838] placeholder-gray-400"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />

              <div className="flex gap-4 shrink-0">
                <div className="flex-1 relative">
                  <button 
                     onClick={() => {
                        setIsTimePickerOpen(!isTimePickerOpen);
                        setIsEndPickerOpen(false);
                        setIsDatePickerOpen(false);
                        setIsPriorityDropdownOpen(false);
                        setIsEffortDropdownOpen(false);
                        setIsCategoryDropdownOpen(false);
                        setIsReminderDropdownOpen(false);
                     }}
                     className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] outline-none text-left relative flex justify-between items-center"
                  >
                     <span>{newTask.startTime ? `Início: ${newTask.startTime}` : <span className="text-gray-400">Horário de Início</span>}</span>
                     <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isTimePickerOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <button 
                     onClick={() => {
                        setIsEndPickerOpen(!isEndPickerOpen);
                        setIsTimePickerOpen(false);
                        setIsDatePickerOpen(false);
                        setIsPriorityDropdownOpen(false);
                        setIsEffortDropdownOpen(false);
                        setIsCategoryDropdownOpen(false);
                        setIsReminderDropdownOpen(false);
                     }}
                     className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] outline-none text-left relative flex justify-between items-center"
                  >
                     <span>{newTask.endTime ? `Fim: ${newTask.endTime}` : newTask.durationStr ? `Duração: ${newTask.durationStr}` : <span className="text-gray-400">Prazo / Duração</span>}</span>
                     <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isEndPickerOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 shrink-0">
                <div className="flex-1 relative">
                  <button 
                     onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen);
                        setIsTimePickerOpen(false);
                        setIsEndPickerOpen(false);
                        setIsPriorityDropdownOpen(false);
                        setIsEffortDropdownOpen(false);
                        setIsCategoryDropdownOpen(false);
                        setIsReminderDropdownOpen(false);
                     }}
                     className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] outline-none text-left relative flex justify-between items-center"
                  >
                     <span>{newTask.date ? new Date(newTask.date + 'T12:00:00').toLocaleDateString('pt-BR') : <span className="text-gray-400">Data da Tarefa</span>}</span>
                     <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isDatePickerOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 shrink-0">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Local de realização da tarefa"
                    className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 text-[14px] text-[#e8e8e9] outline-none focus:border-[#ff3838] placeholder-gray-400"
                    value={newTask.location}
                    onChange={(e) =>
                      setNewTask({ ...newTask, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <div className="w-full bg-[#3f3f3f] rounded-[20px] px-5 py-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[14px] ${newTask.reminderEnabled ? 'text-white' : 'text-gray-400'}`}>Lembrete</span>
                    <button 
                      onClick={() => {
                        if (!newTask.reminderEnabled) {
                          if ("Notification" in window && Notification.permission !== "granted") {
                            Notification.requestPermission();
                          }
                        }
                        setNewTask({...newTask, reminderEnabled: !newTask.reminderEnabled});
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors ${newTask.reminderEnabled ? 'bg-[#ff3838]' : 'bg-[#555]'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${newTask.reminderEnabled ? 'left-[26px]' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  {newTask.reminderEnabled && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setIsReminderDropdownOpen(!isReminderDropdownOpen);
                          setIsPriorityDropdownOpen(false);
                          setIsEffortDropdownOpen(false);
                          setIsCategoryDropdownOpen(false);
                          setIsTimePickerOpen(false);
                          setIsEndPickerOpen(false);
                          setIsDatePickerOpen(false);
                        }}
                        className="w-full bg-[#272727] rounded-[16px] px-4 py-3 flex justify-between items-center text-[13px] text-[#e8e8e9]"
                      >
                        <span>{newTask.reminderTime === 'Personalizado' && newTask.reminderCustomMinutes ? `${newTask.reminderCustomMinutes} minutos antes` : newTask.reminderTime}</span>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isReminderDropdownOpen ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 shrink-0">
                <div className="flex-1 relative">
                  <button
                    onClick={() => {
                      setIsPriorityDropdownOpen(!isPriorityDropdownOpen);
                      setIsEffortDropdownOpen(false);
                      setIsCategoryDropdownOpen(false);
                      setIsTimePickerOpen(false);
                      setIsEndPickerOpen(false);
                      setIsDatePickerOpen(false);
                      setIsReminderDropdownOpen(false);
                    }}
                    className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 flex items-center justify-between outline-none"
                  >
                    <span className="text-[14px] text-[#e8e8e9]">
                      {newTask.priority || <span className="text-gray-400">Prioridade</span>}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${isPriorityDropdownOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <button
                    onClick={() => {
                      setIsEffortDropdownOpen(!isEffortDropdownOpen);
                      setIsPriorityDropdownOpen(false);
                      setIsCategoryDropdownOpen(false);
                      setIsTimePickerOpen(false);
                      setIsEndPickerOpen(false);
                      setIsDatePickerOpen(false);
                      setIsReminderDropdownOpen(false);
                    }}
                    className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 flex items-center justify-between outline-none"
                  >
                    <span className="text-[14px] text-[#e8e8e9]">
                      {newTask.effort ? (newTask.effort === "Baixa" ? "Baixo" : newTask.effort === "Média" ? "Médio" : "Alto") : <span className="text-gray-400">Esforço</span>}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${isEffortDropdownOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
              </div>

              <div className="shrink-0 mb-2">
                <div className="relative w-full">
                  <button
                    onClick={() => {
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                      setIsPriorityDropdownOpen(false);
                      setIsEffortDropdownOpen(false);
                      setIsTimePickerOpen(false);
                      setIsEndPickerOpen(false);
                      setIsDatePickerOpen(false);
                      setIsReminderDropdownOpen(false);
                    }}
                    className="w-full bg-[#3f3f3f] border border-transparent rounded-[20px] px-5 py-4 flex items-center justify-between outline-none"
                  >
                    <span className="text-[14px] text-[#e8e8e9]">
                      {newTask.category || <span className="text-gray-400">Categoria</span>}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={handleAddTask}
              disabled={!newTask.title.trim()}
              className="w-full text-white rounded-[24px] py-4 mt-2 font-bold text-[14px] shadow-lg active:scale-[0.98] transition disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed bg-[#ff3838] hover:bg-[#e03131]"
            >
              {editingTaskId ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </motion.div>

          {/* Bottom Sheets for Pickers */}
          <AnimatePresence>
            {isTimePickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] pt-6 px-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Horário de Início</h3>
                  <button onClick={() => setIsTimePickerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 h-[344px] relative overflow-hidden">
                  <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                    <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">HORAS</div>
                    {Array.from({length: 24}).map((_, i) => (
                      <button 
                        key={`h-${i}`} 
                        onClick={() => {
                          const h = i.toString().padStart(2, '0');
                          const m = newTask.startTime ? newTask.startTime.split(':')[1] : '00';
                          setNewTask({...newTask, startTime: `${h}:${m}`});
                        }}
                        className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${newTask.startTime?.startsWith(i.toString().padStart(2, '0') + ':') ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                    <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">MINUTOS</div>
                    {Array.from({length: 60}).map((_, i) => (
                      <button 
                        key={`m-${i}`} 
                        onClick={() => {
                          const m = i.toString().padStart(2, '0');
                          const h = newTask.startTime ? newTask.startTime.split(':')[0] : '12';
                          setNewTask({...newTask, startTime: `${h}:${m}`});
                          setIsTimePickerOpen(false);
                        }}
                        className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${newTask.startTime?.endsWith(':' + i.toString().padStart(2, '0')) ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                      >
                        {i.toString().padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  {/* Fade out top border */}
                  <div className="absolute top-[32px] left-0 w-full h-14 bg-gradient-to-b from-[#272727] to-transparent pointer-events-none z-20" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isEndPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] pt-6 px-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Prazo ou Duração</h3>
                  <button onClick={() => setIsEndPickerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-[#3f3f3f] rounded-[16px]">
                  <button 
                    onClick={() => setEndMode('end_time')}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-[14px] transition-colors ${endMode === 'end_time' ? 'bg-[#272727] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Prazo Final
                  </button>
                  <button 
                    onClick={() => setEndMode('duration')}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-[14px] transition-colors ${endMode === 'duration' ? 'bg-[#272727] text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                  >
                    Duração
                  </button>
                </div>

                {endMode === 'end_time' ? (
                  <div className="grid grid-cols-2 gap-4 h-[280px] relative overflow-hidden">
                    <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                      <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">HORAS</div>
                      {Array.from({length: 24}).map((_, i) => {
                        const h = i.toString().padStart(2, '0');
                        return (
                        <button 
                          key={`eh-${i}`} 
                          onClick={() => {
                            const m = newTask.endTime ? newTask.endTime.split(':')[1] : '00';
                            setNewTask({...newTask, endTime: `${h}:${m}`, duration: "", durationStr: ""});
                          }}
                          className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${newTask.endTime?.startsWith(h + ':') ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                        >
                          {h}
                        </button>
                      )})}
                    </div>
                    <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                      <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">MINUTOS</div>
                      {Array.from({length: 60}).map((_, i) => {
                        const m = i.toString().padStart(2, '0');
                        return (
                        <button 
                          key={`em-${i}`} 
                          onClick={() => {
                            const h = newTask.endTime ? newTask.endTime.split(':')[0] : '12';
                            setNewTask({...newTask, endTime: `${h}:${m}`, duration: "", durationStr: ""});
                            setIsEndPickerOpen(false);
                          }}
                          className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${newTask.endTime?.endsWith(':' + m) ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                        >
                          {m}
                        </button>
                      )})}
                    </div>
                    {/* Fade out top border */}
                    <div className="absolute top-[32px] left-0 w-full h-14 bg-gradient-to-b from-[#272727] to-transparent pointer-events-none z-20" />
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col">
                    <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden relative">
                      <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                        <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">HORAS</div>
                        {Array.from({length: 24}).map((_, i) => {
                          const currentDur = parseInt(newTask.duration || "0");
                          const hasDuration = newTask.duration !== "";
                          const durH = Math.floor(currentDur / 60);
                          const durM = currentDur % 60;
                          return (
                          <button 
                            key={`dh-${i}`} 
                            onClick={() => {
                              const newDur = i * 60 + durM;
                              setNewTask({...newTask, endTime: "", duration: newDur.toString(), durationStr: i > 0 ? (durM > 0 ? `${i}h ${durM}m` : `${i}h`) : `${durM}m`});
                            }}
                            className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${hasDuration && durH === i ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                          >
                            {i}
                          </button>
                        )})}
                      </div>
                      <div className="overflow-y-auto overscroll-none no-scrollbar flex flex-col items-center gap-2 pb-10 h-full">
                        <div className="text-[11px] text-gray-400 font-bold mb-2 sticky top-0 bg-[#272727] w-full text-center py-2 z-10">MINUTOS</div>
                        {Array.from({length: 60}).map((_, i) => {
                          const currentDur = parseInt(newTask.duration || "0");
                          const hasDuration = newTask.duration !== "";
                          const durH = Math.floor(currentDur / 60);
                          const durM = currentDur % 60;
                          return (
                          <button 
                            key={`dm-${i}`} 
                            onClick={() => {
                              const newDur = durH * 60 + i;
                              setNewTask({...newTask, endTime: "", duration: newDur.toString(), durationStr: durH > 0 ? (i > 0 ? `${durH}h ${i}m` : `${durH}h`) : `${i}m`});
                              setIsEndPickerOpen(false);
                            }}
                            className={`w-full py-3 rounded-[16px] text-[16px] font-bold transition-colors ${hasDuration && durM === i ? 'bg-[#ff3838] text-white' : 'bg-[#3f3f3f] text-[#e8e8e9] hover:bg-[#4f4f4f]'}`}
                          >
                            {i}
                          </button>
                        )})}
                      </div>
                      {/* Fade out top border */}
                      <div className="absolute top-[32px] left-0 w-full h-14 bg-gradient-to-b from-[#272727] to-transparent pointer-events-none z-20" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {isDatePickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] p-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Data da Tarefa</h3>
                  <button onClick={() => setIsDatePickerOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="bg-[#3f3f3f] rounded-[24px] p-5">
                  <div className="flex justify-between items-center mb-6">
                      <button onClick={() => {
                          if (currentMonth === 0) {
                              setCurrentMonth(11);
                              setCurrentYear(currentYear - 1);
                          } else {
                              setCurrentMonth(currentMonth - 1);
                          }
                      }} className="p-2 bg-[#4f4f4f] hover:bg-[#5a5a5a] rounded-xl transition-colors text-white"><ChevronLeft className="w-5 h-5" /></button>
                      <div className="text-[16px] font-bold text-[#e8e8e9] capitalize">
                          {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}
                      </div>
                      <button onClick={() => {
                          if (currentMonth === 11) {
                              setCurrentMonth(0);
                              setCurrentYear(currentYear + 1);
                          } else {
                              setCurrentMonth(currentMonth + 1);
                          }
                      }} className="p-2 bg-[#4f4f4f] hover:bg-[#5a5a5a] rounded-xl transition-colors text-white"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center mb-3">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <div key={`dow-${i}`} className="text-[12px] font-bold text-gray-400">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                      {Array.from({length: new Date(currentYear, currentMonth, 1).getDay()}).map((_, i) => <div key={`empty-${i}`} />)}
                      {Array.from({length: new Date(currentYear, currentMonth + 1, 0).getDate()}).map((_, i) => {
                          const day = i + 1;
                          const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                          const isSelected = newTask.date === dateStr;
                          return (
                              <button 
                                  key={day}
                                  onClick={() => {
                                      setNewTask({...newTask, date: dateStr});
                                      setIsDatePickerOpen(false);
                                  }}
                                  className={`aspect-square rounded-[14px] text-[14px] font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-[#ff3838] text-white shadow-md scale-105' : 'text-[#e8e8e9] bg-[#4f4f4f] hover:bg-[#5a5a5a]'}`}
                              >
                                  {day}
                              </button>
                          )
                      })}
                  </div>
                </div>
              </motion.div>
            )}

            {isReminderDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] p-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Lembrete</h3>
                  <button onClick={() => setIsReminderDropdownOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="flex flex-col gap-3 pb-4">
                  {[
                    "No horário da tarefa",
                    "1 minuto antes",
                    "5 minutos antes",
                    "10 minutos antes",
                    "Personalizado"
                  ].map((opt) => (
                    <div key={opt} className="flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setNewTask({ ...newTask, reminderTime: opt });
                          if (opt !== "Personalizado") {
                            setIsReminderDropdownOpen(false);
                          }
                        }}
                        className={`flex items-center justify-between w-full px-5 py-4 rounded-[20px] transition-all ${newTask.reminderTime === opt ? "bg-[#ff3838] text-white" : "bg-[#3f3f3f] text-[#e8e8e9] border border-transparent hover:bg-[#4f4f4f]"}`}
                      >
                        <span className="text-[15px] font-bold">{opt}</span>
                        {newTask.reminderTime === opt && <Check className="w-5 h-5 text-white" />}
                      </button>
                      
                      {opt === "Personalizado" && newTask.reminderTime === "Personalizado" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="w-full mt-2"
                        >
                          <div className="flex gap-3 items-center w-full">
                            <input 
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Digite os minutos"
                              value={newTask.reminderCustomMinutes}
                              onChange={(e) => setNewTask({...newTask, reminderCustomMinutes: e.target.value.replace(/[^0-9]/g, '')})}
                              className="flex-1 bg-[#3f3f3f] text-[#e8e8e9] placeholder-gray-400 px-5 py-4 rounded-[20px] outline-none focus:border-[#ff3838] border border-transparent font-bold text-[14px]"
                            />
                            <button
                               onClick={() => setIsReminderDropdownOpen(false)}
                               disabled={!newTask.reminderCustomMinutes}
                               className="px-6 py-4 rounded-[20px] font-bold text-[14px] transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed text-white bg-[#ff3838] hover:bg-[#e03131]"
                            >
                               Salvar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {isPriorityDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] p-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Prioridade</h3>
                  <button onClick={() => setIsPriorityDropdownOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    "Baixa",
                    "Média",
                    "Alta"
                  ].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setNewTask({ ...newTask, priority: opt });
                        setIsPriorityDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-5 py-4 rounded-[20px] transition-all ${newTask.priority === opt ? "bg-[#ff3838] text-white" : "bg-[#3f3f3f] text-[#e8e8e9] border border-transparent hover:bg-[#4f4f4f]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-bold">
                          {opt}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isEffortDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] p-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Nível de Esforço</h3>
                  <button onClick={() => setIsEffortDropdownOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { value: "Baixa", label: "Baixo" },
                    { value: "Média", label: "Médio" },
                    { value: "Alta", label: "Alto" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setNewTask({ ...newTask, effort: opt.value });
                        setIsEffortDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-5 py-4 rounded-[20px] transition-all ${newTask.effort === opt.value ? "bg-[#ff3838] text-white" : "bg-[#3f3f3f] text-[#e8e8e9] border border-transparent hover:bg-[#4f4f4f]"}`}
                    >
                      <span className="text-[15px] font-bold">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {isCategoryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 w-full bg-[#272727] shadow-[0_-20px_40px_rgba(0,0,0,0.5)] rounded-t-[30px] p-6 z-[110] border-t border-[#4f4f4f]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold text-[16px]">Categoria</h3>
                  <button onClick={() => setIsCategoryDropdownOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3f3f3f] text-gray-400 hover:text-white">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {["Trabalho", "Estudos", "Pessoal"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setNewTask({ ...newTask, category: opt as "Trabalho" | "Estudos" | "Pessoal" });
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-5 py-4 rounded-[20px] transition-all ${newTask.category === opt ? "bg-[#ff3838] text-white" : "bg-[#3f3f3f] text-[#e8e8e9] border border-transparent hover:bg-[#4f4f4f]"}`}
                    >
                      <span className="text-[15px] font-bold">
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
        )}
      </AnimatePresence>

      {/* View Task Details Modal */}
      {selectedTask && (() => {
        let taskStatusText = "";
        let taskStatusColor = "";

        const isCompleted = selectedTask.completed;
        const [tYear, tMonth, tDay] = (selectedTask.date || "").split('-').map(Number);
        const startH = parseInt((selectedTask.startTime || "00:00").split(':')[0] || '0');
        const startM = parseInt((selectedTask.startTime || "00:00").split(':')[1] || '0');
        const durH = Math.floor((selectedTask.duration || 0) / 60);
        const durM = (selectedTask.duration || 0) % 60;
        const endH = startH + durH + Math.floor((startM + durM) / 60);
        const endM = (startM + durM) % 60;
        
        let startDateTime = new Date();
        let endDateTime = new Date();
        if (tYear) {
          startDateTime = new Date(tYear, tMonth - 1, tDay, startH, startM);
          endDateTime = new Date(tYear, tMonth - 1, tDay, endH, endM);
        }

        if (isCompleted) {
          taskStatusText = "Concluída";
          taskStatusColor = "bg-green-500 text-white";
        } else if (now < startDateTime) {
          taskStatusText = "Não iniciada";
          taskStatusColor = "bg-slate-200 text-slate-700";
        } else if (now >= startDateTime && now < endDateTime) {
          taskStatusText = "Em andamento";
          taskStatusColor = "bg-[#151515] text-white";
        } else {
          taskStatusText = "Encerrada";
          taskStatusColor = "bg-red-100 text-red-600";
        }

        return (
        <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col justify-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-[40px] p-6 pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] flex flex-col gap-5 relative animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-[22px] font-bold text-gray-900 leading-tight mb-5 pr-2">
                  {selectedTask.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />{" "}
                    {selectedTask.startTime} •{" "}
                    {calculateEndTime(
                      selectedTask.startTime,
                      selectedTask.duration,
                      selectedTask.endTime
                    )}
                  </span>
                  {(selectedTask.durationStr || selectedTask.duration > 0) && (
                    <span className="bg-[#ff3838]/20 text-[#ff3838] px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm">
                      {selectedTask.durationStr || `${selectedTask.duration} min`}
                    </span>
                  )}
                  <span className={`${taskStatusColor} px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm`}>
                    {taskStatusText}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0 hover:bg-gray-200 transition"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto no-scrollbar -mx-2 px-2 flex flex-col gap-5 pb-2">
              <div className="bg-[#F4F5F9] rounded-[24px] p-5 border border-gray-100 min-h-[120px] shrink-0">
                <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  Descrição
                </h4>
                <p className="text-[14px] text-gray-800 leading-relaxed font-medium overflow-y-auto max-h-[100px] no-scrollbar">
                  {selectedTask.description ||
                    "Nenhuma descrição detalhada fornecida para esta tarefa."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0">
                {selectedTask.date && (
                  <div className="bg-gray-50 rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Data
                    </span>
                    <span className="text-[13px] font-bold text-gray-900">
                      {selectedTask.date}
                    </span>
                  </div>
                )}
                {selectedTask.location && (
                  <div className="bg-gray-50 rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Local
                    </span>
                    <span className="text-[13px] font-bold text-gray-900 truncate w-full px-2">
                      {selectedTask.location}
                    </span>
                  </div>
                )}
                {selectedTask.priority && (
                  <div className="bg-gray-50 rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Prioridade
                    </span>
                    <span
                      className={`text-[13px] font-bold ${selectedTask.priority === "Alta" ? "text-[#784DBE]" : selectedTask.priority === "Média" ? "text-[#5175D2]" : "text-[#C45A9A]"}`}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                )}
                {selectedTask.effort && (
                  <div className="bg-gray-50 rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Esforço
                    </span>
                    <span className="text-[13px] font-bold text-gray-900">
                      {selectedTask.effort}
                    </span>
                  </div>
                )}
                {selectedTask.category && (
                  <div className="col-span-2 bg-gray-50 rounded-[16px] p-3 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Categoria
                    </span>
                    <span className="text-[13px] font-bold text-[#215EFA]">
                      {selectedTask.category}
                    </span>
                  </div>
                )}
              </div>

              {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                <div className="bg-[#F4F5F9] rounded-[24px] p-5 border border-gray-100 min-h-[100px] shrink-0">
                  <h4 className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                    Subtarefas ({selectedTask.subtasks.length})
                  </h4>
                  <div className="flex flex-col gap-3">
                    {selectedTask.subtasks.map((sub: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-3"
                      >
                        <div className="mt-0.5">
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-[13px] font-bold text-gray-900 mb-1">
                            {sub.title}
                          </h5>
                          {sub.description && (
                            <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 shrink-0 mt-1">
                <button
                  onClick={() => {
                     addTask({
                        title: selectedTask.title || "",
                        description: selectedTask.description || "",
                        startTime: selectedTask.startTime || "12:00",
                        endTime: selectedTask.endTime || "",
                        durationStr: selectedTask.durationStr || "",
                        duration: selectedTask.duration || 30,
                        priority: selectedTask.priority || "Média",
                        category: selectedTask.category || "Trabalho",
                        date: selectedTask.date || "",
                        effort: selectedTask.effort || "Média",
                        location: selectedTask.location || "",
                        subtasks: selectedTask.subtasks || [],
                        style: selectedTask.style || "light",
                        completed: false,
                     });
                     setSelectedTask(null);
                  }}
                  className="flex-1 bg-white text-[#151515] rounded-[24px] py-4 font-bold text-[14px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4 text-[#151515]" /> Duplicar
                </button>
                <button
                  onClick={() => {
                     setNewTask({
                       title: selectedTask.title || "",
                       description: selectedTask.description || "",
                       startTime: selectedTask.startTime || "12:00",
                       endTime: selectedTask.endTime || "",
                       durationStr: selectedTask.durationStr || "",
                       duration: selectedTask.duration ? selectedTask.duration.toString() : "30",
                       priority: selectedTask.priority || "Média",
                       category: selectedTask.category || "Trabalho",
                       date: selectedTask.date || "",
                       effort: selectedTask.effort || "Média",
                       location: selectedTask.location || "",
                       reminderEnabled: selectedTask.reminderEnabled || false,
                       reminderTime: selectedTask.reminderTime || "No horário da tarefa",
                       reminderCustomMinutes: selectedTask.reminderCustomMinutes || "",
                       subtasks: selectedTask.subtasks || [],
                     });
                     setEditingTaskId(selectedTask.id);
                     setIsAddingTask(true);
                     setSelectedTask(null);
                  }}
                  className="flex-1 bg-white text-[#151515] rounded-[24px] py-4 font-bold text-[14px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4 text-[#151515]" /> Editar
                </button>
                <button
                  onClick={() => {
                     deleteTask(selectedTask.id);
                     setSelectedTask(null);
                  }}
                  className="flex-1 bg-white text-[#151515] rounded-[24px] py-4 font-bold text-[14px] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-[0.98] transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-[#151515]" /> Excluir
                </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* FAB (Floating Action Button) */}
      <AnimatePresence>
        {!isAddingTask && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!user) {
                onNavigate?.('profile');
              } else {
                setIsAddingTask(true);
              }
            }}
            className="absolute bottom-[104px] right-6 w-14 h-14 rounded-full bg-[#ff3838] flex items-center justify-center shadow-xl z-40"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-[#303030] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6 flex justify-between items-center z-50">
        <button onClick={() => onNavigate?.("home")} className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition">
          <Home className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Início</span>
        </button>
        <button onClick={() => onNavigate?.("roadmap")} className="flex flex-col items-center gap-1 min-w-[48px]">
          <CalendarDays className="w-[22px] h-[22px] text-[#ff3838]" />
          <span className="text-[10px] font-bold text-[#ff3838] mt-1">Tarefas</span>
        </button>
        <button onClick={() => onNavigate?.("focus")} className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition">
          <Focus className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Foco</span>
        </button>
        <button onClick={() => onNavigate?.("ai")} className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition">
          <MessageCircle className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Chat</span>
        </button>
        <button onClick={() => onNavigate?.("profile")} className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition">
          <User className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
}
