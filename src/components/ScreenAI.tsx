import { ArrowLeft, Menu, Settings2, Camera, Mic, Video, Sparkles, Send } from 'lucide-react';

export function ScreenAI({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full h-full bg-[#F4F5F9] flex flex-col pt-12 pb-6 px-4 overflow-y-auto no-scrollbar relative font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-2 shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-gray-900" />
        </button>
        <h1 className="text-gray-900 font-bold text-[16px]">Assistente IA</h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-100 bg-white shadow-sm hover:bg-gray-50 transition">
          <Menu className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* AI Card */}
      <div className="bg-gradient-to-br from-[#8EAFF5] to-[#A8C6FD] rounded-[40px] px-5 py-6 flex flex-col relative overflow-hidden mb-4 shrink-0 shadow-sm min-h-[380px] justify-between">
        <div className="absolute inset-0 opacity-50 z-0">
           <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-12 left-10 blur-[0.5px]"></div>
           <div className="w-2 h-2 bg-white rounded-full absolute top-24 right-16 blur-[1px]"></div>
           <div className="w-1.5 h-1.5 bg-white rounded-full absolute bottom-40 left-16 blur-[0.5px]"></div>
           <div className="w-1 h-1 bg-white rounded-full absolute bottom-36 right-10"></div>
           <div className="w-3 h-3 bg-white rounded-full absolute top-8 left-[45%] opacity-70 blur-[2px]"></div>
        </div>

        <div className="flex justify-between items-start z-20 w-full mb-4">
           <div className="flex -space-x-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=A1&backgroundColor=0284c7" className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#92B3FA] bg-blue-600 shadow-sm relative z-30" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=A2&backgroundColor=e879f9" className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#92B3FA] bg-pink-400 shadow-sm relative z-20" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=A3&backgroundColor=a78bfa" className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#92B3FA] bg-purple-400 shadow-sm relative z-10" />
           </div>
           
           <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center backdrop-blur-md">
              <Settings2 className="w-5 h-5 text-gray-900" />
           </button>
        </div>

        {/* Central interactive AI visual */}
        <div className="absolute inset-0 pb-20 flex flex-col items-center justify-center pointer-events-none mt-6 z-10">
           <div className="relative w-[180px] h-[180px] flex items-center justify-center">
              <div className="w-[160px] h-[160px] rounded-[50px] rotate-45 border-[6px] border-white/40 blur-[4px] absolute opacity-80"></div>
              <div className="w-[150px] h-[150px] rounded-full border-[4px] border-white/70 blur-[1.5px] absolute shadow-[0_0_25px_rgba(255,255,255,0.7)]"></div>
              <div className="w-[135px] h-[135px] rounded-[38px] rotate-12 border-[3px] border-white absolute shadow-[0_0_35px_rgba(255,255,255,0.9)] opacity-90"></div>
           </div>
        </div>

        <div className="flex justify-center items-center gap-5 z-20 mt-auto pt-[240px] pb-2">
           <button className="w-[52px] h-[52px] rounded-[20px] bg-white flex items-center justify-center shadow-md hover:scale-105 transition">
             <Camera className="w-[24px] h-[24px] text-gray-800" />
           </button>
           <button className="w-[76px] h-[76px] rounded-full bg-[#101010] flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.25)] hover:scale-105 transition z-20 border-[4px] border-white/20">
             <Mic className="w-8 h-8 text-white relative z-10" />
           </button>
           <button className="w-[52px] h-[52px] rounded-[20px] bg-white flex items-center justify-center shadow-md hover:scale-105 transition">
             <Video className="w-[24px] h-[24px] text-gray-800" />
           </button>
        </div>
      </div>

      {/* Prompts info */}
      <div className="flex justify-between items-center px-3 mb-4 shrink-0">
        <div className="flex items-center gap-1.5 text-gray-900 font-bold text-[11px]">
          <Sparkles className="w-4 h-4 fill-black" /> 16 prompts restantes
        </div>
        <span className="text-gray-400 text-[10px] font-bold">Desenvolvido por GPT-4.5</span>
      </div>

      {/* Input Box */}
      <div className="relative mb-5 shrink-0 px-1">
        <input 
          type="text" 
          placeholder="Pergunte qualquer coisa.." 
          className="w-full bg-white border border-transparent placeholder-gray-400 text-gray-900 rounded-[28px] py-4 pl-5 pr-14 text-[13px] font-bold shadow-[0_2px_15px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-1 focus:ring-gray-200"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-[36px] h-[36px] bg-black rounded-full flex items-center justify-center shadow-sm">
          <Send className="w-4 h-4 text-white -mt-0.5 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
