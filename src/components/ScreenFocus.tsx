import { useState, ChangeEvent } from 'react';
import { ArrowLeft, Play, Pause, Square, List, X, Plus, Sparkles, Settings2 } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useFocusSessions, FocusSession } from '../hooks/useFocusSessions';

function PomodoroDetailModal({ session, updateSession, removeSession, onClose }: { session: FocusSession, updateSession: any, removeSession: any, onClose: () => void }) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalTime = session.phase === 'focus' ? session.focusTime * 60 : session.breakTime * 60;
  const progress = session.timerState === 'idle' ? 0 : 100 - (session.timeLeft / totalTime) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 bg-[#bdd3ff]/80 backdrop-blur-sm z-50 flex flex-col justify-end">
      <div className="bg-white w-full rounded-t-[40px] p-6 pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] flex flex-col items-center relative animate-in slide-in-from-bottom-10 duration-200">
        <div className="w-full flex justify-between items-start mb-6">
          <div className="flex flex-col flex-1 pl-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${session.phase === 'focus' ? 'text-[#215EFA]' : 'text-amber-500'}`}>
              {session.phase === 'focus' ? '🎯 Foco' : '☕ Pausa'} • Etapa {session.currentCycle}/{session.totalCycles}
            </span>
            <h2 className="text-[17px] font-bold text-[#101010] mt-1 pr-4 leading-snug">{session.taskTitle}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 hover:bg-gray-100 transition border border-black/5 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative w-[140px] h-[140px] flex items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="rgba(0,0,0,0.05)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle 
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={session.phase === 'focus' ? "#101010" : "#f59e0b"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[32px] font-bold text-[#101010] tracking-tighter leading-none">{formatTime(session.timeLeft)}</span>
            {session.timerState === 'paused' && (
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Pausado</span>
            )}
          </div>
        </div>

        <div className="w-full bg-[#F4F5F9] rounded-2xl p-3 flex justify-between items-center mb-6 border border-black/5">
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Foco</span>
            <span className="text-[14px] font-bold text-gray-900">{session.focusTime}m</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Pausa</span>
            <span className="text-[14px] font-bold text-gray-900">{session.breakTime}m</span>
          </div>
        </div>

        {session.timerState === 'finished' ? (
          <span className="text-[13px] font-bold text-emerald-500 uppercase tracking-wider py-3 mb-4">Concluído! 🎉</span>
        ) : (
          <div className="flex items-center gap-4 mb-4">
            {session.timerState === 'running' ? (
              <button onClick={() => updateSession(session.id, { timerState: 'paused' })} className="w-14 h-14 rounded-full bg-white text-[#101010] shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition border border-black/5">
                <Pause className="w-5 h-5 fill-current" />
              </button>
            ) : (
              <button onClick={() => updateSession(session.id, { timerState: 'running' })} className="w-14 h-14 rounded-full bg-[#101010] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition">
                <Play className="w-5 h-5 fill-current ml-1" />
              </button>
            )}
            <button onClick={() => updateSession(session.id, { timerState: 'idle', timeLeft: session.focusTime * 60, phase: 'focus', currentCycle: 1 })} className="w-14 h-14 rounded-full bg-white/60 text-[#101010] shadow-sm border border-transparent flex items-center justify-center hover:bg-gray-50 hover:scale-105 active:scale-95 transition border border-black/5">
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        )}


      </div>
    </div>
  );
}

function PomodoroListItem({ session, onClick }: { session: FocusSession, onClick: () => void; key?: string | number }) {
  const totalTime = session.phase === 'focus' ? session.focusTime * 60 : session.breakTime * 60;
  const progress = session.timerState === 'idle' ? 0 : 100 - (session.timeLeft / totalTime) * 100;
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className="bg-[#101010] rounded-[32px] p-2 pr-5 flex items-center justify-between shadow-sm cursor-pointer hover:bg-black transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex flex-col flex-1 min-w-0 px-4 py-2">
          <span className="font-semibold text-[15px] truncate text-white">
            {session.taskTitle}
          </span>
          <span className="text-gray-400 text-[11px] font-medium truncate">
            Tarefa dividida em {session.totalCycles} {session.totalCycles === 1 ? 'etapa' : 'etapas'}.
          </span>
        </div>
      </div>
      
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0 ml-2">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle 
            cx="16" cy="16" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle 
            cx="16" cy="16" r={radius}
            fill="none"
            stroke={session.phase === 'focus' ? "#fff" : "#f59e0b"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
      </div>
    </div>
  );
}

export function ScreenFocus({ onNavigate }: { onNavigate: (tab: 'roadmap'|'home'|'ai'|'profile'|'focus'|'notifications') => void }) {
  const { tasks } = useTasks();
  const { sessions, addSession, removeSession, updateSession } = useFocusSessions();
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Modal State
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [focusTime, setFocusTime] = useState<number>(25);
  const [breakTime, setBreakTime] = useState<number>(5);
  const [totalCycles, setTotalCycles] = useState<number>(1);

  const handleSelectTask = (e: ChangeEvent<HTMLSelectElement>) => {
    const taskId = e.target.value;
    setSelectedTaskId(taskId);
    if (mode === 'auto') {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
           const dur = task.duration || 30;
           const cycles = Math.ceil(dur / 25);
           setFocusTime(25);
           setBreakTime(5);
           setTotalCycles(cycles || 1);
        }
    }
  };

  const handleAddSession = () => {
    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    
    addSession({
      id: Date.now().toString(),
      taskId: selectedTaskId,
      taskTitle: task ? task.title : 'Tarefa sem título',
      focusTime,
      breakTime,
      totalCycles: Math.max(1, totalCycles),
      currentCycle: 1,
      phase: 'focus',
      timeLeft: focusTime * 60,
      timerState: 'idle'
    });
    
    setIsPomodoroModalOpen(false);
    setSelectedTaskId('');
  };

  return (
    <div className="w-full h-full bg-[#bdd3ff] flex flex-col relative font-sans overflow-hidden">
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 pt-10 pb-10">
        
        {sessions.length === 0 ? (
          <>
            <div className="flex items-start gap-4 px-1 pb-2 shrink-0 relative z-10 w-full mt-2">
              <button onClick={() => onNavigate('home')} className="w-10 h-10 -ml-1 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition shadow-[0_2px_10px_rgba(0,0,0,0.05)] z-20 shrink-0 mt-1">
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>
              <div className="flex flex-col text-left">
                <h1 className="text-[#151515] text-[32px] font-medium leading-[1.05]">
                  Tarefas grandes não <br/>
                  te <span className="font-bold">assustam</span> mais.
                </h1>
              </div>
            </div>

            <div className="w-full mb-2 shrink-0 flex items-center justify-center -mt-8">
               <img src="https://iili.io/CCxdNvp.png" alt="Illustration" className="w-[490px] h-[490px] object-contain drop-shadow-sm" />
            </div>

            <div className="flex justify-center mt-2">
                <button 
                  onClick={() => setIsPomodoroModalOpen(true)}
                  className="bg-[#101010] text-white px-8 py-3.5 rounded-full text-[14px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Usar Pomodoro Nas Tarefas
                </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 px-1 pb-4 shrink-0 relative z-10 w-full mt-2 mb-2">
              <div className="flex gap-4">
                  <button onClick={() => onNavigate('home')} className="w-10 h-10 -ml-1 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition shadow-[0_2px_10px_rgba(0,0,0,0.05)] z-20 shrink-0 mt-1">
                    <ArrowLeft className="w-5 h-5 text-gray-900" />
                  </button>
                  <div className="flex flex-col text-left mt-2.5">
                    <h1 className="text-[#151515] text-[24px] font-bold leading-tight">
                      Foco
                    </h1>
                  </div>
              </div>
              <button 
                 onClick={() => setIsPomodoroModalOpen(true)} 
                 className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 transition shadow-[0_2px_10px_rgba(0,0,0,0.05)] mt-1 z-20 shrink-0 text-gray-900"
              >
                 <Plus className="w-5 h-5" />
              </button>
            </div>

             <div className="flex flex-col gap-4">
              {sessions.map(session => (
                 <PomodoroListItem 
                    key={session.id} 
                    session={session} 
                    onClick={() => setSelectedSessionId(session.id)}
                 />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pomodoro Session Detail Modal */}
      {selectedSessionId && sessions.find(s => s.id === selectedSessionId) && (
         <PomodoroDetailModal 
            session={sessions.find(s => s.id === selectedSessionId)!}
            updateSession={updateSession}
            removeSession={removeSession}
            onClose={() => setSelectedSessionId(null)}
         />
      )}

      {/* Pomodoro Setup Modal */}
      {isPomodoroModalOpen && (
        <div className="absolute inset-0 bg-[#bdd3ff]/80 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-[40px] p-6 pt-8 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] flex flex-col gap-6 relative animate-in slide-in-from-bottom-10 duration-200">
             <div className="flex justify-between items-center mb-2 shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Configurar Pomodoro</h3>
                <button onClick={() => setIsPomodoroModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                   <X className="w-5 h-5 text-gray-600" />
                </button>
             </div>
             
             <div className="flex flex-col gap-5 shrink-0">
                 
                 <div className="flex bg-[#F4F5F9] rounded-[20px] p-1.5 w-full">
                     <button
                        onClick={() => setMode('auto')}
                        className={`flex-1 py-2.5 rounded-[16px] text-[13px] font-bold transition flex items-center justify-center gap-2 ${mode === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                     >
                        <Sparkles className="w-4 h-4" /> Sugerido
                     </button>
                     <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-2.5 rounded-[16px] text-[13px] font-bold transition flex items-center justify-center gap-2 ${mode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                     >
                        <Settings2 className="w-4 h-4" /> Manual
                     </button>
                 </div>

                 <div>
                     <label className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                         <List className="w-4 h-4" /> Selecione uma Tarefa
                     </label>
                     <select 
                         value={selectedTaskId}
                         onChange={handleSelectTask}
                         className="w-full bg-[#F4F5F9] border-none text-[#101010] font-bold text-[14px] rounded-2xl p-4 focus:ring-2 focus:ring-[#8AA7E9] outline-none appearance-none"
                     >
                         <option value="" disabled>Escolha uma tarefa...</option>
                         {tasks.map(task => (
                             <option key={task.id} value={task.id}>{task.title}</option>
                         ))}
                     </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                             Tempo Foco (min)
                         </label>
                         <input 
                             type="number" 
                             min="1"
                             disabled={mode === 'auto'}
                             value={focusTime || ''}
                             onChange={(e) => setFocusTime(Number(e.target.value) || 0)}
                             className="bg-[#F4F5F9] border-none text-[#101010] font-bold text-[14px] rounded-2xl p-4 w-full outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                             placeholder="ex: 25"
                         />
                     </div>
                     <div>
                         <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                             Pausa (min)
                         </label>
                         <input 
                             type="number" 
                             min="1"
                             disabled={mode === 'auto'}
                             value={breakTime || ''}
                             onChange={(e) => setBreakTime(Number(e.target.value) || 0)}
                             className="bg-[#F4F5F9] border-none text-[#101010] font-bold text-[14px] rounded-2xl p-4 w-full outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                             placeholder="ex: 5"
                         />
                     </div>
                 </div>

                 <div>
                     <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                         Quantidade de Etapas (Pomodoros)
                     </label>
                     <div className="flex items-center gap-4 bg-[#F4F5F9] p-3 rounded-2xl">
                         <button 
                             onClick={() => setTotalCycles(Math.max(1, totalCycles - 1))}
                             disabled={mode === 'auto'}
                             className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm text-gray-600 disabled:opacity-50"
                         >
                             -
                         </button>
                         <div className="flex-1 text-center font-bold text-[16px] text-[#101010]">
                             {totalCycles} {totalCycles === 1 ? 'Etapa' : 'Etapas'}
                         </div>
                         <button 
                             onClick={() => setTotalCycles(totalCycles + 1)}
                             disabled={mode === 'auto'}
                             className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm text-gray-600 disabled:opacity-50"
                         >
                             +
                         </button>
                     </div>
                     {mode === 'auto' && (
                         <p className="text-[11px] text-gray-500 mt-2 font-medium">
                             A quantidade foi gerada automaticamente com base na duração da tarefa.
                         </p>
                     )}
                 </div>

                 <div className="mt-4 pb-2">
                   <button 
                       onClick={handleAddSession}
                       disabled={!selectedTaskId}
                       className="w-full bg-[#101010] text-white font-bold text-[15px] py-4 rounded-[24px] shadow-[0_5px_15px_rgba(16,16,16,0.3)] hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                   >
                       Adicionar Pomodoro
                   </button>
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

