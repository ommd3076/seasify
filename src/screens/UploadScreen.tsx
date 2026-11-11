import React, { useState } from 'react';
import {
  UploadCloud,
  Check,
  MoreVertical,
  Activity,
  Code,
  Compass,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';

export const UploadScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'import'>('upload');
  const [previewMode, setPreviewMode] = useState<'table' | 'chart'>('table');
  const [uploadProgress, setUploadProgress] = useState(72);
  const [isCanceled, setIsCanceled] = useState(false);

  const previewTableData = [
    { timestamp: '2023-01-01 00:00', waterLevel: 0.42, station: 'Harbor Point', flag: 0 },
    { timestamp: '2023-01-01 00:10', waterLevel: 0.48, station: 'Harbor Point', flag: 0 },
    { timestamp: '2023-01-01 00:20', waterLevel: 0.55, station: 'Harbor Point', flag: 0 },
    { timestamp: '2023-01-01 00:30', waterLevel: 0.60, station: 'Harbor Point', flag: 0 },
    { timestamp: '2023-01-01 00:40', waterLevel: 0.64, station: 'Harbor Point', flag: 0 },
  ];

  const previewChartData = [
    { day: 'Jan 1', level: 0.2 },
    { day: 'Jan 2', level: 1.4 },
    { day: 'Jan 3', level: -0.8 },
    { day: 'Jan 4', level: 1.8 },
    { day: 'Jan 5', level: -1.2 },
    { day: 'Jan 6', level: 2.1 },
    { day: 'Jan 7', level: -1.1 },
    { day: 'Jan 8', level: 1.9 },
    { day: 'Jan 9', level: -0.6 },
    { day: 'Jan 10', level: 2.3 },
    { day: 'Jan 11', level: -0.4 },
  ];

  return (
    <div data-testid="screen-upload" className="space-y-6">
      {/* Top Grid: Upload Area & Source Connectors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Left: Drop Area (8 cols) */}
        <div className="lg:col-span-8 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Observation Files</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'import'
                  ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import Historical Tide Data</span>
            </button>
          </div>

          {/* Dashed Drag & Drop Box */}
          <div className="border-2 border-dashed border-[#68DD79] rounded-[24px] bg-[#F2FAF4] p-8 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#DCFADC] text-[#227C34] flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-primary-text">
              Drag & drop files here
            </h3>
            <p className="text-xs text-secondary-text mt-1">
              Upload tide, water-level, or coastal observation files
            </p>
            <p className="text-[11px] text-secondary-text mt-0.5 mb-5">
              Supports CSV, TXT, NetCDF (.nc), and HDF5 (.h5) • up to 5 GB
            </p>

            <label className="px-5 py-2.5 rounded-full border border-border bg-white text-xs font-bold text-primary-text hover:bg-surface-muted transition shadow-xs cursor-pointer flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-secondary-text" />
              <span>Browse Files</span>
              <input type="file" className="hidden" accept=".csv,.txt,.nc,.h5" />
            </label>
          </div>
        </div>

        {/* Top-Right: Source Connectors (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary-text leading-tight">
              Source Connectors
            </h3>
            <p className="text-xs text-secondary-text mt-0.5 mb-4">
              Bring in data from trusted sources
            </p>

            <div className="space-y-3">
              {/* Connector 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text">
                      NDBC (NOAA)
                    </div>
                    <div className="text-[11px] text-secondary-text">
                      Tide & water-level data
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-white transition">
                  Connect
                </button>
              </div>

              {/* Connector 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text">
                      NOAA CO-OPS
                    </div>
                    <div className="text-[11px] text-secondary-text">
                      Tide stations & datums
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-white transition">
                  Connect
                </button>
              </div>

              {/* Connector 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text">
                      Copernicus Marine
                    </div>
                    <div className="text-[11px] text-secondary-text">
                      Coastal water level (CMEMS)
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-white transition">
                  Connect
                </button>
              </div>

              {/* Connector 4 */}
              <div className="flex items-center justify-between p-2.5 rounded-20 bg-surface-muted/60 border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBE0FE] text-[#784FD8] flex items-center justify-center shrink-0">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary-text">
                      Custom URL / API
                    </div>
                    <div className="text-[11px] text-secondary-text">
                      Import from an API or data feed
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 rounded-full border border-border text-xs font-bold text-primary-text hover:bg-white transition">
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: File Progress Card */}
      {!isCanceled && (
        <div className="bg-surface rounded-[24px] border border-border shadow-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-primary-text truncate">
                HarborPoint_2023-2024_tide.csv
              </div>
              <div className="text-xs text-secondary-text mt-0.5">
                Uploading and validating...
              </div>
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-secondary-text mb-1.5 font-medium">
                <span>2.9 GB of 4.0 GB • ~1 min remaining</span>
                <span className="font-bold text-primary-text">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-muted rounded-full overflow-hidden flex">
                <div
                  className="bg-[#68DD79] h-full rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
                <div className="bg-[#C5A8F8] h-full flex-1" />
              </div>
            </div>

            <button
              onClick={() => setIsCanceled(true)}
              className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-secondary-text hover:text-primary-text hover:bg-surface-muted transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lower Split: Recent Uploads & File Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lower Left: Recent Uploads (7 cols) */}
        <div className="lg:col-span-7 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-primary-text leading-tight">
                Recent Uploads
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Your latest data ingestions
              </p>
            </div>

            <button className="px-3.5 py-1.5 rounded-full border border-border text-xs font-semibold text-primary-text hover:bg-surface-muted transition flex items-center gap-1">
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                file: 'HarborPoint_2023-2024_tide.csv',
                size: '4.0 GB',
                time: '2 min ago',
                status: 'Processing',
                statusColor: 'bg-[#EBE0FE] text-[#784FD8]',
              },
              {
                file: 'Bayview_Inlet_obs_2024.nc',
                size: '1.2 GB',
                time: '1 hr ago',
                status: 'Validated',
                statusColor: 'bg-[#DCFADC] text-[#156024]',
              },
              {
                file: 'EastJetty_2019-2023_tide.csv',
                size: '586 MB',
                time: '3 hr ago',
                status: 'Validated',
                statusColor: 'bg-[#DCFADC] text-[#156024]',
              },
              {
                file: 'CoastalNetwork_2020-2022.h5',
                size: '2.1 GB',
                time: 'Yesterday',
                status: 'Issues (2)',
                statusColor: 'bg-[#EBE0FE] text-[#784FD8]',
              },
            ].map((u) => (
              <div
                key={u.file}
                className="flex items-center justify-between p-3 rounded-20 bg-surface-muted/40 border border-border/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileSpreadsheet className="w-4 h-4 text-secondary-text shrink-0" />
                  <span className="font-bold text-xs text-primary-text truncate">
                    {u.file}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-secondary-text font-mono">
                    {u.size}
                  </span>
                  <span className="text-xs text-secondary-text hidden sm:inline">
                    {u.time}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${u.statusColor}`}>
                    {u.status}
                  </span>
                  <MoreVertical className="w-4 h-4 text-secondary-text cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Right: File Validation Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-text leading-tight">
                  File Validation
                </h3>
                <p className="text-xs text-secondary-text mt-0.5 font-mono">
                  HarborPoint_2023-2024_tide.csv
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary-text">
                  <span className="text-[#359D45] font-bold">✔</span>
                  <span>File format</span>
                </div>
                <span className="text-secondary-text font-mono">CSV (valid)</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary-text">
                  <span className="text-[#359D45] font-bold">✔</span>
                  <span>Required columns</span>
                </div>
                <span className="text-secondary-text font-mono">timestamp, water_level ✔</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary-text">
                  <span className="text-[#359D45] font-bold">✔</span>
                  <span>Time range</span>
                </div>
                <span className="text-secondary-text font-mono">2023-01-01 — 2024-12-31 ✔</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary-text">
                  <span className="text-[#359D45] font-bold">✔</span>
                  <span>Data completeness</span>
                </div>
                <span className="text-secondary-text font-mono">99.6% (0.4% missing) ✔</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 text-primary-text">
                  <span className="text-[#359D45] font-bold">✔</span>
                  <span>Value range (water level)</span>
                </div>
                <span className="text-secondary-text font-mono">-2.38 to +2.71 m ✔</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Dataset Preview Card */}
      <div className="bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
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
              <h3 className="text-lg font-bold text-primary-text leading-tight">
                Dataset Preview
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                HarborPoint_2023-2024_tide.csv • 8,761,920 rows (2 years)
              </p>
            </div>
          </div>

          {/* Table / Chart Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-muted border border-border">
            <button
              onClick={() => setPreviewMode('table')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                previewMode === 'table'
                  ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              ⊞ Table
            </button>
            <button
              onClick={() => setPreviewMode('chart')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                previewMode === 'chart'
                  ? 'bg-[#A5F5A6] text-[#171A18] shadow-xs'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              ~ Chart
            </button>
          </div>
        </div>

        {/* Preview Content: Table on Left & Chart on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* Table (6 cols) */}
          <div className="lg:col-span-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/80 text-secondary-text">
                  <th className="pb-2 font-semibold">timestamp (UTC)</th>
                  <th className="pb-2 font-semibold">water_level (m)</th>
                  <th className="pb-2 font-semibold">station</th>
                  <th className="pb-2 font-semibold">quality_flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {previewTableData.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-muted/40 transition">
                    <td className="py-2.5 text-secondary-text">{row.timestamp}</td>
                    <td className="py-2.5 font-bold text-primary-text">{row.waterLevel.toFixed(2)}</td>
                    <td className="py-2.5 text-secondary-text font-sans">{row.station}</td>
                    <td className="py-2.5 text-secondary-text">{row.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Chart Preview (6 cols) */}
          <div className="lg:col-span-6 pl-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-border/80">
            <div className="text-xs font-bold text-primary-text mb-2">
              Water Level (Harbor Point)
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={previewChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="uploadLavender" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A8F8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#C5A8F8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#737A75" tick={{ fill: '#737A75', fontSize: 10 }} />
                  <YAxis domain={[-2.8, 2.8]} ticks={[-2.8, -1.4, 0.0, 1.4, 2.8]} stroke="#737A75" tick={{ fill: '#737A75', fontSize: 10 }} unit="m" />
                  <Area type="monotone" dataKey="level" stroke="#6B21A8" strokeWidth={2} fillOpacity={1} fill="url(#uploadLavender)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
