import { motion } from "framer-motion";
import { ArrowLeft, Bell, Trash2, CheckCircle2 } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

interface ScreenNotificationsProps {
  onBack: () => void;
  onNavigate: (tab: "roadmap" | "home" | "ai" | "profile" | "focus" | "notifications") => void;
}

export function ScreenNotifications({ onBack, onNavigate }: ScreenNotificationsProps) {
  const { notifications, clearAll, markAsRead } = useNotifications();

  return (
    <div className="w-full h-full bg-[#151515] flex flex-col font-sans relative overflow-hidden">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 shrink-0 bg-[#151515] relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-[#272727] rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-[24px] font-bold tracking-tight">Notificações</h1>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearAll}
            className="w-10 h-10 bg-[#272727] rounded-full flex items-center justify-center text-red-400 active:scale-95 transition-transform"
          >
             <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center mt-20">
            <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-6">
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-white text-[18px] font-bold mb-2">Nenhuma notificação</h3>
            <p className="text-gray-400 text-[14px]">Você não tem lembretes no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  if (!notif.read) markAsRead(notif.id);
                  onNavigate('roadmap'); // Navigate to roadmap when clicking a notification
                }}
                className={`w-full rounded-[24px] p-5 cursor-pointer transition-colors border ${notif.read ? 'bg-[#272727] border-transparent' : 'bg-[#2a2a2a] border-[#ff3838]/30'}`}
              >
                <div className="flex items-start gap-4">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.read ? 'bg-[#3f3f3f]' : 'bg-[#ff3838]/20 text-[#ff3838]'}`}>
                      <Bell className={`w-5 h-5 ${notif.read ? 'text-gray-400' : 'text-[#ff3838]'}`} />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-[16px] font-bold ${notif.read ? 'text-[#e8e8e9]' : 'text-white'}`}>{notif.title}</h4>
                        {!notif.read && <div className="w-2 h-2 rounded-full bg-[#ff3838]" />}
                      </div>
                      <p className="text-[13px] text-gray-400 leading-relaxed mb-2">{notif.body}</p>
                      {notif.createdAt && (
                        <span className="text-[11px] text-gray-500 font-medium">
                          {notif.createdAt.toDate ? new Date(notif.createdAt.toDate()).toLocaleString([], {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : 'Agora'}
                        </span>
                      )}
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
