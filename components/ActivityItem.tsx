import React, { useMemo } from 'react';
import { Activity } from '../types';
import { useNotifications } from './NotificationProvider';

const Dashboard: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const { addNotification } = useNotifications();

  const stats = useMemo(() => {
    const totalActivities = activities.length;
    // FIX: Ensure 'participants' is treated as a number to prevent string concatenation.
    const totalParticipants = activities.reduce((sum, act) => sum + Number(act.participants || 0), 0);
    // FIX: Ensure 'venueCost' is treated as a number to prevent string concatenation.
    const totalVenueCost = activities.reduce((sum, act) => sum + Number(act.venueCost || 0), 0);
    // FIX: Explicitly type the accumulator for `reduce` to correctly calculate status counts.
    const statusCounts = activities.reduce((acc: Record<string, number>, act) => {
      acc[act.status] = (acc[act.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { totalActivities, totalParticipants, totalVenueCost, statusCounts };
  }, [activities]);

  const exportAnalysisDataToCSV = () => {
    if (activities.length === 0) {
        addNotification("No data to export.", 'warning');
        return;
    }

    const escapeCSV = (val: any) => `"${String(val).replace(/"/g, '""')}"`;

    // Part 1: Summary Stats
    const summaryData = [
        ['Metric', 'Value'],
        ['Total Activities', stats.totalActivities],
        ['Total Participants', stats.totalParticipants.toLocaleString()],
        ['Total Venue Cost ($)', stats.totalVenueCost.toLocaleString()],
        ...Object.entries(stats.statusCounts).map(([status, count]) => [`${status} Activities`, count])
    ];
    const summaryCsv = summaryData.map(row => row.map(escapeCSV).join(',')).join('\n');

    // Part 2: Raw Data
    const headers = Object.keys(activities[0]).join(',');
    const rows = activities.map(row => 
      Object.values(row).map(escapeCSV).join(',')
    );
    const rawDataCsv = [headers, ...rows].join('\n');

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Analysis Summary\n" 
      + summaryCsv 
      + "\n\nRaw Activity Data\n" 
      + rawDataCsv;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analysis_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );

  const statusColors: { [key: string]: string } = {
    Planned: 'bg-blue-500',
    'In Progress': 'bg-yellow-500',
    Completed: 'bg-green-500',
    Cancelled: 'bg-red-500',
  };
  
  // FIX: Cast participants to a number to ensure correct calculation for Math.max.
  const maxParticipants = useMemo(() => Math.max(1, ...activities.map(a => Number(a.participants || 0))), [activities]);


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard & Analysis</h2>
        {activities.length > 0 && (
          <button 
            onClick={exportAnalysisDataToCSV} 
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 shadow-sm"
            aria-label="Export analysis report to CSV"
          >
            Export Report
          </button>
        )}
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Activities" value={stats.totalActivities} />
          <StatCard title="Total Participants" value={stats.totalParticipants.toLocaleString()} />
          <StatCard title="Total Venue Cost" value={`$${stats.totalVenueCost.toLocaleString()}`} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Activities by Status</h3>
            <div className="space-y-4">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{status}</span>
                        {/* FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. */}
                        <span className="text-sm font-medium">{count} ({stats.totalActivities > 0 ? ((Number(count) / stats.totalActivities) * 100).toFixed(1) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        {/* FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. */}
                        <div className={`${statusColors[status] || 'bg-gray-500'} h-2.5 rounded-full`} style={{ width: `${stats.totalActivities > 0 ? (Number(count) / stats.totalActivities) * 100 : 0}%` }}></div>
                    </div>
                </div>
            ))}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Participants per Activity</h3>
            <div className="space-y-2 overflow-y-auto max-h-80 pr-2">
                {activities.map(act => (
                    <div key={act.id} className="flex items-center gap-4 text-sm">
                        <span className="font-medium truncate w-1/3" title={act.title}>{act.title}</span>
                        <div className="w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                             {/* FIX: Cast participants to a number for the division operation. This resolves the arithmetic error. */}
                             <div className="bg-sky-500 h-4 rounded-full flex items-center justify-end px-2 text-white text-xs" style={{ width: `${(Number(act.participants || 0) / maxParticipants) * 100}%` }}>
                                 {act.participants}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;