import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LabelList, LineChart, Line, ComposedChart, PieChart, Pie, Cell } from 'recharts';

// --- Inlined: types.ts ---
const FILTERABLE_FIELDS = [
    { key: 'year', label: 'Año' },
    { key: 'month', label: 'Mes' },
    { key: 'campaignName', label: 'Nombre de Campaña' },
    { key: 'sentChannel', label: 'Canal de Envío' },
    { key: 'errorType', label: 'Tipo de Error' },
    { key: 'area', label: 'Área' },
    { key: 'funnelState', label: 'Estado del Funnel' },
    { key: 'commType', label: 'Tipo de Comunicación' },
    { key: 'subscriptionType', label: 'Tipo de Suscripción' },
    { key: 'level', label: 'Nivel' },
    { key: 'modality', label: 'Modalidad' },
    { key: 'preferredChannel', label: 'Canal Preferido' },
];

const MONTH_ORDER: Record<string, number> = {
    'Diciembre': 1, 'Enero': 2, 'Febrero': 3, 'Marzo': 4, 'Abril': 5, 'Mayo': 6, 'Junio': 7,
    'Julio': 8, 'Agosto': 9, 'Septiembre': 10, 'Octubre': 11, 'Noviembre': 12
};

const COLUMN_MAPPING: Record<string, string> = {
    'año': 'year',
    'year': 'year',
    'nombre de campaña': 'campaignName',
    'envio': 'sent',
    'envío': 'sent',
    'entrega de correo': 'delivered',
    'apertura de correo': 'opened',
    'clic de correo': 'clicked',
    'error': 'errorCount',
    'tipo de error': 'errorType',
    'tipo de suscripción': 'subscriptionType',
    'nombre del correo': 'emailName',
    'subject': 'subject',
    'tipo com': 'commType',
    'nivel': 'level',
    'modalidad': 'modality',
    'estado del funnel': 'funnelState',
    'area': 'area',
    'mes': 'month',
    'canal preferido': 'preferredChannel',
    'canal del envio': 'sentChannel',
    'canal de envio': 'sentChannel',
};

