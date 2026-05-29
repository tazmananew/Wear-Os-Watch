import { Battery, Footprints, AlarmClock, Flashlight, Mail, Globe, Zap, CloudSun, Sunrise, Sunset } from 'lucide-react';
import { useEffect, useState } from 'react';

// Yardımcı Fonksiyon: İstenilen açılarda kusursuz SVG arkları çizer (0 = En Üst)
function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, sweepFlag: number = 1) {
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleInRadians)),
      y: cy + (r * Math.sin(angleInRadians))
    };
  };
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, sweepFlag, end.x, end.y
  ].join(" ");
}

interface WatchProps {
  hasUnreadMessages: boolean;
  themeColor: string;
}

export default function Watch({ hasUnreadMessages, themeColor }: WatchProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const gmtHours = time.getUTCHours().toString().padStart(2, '0');
  
  const day = time.getDate();
  const weekdayLong = time.toLocaleDateString('tr-TR', { weekday: 'long' });
  const monthLong = time.toLocaleDateString('tr-TR', { month: 'long' });
  
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const dateStr = `${day} ${capitalize(monthLong)} ${capitalize(weekdayLong)}`;

  const stepsCount = 8432; 
  const stepsGoal = 10000;
  const stepsProgress = Math.min(stepsCount / stepsGoal, 1);
  const batteryLevel = 0.84;

  const getBatteryColor = (level: number) => {
    if (level < 0.20) return { track: '#450a0a', fill: '#ef4444' };
    if (level < 0.60) return { track: '#422006', fill: '#eab308' };
    return { track: '#064e3b', fill: '#22c55e' };
  };

  const getStepsColor = (steps: number) => {
    if (steps < 3000) return { track: '#450a0a', fill: '#ef4444' };
    if (steps < 8000) return { track: '#422006', fill: '#eab308' };
    return { track: '#064e3b', fill: '#22c55e' };
  };

  const batteryColors = getBatteryColor(batteryLevel);
  const stepsColors = getStepsColor(stepsCount);

  const arcRadius = 191;
  const topArcSpan = 104; // -52 deg to +52 deg
  const topArcLength = (topArcSpan / 360) * 2 * Math.PI * arcRadius; // ~317.6
  const bottomArcSpan = 104; // 232 deg to 128 deg (sweep 0) -> 104 deg stretch
  const bottomArcLength = (bottomArcSpan / 360) * 2 * Math.PI * arcRadius; // ~317.6

  const topArcPath = describeArc(196, 196, arcRadius, -52, 52, 1);
  const bottomArcPath = describeArc(196, 196, arcRadius, 232, 128, 0);

  // Izgara çizgilerinin yuvarlağa taşmaması için kesişim denklemi (Grid margin r=185)
  const getGridX = (dy: number) => Math.sqrt(190 * 190 - dy * dy);

  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [selectedIcao, setSelectedIcao] = useState('LTFM');

  interface MetarData {
    icao: string;
    windDir: string;
    windSpeed: string;
    vis: string;
    clouds: string;
    qnh: string;
    gust: string;
    sunrise: string;
    sunset: string;
  }

  const [metar, setMetar] = useState<MetarData | null>(null);

  const ICAO_DATA: Record<string, { wind: string, vis: string, clouds: string, qnh: string, sunrise: string, sunset: string }> = {
    'LTFM': { wind: '220/15K', vis: 'CAVOK', clouds: "FEW020", qnh: '1015mb', sunrise: '05:42', sunset: '20:13' },
    'LTFJ': { wind: '040/10K', vis: '9999', clouds: "SCT030", qnh: '1018mb', sunrise: '05:40', sunset: '20:10' },
    'KJFK': { wind: '310/22G30', vis: '10SM', clouds: "BKN015", qnh: '1008mb', sunrise: '05:25', sunset: '20:15' },
    'EGLL': { wind: '090/05K', vis: 'CAVOK', clouds: "CLR", qnh: '1020mb', sunrise: '04:55', sunset: '21:05' }
  };

  useEffect(() => {
    const fetchMetar = async (icao: string) => {
      try {
        const res = await fetch(`https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (data && data.length > 0) {
          const obs = data[0];
          const wdir = obs.wdir === 0 ? "VRB" : obs.wdir.toString().padStart(3, '0');
          const wspd = obs.wspd;
          const wgst = obs.wgst ? `G${obs.wgst}` : "";
          const vis = obs.visib === "10+" ? "9999" : `${obs.visib}SM`;
          
          let clouds = "CAVOK";
          if (obs.clouds && Array.isArray(obs.clouds) && obs.clouds.length > 0) {
             clouds = obs.clouds.map((c: any) => `${c.cover}${c.base || ''}`).join(' ');
          }
          
          const altimMb = obs.altim < 50 ? Math.round(obs.altim * 33.8639) : Math.round(obs.altim);
          const qnh = `${altimMb}mb`;
          
          const mockSunrise = ICAO_DATA[icao]?.sunrise || "05:40";
          const mockSunset = ICAO_DATA[icao]?.sunset || "20:00";

          setMetar({
            icao: obs.icaoId,
            windDir: wdir,
            windSpeed: `${wspd}K`,
            gust: wgst,
            vis,
            clouds,
            qnh,
            sunrise: mockSunrise,
            sunset: mockSunset
          });
        } else {
          throw new Error("No data");
        }
      } catch(e) {
         // Hata durumunda mock verisine düş
         const fallback = ICAO_DATA[icao];
         if(fallback) {
            setMetar({
               icao,
               windDir: fallback.wind.split('/')[0],
               windSpeed: fallback.wind.split('/')[1],
               gust: "",
               vis: fallback.vis,
               clouds: fallback.clouds,
               qnh: fallback.qnh,
               sunrise: fallback.sunrise,
               sunset: fallback.sunset
            });
         }
      }
    };

    fetchMetar(selectedIcao);
    
    // Her 15 dakikada bir otomatik güncelle
    const interval = setInterval(() => {
       fetchMetar(selectedIcao);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);

  }, [selectedIcao]);

  return (
    <div className="relative flex items-center justify-center bg-zinc-950 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.6)] border-[14px] border-zinc-800/80"
         style={{ width: '420px', height: '420px' }}>
         
      {/* 392x392 Cihaz Ekranı İç Alanı */}
      <div className="w-full h-full bg-black rounded-full overflow-hidden relative font-sans">
         
         <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 392 392">
            <defs>
              <mask id="battery-mask">
                <path d={topArcPath} fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeDasharray={topArcLength} strokeDashoffset={topArcLength * (1 - batteryLevel)} className="transition-all duration-1000" />
              </mask>
              <mask id="steps-mask">
                <path d={bottomArcPath} fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeDasharray={bottomArcLength} strokeDashoffset={bottomArcLength * (1 - stepsProgress)} className="transition-all duration-1000" />
              </mask>
            </defs>

            {/* Simetrik Arka Plan Çizgileri */}
            <g stroke="#27272a" strokeWidth="1.5">
               {/* Yatay Çizgiler */}
               <line x1={196 - getGridX(106)} y1="90" x2={196 + getGridX(106)} y2="90" />
               <line x1={196 - getGridX(56)} y1="140" x2={196 + getGridX(56)} y2="140" />
               <line x1={196 - getGridX(56)} y1="252" x2={196 + getGridX(56)} y2="252" />
               <line x1={196 - getGridX(106)} y1="302" x2={196 + getGridX(106)} y2="302" />
               
               {/* Dikey Çizgiler */}
               <line x1="196" y1="90" x2="196" y2="140" />
               <line x1="196" y1="252" x2="196" y2="302" />
            </g>

            {/* Üst Şarj Barı */}
            <path d={topArcPath} fill="none" stroke={batteryColors.track} strokeWidth="10" strokeLinecap="round" strokeDasharray="8 6" />
            <path d={topArcPath} fill="none" stroke={batteryColors.fill} strokeWidth="10" strokeLinecap="round" strokeDasharray="8 6" mask="url(#battery-mask)" />
            
            {/* Alt Adım Barı */}
            <path d={bottomArcPath} fill="none" stroke={stepsColors.track} strokeWidth="10" strokeLinecap="round" strokeDasharray="8 6" />
            <path d={bottomArcPath} fill="none" stroke={stepsColors.fill} strokeWidth="10" strokeLinecap="round" strokeDasharray="8 6" mask="url(#steps-mask)" />
         </svg>

         {/* Üst Bar Etiketleri */}
         <div className="absolute flex items-center justify-center w-6 h-6" style={{ left: 34, top: 66 }}>
            <Zap size={11} className="rotate-[-52deg]" style={{ color: batteryColors.fill }} />
         </div>
         <div className="absolute flex items-center justify-center w-6 h-6" style={{ left: 352, top: 66 }}>
            <span className="text-zinc-300 rotate-[52deg] text-[11px] font-bold tracking-tighter">100</span>
         </div>

         {/* --------- HÜCRELER (Satır Satır) --------- */}
         
         {/* Satır 0 - Üst: Alarm */}
         <div className="absolute top-[30px] left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 cursor-pointer text-zinc-300">
               <AlarmClock size={12} strokeWidth={2.5}/>
               <span className="text-[12px] font-medium tracking-wide">Ayarla</span>
            </div>
         </div>

         {/* Satır 0 - Alt: Hava Durumu (METAR) */}
         <div 
            className="absolute top-[52px] left-[20px] right-[20px] h-[24px] flex items-center justify-center space-x-1.5 text-zinc-300 cursor-pointer hover:text-white"
            onClick={() => setShowWeatherModal(true)}
         >
            {metar && (
               <>
                 <span className="text-[10px] font-bold text-yellow-400">{metar.icao}</span>
                 <span className="text-[9px] font-semibold tracking-tighter w-max">
                   {metar.windDir}/{metar.windSpeed}{metar.gust} {metar.vis} {metar.clouds} {metar.qnh}
                 </span>
               </>
            )}
         </div>

         {/* Satır 1 - Sol: GMT Saati */}
         <div className="absolute top-[90px] left-[40px] right-[196px] h-[50px] flex items-center justify-center space-x-2 text-cyan-400 hover:bg-white/5 cursor-pointer rounded-tl-[100px]">
            <Globe size={15} />
            <span className="font-mono text-[14px] font-bold tracking-wide">{gmtHours}:{minutes}</span>
         </div>

         {/* Satır 1 - Sağ: Tarih */}
         <div className="absolute top-[90px] left-[196px] right-[40px] h-[50px] flex items-center justify-center text-purple-300 hover:bg-white/5 cursor-pointer rounded-tr-[100px]">
            <span className="text-[13px] font-medium tracking-wide">{dateStr}</span>
         </div>

         {/* Satır 2 - Merkez: Dev Saat ve Saniye */}
         <div className="absolute top-[140px] left-0 right-0 h-[112px] flex items-center justify-center hover:bg-white/5 cursor-pointer">
            <div className="flex items-end pl-5">
               <div className="font-bold tabular-nums tracking-tighter" style={{ fontSize: '5.8rem', lineHeight: '0.9', color: 'white' }}>
                  {hours}<span className="text-zinc-600 font-normal animate-[pulse_2s_ease-in-out_infinite]">:</span>{minutes}
               </div>
               <div className="text-[1.8rem] ml-2 mb-2 font-bold tabular-nums text-zinc-400 opacity-90 leading-none relative">
                  {seconds}
               </div>
            </div>
         </div>

         {/* Satır 3 - Sol: Adım */}
         <div className="absolute top-[252px] left-[40px] right-[196px] h-[50px] flex items-center justify-center space-x-2 hover:bg-white/5 cursor-pointer rounded-bl-[100px]" style={{ color: stepsColors.fill }}>
            <Footprints size={15} />
            <span className="text-[15px] font-bold tracking-wide">8.432</span>
         </div>

         {/* Satır 3 - Sağ: Mesaj (Kcal/166 formatında) */}
         <div className="absolute top-[252px] left-[196px] right-[40px] h-[50px] flex items-center justify-center space-x-2 text-orange-400 hover:bg-white/5 cursor-pointer rounded-br-[100px]">
             <Mail size={16} fill={hasUnreadMessages ? "currentColor" : "none"} color="currentColor" />
             <span className="text-[15px] font-bold tracking-wide">
                166
             </span>
         </div>

         {/* Satır 4 - Üst: Gün Doğumu ve Batımı */}
         <div 
            className="absolute top-[313px] left-[40px] right-[40px] flex items-center justify-center space-x-6 hover:bg-white/5 cursor-pointer rounded-full h-[30px]"
            onClick={() => setShowWeatherModal(true)}
         >
            {metar && (
              <>
                 <div className="flex items-center space-x-1.5">
                    <Sunrise size={14} strokeWidth={2.5} className="text-yellow-200 drop-shadow-[0_0_3px_rgba(253,224,71,0.6)]"/>
                    <span className="text-[12px] font-bold tracking-wide text-zinc-300">{metar.sunrise}</span>
                 </div>
                 <div className="flex items-center space-x-1.5">
                    <Sunset size={14} strokeWidth={2.5} className="text-orange-500 drop-shadow-[0_0_3px_rgba(249,115,22,0.6)]"/>
                    <span className="text-[12px] font-bold tracking-wide text-zinc-300">{metar.sunset}</span>
                 </div>
              </>
            )}
         </div>

         {/* Satır 4 - Merkez: Fener */}
         <div className="absolute top-[350px] left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="flex items-center space-x-1.5 opacity-80 hover:opacity-100 cursor-pointer text-zinc-300 hover:text-white">
               <Flashlight size={12} strokeWidth={2.5}/>
               <span className="text-[12px] font-medium tracking-wide">Fener</span>
            </div>
         </div>

         {/* AeroWeather Mock Modal */}
         <div 
           className={`absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center transition-all duration-300 ${showWeatherModal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none scale-95'}`}
         >
            <div className="text-cyan-400 mb-2">
              <CloudSun size={28} />
            </div>
            <h3 className="text-white text-sm font-semibold tracking-wide mb-3">AeroWeather</h3>
            
            <div className="flex flex-col space-y-2 w-3/4 max-w-[200px]">
              {Object.keys(ICAO_DATA).map(icao => (
                <button
                  key={icao}
                  onClick={() => setSelectedIcao(icao)}
                  className={`py-2 px-4 rounded-xl text-[12px] font-medium transition-all flex justify-between items-center ${selectedIcao === icao ? 'bg-cyan-900 text-cyan-50' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                >
                  <span className="font-bold">{icao}</span>
                  <span className="text-[10px] opacity-70">{ICAO_DATA[icao].wind}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowWeatherModal(false)}
              className="mt-5 px-6 py-2 rounded-full bg-zinc-700 text-white text-[12px] font-medium hover:bg-zinc-600 active:scale-95 transition-all"
            >
              Tamam
            </button>
         </div>

      </div>
    </div>
  );
}
