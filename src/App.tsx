import { useState } from 'react';
import Watch from './components/Watch';
import Sidebar from './components/Sidebar';

export default function App() {
  const [themeColor, setThemeColor] = useState('#10b981'); // Default Green for background ambient glow
  const [hasUnreadMessages, setHasUnreadMessages] = useState(true);

  return (
    <div className="flex h-screen bg-black overflow-hidden font-sans">
      {/* Main Designer Area */}
      <div className="flex-1 flex flex-col relative w-full h-full items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-zinc-950">
        
        {/* Ambient Glow behind the watch */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[130px] transition-colors duration-1000 opacity-20 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <Watch 
           themeColor={themeColor} 
           hasUnreadMessages={hasUnreadMessages} 
        />
        
        <div className="mt-12 text-center z-10">
          <h1 className="text-2xl text-white font-sans font-semibold tracking-wide">Xiaomi Watch 2</h1>
          <p className="text-zinc-400 text-sm mt-1 font-medium">Wear OS 5 • Dashboard Arayüzü</p>
        </div>
      </div>

      {/* Settings Panel */}
      <Sidebar 
         themeColor={themeColor} 
         setThemeColor={setThemeColor} 
         hasUnreadMessages={hasUnreadMessages}
         setHasUnreadMessages={setHasUnreadMessages}
      />
    </div>
  );
}