// --- Inlined: components/DownloadWrapper.tsx ---
const DownloadWrapper = ({ children, filename }: { children?: React.ReactNode, filename: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = useCallback(async () => {
        if (!ref.current || isDownloading || !(window as any).html2canvas) return;
        setIsDownloading(true);
        try {
            const elementToCapture = ref.current;
            const buttonToHide = elementToCapture.querySelector('.download-button-unique-class') as HTMLElement;
            if (buttonToHide) buttonToHide.style.visibility = 'hidden';

            const canvas = await (window as any).html2canvas(elementToCapture, {
                scale: 4,
                useCORS: true,
                backgroundColor: '#ffffff',
            });
            
            if (buttonToHide) buttonToHide.style.visibility = 'visible';

            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `${filename || 'componente-dashboard'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error al generar la imagen:", error);
            alert("No se pudo descargar la imagen. Por favor, inténtalo de nuevo.");
        } finally {
            setIsDownloading(false);
            if(ref.current) {
                const buttonToHide = ref.current.querySelector('.download-button-unique-class') as HTMLElement;
                if (buttonToHide) buttonToHide.style.visibility = 'visible';
            }
        }
    }, [isDownloading, filename]);

    return (
        <div ref={ref} className="relative group">
             <button
                onClick={handleDownload}
                disabled={isDownloading}
                title="Descargar como imagen 4K"
                className="download-button-unique-class absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-slate-200 hover:text-slate-800 hover:scale-110 disabled:opacity-50 disabled:cursor-wait"
            >
                {isDownloading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
            </button>
            {children}
        </div>
    );
};

// --- Inlined: components/PerformanceLeaders.tsx ---
const PerformanceLeaders = ({ 
    topByOpenRate, 
    topByClickRate,
    bottomByOpenRate,
    bottomByClickRate,
    filter,
    onFilterChange,
}: any) => {
  const getOpenRateSemaphoreClass = (rate: number) => {
      const p = rate * 100;
      if (p >= 38) return 'bg-emerald-500';
      if (p >= 29 && p < 38) return 'bg-amber-400';
      if (p < 29) return 'bg-red-500';
      return 'bg-slate-400';
  };
  const getClickRateSemaphoreClass = (rate: number) => {
      const p = rate * 100;
      if (p >= 5) return 'bg-emerald-500';
      if (p >= 2 && p < 5) return 'bg-amber-400';
      if (p < 2) return 'bg-red-500';
      return 'bg-slate-400';
  };
  const PerformanceList = ({ title, data, metric }: any) => {
      const getSemaphoreClass = metric === 'openRate' ? getOpenRateSemaphoreClass : getClickRateSemaphoreClass;
      return (
          <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-800 mb-3">{title}</h4>
              {data.length > 0 ? (
                  <ul className="space-y-1 pr-2 overflow-y-auto max-h-80">
                      {data.map((item: any, index: number) => (
                          <li key={index} className="flex items-center justify-between py-2.5 border-b border-slate-200/80 last:border-0">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <span className="text-sm font-bold text-slate-400 w-5 text-right">{index + 1}.</span>
                                  <span className="truncate text-sm text-slate-700" title={item.emailName}>{item.emailName}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                  <span className="font-semibold text-sm text-slate-800 w-16 text-right">
                                      {`${(item[metric] * 100).toFixed(1)}%`}
                                  </span>
                                  <span
                                      className={`h-3 w-3 rounded-full ${getSemaphoreClass(item[metric])}`}
                                      title={`${metric === 'openRate' ? 'Tasa de apertura' : 'Tasa de clic'}: ${(item[metric] * 100).toFixed(1)}%`}
                                  ></span>
                              </div>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 min-h-[160px]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-semibold text-slate-600">No hay datos suficientes para mostrar</p>
                      <p className="text-xs text-slate-500 mt-1">(Se requieren entregas >= 100)</p>
                  </div>
              )}
          </div>
      );
  };
  const openRateData = filter === 'top' ? topByOpenRate : bottomByOpenRate;
  const clickRateData = filter === 'top' ? topByClickRate : bottomByClickRate;
  return (
    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800">
                {filter === 'top' ? 'Top 10 Mejores Piezas' : 'Top 10 Peores Piezas'} por Rendimiento
            </h3>
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                <button 
                    onClick={() => onFilterChange('top')}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'top' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                >
                    Mejores
                </button>
                <button 
                    onClick={() => onFilterChange('bottom')}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'bottom' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                >
                    Peores
                </button>
            </div>
        </div>
        <div className="flex flex-col md:flex-row gap-x-8 gap-y-6">
            <PerformanceList title="Por Tasa de Apertura" data={openRateData} metric="openRate" />
            <div className="border-t md:border-t-0 md:border-l border-slate-200/80"></div>
            <PerformanceList title="Por Tasa de Clic" data={clickRateData} metric="clickRate" />
        </div>
    </section>
  );
};

const TopSubjectsCard = ({ data, filter, onFilterChange }: any) => {
    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 mt-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">
                    {filter === 'top' ? 'Top 10 Subjects por Apertura' : 'Peores 10 Subjects por Apertura'}
                </h3>
                <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                    <button 
                        onClick={() => onFilterChange('top')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'top' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                    >
                        Mejores
                    </button>
                    <button 
                        onClick={() => onFilterChange('bottom')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${filter === 'bottom' ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                    >
                        Peores
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {data.length > 0 ? data.map((item: any, index: number) => (
                    <div key={index} className="space-y-1.5 group">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm font-semibold text-slate-700 truncate max-w-[80%] group-hover:text-indigo-600" title={item.subject}>
                                {index + 1}. {item.subject}
                            </span>
                            <span className="text-sm font-bold text-indigo-600">{(item.openRate * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-400"
                                style={{ width: `${item.openRate * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 italic text-center py-4">No hay datos suficientes para mostrar el ranking de subjects.</p>
                )}
            </div>
        </section>
    );
};

// --- Inlined: components/ActivePiecesBreakdown.tsx ---
const ActivePiecesBreakdown = ({ data, lastMonth }: any) => {
    const TypeBadge = ({ label, count, color }: any) => (
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <span className="text-xs font-medium text-slate-600">{label}</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{count}</span>
        </div>
    );
    return (
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Desglose de Piezas Activas</h3>
                    <p className="text-sm text-slate-500">Basado en el último mes con datos: <span className="font-bold text-indigo-600">{lastMonth || 'N/A'}</span></p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                    Piezas Únicas
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.length > 0 ? data.map((item: any) => (
                    <div key={item.channel} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="uppercase">{item.channel}</span>
                            </h4>
                            <span className="text-2xl font-black text-indigo-600">{item.total}</span>
                        </div>
                        <div className="space-y-2">
                            <TypeBadge label="Nurturing" count={item.types.nurturing} color="bg-emerald-400" />
                            <TypeBadge label="Transaccional" count={item.types.transaccional} color="bg-blue-400" />
                            <TypeBadge label="RA" count={item.types.ra} color="bg-amber-400" />
                            {item.types.otros > 0 && <TypeBadge label="Otros" count={item.types.otros} color="bg-slate-300" />}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 italic">No hay datos disponibles para el desglose.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

// --- Inlined: components/CampaignPerformanceSheet.tsx ---
const CampaignPerformanceSheet = ({ data }: any) => {
    const [minOpenRate, setMinOpenRate] = useState(0);
    const [minClickRate, setMinClickRate] = useState(0);
    const [sortBy, setSortBy] = useState('opened');
    const [searchTerm, setSearchTerm] = useState('');

    const campaignMetrics = useMemo(() => {
        const grouped = data.reduce((acc: any, curr: any) => {
            const name = curr.campaignName || 'Sin Nombre';
            if (!acc[name]) {
                acc[name] = { name, delivered: 0, opened: 0, clicked: 0 };
            }
            acc[name].delivered += curr.delivered || 0;
            acc[name].opened += curr.opened || 0;
            acc[name].clicked += curr.clicked || 0;
            return acc;
        }, {});
        return Object.values(grouped)
            .map((c: any) => ({
                ...c,
                openRate: c.delivered > 0 ? parseFloat(((c.opened / c.delivered) * 100).toFixed(2)) : 0,
                clickRate: c.delivered > 0 ? parseFloat(((c.clicked / c.delivered) * 100).toFixed(2)) : 0,
            }))
            .filter(c => 
                c.openRate >= minOpenRate && 
                c.clickRate >= minClickRate &&
                c.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a: any, b: any) => sortBy === 'opened' ? b.openRate - a.openRate : b.clickRate - a.clickRate);
    }, [data, minOpenRate, minClickRate, sortBy, searchTerm]);
    
    const dynamicHeight = Math.max(500, campaignMetrics.length * 55);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <DownloadWrapper filename="comparativa-campañas-grafico">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
                <div className="max-w-md">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Comparativa de Campañas</h3>
                  <p className="text-sm text-slate-500 font-medium">Analiza el impacto relativo de cada pieza. Usa los filtros para refinar la vista.</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar campaña..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                      <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mínimo Apertura</label>
                      <div className="flex items-center gap-2">
                          <input 
                          type="range" min="0" max="100" value={minOpenRate} 
                          onChange={(e) => setMinOpenRate(Number(e.target.value))}
                          className="w-24 accent-indigo-600 cursor-pointer"
                          />
                          <span className="text-xs font-black text-indigo-600 w-10">{minOpenRate}%</span>
                      </div>
                      </div>
                      <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mínimo Clic</label>
                      <div className="flex items-center gap-2">
                          <input 
                          type="range" min="0" max="20" value={minClickRate} 
                          onChange={(e) => setMinClickRate(Number(e.target.value))}
                          className="w-24 accent-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-black text-emerald-600 w-10">{minClickRate}%</span>
                      </div>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 h-10">
                      <button 
                          onClick={() => setSortBy('opened')}
                          className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${sortBy === 'opened' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          Apertura
                      </button>
                      <button 
                          onClick={() => setSortBy('clicked')}
                          className={`px-3 py-1 text-xs font-black rounded-lg transition-all ${sortBy === 'clicked' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                          Clic
                      </button>
                      </div>
                  </div>
                </div>
              </div>
              <div className="relative border border-slate-100 rounded-2xl bg-white shadow-inner overflow-hidden">
                <div className="overflow-y-auto overflow-x-hidden max-h-[700px] pr-2 custom-chart-scrollbar">
                  <div style={{ height: `${dynamicHeight}px`, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={campaignMetrics} 
                        layout="vertical" 
                        margin={{ top: 20, right: 60, left: 30, bottom: 20 }}
                        barGap={8}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                        <XAxis 
                          type="number" 
                          unit="%" 
                          domain={[0, 100]} 
                          orientation="top"
                          tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}}
                          stroke="#e2e8f0"
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={180}
                          tick={{fontSize: 11, fill: '#1e293b', fontWeight: 700}}
                          stroke="#e2e8f0"
                          interval={0}
                        />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                          formatter={(value) => [`${value}%`]}
                        />
                        <Legend verticalAlign="top" align="right" height={40} iconType="circle" wrapperStyle={{paddingBottom: '20px'}} />
                        <Bar dataKey="openRate" name="% Apertura" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={18}>
                          <LabelList 
                              dataKey="openRate" 
                              position="right" 
                              formatter={(v) => `${v}%`} 
                              style={{ fill: '#6366f1', fontSize: '11px', fontWeight: '800' }} 
                              offset={10}
                          />
                        </Bar>
                        <Bar dataKey="clickRate" name="% Clic" fill="#10b981" radius={[0, 6, 6, 0]} barSize={18}>
                          <LabelList 
                              dataKey="clickRate" 
                              position="right" 
                              formatter={(v) => `${v}%`} 
                              style={{ fill: '#10b981', fontSize: '11px', fontWeight: '800' }} 
                              offset={10}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                .custom-chart-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-chart-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-chart-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-chart-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
              `}} />
            </section>
          </DownloadWrapper>
          <DownloadWrapper filename="comparativa-campañas-tabla">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Listado Detallado de Campañas</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">Total: {campaignMetrics.length} campañas filtradas</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Nombre de Campaña</th>
                      <th className="px-6 py-5 text-center">Entregados</th>
                      <th className="px-6 py-5">Rendimiento (Apertura / Clic)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaignMetrics.map((c: any, i) => (
                      <tr key={i} className="hover:bg-indigo-50/20 transition-all group">
                        <td className="px-8 py-4">
                          <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors" title={c.name}>{c.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-black text-slate-500">{c.delivered.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2 w-full max-w-xs">
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Apertura</span>
                               <span className="text-xs font-black text-indigo-600">{c.openRate}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(c.openRate, 100)}%` }}></div>
                             </div>
                             
                             <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Clic</span>
                               <span className="text-xs font-black text-emerald-600">{c.clickRate}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(c.clickRate * 5, 100)}%` }}></div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {campaignMetrics.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold italic bg-slate-50/50">
                          <div className="flex flex-col items-center gap-2">
                              <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              No se encontraron campañas con los criterios actuales.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </DownloadWrapper>
        </div>
    );
};

// --- Inlined: components/ErrorAnalysisSheet.tsx ---
const ErrorAnalysisSheet = ({ data }: any) => {
    const [errorTypeFilter, setErrorTypeFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ key: 'delivered' | 'errors' | 'errorRate', direction: string }>({ key: 'errors', direction: 'descending' });

    const uniqueErrorTypes = useMemo(() => {
        const types = new Set();
        data.forEach((d: any) => {
            if (d.errorType && d.errorType.trim() !== '') {
                types.add(d.errorType.trim());
            }
        });
        return Array.from(types).sort();
    }, [data]);
    const filteredData = useMemo(() => {
        if (errorTypeFilter === 'all') return data;
        return data.filter((d: any) => d.errorType === errorTypeFilter);
    }, [data, errorTypeFilter]);

    const requestSort = (key: string) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key: key as 'delivered' | 'errors' | 'errorRate', direction });
    };

    const stats = useMemo(() => {
        const grouping = filteredData.reduce((acc, curr: any) => {
            const name = curr.emailName || 'Sin Nombre';
            const level = curr.level || 'N/A';
            const modality = curr.modality || 'N/A';
            const key = `${name}-${level}-${modality}`;
            if (!acc[key]) {
                acc[key] = { name, level, modality, delivered: 0, errors: 0 };
            }
            acc[key].delivered += (curr.delivered || 0);
            acc[key].errors += (curr.errorCount || 0);
            return acc;
        }, {} as Record<string, { name: string; level: string; modality: string; delivered: number; errors: number; }>);

        const baseMetrics = Object.values(grouping)
            .map((e: any) => ({
                ...e,
                errorRate: e.delivered > 0 ? (Number(e.errors) / Number(e.delivered)) * 100 : 0,
            }));

        const sortedItems = [...baseMetrics].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        const totals = baseMetrics.reduce((acc, curr) => ({
            delivered: acc.delivered + (Number(curr.delivered) || 0),
            errors: acc.errors + (Number(curr.errors) || 0),
        }), { delivered: 0, errors: 0 });

        const globalErrorRate = totals.delivered > 0 ? (totals.errors / totals.delivered) * 100 : 0;
        
        const typeGrouped = filteredData.reduce((acc: Record<string, number>, curr: any) => {
            const type = curr.errorType || 'No especificado';
            if (curr.errorCount > 0) {
                acc[type] = (acc[type] ?? 0) + (Number(curr.errorCount) || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        const errorTypeData = Object.entries(typeGrouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return { totals, globalErrorRate, sortedItems, errorTypeData, totalItems: baseMetrics.length };
    }, [filteredData, sortConfig]);
    
    const COLORS = {
        success: '#10b981',
        error: '#ef4444',
    };
    const volumeChartData = [
        { name: 'Entregas Exitosas', value: Math.max(0, stats.totals.delivered - stats.totals.errors), color: COLORS.success },
        { name: 'Volumen de Errores', value: stats.totals.errors, color: COLORS.error }
    ];

    const SortableHeader = ({ label, columnKey }: { label: string, columnKey: string }) => (
        <th className="px-4 py-4 text-center">
            <button 
                onClick={() => requestSort(columnKey)} 
                className="flex items-center justify-center w-full gap-1 group"
            >
                <span className="group-hover:text-indigo-600 transition-colors">{label}</span>
                {sortConfig.key === columnKey && (
                    <span className="text-indigo-600">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                    </span>
                )}
            </button>
        </th>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Filtrar por Causa</p>
                        <select 
                            value={errorTypeFilter} 
                            onChange={(e) => setErrorTypeFilter(e.target.value)}
                            className="text-sm border-none bg-transparent font-bold text-slate-700 outline-none cursor-pointer focus:ring-0 p-0"
                        >
                            <option value="all">Todos los tipos de error</option>
                            {uniqueErrorTypes.map((type: any) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <DownloadWrapper filename="kpis-errores">
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volumen Total</p>
                      <p className="text-2xl font-black text-slate-800">{stats.totals.delivered.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-red-100 bg-red-50/10">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Total Errores</p>
                      <p className="text-2xl font-black text-red-600">{stats.totals.errors.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">% Tasa de Error</p>
                      <p className="text-2xl font-black text-slate-800">{stats.globalErrorRate.toFixed(2)}%</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Piezas Únicas</p>
                      <p className="text-2xl font-black text-indigo-600">{stats.totalItems}</p>
                  </div>
              </section>
            </DownloadWrapper>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DownloadWrapper filename="estado-entregas">
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 lg:col-span-1 h-full">
                      <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-tight">Estado General de Entregas</h3>
                      <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={volumeChartData}
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                  >
                                      {volumeChartData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => (value as number).toLocaleString()} />
                                  <Legend iconType="circle" verticalAlign="bottom" />
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </section>
                </DownloadWrapper>
                <DownloadWrapper filename="causas-fallo">
                  <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 lg:col-span-2 h-full">
                      <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-tight">Principales Causas de Fallo</h3>
                      <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.errorTypeData.slice(0, 8)} margin={{ left: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="name" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                                  <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                  <Tooltip 
                                      cursor={{fill: '#f8fafc'}}
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  />
                                  <Bar dataKey="value" name="Errores" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={45} />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </section>
                </DownloadWrapper>
            </div>
            <DownloadWrapper filename="analisis-errores-tabla">
              <section className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div>
                          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">
                              Análisis Detallado de Piezas
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-1">
                              Haz clic en los encabezados para ordenar la tabla.
                          </p>
                      </div>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                              <tr>
                                  <th className="px-6 py-4">Pieza / Correo</th>
                                  <th className="px-4 py-4">Nivel / Modalidad</th>
                                  <SortableHeader label="Entregas" columnKey="delivered" />
                                  <SortableHeader label="Errores" columnKey="errors" />
                                  <SortableHeader label="% Error" columnKey="errorRate" />
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {stats.sortedItems.map((e: any, i) => (
                                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-slate-700 truncate max-w-[200px]" title={e.name}>{e.name}</div>
                                      </td>
                                      <td className="px-4 py-4">
                                          <div className="flex flex-col gap-1">
                                              <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase w-fit">{e.level}</span>
                                              <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-md uppercase w-fit">{e.modality}</span>
                                          </div>
                                      </td>
                                      <td className="px-4 py-4 text-center font-bold text-slate-600">
                                          {e.delivered.toLocaleString()}
                                      </td>
                                      <td className={`px-4 py-4 text-center font-black ${e.errors > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                          {e.errors.toLocaleString()}
                                      </td>
                                      <td className="px-4 py-4 text-center">
                                          <div className="flex flex-col items-center gap-1">
                                              <span className={`font-black text-xs ${e.errorRate > 10 ? 'text-red-600' : e.errorRate > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                  {e.errorRate.toFixed(2)}%
                                              </span>
                                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                  <div 
                                                      className={`h-full ${e.errorRate > 10 ? 'bg-red-500' : 'bg-amber-400'}`} 
                                                      style={{ width: `${Math.min(e.errorRate, 100)}%` }}
                                                  ></div>
                                              </div>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                              {stats.sortedItems.length === 0 && (
                                  <tr>
                                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic bg-slate-50/50">
                                          No se encontraron piezas con errores para los filtros seleccionados.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </section>
            </DownloadWrapper>
        </div>
    );
};

const MonthlyMetricsChart = ({ data, visibleMetrics, onToggleMetric }: any) => {
    return (
        <DownloadWrapper filename="rendimiento-compilado-mensual">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mt-6">
                {!data || data.length === 0 ? (
                    <>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Rendimiento Compilado por Mes</h3>
                      <div className="h-[400px] flex items-center justify-center text-slate-500 italic">
                          No hay datos suficientes para mostrar este gráfico.
                      </div>
                    </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Rendimiento Compilado por Mes</h3>
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end w-full">
                            {Object.keys(visibleMetrics).map(metric => (
                                <button
                                    key={metric}
                                    onClick={() => onToggleMetric(metric)}
                                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all border ${
                                        (visibleMetrics as any)[metric]
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {metric}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
                                <YAxis yAxisId="right" orientation="right" unit="%" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number, name) => [name.includes('%') ? `${value.toFixed(1)}%` : value.toLocaleString(), name]}
                                />
                                <Legend iconType="circle" />
                                {visibleMetrics['Envíos'] && <Bar yAxisId="left" dataKey="Envíos" fill="#a5b4fc" radius={[4, 4, 0, 0]} barSize={20}>
                                    {/* Fix: added type casting for value to prevent 'unknown' error in arithmetic operation */}
                                    <LabelList dataKey="Envíos" content={(props: any) => { const { x, y, width, value } = props; if ((value as any) <= 0) return null; const fv = (value as number) >= 1000 ? `${((value as number) / 1000).toFixed(1)}k` : (value as number).toLocaleString(); return <text x={x + width / 2} y={y} dy={-4} fill="#475569" fontSize={10} fontWeight="bold" textAnchor="middle">{fv}</text>; }} />
                                </Bar>}
                                {visibleMetrics['Entregados'] && <Bar yAxisId="left" dataKey="Entregados" fill="#7dd3fc" radius={[4, 4, 0, 0]} barSize={20}>
                                    {/* Fix: added type casting for value to prevent 'unknown' error in arithmetic operation */}
                                    <LabelList dataKey="Entregados" content={(props: any) => { const { x, y, width, value } = props; if ((value as any) <= 0) return null; const fv = (value as number) >= 1000 ? `${((value as number) / 1000).toFixed(1)}k` : (value as number).toLocaleString(); return <text x={x + width / 2} y={y} dy={-4} fill="#475569" fontSize={10} fontWeight="bold" textAnchor="middle">{fv}</text>; }} />
                                </Bar>}
                                {visibleMetrics['Aperturas'] && <Bar yAxisId="left" dataKey="Aperturas" fill="#6ee7b7" radius={[4, 4, 0, 0]} barSize={20}>
                                     {/* Fix: added type casting for value to prevent 'unknown' error in arithmetic operation */}
                                     <LabelList dataKey="Aperturas" content={(props: any) => { const { x, y, width, value } = props; if ((value as any) <= 0) return null; const fv = (value as number) >= 1000 ? `${((value as number) / 1000).toFixed(1)}k` : (value as number).toLocaleString(); return <text x={x + width / 2} y={y} dy={-4} fill="#475569" fontSize={10} fontWeight="bold" textAnchor="middle">{fv}</text>; }} />
                                </Bar>}
                                {visibleMetrics['Clics'] && <Bar yAxisId="left" dataKey="Clics" fill="#fde047" radius={[4, 4, 0, 0]} barSize={20}>
                                     {/* Fix: added type casting for value to prevent 'unknown' error in arithmetic operation */}
                                     <LabelList dataKey="Clics" content={(props: any) => { const { x, y, width, value } = props; if ((value as any) <= 0) return null; const fv = (value as number) >= 1000 ? `${((value as number) / 1000).toFixed(1)}k` : (value as number).toLocaleString(); return <text x={x + width / 2} y={y} dy={-4} fill="#475569" fontSize={10} fontWeight="bold" textAnchor="middle">{fv}</text>; }} />
                                </Bar>}
                                {visibleMetrics['CTO (%)'] && <Line yAxisId="right" type="monotone" dataKey="CTO (%)" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                  </>
                )}
            </section>
        </DownloadWrapper>
    );
};

const MonthlySegmentBreakdown = ({ data }: any) => {
    const analysis = useMemo(() => {
        const allMonths = Array.from(new Set(data.map((d: any) => d.month as string).filter(Boolean)))
            .sort((a: string, b: string) => (Number(MONTH_ORDER[a]) || 0) - (Number(MONTH_ORDER[b]) || 0)) as string[];

        if (allMonths.length < 1) return { segments: [], months: [] };

        const getGroupKey = (row: any) => {
            const level = (row.level || 'N/A').trim();
            const modality = (row.modality || 'N/A').trim();
            if (level === 'N/A' && modality === 'N/A') return 'Otros';
            return `${level} / ${modality}`;
        };

        const groupedData = data.reduce((acc: any, row: any) => {
            const key = getGroupKey(row);
            const month = row.month as string;
            if (!month) return acc;

            if (!acc[key]) acc[key] = {};
            if (!acc[key][month]) acc[key][month] = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
            
            acc[key][month].sent += row.sent || 0;
            acc[key][month].delivered += row.delivered || 0;
            acc[key][month].opened += row.opened || 0;
            acc[key][month].clicked += row.clicked || 0;
            
            return acc;
        }, {} as Record<string, Record<string, { sent: number, delivered: number, opened: number, clicked: number }>>);

        const segments = Object.keys(groupedData).map(segmentName => {
            const monthlyMetrics: Record<string, any> = {};
            
            allMonths.forEach(month => {
                const monthData = (groupedData as any)[segmentName][month];
                if (monthData) {
                    monthlyMetrics[month] = {
                        delivered: monthData.delivered,
                        openRate: monthData.delivered > 0 ? (monthData.opened / monthData.delivered) * 100 : 0,
                        clickRate: monthData.delivered > 0 ? (monthData.clicked / monthData.delivered) * 100 : 0,
                        cto: monthData.opened > 0 ? (monthData.clicked / monthData.opened) * 100 : 0,
                    };
                } else {
                     monthlyMetrics[month] = { delivered: 0, openRate: 0, clickRate: 0, cto: 0 };
                }
            });

            return { name: segmentName, metrics: monthlyMetrics };
        }).sort((a,b) => {
            const totalA = Object.values(a.metrics).reduce((sum: number, m: any) => sum + (m.delivered || 0), 0);
            const totalB = Object.values(b.metrics).reduce((sum: number, m: any) => sum + (m.delivered || 0), 0);
            return totalB - totalA;
        });
        
        return { segments, months: allMonths };

    }, [data]);

    if (analysis.segments.length === 0) {
        return null;
    }

    const metricLabels = [
        { key: 'delivered', label: 'Entregas' },
        { key: 'openRate', label: '% Apertura' },
        { key: 'clickRate', label: '% Clic' },
        { key: 'cto', label: '% CTO' },
    ];

    const formatValue = (value: number, key: string) => {
        if (key === 'delivered') return value.toLocaleString();
        return `${value.toFixed(1)}%`;
    };

    return (
        <DownloadWrapper filename="analisis_segmentos_por_mes">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mt-6">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Análisis de Segmentos por Mes</h3>
                    <p className="text-sm text-slate-500 font-medium">
                        Desglose mensual de métricas clave por Nivel y Modalidad.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-slate-50 z-10">Segmento</th>
                                <th className="px-4 py-4">Métrica</th>
                                {analysis.months.map(month => (
                                    /* Fix: cast 'month' to any to avoid key rendering issues */
                                    <th key={month as any} className="px-4 py-4 text-center">{month as any}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {analysis.segments.map((segment, segIndex) => (
                                <React.Fragment key={segment.name}>
                                    {metricLabels.map((metric, metricIndex) => (
                                        <tr key={`${segment.name}-${metric.key}`} className="hover:bg-slate-50/50 group">
                                            {metricIndex === 0 && (
                                                <td 
                                                  rowSpan={metricLabels.length} 
                                                  className="px-6 py-4 font-bold text-slate-700 uppercase align-top sticky left-0 bg-white group-hover:bg-slate-50/50 z-10"
                                                >
                                                  <div className="pt-2">{segment.name}</div>
                                                </td>
                                            )}
                                            <td className="px-4 py-3 font-semibold text-slate-500">{metric.label}</td>
                                            {analysis.months.map(month => (
                                                /* Fix: cast 'month' to any and metric indexing for rendering */
                                                <td key={`${segment.name}-${metric.key}-${month}`} className="px-4 py-3 text-center font-bold text-slate-800">
                                                    {formatValue((segment.metrics as any)[month as string]?.[metric.key] ?? 0, metric.key)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </DownloadWrapper>
    );
};

// --- Inlined: components/ExecutiveReportSheet.tsx ---
const ExecutiveReportSheet = ({ data }: any) => {
    const [visibleMetrics, setVisibleMetrics] = useState({
        'Envíos': true,
        'Entregados': true,
        'Aperturas': true,
        'Clics': true,
        'CTO (%)': true,
    });

    const toggleMetricVisibility = (metric: string) => {
        setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
    };
    
    const analysis = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                currentMonth: null, prevMonth: null, channelMetrics: [], subscriptionMetrics: [],
                commTypeMetrics: [], executiveInsights: [], conclusions: [], trendData: [], monthlyMetrics: []
            };
        }

        const months = Array.from(new Set(data.map((d: any) => d.month as string).filter(Boolean))).sort((a: string, b: string) => ((MONTH_ORDER[a] as number) || 0) - ((MONTH_ORDER[b] as number) || 0));
        
        if (months.length === 0) {
             return {
                currentMonth: null, prevMonth: null, channelMetrics: [], subscriptionMetrics: [],
                commTypeMetrics: [], executiveInsights: [], conclusions: [], trendData: [], monthlyMetrics: []
            };
        }

        const currentMonth = months[months.length - 1];
        const prevMonth = months[months.length - 2];

        const calculateMetrics = (dataset: any[]) => {
            const stats = dataset.reduce((acc, curr) => ({
                sent: acc.sent + (curr.sent || 0),
                delivered: acc.delivered + (curr.delivered || 0),
                opened: acc.opened + (curr.opened || 0),
                clicked: acc.clicked + (curr.clicked || 0),
            }), { sent: 0, delivered: 0, opened: 0, clicked: 0 });
            return {
                ...stats,
                deliveryRate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0,
                openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0,
                clickRate: stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0,
                cto: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0
            };
        };
        const currentStats = calculateMetrics(data.filter((d: any) => d.month === currentMonth));
        const prevStats = prevMonth ? calculateMetrics(data.filter((d: any) => d.month === prevMonth)) : null;
        const groupByField = (dataset: any[], field: string) => {
            const groups: any = {};
            dataset.forEach((row: Record<string, any>) => {
                const key = String(row[field] || 'Sin especificar');
                if (!groups[key]) groups[key] = { name: key, sent: 0, delivered: 0, opened: 0, clicked: 0 };
                groups[key].sent += row.sent || 0;
                groups[key].delivered += row.delivered || 0;
                groups[key].opened += row.opened || 0;
                groups[key].clicked += row.clicked || 0;
            });
            return Object.values(groups).map((g: any) => ({
                ...g,
                deliveryRate: g.sent > 0 ? (g.delivered / g.sent) * 100 : 0,
                openRate: g.delivered > 0 ? (g.opened / g.delivered) * 100 : 0,
                clickRate: g.delivered > 0 ? (g.clicked / g.delivered) * 100 : 0,
                cto: g.opened > 0 ? (g.clicked / g.opened) * 100 : 0
            }));
        };
        const currentData = data.filter((d: any) => d.month === currentMonth);
        const channelMetrics = groupByField(currentData, 'sentChannel');
        const subscriptionMetrics = groupByField(currentData, 'subscriptionType');
        const commTypeMetrics = groupByField(currentData, 'commType');
        const areaMetrics = groupByField(currentData, 'area');
        const executiveInsights: any[] = [];
        if (prevStats) {
            /* Fix: cast currentStats and prevStats to any for arithmetic operations */
            const sentDiff = (((currentStats as any).sent - (prevStats as any).sent) / (prevStats as any).sent) * 100;
            executiveInsights.push({
                title: "Escalabilidad de Envío",
                text: `El volumen de envíos ha ${sentDiff >= 0 ? 'aumentado' : 'disminuido'} un ${Math.abs(sentDiff).toFixed(1)}% respecto a ${prevMonth}.`,
                type: sentDiff >= 0 ? 'positive' : 'neutral',
                trend: `${sentDiff >= 0 ? '↑' : '↓'} ${Math.abs(sentDiff).toFixed(1)}%`
            });
            const openDiff = currentStats.openRate - prevStats.openRate;
            executiveInsights.push({
                title: "Efectividad de Engagement",
                text: `La tasa de apertura global se situó en ${currentStats.openRate.toFixed(1)}%, lo que representa un ${openDiff >= 0 ? 'incremento' : 'descenso'} de ${Math.abs(openDiff).toFixed(2)} p.p.`,
                type: openDiff >= 0 ? 'positive' : 'negative',
                trend: `${openDiff >= 0 ? '↑' : '↓'} ${Math.abs(openDiff).toFixed(2)} p.p.`
            });
            const ctoDiff = currentStats.cto - prevStats.cto;
            executiveInsights.push({
                title: "Relevancia del Contenido (CTO)",
                text: `La eficiencia de los clics (CTO) ${ctoDiff > 0 ? 'mejoró' : 'empeoró'} notablemente. Los usuarios están ${ctoDiff > 0 ? 'más' : 'menos'} interesados en el CTA.`,
                type: ctoDiff > 0 ? 'positive' : 'negative',
                trend: `${ctoDiff > 0 ? '↑' : '↓'} ${Math.abs(ctoDiff).toFixed(1)}%`
            });
        }
        const conclusions: any[] = [];
        const bestChannel = [...channelMetrics].sort((a, b) => b.openRate - a.openRate)[0];
        if (bestChannel) conclusions.push(`📌 El canal **${bestChannel.name}** lidera el engagement con un ${bestChannel.openRate.toFixed(1)}% de apertura.`);
        const bestSub = [...subscriptionMetrics].sort((a, b) => b.openRate - a.openRate)[0];
        if (bestSub) conclusions.push(`📈 El segmento de suscripción **${bestSub.name}** presenta la mayor fidelidad con una tasa de apertura del ${bestSub.openRate.toFixed(1)}%.`);
        const bestComm = [...commTypeMetrics].sort((a, b) => b.cto - a.cto)[0];
        if (bestComm) conclusions.push(`💡 Las comunicaciones de tipo **${bestComm.name}** optimizan la conversión, logrando el CTO más alto del periodo (${bestComm.cto.toFixed(1)}%).`);
        const bestArea = [...areaMetrics].sort((a, b) => b.openRate - a.openRate)[0];
        if (bestArea) conclusions.push(`🎯 La línea de negocio **${bestArea.name}** destaca como el área con mejor recepción de contenido global.`);
        const trendData = months.map(m => {
            const s = calculateMetrics(data.filter((d: any) => d.month === m));
            return { name: m, Apertura: s.openRate, Clic: s.clickRate, Entrega: s.deliveryRate };
        });
        
        const monthlyMetrics = months.map(m => {
            const monthData = data.filter((d: any) => d.month === m);
            const stats = monthData.reduce((acc, curr) => {
                acc.sent += (curr.sent || 0);
                acc.delivered += (curr.delivered || 0);
                acc.opened += (curr.opened || 0);
                acc.clicked += (curr.clicked || 0);
                return acc;
            }, { sent: 0, delivered: 0, opened: 0, clicked: 0 });

            return {
                name: m,
                'Envíos': stats.sent,
                'Entregados': stats.delivered,
                'Aperturas': stats.opened,
                'Clics': stats.clicked,
                'CTO (%)': stats.opened > 0 ? parseFloat(((stats.clicked / stats.opened) * 100).toFixed(1)) : 0,
            };
        });

        return { currentMonth, prevMonth, channelMetrics, subscriptionMetrics, commTypeMetrics, executiveInsights, conclusions, trendData, monthlyMetrics };
    }, [data]);

    const MetricComparisonCard = ({ title, metrics, icon }: any) => {
        if (!metrics || metrics.length === 0) return null;
        const volumeLeader = [...metrics].sort((a, b) => b.sent - a.sent)[0];
        const performanceLeader = [...metrics].sort((a, b) => b.openRate - a.openRate)[0];
        return (
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">{icon}</div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Más Enviado (Volumen)</p>
                        <p className="text-slate-800 font-black text-lg truncate" title={volumeLeader?.name}>{volumeLeader?.name as any}</p>
                        <p className="text-indigo-600 font-bold text-sm">{volumeLeader?.sent.toLocaleString()} envíos</p>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Mejor Rendimiento</p>
                        <p className="text-slate-800 font-black text-lg truncate" title={performanceLeader?.name}>{performanceLeader?.name as any}</p>
                        <p className="text-emerald-600 font-bold text-sm">{performanceLeader?.openRate.toFixed(1)}% apertura</p>
                    </div>
                </div>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={metrics.slice(0, 5)} margin={{ top: 20, right: 10, left: -20, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{fontSize: 9}} axisLine={false} tickLine={false} unit="%" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}/>
                            <Bar yAxisId="left" dataKey="sent" name="Envíos" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
                            <Line yAxisId="right" type="monotone" dataKey="openRate" name="% Apertura" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                <LabelList 
                                    dataKey="openRate" 
                                    position="top" 
                                    offset={8} 
                                    formatter={(value: number) => `${value.toFixed(1)}%`} 
                                    style={{ fontSize: '10px', fontWeight: 'bold', fill: '#4f46e5' }} 
                                />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </section>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
          <DownloadWrapper filename="reporte-ejecutivo-cabecera">
            <header className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Reporte Ejecutivo</span>
                  <span className="text-slate-400 text-sm font-bold">Análisis: {analysis.currentMonth || 'N/A'} {analysis.prevMonth && `vs ${analysis.prevMonth}`}</span>
                </div>
                <h2 className="text-4xl font-black mb-2 tracking-tight">Insights de Performance</h2>
                <p className="text-slate-400 text-lg max-w-2xl font-medium">Análisis automatizado de tendencias y salud de canales digitales para la toma de decisiones estratégicas.</p>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-64 w-64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
              </div>
            </header>
          </DownloadWrapper>
          <DownloadWrapper filename="reporte-ejecutivo-insights">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysis.executiveInsights.length > 0 ? analysis.executiveInsights.map((insight, i) => (
                <div key={i} className={`p-6 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${insight.type === 'positive' ? 'border-emerald-100' : insight.type === 'negative' ? 'border-red-100' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{insight.title}</h4>
                    <span className={`text-xs font-black px-2 py-1 rounded-lg ${insight.type === 'positive' ? 'bg-emerald-100 text-emerald-600' : insight.type === 'negative' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      {insight.trend}
                    </span>
                  </div>
                  <p className="text-slate-700 font-bold leading-snug">{insight.text}</p>
                </div>
              )) : (
                <div className="col-span-3 p-8 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center">
                  <p className="text-slate-500 font-medium italic">Se requiere más de un mes de datos para generar comparativas automáticas.</p>
                </div>
              )}
            </section>
          </DownloadWrapper>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DownloadWrapper filename="reporte-ejecutivo-conclusiones">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 lg:col-span-1">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Conclusiones Estratégicas
                </h3>
                <div className="space-y-4">
                  {analysis.conclusions.map((text, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                       <div className="mt-1 flex-shrink-0">
                          <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                       </div>
                       <p className="text-slate-700 text-sm font-bold leading-relaxed">{text.replace(/^[^\s]+\s/, '')}</p>
                    </div>
                  ))}
                </div>
              </section>
            </DownloadWrapper>
            <DownloadWrapper filename="reporte-ejecutivo-tendencia">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 lg:col-span-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Tendencia de Eficacia Mensual</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysis.trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                      <YAxis unit="%" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toFixed(2)}%`, '']}
                      />
                      <Legend iconType="circle" />
                      <Line type="monotone" dataKey="Apertura" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Clic" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </DownloadWrapper>
          </div>

          <MonthlyMetricsChart 
            data={analysis.monthlyMetrics}
            visibleMetrics={visibleMetrics}
            onToggleMetric={toggleMetricVisibility}
          />
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DownloadWrapper filename="analisis-suscripcion">
              <MetricComparisonCard 
                title="Análisis de Suscripción" 
                metrics={analysis.subscriptionMetrics} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
            </DownloadWrapper>
            <DownloadWrapper filename="analisis-tipo-comunicacion">
              <MetricComparisonCard 
                title="Tipo de Comunicación" 
                metrics={analysis.commTypeMetrics} 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
              />
            </DownloadWrapper>
          </section>
          <DownloadWrapper filename="canales-activos-detalle">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="font-black text-slate-800 text-base uppercase tracking-tight">Canales Activos - Detalle</h4>
                  <p className="text-xs text-slate-500 font-bold">Resumen de performance por canal en el mes de {analysis.currentMonth}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-4">Canal</th>
                      <th className="px-6 py-4 text-center">Entrega %</th>
                      <th className="px-6 py-4 text-center">Apertura %</th>
                      <th className="px-6 py-4 text-center">CTO</th>
                      <th className="px-8 py-4 text-right">Volumen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysis.channelMetrics.map((m, i) => (
                      <tr key={i} className="hover:bg-indigo-50/10 transition-colors">
                        <td className="px-8 py-5">
                          <span className="font-black text-slate-800 uppercase tracking-tight">{m.name}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-2 py-1 rounded-lg font-black text-[10px] ${m.deliveryRate > 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {m.deliveryRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-slate-700">{m.openRate.toFixed(1)}%</td>
                        <td className="px-6 py-5 text-center font-black text-indigo-600">{m.cto.toFixed(1)}%</td>
                        <td className="px-8 py-5 text-right font-black text-slate-500">{m.sent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </DownloadWrapper>
          <MonthlySegmentBreakdown data={data} />
        </div>
    );
};

// --- Inlined: components/BusinessSegmentAnalysis.tsx ---
const BusinessSegmentAnalysis = ({ data }: any) => {
    const [activeSegment, setActiveSegment] = useState('area');
    const segmentLabels: Record<string, string> = {
        area: 'Línea de Negocio',
        level: 'Nivel',
        modality: 'Modalidad',
        level_modality: 'Nivel + Modalidad'
    };
    const analysis = useMemo(() => {
        if (!data || data.length === 0) {
            return { results: [], currentMonth: null, prevMonth: null };
        }

        const availableMonths = Array.from(new Set(data.map((d: any) => d.month as string).filter(Boolean)))
            .sort((a: string, b: string) => ((MONTH_ORDER[a] as number) || 99) - ((MONTH_ORDER[b] as number) || 99)) as string[];

        if (availableMonths.length === 0) {
            return { results: [], currentMonth: 'N/A', prevMonth: null };
        }

        /* Fix: cast availableMonths as any to bypass index type errors */
        const currentMonth = (availableMonths as any)[availableMonths.length - 1];
        const prevMonth = (availableMonths as any)[availableMonths.length - 2];

        const getGroupKey = (row: Record<string, any>): string => {
            if (activeSegment === 'level_modality') {
                return `${row.level || 'N/A'} - ${row.modality || 'N/A'}`;
            }
            return String(row[activeSegment] || 'No especificado').trim();
        };
        const processData = (dataset: any[]) => {
            const groups: any = {};
            dataset.forEach((row: Record<string, any>) => {
                const key: string = getGroupKey(row);
                if (!groups[key]) groups[key] = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
                groups[key].sent += (row.sent || 0);
                groups[key].delivered += (row.delivered || 0);
                groups[key].opened += (row.opened || 0);
                groups[key].clicked += (row.clicked || 0);
            });
            return groups;
        };
        const currentGroups = processData(data.filter((d: any) => d.month === currentMonth));
        const prevGroups = prevMonth ? processData(data.filter((d: any) => d.month === prevMonth)) : {};
        const allKeys = Array.from(new Set([...Object.keys(currentGroups), ...Object.keys(prevGroups)]));
        const calculateRate = (num: number, den: number) => den > 0 ? (num / den) * 100 : 0;
        const results = allKeys.map(key => {
            const curr = currentGroups[key] || { sent: 0, delivered: 0, opened: 0, clicked: 0 };
            const prev = prevGroups[key] || { sent: 0, delivered: 0, opened: 0, clicked: 0 };
            const currMetrics = {
                delivery: calculateRate(curr.delivered, curr.sent),
                open: calculateRate(curr.opened, curr.delivered),
                click: calculateRate(curr.clicked, curr.delivered),
                cto: calculateRate(curr.clicked, curr.opened)
            };
            const prevMetrics = {
                delivery: calculateRate(prev.delivered, prev.sent),
                open: calculateRate(prev.opened, prev.delivered),
                click: calculateRate(prev.clicked, prev.delivered),
                cto: calculateRate(prev.clicked, prev.opened)
            };
            const createComp = (c: number, p: number) => ({ current: c, previous: p, diff: c - p });
            return {
                name: key,
                sent: createComp(curr.sent, prev.sent),
                deliveryRate: createComp(currMetrics.delivery, prevMetrics.delivery),
                openRate: createComp(currMetrics.open, prevMetrics.open),
                clickRate: createComp(currMetrics.click, prevMetrics.click),
                cto: createComp(currMetrics.cto, prevMetrics.cto)
            };
        });
        return {
            results: results.sort((a, b) => b.sent.current - a.sent.current),
            currentMonth,
            prevMonth
        };
    }, [data, activeSegment]);
    
    const DeltaIndicator = ({ diff, isPercentage = true }: { diff: number, isPercentage?: boolean }) => {
        if (diff === undefined || diff === null || Math.abs(diff) < 0.01) return <span className="text-[10px] text-slate-400 font-bold ml-1">--</span>;
        const isPos = diff > 0;
        return (
            <span className={`text-[10px] font-black ml-1 flex items-center ${isPos ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPos ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}{isPercentage ? '' : ''}
            </span>
        );
    };

    return (
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 mt-6">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Comparativa Mensual</span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Análisis Estratégico</h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Rendimiento de {analysis.currentMonth || 'N/A'} {analysis.prevMonth ? `vs ${analysis.prevMonth}` : '(Datos insuficientes para comparar)'}
              </p>
            </div>
            
            <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200">
              {Object.keys(segmentLabels).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSegment(key)}
                  className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                    activeSegment === key 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {segmentLabels[key]}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                <tr>
                  {/* Fix: cast segmentLabels indexing as any for rendering */}
                  <th className="px-6 py-4">{(segmentLabels as any)[activeSegment]}</th>
                  <th className="px-4 py-4 text-right">Volumen</th>
                  <th className="px-4 py-4 text-center">Entrega %</th>
                  <th className="px-4 py-4 text-center">Apertura %</th>
                  <th className="px-4 py-4 text-center">Clic %</th>
                  <th className="px-4 py-4 text-center">CTO (Eficacia)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.results.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700 uppercase tracking-tight block max-w-[200px] truncate" title={row.name}>
                        {row.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <div className="flex flex-col items-end">
                          <span className="font-black text-slate-600">{row.sent.current.toLocaleString()}</span>
                          {analysis.prevMonth && <DeltaIndicator diff={row.sent.current - row.sent.previous} isPercentage={false} />}
                       </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] ${row.deliveryRate.current > 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {row.deliveryRate.current.toFixed(1)}%
                        </span>
                        {analysis.prevMonth && <DeltaIndicator diff={row.deliveryRate.diff} />}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 min-w-[110px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-indigo-600">{row.openRate.current.toFixed(1)}%</span>
                          {analysis.prevMonth && <DeltaIndicator diff={row.openRate.diff} />}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(row.openRate.current, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 min-w-[110px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-600">{row.clickRate.current.toFixed(1)}%</span>
                          {analysis.prevMonth && <DeltaIndicator diff={row.clickRate.diff} />}
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(row.clickRate.current * 5, 100)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-black text-indigo-700">{row.cto.current.toFixed(1)}%</span>
                        {analysis.prevMonth && <DeltaIndicator diff={row.cto.diff} />}
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">CTO</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    );
};

// --- Inlined: App.tsx ---
const App = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('dashboard_activeTab');
        return savedTab ? JSON.parse(savedTab) : 'summary';
    });

    const [filters, setFilters] = useState<Record<string, string[]>>(() => {
        try {
            const savedFilters = localStorage.getItem('dashboard_filters');
            return savedFilters ? JSON.parse(savedFilters) : {};
        } catch (error) {
            console.error("Error al cargar filtros desde localStorage:", error);
            return {};
        }
    });
    
    const [visibleMonthlyInteractions, setVisibleMonthlyInteractions] = useState({
        delivered: true,
        openRate: true,
        clickRate: true,
    });

    const toggleMonthlyInteraction = (dataKey: string) => {
        setVisibleMonthlyInteractions(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
    };

    const [channelBreakdownMetric, setChannelBreakdownMetric] = useState('delivered');
    const [visibleRates, setVisibleRates] = useState({
        openRate: true,
        clickRate: true,
        ctoRate: true,
    });
    const [performanceFilter, setPerformanceFilter] = useState('top');
    const [subjectsFilter, setSubjectsFilter] = useState('top');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const DATA_URL = 'https://script.google.com/macros/s/AKfycbwy8v4EYR3hTA_IAuTVPTUHOBqf9uk8QFZ00JeiveHpcOktE24Cp8hH-OEBTK5P8xhhJg/exec';
    
    useEffect(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter((row: Record<string, any>) => Object.keys(filters).every(field => {
            const selectedValues = filters[field];
            return selectedValues.length === 0 || selectedValues.includes(String(row[field]));
        }));
    }, [data, filters]);

    const parseNumericValue = (value: any) => {
      if (typeof value === 'number') return value || 0;
      if (typeof value !== 'string' || value.trim() === '') return 0;
      const cleanedString = value.replace(/[.,\s]/g, '');
      const num = parseInt(cleanedString, 10);
      return isNaN(num) ? 0 : num;
    };

    const onDataLoadSuccess = useCallback((result: any) => {
        try {
            if (!result || !Array.isArray(result.data)) {
                throw new Error('Formato de datos inválido. Se esperaba un objeto con una propiedad "data" que sea un array.');
            }
            
            const parsedData = result.data.map((row: any) => {
                const newRow: any = {};
                for (const key in row) {
                    const normalizedKey = key.toLowerCase().trim();
                    const newKey = COLUMN_MAPPING[normalizedKey];
                    if (newKey) {
                        const value = row[key];
                        if (['sent', 'delivered', 'opened', 'clicked', 'errorCount'].includes(newKey)) {
                            newRow[newKey] = parseNumericValue(value);
                        } else {
                            newRow[newKey] = value ? String(value).trim() : '';
                        }
                    }
                }
                return newRow;
            });
            setData(parsedData);
        } catch (err: any) {
             setError(err.message || 'Ocurrió un error al procesar los datos.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const onDataLoadFailure = useCallback((error: any) => {
        setError(error.message || 'Ocurrió un error desconocido al cargar los datos.');
        setLoading(false);
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            onDataLoadSuccess(result);
        } catch (error) {
            onDataLoadFailure(error);
        }
    }, [onDataLoadSuccess, onDataLoadFailure]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    useEffect(() => {
        localStorage.setItem('dashboard_activeTab', JSON.stringify(activeTab));
    }, [activeTab]);

    useEffect(() => {
        try {
            localStorage.setItem('dashboard_filters', JSON.stringify(filters));
        } catch (error) {
            console.error("Error al guardar filtros en localStorage:", error);
        }
    }, [filters]);

    const KPICard = ({ title, value, total, change, icon, changeType }: any) => {
        const changeColor = changeType === 'positive' ? 'text-emerald-500' : changeType === 'negative' ? 'text-red-500' : 'text-slate-500';
        const changeIcon = changeType === 'positive' ? '▲' : changeType === 'negative' ? '▼' : '';

        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
                        <div className="text-slate-400">{icon}</div>
                    </div>
                    <p className="text-3xl font-bold text-slate-800">{value}</p>
                    <p className="text-xs text-slate-500 h-4">{total}</p>
                </div>
                <div className={`text-sm flex items-center mt-3 ${changeColor}`}>
                    {changeIcon && <span className="mr-1">{changeIcon}</span>}
                    <span>{change} vs mes anterior</span>
                </div>
            </div>
        );
    };

    const Sidebar = ({ filters, uniqueValues, onFilterChange, onResetFilters }: any) => {
        return (
            <aside className="w-full md:w-64 lg:w-72 bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 h-fit md:sticky md:top-6 max-h-[95vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 backdrop-blur-sm py-4 -mt-4 -mx-6 px-6 z-10">
                    <h2 className="text-xl font-bold text-slate-800">Filtros</h2>
                    <button
                        onClick={onResetFilters}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
                <div className="space-y-6">
                    {FILTERABLE_FIELDS.map(field => {
                        const selectedCount = (filters[field.key] || []).length;
                        return (
                            <div key={field.key}>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                                    {field.label}
                                    {selectedCount > 0 && (
                                        <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                            {selectedCount}
                                        </span>
                                    )}
                                </h3>
                                <div className="max-h-48 overflow-y-auto custom-scrollbar-inner pr-2 space-y-1">
                                    {(uniqueValues[field.key] || []).length > 0 ? (uniqueValues[field.key] || []).map((value: string) => (
                                        <label key={value} className="flex items-center space-x-3 cursor-pointer text-sm text-slate-600 hover:bg-slate-50 p-2 rounded-md transition-colors group">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                checked={(filters[field.key] || []).includes(value)}
                                                onChange={() => onFilterChange(field.key, value)}
                                            />
                                            <span className="truncate group-hover:text-slate-900" title={value}>
                                                {value}
                                            </span>
                                        </label>
                                    )) : (
                                        <div className="px-2 py-2 text-xs text-slate-400 italic">No hay opciones</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                    .custom-scrollbar-inner::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar-inner::-webkit-scrollbar-thumb { background: #f1f5f9; }
                    .custom-scrollbar-inner::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
                `}} />
            </aside>
        );
    };

    const CHANNEL_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ef4444', '#8b5cf6', '#14b8a6'];
    
    const toggleRateVisibility = (rate: string) => {
        setVisibleRates(prev => ({ ...prev, [rate]: !prev[rate] }));
    };

    const handleFilterChange = useCallback((field: string, value: string) => {
        setFilters(prev => {
            const currentValues = prev[field] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    }, []);

    const resetFilters = () => {
        setFilters({});
    };

    const uniqueValues = useMemo(() => {
        const values: Record<string, Set<string>> = {};
        FILTERABLE_FIELDS.forEach(field => values[field.key] = new Set());
        
        data.forEach(row => FILTERABLE_FIELDS.forEach(field => {
            if (row[field.key]) values[field.key].add(row[field.key]);
        }));
        
        const sortedValues: Record<string, string[]> = {};
        FILTERABLE_FIELDS.forEach(field => {
            const arr = Array.from(values[field.key]);
            if (field.key === 'month') arr.sort((a, b) => ((MONTH_ORDER[String(a)] as number) || 99) - ((MONTH_ORDER[String(b)] as number) || 99));
            else arr.sort();
            sortedValues[field.key] = arr;
        });
        return sortedValues;
    }, [data]);
    
    const activeMonthsFiltered = useMemo(() => {
        return Array.from(new Set(filteredData.map((d: any) => d.month as string))).sort((a: string, b: string) => ((MONTH_ORDER[a] as number) || 99) - ((MONTH_ORDER[b] as number) || 99));
    }, [filteredData]);
    
    const kpiData = useMemo(() => {
        const calculateMetrics = (d: any[]) => d.reduce(
            (acc, row) => ({
                sent: acc.sent + (row.sent || 0),
                delivered: acc.delivered + (row.delivered || 0),
                opened: acc.opened + (row.opened || 0),
                clicked: acc.clicked + (row.clicked || 0),
            }), { sent: 0, delivered: 0, opened: 0, clicked: 0 }
        );

        const calculateRates = (m: any) => ({
            open: m.delivered > 0 ? (m.opened / m.delivered) * 100 : 0,
            click: m.delivered > 0 ? (m.clicked / m.delivered) * 100 : 0,
            cto: m.opened > 0 ? (m.clicked / m.opened) * 100 : 0,
        });

        const totalMetrics = calculateMetrics(filteredData);
        const totalRates = calculateRates(totalMetrics);

        const currentMonth = activeMonthsFiltered[activeMonthsFiltered.length - 1];
        const prevMonth = activeMonthsFiltered[activeMonthsFiltered.length - 2];

        const currentMonthMetrics = calculateMetrics(filteredData.filter(d => d.month === currentMonth));
        const currentMonthRates = calculateRates(currentMonthMetrics);
        
        const prevMonthMetrics = prevMonth ? calculateMetrics(filteredData.filter(d => d.month === prevMonth)) : { sent: 0, delivered: 0, opened: 0, clicked: 0 };
        const prevMonthRates = prevMonth ? calculateRates(prevMonthMetrics) : { open: 0, click: 0, cto: 0 };

        const calculateRateChange = (current: number, previous: number) => {
            if (!prevMonth) return { value: 'N/A', type: 'neutral' };
            const change = current - previous;
            return { value: `${change.toFixed(1)} p.p.`, type: change >= 0 ? 'positive' : 'negative' };
        };

        const calculateCountChange = (current: number, previous: number) => {
            if (!prevMonth || previous === 0) return { value: 'N/A', type: 'neutral' };
            const change = ((current - previous) / previous) * 100;
            return { value: `${change.toFixed(1)}%`, type: change >= 0 ? 'positive' : 'negative' };
        };

        return {
            sent: { total: totalMetrics.sent, change: calculateCountChange(currentMonthMetrics.sent, prevMonthMetrics.sent) },
            delivery: { total: totalMetrics.delivered, change: calculateCountChange(currentMonthMetrics.delivered, prevMonthMetrics.delivered) },
            open: { rate: totalRates.open, total: totalMetrics.opened, change: calculateRateChange(currentMonthRates.open, prevMonthRates.open) },
            click: { rate: totalRates.click, total: totalMetrics.clicked, change: calculateRateChange(currentMonthRates.click, prevMonthRates.click) },
            cto: { rate: totalRates.cto, total: totalMetrics.clicked, change: calculateRateChange(currentMonthRates.cto, prevMonthRates.cto) },
        };
    }, [filteredData, activeMonthsFiltered]);

    const chartDataByMonth = useMemo(() => {
        const monthlyData = filteredData.reduce((acc: any, row: any) => {
            const month = row.month as string;
            if (!acc[month]) acc[month] = { month, sent: 0, delivered: 0, opened: 0, clicked: 0 };
            acc[month].sent += row.sent;
            acc[month].delivered += row.delivered;
            acc[month].opened += row.opened;
            acc[month].clicked += row.clicked;
            return acc;
        }, {} as Record<string, { month: string, sent: number, delivered: number, opened: number, clicked: number }>);
        return Object.values(monthlyData).sort((a: any, b: any) => ((MONTH_ORDER[String(a.month)] as number) || 99) - ((MONTH_ORDER[String(b.month)] as number) || 99));
    }, [filteredData]);

    const chartDataWithRates = useMemo(() => {
        return chartDataByMonth.map(monthData => ({
            ...monthData,
            openRate: monthData.delivered > 0 ? parseFloat(((monthData.opened / monthData.delivered) * 100).toFixed(2)) : 0,
            clickRate: monthData.delivered > 0 ? parseFloat(((monthData.clicked / monthData.delivered) * 100).toFixed(2)) : 0,
            ctoRate: monthData.opened > 0 ? parseFloat(((monthData.clicked / monthData.opened) * 100).toFixed(2)) : 0,
        }));
    }, [chartDataByMonth]);

    const channelBreakdownData = useMemo(() => {
        const dataByMonthChannel: any = {};
        const channels = new Set<string>();

        filteredData.forEach(row => {
            const month = row.month;
            const channel = row.sentChannel || 'Otro';
            if (!month) return;
            channels.add(channel);

            if (!dataByMonthChannel[month]) dataByMonthChannel[month] = {};
            if (!dataByMonthChannel[month][channel]) dataByMonthChannel[month][channel] = { delivered: 0, opened: 0, clicked: 0 };
            
            dataByMonthChannel[month][channel].delivered += row.delivered || 0;
            dataByMonthChannel[month][channel].opened += row.opened || 0;
            dataByMonthChannel[month][channel].clicked += row.clicked || 0;
        });
        
        const monthKeys = Object.keys(dataByMonthChannel).sort((a, b) => ((MONTH_ORDER[String(a)] as number) || 99) - ((MONTH_ORDER[String(b)] as number) || 99));

        const chartData = monthKeys.map(month => {
            const monthEntry: any = { month };
            const channelsInData = dataByMonthChannel[month];

            for (const channel of channels) {
                const stats = (channelsInData[channel] || { delivered: 0, opened: 0, clicked: 0 });
                monthEntry[`${channel}_delivered`] = stats.delivered;
                monthEntry[`${channel}_opened`] = stats.opened;
                monthEntry[`${channel}_clicked`] = stats.clicked;
                monthEntry[`${channel}_openRate`] = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
                monthEntry[`${channel}_clickRate`] = stats.delivered > 0 ? (stats.clicked / stats.delivered) * 100 : 0;
            }
            return monthEntry;
        });

        return { chartData, uniqueChannels: Array.from(channels).sort() };
    }, [filteredData]);
    
    const performanceData = useMemo(() => {
        const aggregatedPieces = filteredData.reduce((acc: any, row) => {
            if (!row.emailName || row.emailName.trim() === '') return acc;
            const emailName = row.emailName.trim();
            if (!acc[emailName]) {
                acc[emailName] = { 
                    subject: row.subject || row.emailName,
                    delivered: 0, 
                    opened: 0, 
                    sent: 0, 
                    clicked: 0 
                };
            }
            acc[emailName].delivered += row.delivered || 0;
            acc[emailName].opened += row.opened || 0;
            acc[emailName].sent += row.sent || 0;
            acc[emailName].clicked += row.clicked || 0;
            return acc;
        }, {});

        const piecePerformance = Object.entries(aggregatedPieces)
            .map(([emailName, stats]: [string, any]) => ({
                emailName,
                subject: stats.subject,
                sent: stats.sent,
                delivered: stats.delivered,
                openRate: stats.delivered > 0 ? (stats.opened / stats.delivered) : 0,
                clickRate: stats.delivered > 0 ? (stats.clicked / stats.delivered) : 0,
                ctoRate: stats.opened > 0 ? (stats.clicked / stats.opened) : 0,
            }))
            .filter(item => item.delivered >= 100);

        const topByOpenRate = [...piecePerformance].sort((a, b) => b.openRate - a.openRate).slice(0, 10);
        const topByClickRate = [...piecePerformance].sort((a, b) => b.clickRate - a.clickRate).slice(0, 10);
        const bottomByOpenRate = [...piecePerformance].sort((a, b) => a.openRate - b.openRate).slice(0, 10);
        const bottomByClickRate = [...piecePerformance].sort((a, b) => a.clickRate - b.clickRate).slice(0, 10);

        return { topByOpenRate, topByClickRate, bottomByOpenRate, bottomByClickRate };
    }, [filteredData]);

    const activePiecesData = useMemo(() => {
        if (filteredData.length === 0) return { breakdown: [], lastMonth: '' };

        const lastMonth = activeMonthsFiltered[activeMonthsFiltered.length - 1];
        if (!lastMonth) return { breakdown: [], lastMonth: '' };

        const lastMonthData = filteredData.filter(d => d.month === lastMonth);

        const channels = ['sms', 'hsm', 'email'];
        const breakdown = channels.map(channel => {
            const channelPieces = lastMonthData.filter(d => d.sentChannel?.toLowerCase().includes(channel));
            
            const uniquePiecesMap = new Map();
            channelPieces.forEach(p => {
                if (p.emailName) uniquePiecesMap.set(p.emailName.trim(), p.commType?.toLowerCase() || 'otros');
            });

            const counts = { nurturing: 0, transaccional: 0, ra: 0, otros: 0 };
            uniquePiecesMap.forEach(type => {
                if (type.includes('nurturing')) counts.nurturing++;
                else if (type.includes('transaccional')) counts.transaccional++;
                else if (type.includes('ra')) counts.ra++;
                else counts.otros++;
            });

            return {
                channel: channel,
                total: uniquePiecesMap.size,
                types: counts
            };
        });

        return { breakdown, lastMonth };
    }, [filteredData, activeMonthsFiltered]);
    
    const chartMetricConfig: Record<string, { name: string; color: string; isRate: boolean }> = {
        delivered: { name: 'Entregas', color: '#6366f1', isRate: false },
        openRate: { name: 'Apertura (%)', color: '#10b981', isRate: true },
        clickRate: { name: 'Clic (%)', color: '#f59e0b', isRate: true }
    };
    
    const rateMetricConfig: Record<string, { name: string; color: string }> = {
        openRate: { name: 'Tasa Apertura', color: '#10b981' },
        clickRate: { name: 'Tasa Clic', color: '#f59e0b' },
        ctoRate: { name: 'Tasa CTO', color: '#ec4899' }
    };

    const isChannelRateMetric = chartMetricConfig[channelBreakdownMetric]?.isRate;

    if (loading && data.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-center p-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-6 h-6 rounded-full animate-pulse bg-indigo-600"></div>
                    <div className="w-6 h-6 rounded-full animate-pulse bg-indigo-600" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-6 h-6 rounded-full animate-pulse bg-indigo-600" style={{animationDelay: '0.4s'}}></div>
                </div>
                <h2 className="text-xl font-bold text-slate-700">Cargando datos...</h2>
                <p className="text-slate-500">Conectando con el servidor.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-center p-4">
                <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-red-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Error al cargar datos</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={loadData}
                        className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                        disabled={loading}
                    >
                        {loading ? 'Reintentando...' : 'Reintentar'}
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 md:p-6 lg:p-8 bg-slate-100 min-h-screen">
            <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard de Canales Digitales</h1>
                    <p className="text-slate-600 mt-1">Análisis de rendimiento de campañas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Salir de pantalla completa" : "Ver en pantalla completa"}
                        className="bg-white text-slate-700 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors flex items-center gap-2 disabled:bg-slate-100"
                        disabled={loading}
                    >
                        {isFullscreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l-5 5m0 0v-4m0 4h4m11-1-5-5m0 0v4m0-4h-4m-4-11 5 5m0 0V4m0 4h-4m5 11-5-5m0 0v-4m0 4h4" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={loadData}
                        className="bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-indigo-400"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Actualizando...
                            </>
                        ) : "Actualizar datos"}
                    </button>
                </div>
            </header>

            <nav className="mb-8 border-b border-slate-200">
              <div className="flex space-x-8">
                <button 
                  onClick={() => setActiveTab('summary')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'summary' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Resumen General
                  {activeTab === 'summary' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('detailed')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'detailed' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Análisis Detallado
                  {activeTab === 'detailed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('errors')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'errors' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Análisis de Errores
                  {activeTab === 'errors' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('insights')}
                  className={`pb-4 text-sm font-bold transition-all relative ${activeTab === 'insights' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Reporte Ejecutivo
                  {activeTab === 'insights' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              </div>
            </nav>

            {data.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-4 bg-white rounded-xl shadow-sm border border-slate-200/60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h2 className="text-xl font-bold text-slate-800">No se encontraron datos</h2>
                    <p className="text-slate-500 max-w-md">La fuente de datos no devolvió ninguna campaña. Intenta actualizar o revisa la fuente de datos.</p>
                </div>
            ) : (
                <div className="w-full flex flex-col md:flex-row gap-6">
                    <Sidebar filters={filters} uniqueValues={uniqueValues} onFilterChange={handleFilterChange} onResetFilters={resetFilters} />
                    <main className="flex-1 min-w-0 w-full">
                        {activeTab === 'summary' ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <DownloadWrapper filename="kpis-generales">
                                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                    {/* Fix: cast kpiData indexing for toLocaleString and properties */}
                                    <KPICard title="Envío" value={(kpiData as any).sent.total.toLocaleString()} total="" change={(kpiData as any).sent.change.value} changeType={(kpiData as any).sent.change.type} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>} />
                                    <KPICard title="Entrega" value={(kpiData as any).delivery.total.toLocaleString()} total="" change={(kpiData as any).delivery.change.value} changeType={(kpiData as any).delivery.change.type} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                                    <KPICard title="% Apertura" value={`${(kpiData as any).open.rate.toFixed(1)}%`} total={`${(kpiData as any).open.total.toLocaleString()} aperturas`} change={(kpiData as any).open.change.value} changeType={(kpiData as any).open.change.type} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
                                    <KPICard title="% Clic" value={`${(kpiData as any).click.rate.toFixed(1)}%`} total={`${(kpiData as any).click.total.toLocaleString()} clics`} change={(kpiData as any).click.change.value} changeType={(kpiData as any).click.change.type} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L8 9l11-4-6 10z" /></svg>} />
                                    <KPICard title="% CTO" value={`${(kpiData as any).cto.rate.toFixed(1)}%`} total={`${(kpiData as any).cto.total.toLocaleString()} clics`} change={(kpiData as any).cto.change.value} changeType={(kpiData as any).cto.change.type} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>} />
                                </section>
                            </DownloadWrapper>
                            
                            <DownloadWrapper filename="rendimiento-interacciones-mensuales">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-slate-800">Rendimiento e Interacciones Mensuales</h3>
                                        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                                            {Object.entries(chartMetricConfig).map(([dataKey, config]) => (
                                                <button 
                                                    key={dataKey} 
                                                    onClick={() => toggleMonthlyInteraction(dataKey)}
                                                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                                                        (visibleMonthlyInteractions as any)[dataKey] 
                                                            ? 'bg-white text-slate-800 shadow-sm' 
                                                            : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
                                                    }`}
                                                >
                                                    {config.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={chartDataWithRates}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis 
                                                yAxisId="left"
                                                tick={{ fill: '#64748b' }} 
                                                axisLine={false} 
                                                tickLine={false}
                                                tickFormatter={(val) => val.toLocaleString()}
                                            />
                                            <YAxis 
                                                yAxisId="right"
                                                orientation="right"
                                                tick={{ fill: '#64748b' }} 
                                                axisLine={false} 
                                                tickLine={false}
                                                unit="%"
                                            />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                formatter={(value: number, name) => {
                                                    if (name.includes('%')) {
                                                        return [`${value.toFixed(2)}%`, name];
                                                    }
                                                    return [value.toLocaleString(), name];
                                                }} 
                                            />
                                            <Legend />

                                            {visibleMonthlyInteractions.delivered && (
                                                <Bar
                                                    yAxisId="left"
                                                    dataKey="delivered"
                                                    name={chartMetricConfig.delivered.name}
                                                    fill={chartMetricConfig.delivered.color}
                                                    radius={[6, 6, 0, 0]}
                                                >
                                                    <LabelList 
                                                        dataKey="delivered" 
                                                        position="top" 
                                                        formatter={(value: number) => (value as any) > 0 ? (value as any).toLocaleString() : ''}
                                                        fill="#475569"
                                                        fontSize={11}
                                                        fontWeight="600"
                                                    />
                                                </Bar>
                                            )}
                                            {visibleMonthlyInteractions.openRate && (
                                                <Bar
                                                    yAxisId="right"
                                                    dataKey="openRate"
                                                    name={chartMetricConfig.openRate.name}
                                                    fill={chartMetricConfig.openRate.color}
                                                    radius={[6, 6, 0, 0]}
                                                >
                                                    <LabelList 
                                                        dataKey="openRate" 
                                                        position="top" 
                                                        formatter={(value: number) => (value as any) > 0 ? `${(value as any).toFixed(1)}%` : ''}
                                                        fill="#475569"
                                                        fontSize={11}
                                                        fontWeight="600"
                                                    />
                                                </Bar>
                                            )}
                                            {visibleMonthlyInteractions.clickRate && (
                                                <Bar
                                                    yAxisId="right"
                                                    dataKey="clickRate"
                                                    name={chartMetricConfig.clickRate.name}
                                                    fill={chartMetricConfig.clickRate.color}
                                                    radius={[6, 6, 0, 0]}
                                                >
                                                    <LabelList 
                                                        dataKey="clickRate" 
                                                        position="top" 
                                                        formatter={(value: number) => (value as any) > 0 ? `${(value as any).toFixed(1)}%` : ''}
                                                        fill="#475569"
                                                        fontSize={11}
                                                        fontWeight="600"
                                                    />
                                                </Bar>
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </section>
                            </DownloadWrapper>

                            <DownloadWrapper filename="rendimiento-mensual-canal">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                        <h3 className="text-xl font-bold text-slate-800">Rendimiento Mensual por Canal</h3>
                                        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                                            {Object.entries(chartMetricConfig).map(([dataKey, config]) => (
                                                <button 
                                                    key={dataKey} 
                                                    onClick={() => setChannelBreakdownMetric(dataKey)}
                                                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${channelBreakdownMetric === dataKey ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                                                >
                                                    {config.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={channelBreakdownData.chartData} margin={{ top: 25, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                                            <YAxis 
                                                tick={{ fill: '#64748b' }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tickFormatter={(value: number) => isChannelRateMetric ? `${value.toFixed(0)}%` : (value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toLocaleString())} 
                                                domain={isChannelRateMetric ? [0, 100] : [0, (dataMax: number) => Math.max(10, dataMax * 1.2)]}
                                            />
                                            <Tooltip 
                                                formatter={(value: number, name) => {
                                                  if (isChannelRateMetric) {
                                                      return [`${value.toFixed(1)}%`, name];
                                                  }
                                                  return [value.toLocaleString(), name];
                                                }}
                                            />
                                            <Legend />
                                            {channelBreakdownData.uniqueChannels.map((channel, index) => (
                                                <Bar 
                                                    key={channel}
                                                    dataKey={`${channel}_${channelBreakdownMetric}`}
                                                    name={channel}
                                                    fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]}
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    <LabelList
                                                        dataKey={`${channel}_${channelBreakdownMetric}`}
                                                        content={(props: any) => {
                                                            const { x, y, width, value } = props;
                                                            if (value === undefined || value === null || (value as any) <= 0) return null;
                                                            
                                                            let labelText = '';
                                                            if (isChannelRateMetric) {
                                                                labelText = `${(value as any).toFixed(1)}%`;
                                                            } else {
                                                                labelText = (value as any) >= 1000 ? `${((value as any) / 1000).toFixed(1)}k` : (value as any).toString();
                                                            }
                                                            
                                                            if (!labelText) return null;

                                                            return (
                                                                <text 
                                                                    x={x + width / 2} 
                                                                    y={y - 10} 
                                                                    fill="#334155" 
                                                                    textAnchor="middle" 
                                                                    fontSize={10} 
                                                                    fontWeight="800"
                                                                >
                                                                    {labelText}
                                                                </text>
                                                            );
                                                        }}
                                                    />
                                                </Bar>
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </section>
                            </DownloadWrapper>

                            <DownloadWrapper filename="tasas-rendimiento-mensual">
                                <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-slate-800">Tasas de Rendimiento Mensual (%)</h3>
                                        <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg">
                                            {Object.keys(rateMetricConfig).map(key => (
                                                <button 
                                                    key={key} 
                                                    onClick={() => toggleRateVisibility(key)}
                                                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${(visibleRates as any)[key] ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'}`}
                                                >
                                                    {rateMetricConfig[key as keyof typeof rateMetricConfig].name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <AreaChart data={chartDataWithRates} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
                                            <YAxis unit="%" tick={{ fill: '#64748b' }} />
                                            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                                            <Legend />
                                            {visibleRates.openRate && <Area type="monotone" dataKey="openRate" stroke={rateMetricConfig.openRate.color} name={rateMetricConfig.openRate.name} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} fill={rateMetricConfig.openRate.color} fillOpacity={0.3} />}
                                            {visibleRates.clickRate && <Area type="monotone" dataKey="clickRate" stroke={rateMetricConfig.clickRate.color} name={rateMetricConfig.clickRate.name} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} fill={rateMetricConfig.clickRate.color} fillOpacity={0.3} />}
                                            {visibleRates.ctoRate && <Area type="monotone" dataKey="ctoRate" stroke={rateMetricConfig.ctoRate.color} name={rateMetricConfig.ctoRate.name} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} fill={rateMetricConfig.ctoRate.color} fillOpacity={0.3} />}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </section>
                            </DownloadWrapper>
                            
                            <DownloadWrapper filename={`top-10-piezas-${performanceFilter}`}>
                                <PerformanceLeaders
                                    topByOpenRate={performanceData.topByOpenRate}
                                    topByClickRate={performanceData.topByClickRate}
                                    bottomByOpenRate={performanceData.bottomByOpenRate}
                                    bottomByClickRate={performanceData.bottomByClickRate}
                                    filter={performanceFilter}
                                    onFilterChange={setPerformanceFilter}
                                />
                            </DownloadWrapper>

                            <DownloadWrapper filename={`top-10-subjects-${subjectsFilter}`}>
                                <TopSubjectsCard
                                    data={subjectsFilter === 'top' ? performanceData.topByOpenRate : performanceData.bottomByOpenRate}
                                    filter={subjectsFilter}
                                    onFilterChange={setSubjectsFilter}
                                />
                            </DownloadWrapper>

                            <DownloadWrapper filename="desglose-piezas-activas">
                                <ActivePiecesBreakdown 
                                    data={activePiecesData.breakdown} 
                                    lastMonth={activePiecesData.lastMonth} 
                                />
                            </DownloadWrapper>
                            
                            <DownloadWrapper filename="analisis-segmento-negocio">
                                <BusinessSegmentAnalysis data={filteredData} />
                            </DownloadWrapper>
                        </div>
                        ) : activeTab === 'detailed' ? (
                        <CampaignPerformanceSheet data={filteredData} />
                        ) : activeTab === 'errors' ? (
                        <ErrorAnalysisSheet data={filteredData} />
                        ) : (
                        /* Fix: added type casting for activeTab to avoid 'unknown' ReactNode rendering */
                        <ExecutiveReportSheet data={filteredData} />
                        )}
                    </main>
                </div>
            )}
        </div>
    );
};

// --- Inlined: index.tsx ---
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
