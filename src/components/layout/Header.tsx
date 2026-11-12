import React from 'react';
import { MapPin, Activity } from 'lucide-react';
import Dropdown from '../common/Dropdown';
import DateRangePicker from '../common/DateRangePicker';
import { useStationStore } from '@/stores/stationStore';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  selectedStation?: string;
  onStationChange?: (stationId: string) => void;
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
  extraControls?: React.ReactNode;
  isStationsScreen?: boolean;
}

export const STATION_OPTIONS = [
  { value: 'all', label: 'All Regions' },
  { value: '9414290', label: 'San Francisco, CA (9414290)' },
  { value: '8518750', label: 'The Battery, NY (8518750)' },
  { value: '8443970', label: 'Boston, MA (8443970)' },
  { value: '8724580', label: 'Key West, FL (8724580)' },
  { value: '8771450', label: 'Galveston Pier 21, TX (8771450)' },
  { value: '9447130', label: 'Seattle, WA (9447130)' },
];

export const REGION_OPTIONS = [
  { value: 'All Regions', label: 'All Regions' },
  { value: 'North Coast', label: 'North Coast' },
  { value: 'Central Coast', label: 'Central Coast' },
  { value: 'South Coast', label: 'South Coast' },
  { value: 'East Coast', label: 'East Coast' },
  { value: 'Gulf Coast', label: 'Gulf Coast' },
  { value: 'Pacific Northwest', label: 'Pacific NW' },
];

export const STATUS_OPTIONS = [
  { value: 'All Statuses', label: 'All Statuses' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Elevated', label: 'Elevated' },
  { value: 'Low Tide', label: 'Low Tide' },
  { value: 'Maintenance', label: 'Maintenance' },
];

export const Header: React.FC<HeaderProps> = ({
  title = 'Overview',
  subtitle = 'Coastal tide and water-level patterns across your monitoring network',
  selectedStation = 'all',
  onStationChange,
  selectedRange = '30d',
  onRangeChange,
  extraControls,
  isStationsScreen = false,
}) => {
  const { statusFilter, setStatusFilter, regionFilter, setRegionFilter } = useStationStore();

  const [station, setStation] = React.useState(selectedStation);
  const [range, setRange] = React.useState(selectedRange);

  React.useEffect(() => {
    setStation(selectedStation);
  }, [selectedStation]);

  const handleStationChange = (val: string) => {
    setStation(val);
    if (onStationChange) {
      onStationChange(val);
    }
  };

  const handleRangeChange = (val: string) => {
    setRange(val);
    if (onRangeChange) {
      onRangeChange(val);
    }
  };

  return (
    <header
      data-testid="header"
      className="flex items-center justify-between py-2 px-1 mb-4 flex-shrink-0 select-none"
    >
      {/* Route Title & Subtitle */}
      <div className="flex flex-col min-w-0">
        <h1
          data-testid="header-title"
          className="text-2xl font-bold tracking-tight text-[#171A18] truncate leading-tight"
        >
          {title}
        </h1>
        <p
          data-testid="header-subtitle"
          className="text-sm text-[#737A75] truncate mt-0.5"
        >
          {subtitle}
        </p>
      </div>

      {/* Right Controls: Filter Pills matching ui-ref */}
      <div className="flex items-center gap-3">
        {extraControls}

        {/* Station / Region Filter Pill matching ui-ref Image 2 (default label is 'All Regions') */}
        <Dropdown
          data-testid="station-filter"
          icon={<MapPin className="w-4 h-4 text-[#737A75]" />}
          value={station}
          onChange={handleStationChange}
          options={STATION_OPTIONS}
        />

        {/* Status Filter Pill on Stations Screen (matching ui-ref Image 2) */}
        {isStationsScreen && (
          <Dropdown
            data-testid="status-filter"
            icon={<Activity className="w-4 h-4 text-[#737A75]" />}
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        )}

        {/* Date Range Filter Pill */}
        <DateRangePicker
          data-testid="date-range-filter"
          value={range}
          onChange={handleRangeChange}
        />
      </div>
    </header>
  );
};

export default Header;
