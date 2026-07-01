import {
  Bell,
  Search,
  Settings,
  Home,
  CalendarDays,
  Phone,
  MessageCircle,
  User,
  Wand2,
  Eye,
  Focus,
  Box,
  Monitor,
  Megaphone,
  BookOpen,
  Image as ImageIcon,
  Target,
} from "lucide-react";
import { useProfile } from "../hooks/useProfile";
import { useTasks } from "../hooks/useTasks";
import { useNotifications } from "../hooks/useNotifications";
import { useState, useRef, useEffect } from "react";
import { ScreenTaskDetails } from "./ScreenTaskDetails";
import { motion } from "motion/react";

export function ScreenHome({
  onNavigate,
}: {
  onNavigate: (tab: "roadmap" | "home" | "ai" | "profile" | "focus" | "notifications") => void;
}) {
  const { profile } = useProfile();
  const { tasks } = useTasks();
  const { notifications } = useNotifications();
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<
    "Trabalho" | "Estudos" | "Pessoal"
  >("Trabalho");
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const mainBtnRef = useRef<HTMLButtonElement>(null);
  const [isMainBtnFilled, setIsMainBtnFilled] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (mainBtnRef.current && !mainBtnRef.current.contains(event.target as Node)) {
        setIsMainBtnFilled(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);
  
  const activeTasks = tasks.filter((t) => !t.completed);
  
  // Sort tasks by startTime
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const timeA = a.startTime || "23:59";
    const timeB = b.startTime || "23:59";
    return timeA.localeCompare(timeB);
  });
  
  // Find the next upcoming task based on current time
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  
  let upcomingTask = sortedTasks.find(t => (t.startTime || "23:59") >= currentTime);
  
  // Fallback to the first uncompleted task if all tasks were earlier today
  if (!upcomingTask && sortedTasks.length > 0) {
     upcomingTask = sortedTasks[0];
  }
  
  const isSearching = searchQuery.trim().length > 0;
  
  let filteredTasks = activeTasks;
  if (isSearching) {
    const q = searchQuery.toLowerCase();
    filteredTasks = activeTasks.filter(t => t.title.toLowerCase().includes(q));
  } else {
    filteredTasks = activeTasks.filter(t => (t.category || "Trabalho").toLowerCase() === activeCategory.toLowerCase());
  }

  let mainCardBgColor = "bg-gradient-to-br from-[#313131] to-[#2a2a2a]";

  if (isTaskDetailsOpen && upcomingTask) {
    return <ScreenTaskDetails task={upcomingTask} onBack={() => setIsTaskDetailsOpen(false)} />;
  }

  return (
    <div className="w-full h-full bg-[#1f1f1f] relative font-sans overflow-hidden">
      
      {/* Fixed Header Background (Behind the sticky search bar) */}
      <div 
        className="absolute top-0 left-0 right-0 bg-[#1f1f1f] pointer-events-none"
        style={{ height: '68px', zIndex: 20 }}
      >
        {/* Soft Gradient Fade for smooth card disappearance */}
        <div 
          className="absolute left-0 right-0 h-[100px] pointer-events-none"
          style={{ 
            top: '100%',
            background: 'linear-gradient(to bottom, rgba(31,31,31,1) 0%, rgba(31,31,31,0.98) 8%, rgba(31,31,31,0.94) 16%, rgba(31,31,31,0.85) 26%, rgba(31,31,31,0.7) 40%, rgba(31,31,31,0.5) 56%, rgba(31,31,31,0.25) 76%, rgba(31,31,31,0) 100%)'
          }}
        ></div>
      </div>

      {/* Native Scrollable Content Area */}
      <div 
        ref={scrollRef}
        className="absolute inset-0 w-full h-full overflow-y-auto no-scrollbar pointer-events-auto"
      >
        <div className="w-full flex flex-col relative min-h-full" style={{ paddingBottom: '120px' }}>
          
          {/* Header Row (Avatar, Greeting, Bell) - Scrolls normally */}
          <div className="w-full px-6 pt-12 pb-6 flex justify-between items-center relative z-30 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("profile")}
                className="w-11 h-11 border border-black/5 bg-gray-200 outline-none rounded-full overflow-hidden flex items-center justify-center shadow-sm hover:opacity-80 transition-opacity shrink-0"
              >
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <div className="flex flex-col justify-center">
                <span className="text-white font-bold text-[15px] leading-tight mb-0.5 whitespace-nowrap">
                  Olá, {profile.name === "anônimo" ? "" : profile.name}
                </span>
                <span className="text-[#aaaaaa] text-[11px] font-semibold whitespace-nowrap">
                  Subir de Nível
                </span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate("notifications")}
              className="w-11 h-11 rounded-full bg-[#303030] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-transparent flex items-center justify-center outline-none hover:opacity-80 transition-opacity shrink-0 relative"
            >
              <Bell className="w-[18px] h-[18px] text-white" />
              {unreadCount > 0 && (
                <div className="absolute top-2.5 right-2 w-[7px] h-[7px] bg-[#F64E3D] rounded-full border-[1.5px] border-[#303030]"></div>
              )}
            </button>
          </div>
          
          {/* Native Sticky Search Bar */}
          <div 
            className="sticky pointer-events-auto shrink-0 mb-6 px-6"
            style={{
              zIndex: 30, // Higher than Header Background (20)
              top: 16, 
              height: 52,
            }}
          >
            <div className="relative w-full h-full bg-[#303030]/60 rounded-full shadow-sm border border-[#aaaaaa]/20 flex items-center">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
                <Search className="w-4.5 h-4.5 text-[#aaaaaa]" />
              </div>
              <input
                type="text"
                placeholder="Pesquisar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent placeholder-[#aaaaaa]/50 text-[#aaaaaa] rounded-full pl-12 pr-4 text-[13px] font-medium focus:outline-none"
              />
            </div>
          </div>

          <div className="px-6 flex flex-col w-full relative z-10">
          {!isSearching && (
            <>
          {/* Main Feature Card */}
          <div className={`${mainCardBgColor} rounded-[36px] p-5 pb-6 flex flex-col relative overflow-hidden mb-6 shrink-0 shadow-sm`}>
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="bg-white rounded-full px-3.5 py-1.5 text-[11px] font-bold text-[#101010] shadow-none">
              Prioridade: {upcomingTask ? upcomingTask.priority || "Normal" : "N/A"}
            </div>
            <div className="bg-white rounded-full px-3.5 py-1.5 text-[11px] font-bold text-[#101010] shadow-none">
              {upcomingTask?.startTime ? `Se inicia as ${upcomingTask.startTime}` : (tasks.length > 0 ? "Ação" : "0")}
            </div>
          </div>

          <div className="relative z-10 mb-8">
            <h2 className="text-white font-bold text-[22px] leading-[1.1] line-clamp-2">
              {upcomingTask ? `Próxima Tarefa: ${upcomingTask.title}` : "Nenhuma tarefa adicionada"}
            </h2>
            <p className="text-white/80 text-[12px] font-bold mt-1.5">
              {upcomingTask ? `Criado para: ${upcomingTask.date.split('-').reverse().join('-')}` : "Adicione tarefas em 'Tarefas'"}
            </p>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <button
              ref={mainBtnRef}
              onClick={() => setIsTaskDetailsOpen(true)}
              onMouseEnter={() => setIsMainBtnFilled(true)}
              onTouchMove={() => setIsMainBtnFilled(true)}
              className="relative bg-transparent border-2 border-white px-6 py-2.5 rounded-full text-[11px] outline-none font-bold overflow-hidden shadow-none"
            >
              <div className={`absolute inset-y-0 left-0 bg-white transition-all duration-200 ease-out z-0 ${isMainBtnFilled ? 'w-full' : 'w-0'}`}></div>
              <div className="relative z-10 overflow-hidden block">
                <span className="invisible block">VER TAREFA COMPLETA</span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${isMainBtnFilled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'} text-white`}>
                  VER TAREFA COMPLETA
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out ${isMainBtnFilled ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'} text-[#101010]`}>
                  VER TAREFA COMPLETA
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Track Pills */}
        <div className="flex gap-2 mb-6 shrink-0 h-12">
          <button
            onClick={() => setActiveCategory("Trabalho")}
            className={`${activeCategory === "Trabalho" ? "bg-[#303030] text-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-transparent" : "bg-transparent text-[#aaaaaa] shadow-none border border-[#aaaaaa]/20"} px-5 py-2 rounded-full flex items-center justify-center gap-2 text-[11px] font-bold flex-1 whitespace-nowrap transition`}
          >
            <img 
              src={activeCategory === "Trabalho" ? "https://iili.io/CnLJHsp.png" : "https://iili.io/CnsmWGt.png"}
              alt="Trabalho"
              className="w-[22px] h-[22px] object-contain"
            /> Trabalho
          </button>
          <button
            onClick={() => setActiveCategory("Estudos")}
            className={`${activeCategory === "Estudos" ? "bg-[#303030] text-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-transparent" : "bg-transparent text-[#aaaaaa] shadow-none border border-[#aaaaaa]/20"} px-5 py-2 rounded-full flex items-center justify-center gap-2 text-[11px] font-bold flex-1 whitespace-nowrap transition`}
          >
            <img 
              src={activeCategory === "Estudos" ? "https://iili.io/CnLBlqJ.png" : "https://iili.io/CnLCIBs.png"}
              alt="Estudos"
              className="w-[22px] h-[22px] object-contain"
            /> Estudo
          </button>
          <button
            onClick={() => setActiveCategory("Pessoal")}
            className={`${activeCategory === "Pessoal" ? "bg-[#303030] text-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] border border-transparent" : "bg-transparent text-[#aaaaaa] shadow-none border border-[#aaaaaa]/20"} px-5 py-2 rounded-full flex items-center justify-center gap-2 text-[11px] font-bold flex-1 whitespace-nowrap transition`}
          >
            <img 
              src={activeCategory === "Pessoal" ? "https://iili.io/CnLIast.png" : "https://iili.io/CnLTIC7.png"}
              alt="Pessoal"
              className="w-[18px] h-[18px] object-contain"
            /> Pessoal
          </button>
        </div>
        </>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-2 gap-4 pb-28 shrink-0">
          {filteredTasks.length === 0 && (
            <div className="col-span-2 text-center py-10 text-[#aaaaaa] font-bold text-sm">
              {isSearching ? "Nenhuma tarefa encontrada." : "Nenhuma tarefa nesta categoria."}
            </div>
          )}
          {filteredTasks.map((task, index) => {
            let bgColor = "bg-gradient-to-br from-[#313131] to-[#2a2a2a]";
            let textColor = "text-white";
            let descColor = "text-white/70";
            let iconBg = "bg-white/20";
            
            return (
              <div key={task.id} className={`${bgColor} rounded-[32px] p-4 flex flex-col relative overflow-hidden h-[165px] shadow-sm justify-between transition-colors`}>
                <div className="flex justify-between items-start z-10 w-full mb-2">
                  <div className={`text-[22px] font-bold ${textColor} leading-none tracking-tighter`}>
                    {activeTasks.findIndex(t => t.id === task.id) + 1}
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] text-[#101010] font-bold bg-white px-2.5 py-1 rounded-full inline-flex tracking-wide`}>
                    {task.startTime ? `Se inicia as ${task.startTime}` : "Sem horário"}
                  </div>
                </div>

                <div className="z-10 mt-auto">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[11px] font-bold ${textColor} border-b-[1.5px] ${textColor === 'text-white' ? 'border-white/20' : 'border-black/20'} pb-0.5 capitalize`}>
                      por {profile.name === "anônimo" ? "você" : profile.name}
                    </span>
                  </div>
                  <h3 className={`font-bold text-[14px] ${textColor} leading-[1.1] mt-1 mb-1.5 line-clamp-2`}>
                    {task.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
        </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-[#303030] rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] px-6 flex justify-between items-center z-50">
        <button
          onClick={() => onNavigate("home")}
          className="flex flex-col items-center gap-1 min-w-[48px]"
        >
          <Home className="w-[22px] h-[22px] text-[#ff3838]" />
          <span className="text-[10px] font-bold text-[#ff3838] mt-1">
            Início
          </span>
        </button>

        <button
          onClick={() => onNavigate("roadmap")}
          className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition"
        >
          <CalendarDays className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">
            Tarefas
          </span>
        </button>

        <button
          onClick={() => onNavigate("focus")}
          className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition"
        >
          <Focus className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Foco</span>
        </button>

        <button
          onClick={() => onNavigate("ai")}
          className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition"
        >
          <MessageCircle className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">Chat</span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          className="flex flex-col items-center gap-1 min-w-[48px] hover:opacity-80 transition"
        >
          <User className="w-[22px] h-[22px] text-[#aaaaaa]" />
          <span className="text-[10px] font-bold text-[#aaaaaa] mt-1">
            Perfil
          </span>
        </button>
      </div>
    </div>
  );
}
