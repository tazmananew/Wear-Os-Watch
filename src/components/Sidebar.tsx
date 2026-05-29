import React from 'react';

interface SidebarProps {
  themeColor: string;
  setThemeColor: (color: string) => void;
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (has: boolean) => void;
}

export default function Sidebar({ themeColor, setThemeColor, hasUnreadMessages, setHasUnreadMessages }: SidebarProps) {
  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col h-full overflow-y-auto z-10">
      <h2 className="text-white text-xl font-sans font-semibold mb-2">
        Arayüz Tasarımcısı
      </h2>
      <p className="text-zinc-400 text-sm mb-6">
        Mevcut görsel referansına uygun yapılandırılmış şık dijital arayüz.
      </p>

      <div className="mb-8">
        <h3 className="text-zinc-300 text-sm font-medium uppercase tracking-wider mb-4">
          Durum Testi
        </h3>
        <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900 cursor-pointer hover:border-zinc-700 transition">
          <span className="text-zinc-300 text-sm font-medium">Okunmamış Mesaj</span>
          <div className="relative">
             <input 
               type="checkbox" 
               className="sr-only peer" 
               checked={hasUnreadMessages} 
               onChange={(e) => setHasUnreadMessages(e.target.checked)} 
             />
             <div 
               className="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-transparent peer-checked:border-2" 
               style={{ backgroundColor: hasUnreadMessages ? themeColor : undefined, borderColor: hasUnreadMessages ? themeColor : undefined }}
             ></div>
          </div>
        </label>
      </div>

      <div className="mt-auto p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
        <h4 className="text-white text-sm font-semibold mb-2">Prototip Bilgisi</h4>
        <p className="text-zinc-400 text-xs leading-relaxed mb-2">
          İsteğinize özel olarak: <br/><br/>
          - Üstte batarya barı ve Alarm<br/>
          - Solda GMT Dünya saati<br/>
          - Saatte saniye görünümü<br/>
          - Altta 10.000 adım kırmızı skala<br/>
          - Alt kısımda Fener <br/>
          - Sol altta Adım sayısı<br/>
          - Sağ altta Mesaj kısayolu (zarf)<br/>
          <br/>
          Tüm detaylar simetrik olarak dengelenmiştir.
        </p>
      </div>
    </div>
  );
}
