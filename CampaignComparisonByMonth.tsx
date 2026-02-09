import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
  LabelList
} from 'recharts';

// Constantes para el ordenamiento de meses
const MONTH_ORDER: Record<string, number> = {
  'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
  'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12,
  'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
  'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
};

interface CampaignComparisonProps {
  data: any[];
}

const CampaignComparisonByMonth: React.FC<CampaignComparisonProps> = ({ data }) => {
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 1. Identificar y ordenar los meses disponibles
    const months = (Array.from(new Set(data.map((d: any) => d.month as string).filter(Boolean))) as string[])
      .sort((a: string, b: string) => ((MONTH_ORDER[a] as number) || 99) - ((MONTH_ORDER[b] as number) || 99));

    if (months.length < 1) return null;

    const currentMonth = months[months.length - 1];
    const prevMonth = months.length > 1 ? months[months.length - 2] : null;

    // 2. Agrupar métricas por campaña y mes
    const getCampaignMetrics = (month: string | null) => {
      if (!month) return {};
      const filtered = data.filter((d: any) => d.month === month);
      const grouped: Record<string, { delivered: number, opened: number }> = {};
      
      filtered.forEach((d: any) => {
        const name = d.campaignName || 'Sin Nombre';
        if (!grouped[name]) grouped[name] = { delivered: 0, opened: 0 };
        grouped[name].delivered += d.delivered || 0;
        grouped[name].opened += d.opened || 0;
      });
      return grouped;
    };

    const currentMetrics = getCampaignMetrics(currentMonth);
    const prevMetrics = getCampaignMetrics(prevMonth);

    // 3. Obtener el Top 5 por volumen en el mes actual
    const topCampaigns = Object.keys(currentMetrics)
      .map(name => ({
        name,
        delivered: currentMetrics[name].delivered
      }))
      .sort((a, b) => b.delivered - a.delivered)
      .slice(0, 5);

    // 4. Construir datos para el gráfico
    const chartData = topCampaigns.map(c => {
      const curr = currentMetrics[c.name];
      const prev = prevMetrics && prevMetrics[c.name] ? prevMetrics[c.name] : { delivered: 0, opened: 0 };

      const prevRate = prev.delivered > 0 ? (prev.opened / prev.delivered) * 100 : 0;
      const currRate = curr.delivered > 0 ? (curr.opened / curr.delivered) * 100 : 0;

      return {
        name: c.name,
        // Usamos nombres dinámicos para las claves para que la leyenda sea correcta
        [prevMonth || 'Mes Anterior']: parseFloat(prevRate.toFixed(1)),
        [currentMonth]: parseFloat(currRate.toFixed(1)),
        _prevValue: prevRate,
        _currValue: currRate,
        _prevVolume: prev.delivered,
        _currVolume: curr.delivered
      };
    });

    return { chartData, currentMonth, prevMonth };
  }, [data]);

  if (!analysis || analysis.chartData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 italic">
        No hay suficientes datos para generar la comparativa.
      </div>
    );
  }

  const { chartData, currentMonth, prevMonth } = analysis;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const prevData = payload.find((p: any) => p.dataKey === (prevMonth || 'Mes Anterior'));
      const currData = payload.find((p: any) => p.dataKey === currentMonth);
      
      const prevVal = prevData ? prevData.value : 0;
      const currVal = currData ? currData.value : 0;
      const diff = currVal - prevVal;

      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl min-w-[220px]">
          <p className="font-black text-slate-800 text-xs mb-3 border-b border-slate-100 pb-2 truncate max-w-[200px]">
            {label}
          </p>
          <div className="space-y-3">
            {prevMonth && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span className="text-xs font-semibold text-slate-500">{prevMonth}</span>
                </div>
                <span className="text-sm font-bold text-slate-600">{prevVal.toFixed(1)}%</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                <span className="text-xs font-semibold text-indigo-700">{currentMonth}</span>
              </div>
              <span className="text-sm font-black text-indigo-600">{currVal.toFixed(1)}%</span>
            </div>
            
            {prevMonth && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Variación</span>
                <span className={`text-xs font-black ${diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(1)} pp
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 w-full">
      <div className="mb-6">
        <div className="flex justify-between items-start gap-4">
            <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Evolución de Campañas Top 5</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Comparativa de Tasa de Apertura: <span className="font-bold text-indigo-600">{currentMonth}</span> vs {prevMonth || 'Anterior'}.
                </p>
            </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} 
              axisLine={false} 
              tickLine={false}
              interval={0}
              // Rotamos las etiquetas si son muy largas para evitar solapamiento en vertical
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              unit="%" 
              tick={{ fontSize: 11, fill: '#94a3b8' }} 
              axisLine={false} 
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600, color: '#475569' }}
            />
            
            {prevMonth && (
              <Bar 
                dataKey={prevMonth} 
                fill="#cbd5e1" 
                radius={[4, 4, 0, 0]} 
                barSize={30} // Ancho de barra fijo para estética consistente
                name={prevMonth}
              />
            )}
            
            <Bar 
              dataKey={currentMonth} 
              fill="#4f46e5" 
              radius={[4, 4, 0, 0]} 
              barSize={30}
              name={currentMonth}
            >
               <LabelList 
                  dataKey={currentMonth} 
                  position="top" 
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: '10px', fontWeight: '800', fill: '#4f46e5' }}
                  offset={5}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default CampaignComparisonByMonth;