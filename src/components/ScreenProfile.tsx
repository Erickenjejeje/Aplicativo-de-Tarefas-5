import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { ArrowLeft, Upload, Trash2, Camera, Bell, Check, Key, User, ChevronRight, Pencil } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { AuthUI } from './AuthUI';

type SubScreen = 'main' | 'userInfo' | 'settings' | 'sensitiveData';

export function ScreenProfile({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile, resetProfile, user, loginWithGoogle, logout } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeSubScreen, setActiveSubScreen] = useState<SubScreen>('main');
  const [nameInput, setNameInput] = useState(profile.name === 'anônimo' ? '' : profile.name);
  const [apiKeyInput, setApiKeyInput] = useState(profile.geminiApiKey || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingApiKey, setIsEditingApiKey] = useState(false);

  useEffect(() => {
    setNameInput(profile.name === 'anônimo' ? '' : profile.name);
    setApiKeyInput(profile.geminiApiKey || '');
  }, [profile.name, profile.geminiApiKey]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 300;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          } else if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          updateProfile({ photoUrl: compressedBase64 });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    updateProfile({ name: nameInput.trim() || 'anônimo' });
    setIsEditingName(false);
  };

  const handleSaveApiKey = () => {
    updateProfile({ geminiApiKey: apiKeyInput.trim() });
    setIsEditingApiKey(false);
  };

  const CategoryButton = ({ title, onClick }: { title: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="w-full bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center justify-between text-left transition-transform active:scale-[0.98] hover:bg-gray-50 mb-4"
    >
       <span className="text-[16px] font-bold text-[#151515]">{title}</span>
       <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );

  return (
    <div className="w-full h-full bg-[#F4F5F9] relative font-sans overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
      <div className="flex-1 w-full overflow-y-auto no-scrollbar px-6 pt-8 pb-8 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 shrink-0">
            <button 
              onClick={() => {
                if (activeSubScreen === 'main') {
                  onBack();
                } else {
                  setActiveSubScreen('main');
                }
              }} 
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-50 transition shadow-sm shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-[#151515]" />
            </button>
            <h1 className="text-[#151515] text-[18px] font-bold leading-tight text-center flex-1 pr-10">
              {activeSubScreen === 'main' ? 'Meu Perfil' : 
               activeSubScreen === 'userInfo' ? 'Info do Usuário' : 
               activeSubScreen === 'settings' ? 'Configurações' : 'Dados Sensíveis'}
            </h1>
          </div>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 mt-4 mb-4 bg-gradient-to-b from-[#5175d2] from-[0%] to-black to-[70%] rounded-3xl shadow-xl min-h-[300px] border-none">
            <img src="https://iili.io/CC837p4.png" alt="Boas-vindas" className="w-[260px] h-auto object-contain mb-6 opacity-90" />
            <h2 className="text-white text-[20px] font-bold text-center mb-3">Conecte-se</h2>
            <p className="text-gray-200 text-center mb-8 px-4 text-[14px]">Entre com sua conta Google para salvar seus dados com segurança e sincronizá-los automaticamente em todos os seus dispositivos.</p>
            <button 
              onClick={() => loginWithGoogle()}
              className="w-full max-w-[280px] bg-white flex items-center justify-center gap-3 py-4 rounded-2xl text-[15px] font-bold text-black shadow-xl shadow-black/10 hover:bg-gray-50 transition active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>
          </div>
        ) : (

          <>
            {activeSubScreen === 'main' && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md flex items-center justify-center mb-4">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h2 className="text-[#151515] text-[20px] font-bold leading-tight mb-1">{profile.name === 'anônimo' ? '' : profile.name}</h2>
                </div>

                <div className="flex flex-col">
                  <CategoryButton title="Informações do usuário" onClick={() => setActiveSubScreen('userInfo')} />
                  <CategoryButton title="Configurações" onClick={() => setActiveSubScreen('settings')} />
                  <CategoryButton title="Dados sensíveis" onClick={() => setActiveSubScreen('sensitiveData')} />
                </div>
              </div>
            )}

            {activeSubScreen === 'userInfo' && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Profile Picture */}
                <div className="flex flex-col items-center mb-10">
                  <div className="relative mb-4">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                      {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#151515] rounded-full flex items-center justify-center border-2 border-white shadow-sm hover:scale-105 transition"
                    >
                      <Upload className="w-4 h-4 text-white" />
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-6 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-[#151515] uppercase tracking-wider pl-1">Nome de Usuário</label>
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onBlur={handleSaveName}
                          autoFocus
                          placeholder="Seu nome"
                          className="flex-1 bg-[#F4F5F9] border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-bold text-[#151515] outline-none focus:border-[#5284FF] transition"
                        />
                        <button 
                          onClick={handleSaveName}
                          className="h-12 px-5 bg-[#151515] text-white font-bold rounded-xl flex items-center justify-center hover:bg-black transition text-[14px]"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3 transition" 
                      >
                        <span className="text-[16px] font-bold text-gray-500">{profile.name === 'anônimo' ? 'Adicionar nome' : profile.name}</span>
                        <div 
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-100 active:scale-[0.95] transition"
                          onClick={() => setIsEditingName(true)}
                        >
                          <Pencil className="w-4 h-4 text-[#151515]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-[#151515] uppercase tracking-wider pl-1">Meu email cadastrado</label>
                    <div className="bg-[#F4F5F9] rounded-xl px-4 py-3 border border-transparent">
                      <span className="text-[15px] font-medium text-gray-500">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="mt-auto pt-4 pb-2">
                   <button 
                     onClick={() => {
                         setActiveSubScreen('main');
                         sessionStorage.removeItem('@app_has_seen_auth');
                         logout();
                         onBack();
                     }}
                     className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between transition-colors hover:bg-gray-50 text-left active:scale-[0.98] mb-3"
                   >
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                         </div>
                         <div className="flex flex-col flex-1 pr-2">
                           <span className="text-[14px] font-bold text-[#151515] mb-0.5">Sair da Conta</span>
                           <span className="text-[11px] font-medium text-gray-500 leading-tight">
                             Desconectar deste dispositivo temporariamente.
                           </span>
                         </div>
                      </div>
                   </button>
                </div>
              </div>
            )}

            {activeSubScreen === 'settings' && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Lembretes Diários */}
                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                       <img src="https://iili.io/Cn2B4YG.png" alt="Lembretes Diários" className="w-6 h-6 object-contain shrink-0" />
                       <div className="flex flex-col">
                         <span className="text-[14px] font-bold text-[#151515]">Lembretes Diários</span>
                         <span className="text-[11px] font-medium text-gray-500">Notificações de foco</span>
                       </div>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => updateProfile({ dailyReminders: !profile.dailyReminders })}
                      className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${profile.dailyReminders ? 'bg-[#215EFA]' : 'bg-gray-200'}`}
                    >
                       <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all duration-300 shadow-sm ${profile.dailyReminders ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>

                {/* API Key Form Field */}
                <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-6 mb-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 pl-1 mb-1">
                      <img src="https://iili.io/Cn2CHyx.png" alt="Chave da API Gemini" className="w-6 h-6 object-contain shrink-0" />
                      <label className="text-[13px] font-bold text-[#151515] uppercase tracking-wider">Chave da API Gemini</label>
                    </div>
                    {isEditingApiKey ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="password" 
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          onBlur={handleSaveApiKey}
                          autoFocus
                          placeholder="Cole sua chave aqui"
                          className="flex-1 bg-[#F4F5F9] border border-gray-200 rounded-xl px-4 py-3 text-[15px] font-bold text-[#151515] outline-none focus:border-[#5284FF] transition"
                        />
                        <button 
                          onClick={handleSaveApiKey}
                          className="h-12 px-5 bg-[#151515] text-white font-bold rounded-xl flex items-center justify-center hover:bg-black transition text-[14px]"
                        >
                          Salvar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-[#F4F5F9] border border-transparent rounded-xl px-4 py-3 transition flex-1">
                        <span className="text-[15px] font-medium text-gray-500">{apiKeyInput ? '••••••••••••••••' : 'Cole sua chave aqui'}</span>
                        <div 
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-100 active:scale-[0.95] transition shrink-0"
                          onClick={() => setIsEditingApiKey(true)}
                        >
                          <Pencil className="w-4 h-4 text-[#151515]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubScreen === 'sensitiveData' && (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button 
                  onClick={() => {
                      resetProfile();
                      setNameInput('');
                      setActiveSubScreen('main');
                  }}
                  className="w-full bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between transition-colors hover:bg-gray-50 text-left active:scale-[0.98]"
                >
                   <div className="flex items-center gap-3">
                      <img src="https://iili.io/Cn2TCFI.png" alt="Resetar Dados" className="w-6 h-6 object-contain shrink-0" />
                      <div className="flex flex-col flex-1 pr-2">
                        <span className="text-[14px] font-bold text-[#151515] mb-0.5">Resetar Dados</span>
                        <span className="text-[11px] font-medium text-gray-500 leading-tight">
                          Isto irá apagar todos os dados centralizados.
                        </span>
                      </div>
                   </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}