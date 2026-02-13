
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Monitor, Target, Settings, User, Globe, LayoutDashboard, TrendingUp, Activity, ClipboardList } from 'lucide-react';

const slides = [
  {
    id: 0,
    headerTitle: "Gestão Integrada",
    title: <span>Gestão <span className="text-blue-400">Eficiente</span></span>,
    desc: "Acompanhe o desenvolvimento de cada aluno em tempo real com dashboards inteligentes.",
    accent: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.15)",
    type: 'dashboard'
  },
  {
    id: 1,
    headerTitle: "Análise de Dados",
    title: <span>Dados que <span className="text-emerald-400">Transformam</span></span>,
    desc: "Métricas precisas e seguras para embasar as melhores decisões pedagógicas.",
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.15)",
    type: 'analytics'
  },
  {
    id: 2,
    headerTitle: "Rede de Apoio",
    title: <span>Sistema <span className="text-orange-400">Conectado</span></span>,
    desc: "Integração total entre escola, família, profissionais e alunos em uma única plataforma inteligente.",
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.15)",
    type: 'ecosystem'
  }
];

const MarketingSection: React.FC = () => {
  const [current, setCurrent] = useState(2);
  const active = slides[current];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#000d1a] px-4 sm:px-6 font-sans overflow-hidden">
      <style>{`
        @keyframes rotate-dashed {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-particle {
          0% { transform: rotate(0deg) translateX(200px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(200px) rotate(-360deg); opacity: 0; }
        }
        .animate-rotate-dashed { animation: rotate-dashed 12s linear infinite; }
        .pattern-bg {
          background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 45px 45px;
        }
      `}</style>

      {/* Fundo com Grid e Glow */}
      <div className="absolute inset-0 pattern-bg"></div>
      <motion.div
        animate={{ backgroundColor: active.glow }}
        className="absolute -top-1/4 -right-1/4 w-[600px] md:w-[800px] h-[600px] md:h-[800px] blur-[120px] md:blur-[160px] rounded-full transition-colors duration-1000"
      />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">

        {/* Área do Gráfico / Visual */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] flex items-center justify-center mb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full flex justify-center items-center h-full"
            >
              <div className="scale-75 sm:scale-90 md:scale-100 w-full h-full flex items-center justify-center">
                {active.type === 'analytics' && <AnalyticsChart color={active.accent} />}
                {active.type === 'ecosystem' && <EcosystemRadar />}
                {active.type === 'dashboard' && <DashboardBars color={active.accent} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Conteúdo de Texto */}
        <div className="text-center max-w-3xl px-4">
          <motion.div
            key={`header-${current}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-4"
          >
            <div className="h-[1px] w-4 sm:w-8 bg-white/10" />
            <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-white/40 uppercase flex items-center gap-2">
              {active.headerTitle} <Globe size={12} className="opacity-50" />
            </span>
            <div className="h-[1px] w-4 sm:w-8 bg-white/10" />
          </motion.div>

          <motion.h2
            key={`title-${current}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight"
          >
            {active.title}
          </motion.h2>

          <motion.p
            key={`desc-${current}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-sm sm:text-base md:text-lg text-slate-400 font-light leading-relaxed mb-6 sm:mb-8"
          >
            {active.desc}
          </motion.p>
        </div>

        {/* Paginação Dots */}
        <div className="flex gap-3 sm:gap-4 mt-2">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)} className="relative py-2 group">
              <motion.div
                animate={{
                  width: current === i ? (window.innerWidth < 640 ? 32 : 48) : 8,
                  backgroundColor: current === i ? active.accent : "rgba(255,255,255,0.1)"
                }}
                className="h-1 sm:h-1.5 rounded-full transition-all duration-500"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};


/* --- Componente Ecosystem Radar --- */
const EcosystemRadar: React.FC = () => {
  const nodes = [
    { icon: <Users size={28} />, label: "FAMÍLIA", color: "#00a8ff", position: "top-left" },
    { icon: <Monitor size={28} />, label: "ESCOLA", color: "#00ff88", position: "top-right" },
    { icon: <Settings size={28} />, label: "PROFISSIONAIS", color: "#00d2ff", position: "bottom-left" },
    { icon: <ClipboardList size={28} />, label: "PEI", color: "#bf5af2", position: "bottom-right" },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">

      {/* 1. Orbit Paths Geometry */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Subtle Dotted Rings */}
        <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5 border-dashed" />
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/[0.03]" />
        <div className="absolute w-[520px] h-[520px] rounded-full border border-white/[0.015] border-dashed" />

        {/* Orbiting Particles */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-blue-500 blur-[1px]" style={{ animation: 'float-particle 14s linear infinite' }}></div>
        <div className="absolute w-2 h-2 rounded-full bg-orange-500 blur-[2px]" style={{ animation: 'float-particle 18s linear infinite reverse' }}></div>
        <div className="absolute w-1.5 h-1.5 rounded-full bg-purple-500 blur-[1px]" style={{ animation: 'float-particle 22s linear infinite', animationDelay: '-5s' }}></div>
      </div>

      {/* 2. Central Hub (ALUNO CENTRAL) */}
      <div className="relative z-50">
        <div className="absolute inset-[-18px] border-[1.5px] border-transparent border-t-orange-500/40 border-r-orange-500/20 rounded-full animate-rotate-dashed" />
        <div className="absolute inset-[-10px] border-[1.5px] border-transparent border-b-purple-500/30 border-l-purple-500/10 rounded-full animate-rotate-dashed" style={{ animationDirection: 'reverse', animationDuration: '8s' }} />

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-44 h-44 rounded-full bg-gradient-to-br from-[#ff8a00] via-[#e52e71] to-[#9c27b0] p-[2.5px] shadow-[0_0_100px_-10px_rgba(255,138,0,0.6)]"
        >
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-center overflow-hidden border border-white/30 backdrop-blur-sm">
            <div className="mb-1">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <Users size={44} className="text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-black text-white leading-tight tracking-wider">ALUNO</span>
              <span className="text-[13px] font-black text-white leading-tight tracking-wider">CENTRAL</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Peripheral Cards - NOW TRANSPARENT */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {nodes.map((node, i) => {
          const isLeft = node.position.includes('left');
          const isTop = node.position.includes('top');

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isLeft ? -100 : 100, y: isTop ? -100 : 100 }}
              animate={{ opacity: 1, x: isLeft ? -190 : 190, y: isTop ? -150 : 150 }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
              className="absolute pointer-events-auto group"
            >
              {/* The Glass Card - Reduced Background Opacity for Transparency */}
              <div className="relative w-48 h-36 rounded-[2rem] bg-white/[0.02] backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center p-5 transition-all duration-500 group-hover:scale-110 group-hover:bg-white/[0.05] group-hover:border-white/30 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] overflow-hidden">
                {/* Visual Accent - Colored Top Edge Glow */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] blur-[1px] opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: node.color }}
                />

                <div style={{ color: node.color }} className="mb-3 drop-shadow-[0_0_12px_currentColor] group-hover:scale-115 transition-transform duration-500">
                  {node.icon}
                </div>

                <span className="text-[11px] font-black text-white/90 tracking-[0.25em] text-center uppercase leading-tight">
                  {node.label}
                </span>

                {/* Subtle Internal Radial Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-1000 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${node.color}, transparent 70%)` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/* --- Componente de Analytics --- */
const AnalyticsChart = ({ color }: { color: string }) => {
  const points = "0,80 15,40 30,65 45,25 60,50 75,15 90,45 100,30";
  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl"><TrendingUp size={22} className="text-emerald-400" /></div>
          <div className="flex flex-col gap-1">
            <div className="h-3 w-32 bg-white/10 rounded-full" />
            <div className="h-2 w-16 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="flex gap-1.5">
          {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
        </div>
      </div>
      <div className="relative h-56 w-full mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polyline
            points={areaPoints}
            fill="url(#chartFill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          />
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
};

/* --- Componente Dashboard Bars --- */
const DashboardBars = ({ color }: { color: string }) => {
  const metrics = [
    { label: "Alunos Ativos", value: "1.240", icon: <User size={18} />, trend: "+12%" },
    { label: "Engajamento", value: "94%", icon: <Activity size={18} />, trend: "+5%" }
  ];

  return (
    <div className="relative w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-10">
      <div className="w-full max-w-md bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <LayoutDashboard className="text-white/20" size={20} />
        </div>
        <div className="flex items-end justify-between h-40 gap-3">
          {[55, 80, 45, 95, 60, 85, 70].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.08, duration: 1, ease: "backOut" }}
              className="w-full rounded-t-xl shadow-lg shadow-black/20"
              style={{ background: `linear-gradient(to top, ${color}, ${color}33)` }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full md:w-56">
        {metrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.2 }}
            className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-3xl shadow-2xl flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-white/5 text-white/50">{metric.icon}</div>
              <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-[10px] font-black text-emerald-400">{metric.trend}</div>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-2">{metric.label}</p>
            <h4 className="text-2xl font-black text-white">{metric.value}</h4>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MarketingSection;
