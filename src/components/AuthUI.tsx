import { User, Sparkles, BookOpen, Star, Triangle, Circle, Clock } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import React, { useState } from 'react';

interface AuthUIProps {
  onClose?: () => void;
  isModal?: boolean;
}

export function AuthUI({ onClose, isModal = false }: AuthUIProps) {
  const { loginWithGoogle } = useProfile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [step, setStep] = useState<'slider' | 'description'>('slider');
  const [pendingAuth, setPendingAuth] = useState<'google' | 'guest' | null>(null);

  const slides = [
    {
      title: "Olá, bem-vindo ao ZaptDay!",
      image: "https://iili.io/CC837p4.png",
    },
    {
      title: "Planeje-se melhor.\nRealize mais.",
      image: "https://iili.io/CCmdAq7.png",
    }
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentSlide(index);
  };

  const handleAuthAction = (action: 'google' | 'guest') => {
    if (!isModal) {
      if (action === 'google') {
        loginWithGoogle().then(success => { if (success && onClose) onClose(); });
      } else {
        if (onClose) onClose();
      }
      return;
    }
    setPendingAuth(action);
    setStep('description');
  };

  const handleContinue = async () => {
    if (pendingAuth === 'google') {
      const success = await loginWithGoogle();
      if (success && onClose) onClose();
    } else {
      if (onClose) onClose();
    }
  };

  if (step === 'description') {
    return (
      <div className={`w-full flex-col flex overflow-y-auto overflow-x-hidden no-scrollbar ${isModal ? 'min-h-[100dvh] bg-white absolute inset-0 z-50 animate-in slide-in-from-right-8 duration-300' : 'flex-1 h-full bg-white rounded-[32px] shadow-sm animate-in fade-in duration-300'}`}>
        <div className="flex-1 flex flex-col p-8 pt-16">
          <h2 className="text-[32px] font-bold text-[#101010] leading-tight mb-4">
            O que é o ZaptDay?
          </h2>
          <p className="text-[15px] font-medium text-gray-500 leading-relaxed mb-10">
            O ZaptDay é o aplicativo que ajuda você a transformar planos em resultados. Organize sua rotina, mantenha o foco e aumente sua produtividade com ferramentas práticas criadas para simplificar o seu dia a dia.
          </p>

          <div className="flex flex-col gap-6 mb-auto overflow-y-auto pb-6 no-scrollbar">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                 <img src="https://iili.io/CCpx6w7.png" alt="Tarefas e metas" className="w-9 h-9 object-contain" />
              </div>
              <div className="mt-1">
                 <h3 className="font-bold text-[16px] text-[#101010] mb-1">Crie tarefas e alcance metas</h3>
                 <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Centralize tudo o que precisa fazer em um único lugar. Organize tarefas, defina prioridades e acompanhe seu progresso de forma simples e intuitiva.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                 <img src="https://iili.io/CCpmh7f.png" alt="Gerencie seu tempo" className="w-9 h-9 object-contain" />
              </div>
              <div className="mt-1">
                 <h3 className="font-bold text-[16px] text-[#101010] mb-1">Gerencie seu tempo com eficiência</h3>
                 <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Estabeleça prazos, planeje suas atividades e tenha mais controle sobre sua rotina para realizar mais em menos tempo.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                 <img src="https://iili.io/CCpYPt4.png" alt="Foco e Produtividade" className="w-full h-full object-contain" />
              </div>
              <div className="mt-1">
                 <h3 className="font-bold text-[16px] text-[#101010] mb-1">Mais foco, menos procrastinação</h3>
                 <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Utilize temporizadores e técnicas de produtividade que ajudam você a manter a concentração, evitar distrações e concluir suas tarefas com mais facilidade.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                 <img src="https://iili.io/CCpyNi7.png" alt="Produtividade para todas as áreas" className="w-9 h-9 object-contain" />
              </div>
              <div className="mt-1">
                 <h3 className="font-bold text-[16px] text-[#101010] mb-1">Produtividade para todas as áreas da sua vida</h3>
                 <p className="text-[14px] font-medium text-gray-500 leading-relaxed">Seja no trabalho, nos estudos ou em projetos pessoais, o ZaptDay oferece tudo o que você precisa para se manter organizado, focado e em constante evolução.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 w-full mt-auto pb-4 shrink-0 bg-white">
            <button 
               onClick={handleContinue}
               className="w-full bg-[#5284FF] flex items-center justify-center gap-3 py-4 rounded-2xl text-[16px] font-bold text-white shadow-xl shadow-[#5284FF]/20 hover:bg-[#4270e0] transition active:scale-[0.98]"
            >
               Continuar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex-col flex overflow-y-auto overflow-x-hidden no-scrollbar ${isModal ? 'min-h-[100dvh] bg-[#F4F5F9] absolute inset-0 z-50' : 'flex-1 h-full bg-[#F4F5F9] rounded-[32px] shadow-sm'}`}>
      
      {/* Top Section */}
      <div className="relative flex flex-col items-center justify-start pt-8 z-10 w-full flex-1 overflow-visible pb-8">
        {/* Curved blue background */}
        <div className="absolute w-[200%] pb-[200%] left-[-50%] bottom-[0px] bg-gradient-to-b from-[#bdd3ff] to-black rounded-full shadow-sm pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center w-full grow min-h-0">
          <div 
             className="w-full h-full flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
             onScroll={handleScroll}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full h-full shrink-0 snap-center flex flex-col items-center justify-start pt-2">
                <h2 className="text-white text-[32px] font-bold leading-tight mb-4 drop-shadow-sm px-6 w-full text-center shrink-0 whitespace-pre-line">
                  {slide.title}
                </h2>
                <div className="w-full flex-1 flex items-end justify-center relative px-4 min-h-0 pb-4">
                  <img 
                    src={slide.image} 
                    alt={`Slide ${index + 1}`} 
                    className="w-full h-full max-w-[360px] object-contain object-bottom drop-shadow-2xl" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="relative z-10 flex items-center gap-2.5 mt-2 mb-4">
          {slides.map((_, index) => (
            <div 
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'w-2.5 bg-white shadow-sm' : 'w-2.5 bg-white/40'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#F4F5F9] px-6 pb-12 pt-10 flex flex-col justify-end w-full shrink-0 z-10 relative">
        <div className="flex flex-col gap-4 w-full max-w-[400px] mx-auto mt-auto">
          <button 
             type="button"
             onClick={() => handleAuthAction('google')}
             className="w-full bg-[#101010] flex items-center justify-center gap-3 py-4 rounded-2xl text-[16px] font-bold text-white shadow-xl shadow-black/10 hover:bg-black transition active:scale-[0.98]"
          >
             <svg className="w-5 h-5 bg-white rounded-full p-[2px]" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
             Entrar com Google
          </button>

          {isModal && onClose && (
            <button 
              onClick={() => handleAuthAction('guest')}
              className="w-full bg-white border border-gray-200 text-[#151515] py-4 rounded-2xl text-[15px] font-bold shadow-sm hover:bg-gray-50 transition active:scale-[0.98]"
            >
              Entrar sem conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
