import React, { useState, useEffect } from 'react';
import { Calendar, Activity, Users, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeatmapData {
  date: string;
  hour: number;
  activity_count: number;
  message_count: number;
  task_count: number;
  approval_count: number;
  document_count: number;
}

interface UserActivityHeatmapProps {
  userId?: string;
  timeRange: 'week' | 'month';
  onTimeRangeChange: (range: 'week' | 'month') => void;
}

export const UserActivityHeatmap: React.FC<UserActivityHeatmapProps> = ({ 
  userId,
  timeRange,
  onTimeRangeChange 
}) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  useEffect(() => {
    fetchHeatmapData();
  }, [userId, timeRange]);

  const fetchHeatmapData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_heatmap')
        .select('*')
        .eq('user_id', userId || 'current_user') // Will need to be adjusted
        .gte('date', getDateRange(timeRange).start)
        .lte('date', getDateRange(timeRange).end)
        .order('date', { ascending: true })
        .order('hour', { ascending: true });
      
      if (!error && data) {
        setHeatmapData(data);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }
    setLoading(false);
  };

  const getDateRange = (range: 'week' | 'month') => {
    const now = new Date();
    const start = new Date(now);
    
    if (range === 'week') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setMonth(now.getMonth() - 1);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  };

  const getActivityColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-green-100';
    if (intensity < 0.4) return 'bg-green-200';
    if (intensity < 0.6) return 'bg-green-300';
    if (intensity < 0.8) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getHourLabels = () => {
    return Array.from({ length: 24 }, (_, i) => 
      i === 0 ? '12am' : 
      i < 12 ? `${i}am` : 
      i === 12 ? '12pm' : 
      `${i - 12}pm`
    );
  };

  const getMaxActivity = () => {
    return Math.max(...heatmapData.map(d => d.activity_count), 1);
  };

  const getSelectedData = () => {
    if (!selectedDate || !selectedHour) return null;
    
    return heatmapData.find(
      d => d.date === selectedDate && d.hour === selectedHour
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-worksphere-600"></div>
        <span className="ml-2 text-gray-600">Loading activity heatmap...</span>
      </div>
    );
  }

  const maxActivity = getMaxActivity();
  const hourLabels = getHourLabels();
  const selectedData = getSelectedData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">User Activity Heatmap</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onTimeRangeChange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-worksphere-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => onTimeRangeChange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-worksphere-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Activities</span>
            <Activity className="text-blue-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {heatmapData.reduce((sum, d) => sum + d.activity_count, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">All interactions</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Peak Hour</span>
            <Clock className="text-green-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {hourLabels[
              heatmapData.reduce((maxHour, d) => 
                d.activity_count > heatmapData.find(md => md.hour === maxHour)?.activity_count 
                  ? d.hour 
                  : maxHour, 0
              )
            ]}
          </div>
          <div className="text-sm text-gray-500">Most active time</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Active Days</span>
            <Calendar className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {new Set(heatmapData.map(d => d.date)).size}
          </div>
          <div className="text-sm text-gray-500">Days with activity</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Avg Daily</span>
            <TrendingUp className="text-orange-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {heatmapData.length > 0 
              ? Math.round(heatmapData.reduce((sum, d) => sum + d.activity_count, 0) / new Set(heatmapData.map(d => d.date)).size)
              : 0
            }
          </div>
          <div className="text-sm text-gray-500">Activities per day</div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Activity Pattern</h3>
        
        {/* Hour labels */}
        <div className="grid grid-cols-25 gap-1 mb-2">
          <div></div>
          {hourLabels.map((hour, i) => (
            <div key={i} className="text-xs text-gray-500 text-center">
              {hour}
            </div>
          ))}
        </div>

        {/* Date rows */}
        {Array.from({ length: timeRange === 'week' ? 7 : 30 }, (_, dayIndex) => {
          const date = new Date();
          if (timeRange === 'week') {
            date.setDate(date.getDate() - (6 - dayIndex));
          } else {
            date.setDate(date.getDate() - (29 - dayIndex));
          }
          const dateStr = date.toISOString().split('T')[0];
          
          return (
            <div key={dateStr} className="grid grid-cols-25 gap-1">
              <div className="text-xs text-gray-500 text-right pr-2">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              {hourLabels.map((_, hourIndex) => {
                const data = heatmapData.find(d => d.date === dateStr && d.hour === hourIndex);
                const count = data?.activity_count || 0;
                
                return (
                  <div
                    key={hourIndex}
                    className={`w-4 h-4 rounded cursor-pointer border border-gray-200 hover:border-gray-400 ${getActivityColor(count, maxActivity)}`}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedHour(hourIndex);
                    }}
                    title={`${dateStr} ${hourLabels[hourIndex]}: ${count} activities`}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-xs text-gray-500">Activity Level:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            <span className="text-xs">None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-200 border border-gray-200 rounded"></div>
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-300 border border-gray-200 rounded"></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 border border-gray-200 rounded"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 border border-gray-200 rounded"></div>
            <span className="text-xs">Very High</span>
          </div>
        </div>
      </div>

      {/* Selected Time Details */}
      {selectedData && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">
            {new Date(selectedData.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            )} - {hourLabels[selectedHour]}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Activities</div>
              <div className="text-xl font-bold text-blue-600">
                {selectedData.activity_count}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Messages</div>
              <div className="text-xl font-bold text-green-600">
                {selectedData.message_count}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Tasks</div>
              <div className="text-xl font-bold text-purple-600">
                {selectedData.task_count}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Approvals</div>
              <div className="text-xl font-bold text-orange-600">
                {selectedData.approval_count}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Documents</div>
              <div className="text-xl font-bold text-red-600">
                {selectedData.document_count}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Activity Breakdown</h4>
            <div className="space-y-2">
              {selectedData.message_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages sent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(selectedData.message_count / selectedData.activity_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((selectedData.message_count / selectedData.activity_count) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              
              {selectedData.task_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasks completed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(selectedData.task_count / selectedData.activity_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((selectedData.task_count / selectedData.activity_count) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              
              {selectedData.approval_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approvals processed</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${(selectedData.approval_count / selectedData.activity_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((selectedData.approval_count / selectedData.activity_count) * 100)}%
                    </span>
                  </div>
                </div>
              )}
              
              {selectedData.document_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Documents uploaded</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(selectedData.document_count / selectedData.activity_count) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((selectedData.document_count / selectedData.activity_count) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
