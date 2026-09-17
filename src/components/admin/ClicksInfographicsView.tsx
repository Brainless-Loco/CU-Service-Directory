import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Download,
  Trash2,
  Sparkles,
  Search,
  ArrowUpRight,
  MousePointerClick,
  Filter,
} from 'lucide-react';
import { ServiceClickEvent, ServiceItem } from '../../types';
import {
  computeClickStats,
  generateSeedClicks,
  clearRecordedClicks,
  recordServiceClick,
  STORAGE_KEY_CLICKS,
} from '../../services/clickTrackingService';

interface ClicksInfographicsViewProps {
  services: ServiceItem[];
  clicks: ServiceClickEvent[];
  onRefreshClicks: () => void;
}

export const ClicksInfographicsView: React.FC<ClicksInfographicsViewProps> = ({
  services,
  clicks,
  onRefreshClicks,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const [streamFilter, setStreamFilter] = useState('');
  const [hoveredBar, setHoveredBar] = useState<{ date: string; count: number } | null>(null);
  const [hoveredHour, setHoveredHour] = useState<{ hour: string; count: number } | null>(null);

  const stats = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    return computeClickStats(clicks || [], days);
  }, [clicks, timeRange]);

  // Filtered click stream
  const filteredClicks = useMemo(() => {
    if (!streamFilter.trim()) return (clicks || []).slice(0, 50);
    const q = streamFilter.toLowerCase();
    return (clicks || [])
      .filter(
        (c) =>
          c.serviceTitle.toLowerCase().includes(q) ||
          c.portalUrl.toLowerCase().includes(q) ||
          (c.ipAddress && c.ipAddress.includes(q))
      )
      .slice(0, 50);
  }, [clicks, streamFilter]);

  const handleSimulateTraffic = () => {
    const seed = generateSeedClicks(services, 45);
    let existing: ServiceClickEvent[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLICKS);
      if (saved) existing = JSON.parse(saved);
    } catch (e) {
      existing = [];
    }
    const combined = [...seed, ...existing].slice(0, 5000);
    try {
      localStorage.setItem(STORAGE_KEY_CLICKS, JSON.stringify(combined));
    } catch (e) {
      console.error('Failed to save simulated clicks', e);
    }
    onRefreshClicks();
  };

  const handleClearClicks = () => {
    if (window.confirm('Are you sure you want to reset all click logs and infographic statistics?')) {
      clearRecordedClicks();
      onRefreshClicks();
    }
  };

  const handleExportCsv = () => {
    if (!clicks || clicks.length === 0) {
      alert('No click events recorded yet.');
      return;
    }
    const headers = ['Click ID', 'Service ID', 'Service Title', 'Portal URL', 'Date & Time', 'Device Type', 'IP Address'];
    const rows = clicks.map((c) => [
      c.id,
      c.serviceId,
      `"${c.serviceTitle.replace(/"/g, '""')}"`,
      `"${c.portalUrl.replace(/"/g, '""')}"`,
      c.timestamp,
      c.deviceType,
      c.ipAddress || 'Unknown',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cu-service-clicks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Max value calculation for Daily Trend Chart
  const dailyTrend = stats?.dailyTrend || [];
  const hourlyDistribution = stats?.hourlyDistribution || [];
  const topServices = stats?.topServices || [];
  const deviceBreakdown = stats?.deviceBreakdown || {
    desktop: 0,
    desktopPct: 0,
    mobile: 0,
    mobilePct: 0,
    tablet: 0,
    tabletPct: 0,
  };

  const maxDailyCount = Math.max(...dailyTrend.map((d) => d.count), 1);
  const maxHourlyCount = Math.max(...hourlyDistribution.map((h) => h.count), 1);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Service Clicks & Engagement Infographics
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of student, faculty, and officer clicks across university portals with date/time logs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                timeRange === '7d' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                timeRange === '14d' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-colors ${
                timeRange === '30d' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleSimulateTraffic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
            title="Generate sample user clicks to populate infographics immediately"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Simulate Clicks</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            title="Download full clicks data in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleClearClicks}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
            title="Reset all click logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Total Recorded Clicks</span>
            <MousePointerClick className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalClicks.toLocaleString()}</p>
          <span className="text-2xs text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
            Across {services.length} registered portals
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Daily Average Clicks</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.dailyAverageClicks}</p>
          <span className="text-2xs text-slate-500 mt-1 inline-block">
            Computed over active days
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Peak Traffic Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 truncate">
            {stats.peakHour ? `${stats.peakHour.hour} (${stats.peakHour.count} clicks)` : '10:00 AM'}
          </p>
          <span className="text-2xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
            Highest university access
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider">Top Visited Portal</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-base font-bold text-slate-900 truncate" title={stats.topService?.title}>
            {stats.topService?.title || 'None'}
          </p>
          <span className="text-2xs text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
            {stats.topService ? `${stats.topService.count} clicks (${stats.topService.percentage}%)` : 'No clicks'}
          </span>
        </div>
      </div>

      {/* Infographic 1: Daily Click Activity Timeline (Dates on X-Axis) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Daily Click Trend Infographic (By Date)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Interactive timeline showing user clicks volume across calendar dates. Hover over any bar for details.
            </p>
          </div>
          {hoveredBar && (
            <div className="text-xs px-2.5 py-1 bg-emerald-900 text-white rounded-md font-mono shadow-xs animate-fadeIn">
              {hoveredBar.date}: <strong>{hoveredBar.count} clicks</strong>
            </div>
          )}
        </div>

        {/* Custom SVG/HTML Bar Infographic */}
        <div className="h-44 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-200">
          {dailyTrend.map((item, idx) => {
            const heightPercent = Math.round((item.count / maxDailyCount) * 100);
            const isHighest = item.count === maxDailyCount && item.count > 0;
            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredBar(item)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Floating tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-3xs font-mono py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-xs">
                  {item.count} clicks
                </div>

                {/* Animated bar */}
                <div
                  className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                    isHighest
                      ? 'bg-gradient-to-t from-emerald-700 to-emerald-400'
                      : item.count > 0
                      ? 'bg-gradient-to-t from-slate-800 to-slate-600 group-hover:from-emerald-600 group-hover:to-emerald-400'
                      : 'bg-slate-100 h-1'
                  }`}
                  style={{ height: item.count > 0 ? `${Math.max(heightPercent, 6)}%` : '4px' }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Date Labels */}
        <div className="flex items-center justify-between text-3xs font-mono text-slate-600 pt-2 overflow-x-auto">
          {dailyTrend.map((item, idx) => (
            <span key={idx} className="truncate text-center flex-1">
              {item.formattedDate}
            </span>
          ))}
        </div>
      </div>

      {/* Infographic 2: 24-Hour Traffic Distribution Curve (Times of Day on X-Axis) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>24-Hour Traffic Distribution Curve (Time of Day)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Hourly activity breakdown showing when university visitors access portals (00:00 to 23:00).
              </p>
            </div>
            {hoveredHour && (
              <div className="text-xs px-2.5 py-1 bg-sky-900 text-white rounded-md font-mono shadow-xs">
                {hoveredHour.hour}: <strong>{hoveredHour.count} clicks</strong>
              </div>
            )}
          </div>

          {/* 24-Hour Column Chart */}
          <div className="h-40 w-full flex items-end gap-1 pt-6 pb-2 border-b border-slate-200">
            {hourlyDistribution.map((item) => {
              const heightPercent = Math.round((item.count / maxHourlyCount) * 100);
              const isPeak = item.count === maxHourlyCount && item.count > 0;
              return (
                <div
                  key={item.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredHour(item)}
                  onMouseLeave={() => setHoveredHour(null)}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isPeak
                        ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                        : item.count > 0
                        ? 'bg-gradient-to-t from-slate-400 to-slate-500 group-hover:from-sky-500 group-hover:to-sky-300'
                        : 'bg-slate-100 h-1'
                    }`}
                    style={{ height: item.count > 0 ? `${Math.max(heightPercent, 5)}%` : '3px' }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-3xs font-mono text-slate-600 pt-2">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Infographic 3: Device Type Breakdown */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Device Access Breakdown</span>
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Visitor client hardware distribution.
            </p>

            <div className="space-y-3">
              {/* Desktop */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>Desktop Workstation</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {deviceBreakdown.desktop} ({deviceBreakdown.desktopPct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${deviceBreakdown.desktopPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mobile Smartphone</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {deviceBreakdown.mobile} ({deviceBreakdown.mobilePct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all duration-500"
                    style={{ width: `${deviceBreakdown.mobilePct}%` }}
                  ></div>
                </div>
              </div>

              {/* Tablet */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Tablet className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tablet Device</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {deviceBreakdown.tablet} ({deviceBreakdown.tabletPct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${deviceBreakdown.tabletPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-2xs text-slate-600 flex items-center justify-between font-mono">
            <span>Client Fingerprinting: Active</span>
            <span>HTTP User-Agent Parser</span>
          </div>
        </div>
      </div>

      {/* Infographic 4: Top Services Leaderboard & Popularity Share */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Top Visited Services Leaderboard (Highest Click Volume)</span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Ranking of the most frequently visited digital tools with proportion of university portal traffic.
        </p>

        {topServices.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No service clicks recorded yet. Click on any service in the portal or click "Simulate Clicks" above.
          </div>
        ) : (
          <div className="space-y-3">
            {topServices.map((item, idx) => (
              <div key={item.serviceId} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-900'
                      : idx === 2
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate pr-2">{item.title}</span>
                    <span className="font-mono text-slate-700 font-semibold whitespace-nowrap">
                      {item.count} clicks ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Click Stream Log Table */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-emerald-600" />
              <span>Real-Time User Click Stream Log (service_clicks)</span>
            </h4>
            <p className="text-xs text-slate-500">
              Chronological log of portal visits with high-precision timestamp, IP address, and client platform.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              placeholder="Search by service or IP..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Portal URL</th>
                <th className="py-2.5 px-3">Date & Time (Timestamp)</th>
                <th className="py-2.5 px-3">Device</th>
                <th className="py-2.5 px-3">Client IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredClicks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    No clicks logged matching your filter.
                  </td>
                </tr>
              ) : (
                filteredClicks.map((click) => {
                  const dateObj = new Date(click.timestamp);
                  const formattedDateTime = dateObj.toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr key={click.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 font-sans font-bold text-slate-900 truncate max-w-[200px]">
                        {click.serviceTitle}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-2xs truncate max-w-[220px]">
                        {click.portalUrl}
                      </td>
                      <td className="py-2 px-3 text-slate-700 text-2xs whitespace-nowrap">
                        {formattedDateTime}
                      </td>
                      <td className="py-2 px-3 text-2xs">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-sans capitalize">
                          {click.deviceType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-2xs">
                        {click.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
