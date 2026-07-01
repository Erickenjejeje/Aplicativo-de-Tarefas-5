import { Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Task, useTasks } from "../hooks/useTasks";
import { FocusSession, useFocusSessions } from '../hooks/useFocusSessions';
import { useState, useEffect } from 'react';

export function ScreenTaskDetails({ task, onBack }: { task: Task, onBack: () => void }) {
  const { updateTask, deleteTask, addTask } = useTasks();
  const { sessions } = useFocusSessions();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const session = sessions.find((s) => s.taskId === task.id);

  const formattedDate = task.date; // Use raw YYYY-MM-DD to match the screenshot or we can reformat
  const [year, month, day] = task.date.split('-');
  const displayDate = `${year}-${month}-${day}`;

  const startH = parseInt(task.startTime.split(':')[0] || '0');
  const startM = parseInt(task.startTime.split(':')[1] || '0');
  const durH = Math.floor(task.duration / 60);
  const durM = task.duration % 60;
  const endM = (startM + durM) % 60;
  const endH = startH + durH + Math.floor((startM + durM) / 60);
  const formattedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

  // Countdown Calculation
  let remainingText = `${durH}h ${durM > 0 ? `${durM}m` : ''}`.trim();
  let timeStr = "";

  const [tYear, tMonth, tDay] = task.date.split('-').map(Number);
  const startDateTime = new Date(tYear, tMonth - 1, tDay, startH, startM, 0);
  const endDateTime = new Date(tYear, tMonth - 1, tDay, endH, endM, 0);

  if (session) {
    const mins = Math.floor(session.timeLeft / 60);
    const secs = session.timeLeft % 60;
    timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    remainingText = session.phase === 'focus' ? "Tempo de Foco" : "Pausa";
  } else {
    if (now < startDateTime) {
      timeStr = remainingText;
      remainingText = "Duração estimada";
    } else if (now >= startDateTime && now < endDateTime) {
      const diffMs = endDateTime.getTime() - now.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const h = Math.floor(diffSecs / 3600);
      const m = Math.floor((diffSecs % 3600) / 60);
      const s = diffSecs % 60;
      if (h > 0) {
        timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      } else {
        timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      remainingText = "Tempo Restante";
    } else {
      timeStr = "00:00";
      remainingText = "Tempo esgotado";
    }
  }

  const handleMarkCompleted = () => {
    updateTask(task.id, { completed: true, completedAt: new Date().toISOString() });
    onBack();
  };

  const isCompleted = task.completed;

  let taskStatusText = "";
  let taskStatusColor = "";

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

  // Header Colors
  let headerBg = "bg-[#A7C5FE]";
  if (task.style === "purple") headerBg = "bg-[#B794F6]";
  if (task.style === "pink") headerBg = "bg-[#FBB6CE]";
  if (task.style === "orange") headerBg = "bg-[#FBD38D]";

  return (
    <div className="w-full h-full bg-white relative font-sans overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300">
      
      <div className={`${headerBg} relative shrink-0 rounded-b-[40px] px-6 pt-12 pb-10 flex flex-col`}>
         <div className="flex items-start gap-4 mt-2">
           <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition shrink-0">
              <ArrowLeft className="w-5 h-5 text-[#151515]" />
           </button>
           <h1 className="text-[#151515] text-[26px] font-bold leading-tight flex-1 line-clamp-3">{task.title}</h1>
         </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto no-scrollbar pt-6 pb-24 flex flex-col">
        <div className="px-6 flex items-center gap-2 flex-wrap mb-6">
        <span className="bg-[#f4f5f9] text-slate-800 px-3 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-500" /> 
          {task.startTime} • {formattedEndTime}
        </span>
        <span className="bg-[#E4F2FF] text-[#215efa] px-3 py-1.5 rounded-full text-[12px] font-bold">
          {task.duration} min
        </span>
        <span className={`${taskStatusColor} px-3 py-1.5 rounded-full text-[12px] font-bold`}>
          {taskStatusText}
        </span>
        {session && (
          <span className="bg-[#f4f5f9] text-slate-800 px-3 py-1.5 rounded-full text-[12px] font-bold">
            Pomodoro: {session.currentCycle}/{session.totalCycles}
          </span>
        )}
      </div>

      <div className="px-6 flex flex-col gap-4 mb-6">
         {/* Timer Component */}
         <div className="bg-[#F4F5F9] rounded-[24px] p-5 shrink-0 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{session ? "Progresso (Pomodoro)" : "Progresso da Tarefa"}</span>
               <span className="text-[14px] text-slate-800 font-bold">{remainingText}</span>
               {session && <span className="text-[12px] text-slate-500 mt-1">Ciclo {session.currentCycle} / {session.totalCycles}</span>}
             </div>
             <span className="text-[24px] font-bold text-[#151515] font-mono tracking-tight">{timeStr}</span>
         </div>

         <div className="bg-[#F4F5F9] rounded-[24px] p-5 shrink-0">
             <h4 className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
               Descrição
             </h4>
             <p className="text-[14px] text-slate-800 leading-relaxed font-medium">
               {task.description || "Nenhuma descrição fornecida."}
             </p>
         </div>

         <div className="grid grid-cols-2 gap-3 shrink-0">
             <div className="bg-[#F4F5F9] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Data</span>
                 <span className="text-[14px] font-bold text-slate-900">{displayDate}</span>
             </div>
             <div className="bg-[#F4F5F9] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Local</span>
                 <span className="text-[14px] font-bold text-slate-900">{task.location || "-"}</span>
             </div>
             <div className="bg-[#F4F5F9] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prioridade</span>
                 <span className={`text-[14px] font-bold ${task.priority === "Alta" ? "text-[#f97316]" : task.priority === "Média" ? "text-[#f59e0b]" : "text-[#10b981]"}`}>
                   {task.priority || "Média"}
                 </span>
             </div>
             <div className="bg-[#F4F5F9] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Esforço</span>
                 <span className="text-[14px] font-bold text-slate-900">{task.effort || "-"}</span>
             </div>
             <div className="col-span-2 bg-[#F4F5F9] rounded-[20px] p-4 flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</span>
                 <span className="text-[14px] font-bold text-[#215EFA]">{task.category || "Sem categoria"}</span>
             </div>
         </div>

         {task.subtasks && task.subtasks.length > 0 && (
           <div className="bg-[#F4F5F9] rounded-[24px] p-5 shrink-0">
             <h4 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
               Subtarefas ({task.subtasks.length})
             </h4>
             <div className="flex flex-col gap-3">
               {task.subtasks.map((sub, i) => (
                 <div
                   key={i}
                   className="bg-white rounded-2xl p-4 border border-gray-50 flex gap-3"
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

      <div className="px-6 flex flex-col gap-3 mt-4 shrink-0">
        {!isCompleted && (
           <button 
             onClick={handleMarkCompleted}
             className="w-full bg-[#215EFA] text-white rounded-[24px] py-4 flex items-center justify-center gap-2 text-[14px] font-bold hover:bg-blue-700 transition active:scale-[0.98] mb-2"
           >
             <CheckCircle2 className="w-5 h-5" />
             Marcar como Concluída
           </button>
        )}
        {/* Buttons removed per instructions */}

      </div>
      </div>
    </div>
  );
}


