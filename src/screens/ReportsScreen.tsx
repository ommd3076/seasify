import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const ReportsScreen: React.FC = () => {
  const [selectedReportPeriod, setSelectedReportPeriod] = useState<'30d' | '90d' | '12m'>('30d');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const monthlyAnomalyData = [
    { month: 'Jun', events: 14, surgeHours: 28, meanResidual: 0.18 },
    { month: 'Jul', events: 9, surgeHours: 16, meanResidual: 0.12 },
    { month: 'Aug', events: 12, surgeHours: 22, meanResidual: 0.15 },
    { month: 'Sep', events: 21, surgeHours: 46, meanResidual: 0.32 },
    { month: 'Oct', events: 34, surgeHours: 78, meanResidual: 0.44 },
    { month: 'Nov', events: 28, surgeHours: 62, meanResidual: 0.38 },
  ];

  const stationComparisonData = [
    { station: 'The Battery (NY)', surges: 32, blowouts: 8, avgResidual: 0.34 },
    { station: 'San Francisco (CA)', surges: 18, blowouts: 12, avgResidual: 0.22 },
    { station: 'Key West (FL)', surges: 26, blowouts: 5, avgResidual: 0.29 },
    { station: 'Boston (MA)', surges: 38, blowouts: 14, avgResidual: 0.41 },
    { station: 'Galveston (TX)', surges: 22, blowouts: 7, avgResidual: 0.25 },
  ];

  const eventDistributionData = [
    { name: 'Sustained Surge', value: 44, color: '#68DD79' },
    { name: 'Rapid Rise', value: 24, color: '#C5A8F8' },
    { name: 'Abnormal Recovery', value: 16, color: '#A5F5A6' },
    { name: 'Low Blowout', value: 10, color: '#FBBF24' },
    { name: 'Oscillatory', value: 6, color: '#F87171' },
  ];

  const reportHistory = [
    {
      id: 'REP-2024-11-A',
      title: 'November 2024 Coastal Telemetry & Surge Assessment',
      period: 'Nov 01 - Nov 30, 2024',
      stations: '13 Stations',
      type: 'Executive Monthly',
      generated: '2024-11-12 04:00 UTC',
      status: 'Generated',
      fileSize: '2.4 MB',
    },
    {
      id: 'REP-2024-10-B',
      title: 'October 2024 Nor’easter Storm Impact & Automata Trace',
      period: 'Oct 15 - Oct 22, 2024',
      stations: 'Atlantic Coast (5)',
      type: 'Extreme Event Audit',
      generated: '2024-10-25 11:30 UTC',
      status: 'Generated',
      fileSize: '4.8 MB',
    },
    {
      id: 'REP-2024-Q3-SUMMARY',
      title: 'Q3 2024 Network-Wide Anomaly Recognition Report',
      period: 'Jul 01 - Sep 30, 2024',
      stations: 'All Active (13)',
      type: 'Quarterly Scientific',
      generated: '2024-10-02 09:15 UTC',
      status: 'Archived',
      fileSize: '8.1 MB',
    },
    {
      id: 'REP-2024-09-GAP',
      title: 'September 2024 Sensor Quality & Data Gap Diagnostic',
      period: 'Sep 01 - Sep 30, 2024',
      stations: 'Gulf & Pacific (8)',
      type: 'QA & Compliance',
      generated: '2024-10-01 16:40 UTC',
      status: 'Archived',
      fileSize: '1.9 MB',
    },
  ];

  const handleExport = (reportId: string, format: 'PDF' | 'CSV') => {
    setDownloadSuccess(`${format} download started for ${reportId}`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div data-testid="screen-reports" className="space-y-6">
      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="bg-[#A5F5A6] text-[#171A18] px-4 py-2.5 rounded-card border border-[#68DD79] flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#156024]" />
            <span className="text-sm font-semibold">{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-xs font-bold px-2">
            ✕
          </button>
        </div>
      )}

      {/* Top 2x2 Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Monthly Anomaly Summary (Charcoal Card, 7 cols) */}
        <div className="lg:col-span-7 bg-charcoal text-white rounded-panel p-6 sm:p-7 border border-[#383838] shadow-panel flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79] animate-pulse" />
                <h3 className="text-lg font-bold text-white">Monthly Anomaly Summary</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-[#2E2E2E] p-1 rounded-full border border-[#404040]">
                {(['30d', '90d', '12m'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedReportPeriod(period)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      selectedReportPeriod === period
                        ? 'bg-[#68DD79] text-[#171A18]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {period.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Total recognized surge events and cumulative hours exceeding astronomical baseline
            </p>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyAnomalyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
                  <XAxis dataKey="month" stroke="#737A75" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <YAxis stroke="#737A75" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E1E1E',
                      borderColor: '#404040',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="surgeHours" name="Surge Hours" fill="#68DD79" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="events" name="Event Count" fill="#C5A8F8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-[#383838] flex items-center justify-between text-xs text-gray-400 mt-2">
            <span>Peak Month: October (78 hrs)</span>
            <span className="font-mono text-[#68DD79]">Cumulative: 252 hrs</span>
          </div>
        </div>

        {/* Card 2: Event Distribution Donut Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface rounded-panel border border-border shadow-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A8F8]" />
                <h3 className="text-lg font-bold text-primary-text">Event Archetype Share</h3>
              </div>
              <Badge variant="normal">118 Matches</Badge>
            </div>
            <p className="text-xs text-secondary-text mb-4">
              Classification breakdown generated by deterministic finite automata
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {eventDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#F7F9F6',
                      borderColor: '#D9DEDA',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {eventDistributionData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-secondary-text">{item.name}</span>
                  <span className="font-mono font-bold text-primary-text ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Station Comparison Section */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-primary-text">Station Disruption Comparison</h3>
            <p className="text-xs text-secondary-text mt-0.5">
              Comparative anomaly frequency and average residual deviation across monitored coastal ports
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleExport('comparison-all', 'CSV')}
          >
            Export CSV
          </Button>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={stationComparisonData}
              margin={{ top: 10, right: 20, left: 60, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEFEC" horizontal={false} />
              <XAxis type="number" stroke="#737A75" tick={{ fill: '#737A75', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="station"
                stroke="#737A75"
                tick={{ fill: '#171A18', fontSize: 11 }}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F7F9F6',
                  borderColor: '#D9DEDA',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="surges" name="Surge Incidents" fill="#68DD79" radius={[0, 4, 4, 0]} />
              <Bar dataKey="blowouts" name="Low Blowouts" fill="#C5A8F8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Archive & Export Table */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-muted border border-border flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-mint-strong" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary-text">Published Reports & Insights</h3>
              <p className="text-xs text-secondary-text">
                Certified water-level pattern recognition documents and scientific audits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => handleExport('new-custom-report', 'PDF')}
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-secondary-text text-xs uppercase font-semibold border-b border-border">
              <tr>
                <th className="py-3 px-4">Document Title & ID</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Stations Scope</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportHistory.map((report) => (
                <tr key={report.id} className="hover:bg-surface-muted/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-primary-text leading-snug">{report.title}</div>
                    <div className="font-mono text-[11px] text-secondary-text">{report.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-secondary-text">{report.period}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-primary-text">{report.stations}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={report.status === 'Generated' ? 'normal' : 'neutral'} size="sm">
                      {report.type}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-secondary-text">{report.fileSize}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExport(report.id, 'PDF')}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleExport(report.id, 'CSV')}
                      >
                        CSV
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
