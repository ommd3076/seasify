import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
  Table as TableIcon,
  Activity,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export const UploadScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'import'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>('noaa_harbor_point_nov2024.csv');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const previewRows = [
    { timestamp: '2024-11-12 00:00:00', waterLevel: 1.42, predicted: 1.38, residual: 0.04, flag: 'Verified' },
    { timestamp: '2024-11-12 01:00:00', waterLevel: 1.68, predicted: 1.55, residual: 0.13, flag: 'Verified' },
    { timestamp: '2024-11-12 02:00:00', waterLevel: 2.15, predicted: 1.72, residual: 0.43, flag: 'Surge' },
    { timestamp: '2024-11-12 03:00:00', waterLevel: 2.44, predicted: 1.84, residual: 0.60, flag: 'Extreme' },
    { timestamp: '2024-11-12 04:00:00', waterLevel: 2.38, predicted: 1.80, residual: 0.58, flag: 'Extreme' },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleProcessFile = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportStatus('Successfully parsed 720 time-series rows. Ready for automata ingestion.');
    }, 1200);
  };

  return (
    <div data-testid="screen-upload" className="space-y-6">
      {/* Ingestion Type Tabs Header */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary-text">Data Ingestion & Historical Import</h2>
            <p className="text-xs text-secondary-text mt-0.5">
              Add external tide telemetry files or connect to public coastal oceanographic APIs
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-muted p-1 rounded-full border border-border">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Upload Observation Files
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                activeTab === 'import'
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              Import Historical Tide Data
            </button>
          </div>
        </div>

        {/* Tab 1: Upload Dropzone */}
        {activeTab === 'upload' ? (
          <div className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-panel p-8 text-center transition-all ${
                dragOver
                  ? 'border-mint-strong bg-[#A5F5A6]/10'
                  : 'border-border bg-surface-muted/40 hover:bg-surface-muted/60'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EAEFEC] border border-border flex items-center justify-center mx-auto mb-3 text-mint-strong">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-primary-text mb-1">
                Drag and drop your observation dataset
              </h3>
              <p className="text-xs text-secondary-text max-w-md mx-auto mb-4">
                Supported formats: CSV, TSV, or JSON with timestamp, observed water level, and optional predicted tides.
              </p>

              <div className="flex items-center justify-center gap-3">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.tsv,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <span className="btn-secondary text-xs">Browse Local Files</span>
                </label>
              </div>

              {selectedFileName && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-mono text-primary-text">
                  <FileText className="w-3.5 h-3.5 text-mint-strong" />
                  <span>{selectedFileName}</span>
                  <Badge variant="normal" size="sm">Ready</Badge>
                </div>
              )}
            </div>

            {/* Validation Checklist & Parser Trigger */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-card bg-surface-muted border border-border">
                <div className="flex items-center gap-2 mb-1 text-mint-dark">
                  <CheckCircle2 className="w-4 h-4 text-mint-strong" />
                  <span className="text-xs font-bold text-primary-text">Timestamp Parsing</span>
                </div>
                <p className="text-[11px] text-secondary-text">ISO 8601 & UTC offsets supported (6-minute or 1-hour cadence)</p>
              </div>

              <div className="p-4 rounded-card bg-surface-muted border border-border">
                <div className="flex items-center gap-2 mb-1 text-mint-dark">
                  <CheckCircle2 className="w-4 h-4 text-mint-strong" />
                  <span className="text-xs font-bold text-primary-text">Datum Standardization</span>
                </div>
                <p className="text-[11px] text-secondary-text">MLLW, MSL, and NAVD88 unit harmonization (Meters / Feet)</p>
              </div>

              <div className="p-4 rounded-card bg-surface-muted border border-border">
                <div className="flex items-center gap-2 mb-1 text-mint-dark">
                  <CheckCircle2 className="w-4 h-4 text-mint-strong" />
                  <span className="text-xs font-bold text-primary-text">Residual Pre-computation</span>
                </div>
                <p className="text-[11px] text-secondary-text">Automatic cubic spline interpolation of non-tidal residuals</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-secondary-text">
                {importStatus ? (
                  <span className="font-semibold text-mint-dark flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-mint-strong" />
                    {importStatus}
                  </span>
                ) : (
                  <span>Ready to parse dataset and generate automata symbol stream</span>
                )}
              </div>

              <Button
                variant="primary"
                onClick={handleProcessFile}
                isLoading={isProcessing}
                disabled={!selectedFileName}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Ingest & Process Telemetry
              </Button>
            </div>
          </div>
        ) : (
          /* Tab 2: Historical API Connector */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: 'NOAA CO-OPS API',
                  desc: 'National Ocean Service water levels & harmonic predictions across 300+ US coastal stations',
                  badge: 'Direct CORS',
                  color: 'border-mint-strong',
                },
                {
                  name: 'NDBC Buoy Network',
                  desc: 'National Data Buoy Center oceanographic wave period, atmospheric pressure, and offshore tides',
                  badge: 'Public API',
                  color: 'border-lavender',
                },
                {
                  name: 'Copernicus Marine',
                  desc: 'European Copernicus sea level reanalysis and global coastal altimetry observations',
                  badge: 'REST Auth',
                  color: 'border-border',
                },
              ].map((conn) => (
                <div key={conn.name} className={`p-5 rounded-panel bg-surface border ${conn.color} shadow-sm flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-primary-text">{conn.name}</span>
                      <Badge variant="normal" size="sm">{conn.badge}</Badge>
                    </div>
                    <p className="text-xs text-secondary-text">{conn.desc}</p>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-4 w-full">
                    Connect Provider
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dataset Preview Table */}
      <div className="bg-surface rounded-panel border border-border shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-secondary-text" />
            <h3 className="text-base font-bold text-primary-text">Parsed Telemetry Preview</h3>
          </div>
          <span className="text-xs font-mono text-secondary-text">First 5 records displayed</span>
        </div>

        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-secondary-text text-xs uppercase font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4">Observed Level (m)</th>
                <th className="py-2.5 px-4">Predicted Harmonic (m)</th>
                <th className="py-2.5 px-4">Residual R(t)</th>
                <th className="py-2.5 px-4">Quality / Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono text-xs">
              {previewRows.map((r, i) => (
                <tr key={i} className="hover:bg-surface-muted/40 transition">
                  <td className="py-2.5 px-4 text-primary-text">{r.timestamp}</td>
                  <td className="py-2.5 px-4 font-semibold text-primary-text">{r.waterLevel.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-secondary-text">{r.predicted.toFixed(2)}</td>
                  <td className={`py-2.5 px-4 font-bold ${r.residual > 0.2 ? 'text-lavender-dark' : 'text-mint-dark'}`}>
                    +{r.residual.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 font-sans">
                    <Badge variant={r.flag === 'Extreme' ? 'elevated' : 'normal'} size="sm">
                      {r.flag}
                    </Badge>
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

export default UploadScreen;
