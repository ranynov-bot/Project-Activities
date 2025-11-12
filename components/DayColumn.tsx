import React, { useState, useMemo } from 'react';
import { Activity, ActivityStatus } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import { useNotifications } from './NotificationProvider';

interface ActivityTableProps {
  activities: Activity[];
  isAdmin: boolean;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const STATUS_OPTIONS: ActivityStatus[] = ["Planned", "In Progress", "Completed", "Cancelled"];

const ActivityTable: React.FC<ActivityTableProps> = ({ activities, isAdmin, onEdit, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const { addNotification } = useNotifications();

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      if (statusFilter && activity.status !== statusFilter) {
        return false;
      }
      if (locationFilter && !activity.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      // Date range overlap logic
      if (startDateFilter && activity.endDate < startDateFilter) { // Activity ends before the filter range starts
        return false;
      }
      if (endDateFilter && activity.startDate > endDateFilter) { // Activity starts after the filter range ends
        return false;
      }
      return true;
    });
  }, [activities, statusFilter, locationFilter, startDateFilter, endDateFilter]);

  const summaryStats = useMemo(() => {
    const totalParticipants = filteredActivities.reduce((sum, act) => sum + Number(act.participants || 0), 0);
    const totalVenueCost = filteredActivities.reduce((sum, act) => sum + Number(act.venueCost || 0), 0);
    const statusCounts = filteredActivities.reduce((acc: Record<string, number>, act) => {
      acc[act.status] = (acc[act.status] || 0) + 1;
      return acc;
    }, {});
    
    STATUS_OPTIONS.forEach(status => {
        if (!statusCounts[status]) {
            statusCounts[status] = 0;
        }
    });

    return { totalParticipants, totalVenueCost, statusCounts };
  }, [filteredActivities]);
  
  const clearFilters = () => {
    setStatusFilter('');
    setLocationFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const exportToCSV = () => {
    if (filteredActivities.length === 0) {
        addNotification("No data to export for the current filters.", 'warning');
        return;
    }
    const headers = Object.keys(filteredActivities[0]).join(',');
    const rows = filteredActivities.map(row => 
      Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "activities_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No Activities Found</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Get started by adding a new activity on the 'Data Entry' page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold">Activity Results</h2>
            <div className="flex gap-2">
                {isAdmin && (
                    <button className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Import CSV</button>
                )}
                <button onClick={exportToCSV} className="px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Export CSV</button>
            </div>
        </div>
        
        {activities.length > 0 && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold mb-3 text-slate-600 dark:text-slate-300">Filtered Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Participants</h4>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{summaryStats.totalParticipants.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Venue Cost</h4>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">${summaryStats.totalVenueCost.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg col-span-1 sm:col-span-2">
                        <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status Breakdown</h4>
                        <div className="mt-2 flex flex-wrap justify-around gap-x-4 gap-y-2">
                            {STATUS_OPTIONS.map(status => (
                                <div key={status} className="text-center">
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{summaryStats.statusCounts[status] || 0}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{status}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md">
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="location-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
                    <input type="text" id="location-filter" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} placeholder="e.g., Conference Room" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="start-date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                        <input type="date" id="start-date-filter" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                    <div>
                        <label htmlFor="end-date-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                        <input type="date" id="end-date-filter" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"/>
                    </div>
                </div>
                <div>
                    <button onClick={clearFilters} className="w-full px-4 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">Clear Filters</button>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">Title</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Location</th>
                        <th scope="col" className="px-6 py-3">Start Date</th>
                        <th scope="col" className="px-6 py-3">End Date</th>
                        <th scope="col" className="px-6 py-3">Participants</th>
                        {isAdmin && <th scope="col" className="px-6 py-3">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map(activity => (
                          <tr key={activity.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{activity.title}</td>
                              <td className="px-6 py-4">{activity.status}</td>
                              <td className="px-6 py-4">{activity.location}</td>
                              <td className="px-6 py-4">{activity.startDate}</td>
                              <td className="px-6 py-4">{activity.endDate}</td>
                              <td className="px-6 py-4">{activity.participants}</td>
                              {isAdmin && (
                                  <td className="px-6 py-4 flex items-center space-x-2">
                                      <button onClick={() => onEdit(activity)} className="p-1 text-slate-500 hover:text-sky-500" aria-label="Edit"><EditIcon className="w-4 h-4" /></button>
                                      <button onClick={() => onDelete(activity.id)} className="p-1 text-slate-500 hover:text-red-500" aria-label="Delete"><TrashIcon className="w-4 h-4" /></button>
                                  </td>
                              )}
                          </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                          No activities match your filter criteria.
                        </td>
                      </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default ActivityTable;