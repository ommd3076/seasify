import React, { useState } from 'react';
import {
  Download,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Area,
} from 'recharts';

export const ReportsScreen: React.FC = () => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (reportName: string, format: 'PDF' | 'CSV') => {
    if (format === 'CSV') {
      const csvContent =
        'Date,Station,Observed Water Level (m),Predicted Water Level (m),Residual (m),Anomaly Status\n' +
        '2024-11-01,The Battery NY,1.42,1.36,0.06,Normal\n' +
        '2024-11-05,San Francisco CA,1.86,1.54,0.32,Elevated\n' +
        '2024-11-09,Boston Harbor MA,2.65,2.61,0.04,Normal\n' +
        '2024-11-13,Key West FL,0.38,0.64,-0.26,Low Tide\n' +
        '2024-11-17,Seattle WA,2.92,2.88,0.04,Normal\n' +
        '2024-11-21,Galveston Pier 21 TX,0.88,0.58,0.30,Elevated\n' +
        '2024-11-25,Annapolis MD,0.82,0.48,0.34,Elevated\n' +
        '2024-11-29,Monterey CA,1.68,1.64,0.04,Normal\n';

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `seasify-${reportName.toLowerCase().replace(/\s+/g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'PDF') {
      window.print();
    }
    setDownloadSuccess(`Exported ${reportName} as ${format}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Key Trends dual-axis time-series data (Nov 1 - Nov 29)
  const trendsData = [
    { date: 'Nov 1', waterLevel: 2.15, anomaly: 1.82 },
    { date: 'Nov 5', waterLevel: 2.10, anomaly: 1.80 },
    { date: 'Nov 9', waterLevel: 2.38, anomaly: 2.10 },
    { date: 'Nov 13', waterLevel: 2.25, anomaly: 1.78 },
    { date: 'Nov 17', waterLevel: 2.30, anomaly: 1.95 },
    { date: 'Nov 21', waterLevel: 2.62, anomaly: 1.85 },
    { date: 'Nov 25', waterLevel: 2.35, anomaly: 1.75 },
    { date: 'Nov 29', waterLevel: 2.45, anomaly: 1.92 },
  ];

  // Station Comparison diverging bar data
  const comparisonData = [
    { station: 'Harbor Point', delta: 0.42, isPositive: true },
    { station: 'Bayview Inlet', delta: -0.36, isPositive: false },
    { station: 'East Jetty', delta: 0.51, isPositive: true },
    { station: 'Lighthouse', delta: 0.19, isPositive: true },
    { station: 'Cedar Beach', delta: -0.21, isPositive: false },
  ];

  // Donut chart distribution data
  const distributionData = [
    { name: 'High tide events', count: 58, pct: '60.4%', color: '#A5F5A6' },
    { name: 'Low tide events', count: 27, pct: '28.1%', color: '#C5A8F8' },
    { name: 'Anomaly events', count: 11, pct: '11.5%', color: '#EAEFEC' },
  ];

  return (
    <div data-testid="screen-reports" className="space-y-6">
      {/* Toast */}
      {downloadSuccess && (
        <div className="bg-[#A5F5A6] text-[#171A18] px-4 py-2.5 rounded-card border border-[#68DD79] flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <span className="text-sm font-semibold">{downloadSuccess}</span>
          <button onClick={() => setDownloadSuccess(null)} className="text-xs font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Top 2x2 Modular Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Monthly Anomaly Summary (Charcoal Card, 6 cols) */}
        <div className="lg:col-span-6 bg-[#242424] text-white rounded-[28px] p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">
                Monthly Anomaly Summary
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Water-level anomalies across all stations
              </p>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-[#333333] border border-[#444444] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer">
              <span>Monthly</span>
              <span className="text-[10px] text-gray-400">⌄</span>
            </div>
          </div>

          <div className="flex items-end justify-between pt-4">
            <div>
              <span className="text-xs text-[#9CA3AF] font-medium block">
                Total anomalies
              </span>
              <div className="text-5xl font-black font-sans text-white tracking-tight mt-1">
                47
              </div>
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#A5F5A6] text-[#171A18]">
                  <span>↗</span>
                  <span>+12.8%</span>
                </span>
                <span className="text-[11px] text-[#9CA3AF] block mt-1">
                  vs. previous month
                </span>
              </div>
            </div>

            {/* 3-Month Stacked Bars (Sep, Oct, Nov) */}
            <div className="flex items-end gap-3 sm:gap-4 pb-1">
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Sep</span>
                <div className="w-14 sm:w-16 h-28 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-16 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Oct</span>
                <div className="w-14 sm:w-16 h-36 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-24 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#9CA3AF]">Nov</span>
                <div className="w-14 sm:w-16 h-32 rounded-2xl overflow-hidden flex flex-col justify-end bg-[#333333]">
                  <div className="h-20 bg-[#A5F5A6] rounded-t-2xl" />
                  <div className="h-12 bg-[#C5A8F8]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Key Trends (Surface Card, 6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-[#227C34]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                  <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Key Trends
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Water level and anomaly trends over time
                </p>
              </div>
            </div>

            <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition flex items-center gap-1">
              <span>View Details</span>
              <span>→</span>
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79]" />
              <span className="text-primary-text">Water level (m)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C5A8F8]" />
              <span className="text-secondary-text">Anomaly index</span>
            </div>
          </div>

          {/* Dual Wave Area Chart */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F3F1" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#737A75"
                  tick={{ fill: '#737A75', fontSize: 11 }}
                  axisLine={{ stroke: '#D9DEDA' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[1.6, 2.8]}
                  ticks={[1.6, 1.8, 2.0, 2.2, 2.4, 2.6]}
                  stroke="#737A75"
                  tick={{ fill: '#737A75', fontSize: 11 }}
                  axisLine={{ stroke: '#D9DEDA' }}
                  tickLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#68DD79"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#68DD79', stroke: '#FFFFFF', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="anomaly"
                  stroke="#C5A8F8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#C5A8F8', stroke: '#FFFFFF', strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Station Comparison (Surface Card, 6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-[#227C34]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary-text leading-tight">
                  Station Comparison
                </h3>
                <p className="text-xs text-secondary-text mt-0.5">
                  Water-level change vs. network mean (last 30 days)
                </p>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
              <span>All Stations</span>
              <span className="text-[10px] text-secondary-text">⌄</span>
            </div>
          </div>

          {/* Diverging Horizontal Bars Around 0.0 */}
          <div className="space-y-3.5 my-3">
            {comparisonData.map((st) => (
              <div key={st.station} className="flex items-center text-xs">
                {/* Station Name */}
                <span className="w-28 font-bold text-primary-text truncate">
                  {st.station}
                </span>

                {/* Diverging Bar Area (Left = Negative Lavender, Right = Positive Mint) */}
                <div className="flex-1 flex items-center h-5 relative mx-2">
                  {/* Center vertical baseline 0.0 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#D9DEDA]" />

                  {st.isPositive ? (
                    // Positive bar (from center to right)
                    <div
                      className="h-4 rounded-r-md bg-[#A5F5A6] absolute left-1/2 flex items-center justify-end px-2"
                      style={{ width: `${(st.delta / 0.6) * 50}%` }}
                    >
                      <span className="text-[10px] font-bold text-[#171A18] font-mono">
                        +{st.delta.toFixed(2)} m
                      </span>
                    </div>
                  ) : (
                    // Negative bar (from right to left towards center)
                    <div
                      className="h-4 rounded-l-md bg-[#C5A8F8] absolute right-1/2 flex items-center justify-start px-2"
                      style={{ width: `${(Math.abs(st.delta) / 0.6) * 50}%` }}
                    >
                      <span className="text-[10px] font-bold text-[#171A18] font-mono">
                        {st.delta.toFixed(2)} m
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Scale Axis */}
          <div className="flex items-center justify-between text-[11px] text-secondary-text font-mono border-t border-border pt-2 pl-28 pr-4">
            <span>-0.6</span>
            <span>-0.4</span>
            <span>-0.2</span>
            <span className="font-bold text-primary-text">0.0</span>
            <span>+0.2</span>
            <span>+0.4</span>
            <span>+0.6</span>
          </div>
        </div>

        {/* Card 4: Event Distribution Donut Card (6 cols) */}
        <div className="lg:col-span-6 bg-surface rounded-[28px] p-6 sm:p-7 border border-border shadow-panel flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#227C34]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Event Distribution
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Water-level events by type (last 30 days)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-2">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black font-sans text-primary-text">
                  96
                </span>
                <span className="text-[10px] text-secondary-text font-medium">
                  Total Events
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-3 w-full">
              {distributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-muted/60 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: item.color, color: '#171A18' }}
                    >
                      {item.name.includes('High') ? '↗' : item.name.includes('Low') ? '↘' : '≈'}
                    </div>
                    <span className="text-xs font-bold text-primary-text">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-primary-text">
                    {item.count} ({item.pct})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Bottom Card: Exported Report History Table */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-[#227C34]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-text leading-tight">
                Exported Report History
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Recently generated reports and downloads
              </p>
            </div>
          </div>

          <button className="px-4 py-2 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition flex items-center gap-1.5">
            <span>Manage Reports</span>
            <span>→</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/80 text-secondary-text">
                <th className="pb-3 font-semibold">Report Name</th>
                <th className="pb-3 font-semibold">Date Range</th>
                <th className="pb-3 font-semibold">Generated</th>
                <th className="pb-3 font-semibold">Format</th>
                <th className="pb-3 font-semibold">Size</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Row 1 */}
              <tr className="hover:bg-surface-muted/50 transition">
                <td className="py-3.5 font-bold text-primary-text flex items-center gap-2.5">
                  <span className="text-secondary-text">📄</span>
                  <span>Monthly Monitoring Report – Nov 2024</span>
                </td>
                <td className="py-3.5 text-secondary-text">Nov 1, 2024 – Nov 30, 2024</td>
                <td className="py-3.5 text-secondary-text">Dec 1, 2024, 10:24</td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
                    PDF
                  </span>
                </td>
                <td className="py-3.5 text-secondary-text font-mono">2.8 MB</td>
                <td className="py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleExport('Monthly Monitoring Report', 'PDF')}
                      className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-surface-muted/50 transition">
                <td className="py-3.5 font-bold text-primary-text flex items-center gap-2.5">
                  <span className="text-secondary-text">📄</span>
                  <span>Station Comparison Analysis</span>
                </td>
                <td className="py-3.5 text-secondary-text">Oct 1, 2024 – Nov 30, 2024</td>
                <td className="py-3.5 text-secondary-text">Nov 30, 2024, 16:07</td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EBE0FE] text-[#784FD8]">
                    CSV
                  </span>
                </td>
                <td className="py-3.5 text-secondary-text font-mono">1.1 MB</td>
                <td className="py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleExport('Station Comparison Analysis', 'CSV')}
                      className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-surface-muted/50 transition">
                <td className="py-3.5 font-bold text-primary-text flex items-center gap-2.5">
                  <span className="text-secondary-text">📄</span>
                  <span>Anomaly Events Summary</span>
                </td>
                <td className="py-3.5 text-secondary-text">Nov 1, 2024 – Nov 30, 2024</td>
                <td className="py-3.5 text-secondary-text">Nov 30, 2024, 09:13</td>
                <td className="py-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFADC] text-[#156024]">
                    PDF
                  </span>
                </td>
                <td className="py-3.5 text-secondary-text font-mono">2.3 MB</td>
                <td className="py-3.5 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleExport('Anomaly Events Summary', 'PDF')}
                      className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-lg border border-border text-secondary-text hover:text-primary-text hover:bg-surface">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
