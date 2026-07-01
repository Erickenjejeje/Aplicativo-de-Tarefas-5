import { ArrowLeft, Check, X } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export function ScreenTaskHistory({ onBack }: { onBack: () => void }) {
  const { tasks } = useTasks();

  const completedTasks = tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - completedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `Concluída em ${day}/${month}/${year}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="w-full h-full bg-[#F4F5F9] relative font-sans overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
      <div className="w-full px-6 pt-12 flex flex-col shrink-0 relative z-20">
        {/* Header */}
        <div className="flex items-start shrink-0 gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition shadow-sm shrink-0 mt-1">
            <ArrowLeft className="w-5 h-5 text-[#151515]" />
          </button>
          <h1 className="text-[#151515] text-[28px] font-medium leading-[1.2] text-left flex-1 pt-0.5">
            Histórico de <br />
            <span className="font-bold">Tarefas Concluídas</span>
          </h1>
        </div>

        {/* Notice Message */}
        <p className="text-[13px] text-gray-500 font-medium text-left mt-3 mb-8 leading-tight pl-14">
          Suas tarefas concluídas ficam salvas aqui por <strong className="text-[#151515]">7 dias</strong>. Após isso, elas desaparecem para você focar apenas no progresso da sua semana atual!
        </p>

        {/* Soft Gradient Fade for smooth history disappearance */}
        <div 
          className="absolute left-0 right-0 h-[100px] pointer-events-none"
          style={{ 
            top: '100%',
            background: 'linear-gradient(to bottom, rgba(244,245,249,1) 0%, rgba(244,245,249,0.98) 8%, rgba(244,245,249,0.94) 16%, rgba(244,245,249,0.85) 26%, rgba(244,245,249,0.7) 40%, rgba(244,245,249,0.5) 56%, rgba(244,245,249,0.25) 76%, rgba(244,245,249,0) 100%)'
          }}
        ></div>
      </div>

      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 pt-[60px] pb-8 flex flex-col">
        {/* Timeline */}
        <div className="relative pl-4 flex-1">
          {/* Vertical Line */}
          <div className="absolute top-2 bottom-4 left-[23px] w-0.5 bg-gray-200" />

          <div className="flex flex-col gap-6">
            {completedTasks.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8 relative z-10 bg-[#F4F5F9]">
                    Nenhuma tarefa concluída nos últimos 7 dias.
                </div>
            ) : (
                completedTasks.map((task) => (
                  <div key={task.id} className="relative flex gap-4">
                    {/* Timeline Dot */}
                    <div className="mt-1 relative z-10 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[#151515] flex items-center justify-center ring-4 ring-[#F4F5F9]">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-[24px] p-4 flex-1 shadow-sm border border-gray-100 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[14px] font-bold text-[#151515] leading-tight pr-2">{task.title}</span>
                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg shrink-0">{formatTime(task.completedAt!)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[12px] font-bold text-[#215EFA]">{formatDate(task.completedAt!)}</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
          
          {/* End of timeline indicator */}
          <div className="relative flex gap-4 mt-8">
             <div className="mt-1 relative z-10 shrink-0">
                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center ring-4 ring-[#F4F5F9]">
                  <X className="w-3 h-3 text-white" />
                </div>
             </div>
             <div className="pt-1.5 pb-8">
                <span className="text-[13px] font-medium text-gray-400">Semana anterior Deletada</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
