import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Clock, 
  CheckCircle, AlertCircle, BarChart3, Target 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductivityData {
  departmentName: string;
  taskCompletionRate: number;
  avgTaskTime: number;
  messageVolume: number;
  approvalCycleTime: number;
  engagementScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface ProductivityMetricsProps {
  timeRange: 'today' | 'week' | 'month';
  onTimeRangeChange: (range: 'today' | 'week' | 'month') => void;
}

export const ProductivityMetrics: React.FC<ProductivityMetricsProps> = ({ 
  timeRange, 
  onTimeRangeChange 
}) => {
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    fetchProductivityData();
  }, [timeRange]);

  const fetchProductivityData = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_productivity_metrics', { time_range: timeRange });
      
      if (!error && data) {
        setProductivityData(data);
      }
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
    }
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'down':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getPerformanceColor = (value: number, type: string) => {
    if (type === 'completion_rate') {
      if (value >= 85) return 'text-green-600';
      if (value >= 70) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'response_time') {
      if (value <= 24) return 'text-green-600';
      if (value <= 48) return 'text-yellow-600';
      return 'text-red-600';
    }
    if (type === 'engagement') {
      if (value >= 75) return 'text-green-600';
      if (value >= 50) return 'text-yellow-600';
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-worksphere-600"></div>
        <span className="ml-2 text-gray-600">Loading productivity metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Productivity Metrics</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onTimeRangeChange('today')}
            className={`px-3 py-1 rounded ${
              timeRange === 'today' ? 'bg-worksphere-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => onTimeRangeChange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-worksphere-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => onTimeRangeChange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-worksphere-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Avg Completion Rate</span>
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {productivityData.length > 0 
              ? (productivityData.reduce((sum, dept) => sum + dept.taskCompletionRate, 0) / productivityData.length).toFixed(1)
              : '0'
            }%
          </div>
          <div className="text-sm text-gray-500">Across all departments</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Avg Task Time</span>
            <Clock className="text-blue-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {productivityData.length > 0 
              ? (productivityData.reduce((sum, dept) => sum + dept.avgTaskTime, 0) / productivityData.length).toFixed(1)
              : '0'
            }h
          </div>
          <div className="text-sm text-gray-500">Hours per task</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Approval Cycle</span>
            <Target className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {productivityData.length > 0 
              ? (productivityData.reduce((sum, dept) => sum + dept.approvalCycleTime, 0) / productivityData.length).toFixed(1)
              : '0'
            }h
          </div>
          <div className="text-sm text-gray-500">Average cycle time</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Engagement Score</span>
            <Users className="text-orange-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {productivityData.length > 0 
              ? (productivityData.reduce((sum, dept) => sum + dept.engagementScore, 0) / productivityData.length).toFixed(1)
              : '0'
            }
          </div>
          <div className="text-sm text-gray-500">Out of 100</div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Department Performance</h3>
        </div>
        <div className="divide-y">
          {productivityData.map((dept) => (
            <div 
              key={dept.departmentName}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedDepartment === dept.departmentName ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedDepartment(
                selectedDepartment === dept.departmentName ? null : dept.departmentName
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">{dept.departmentName}</h4>
                  {getTrendIcon(dept.trend)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BarChart3 size={16} />
                  <span>View Details</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Task Completion</div>
                  <div className={`font-semibold ${getPerformanceColor(dept.taskCompletionRate, 'completion_rate')}`}>
                    {dept.taskCompletionRate}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg Task Time</div>
                  <div className={`font-semibold ${getPerformanceColor(dept.avgTaskTime, 'response_time')}`}>
                    {dept.avgTaskTime}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Approval Cycle</div>
                  <div className={`font-semibold ${getPerformanceColor(dept.approvalCycleTime, 'response_time')}`}>
                    {dept.approvalCycleTime}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Engagement</div>
                  <div className={`font-semibold ${getPerformanceColor(dept.engagementScore, 'engagement')}`}>
                    {dept.engagementScore}
                  </div>
                </div>
              </div>

              {selectedDepartment === dept.departmentName && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Performance Indicators</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Message Volume:</span>
                          <span className="font-medium">{dept.messageVolume}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Task Efficiency:</span>
                          <span className="font-medium">
                            {dept.taskCompletionRate >= 85 ? 'Excellent' : 
                             dept.taskCompletionRate >= 70 ? 'Good' : 'Needs Improvement'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response Speed:</span>
                          <span className="font-medium">
                            {dept.avgTaskTime <= 24 ? 'Fast' : 
                             dept.avgTaskTime <= 48 ? 'Normal' : 'Slow'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                      <div className="space-y-1">
                        {dept.taskCompletionRate < 70 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle size={14} />
                            <span>Consider task prioritization training</span>
                          </div>
                        )}
                        {dept.approvalCycleTime > 48 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle size={14} />
                            <span>Streamline approval workflows</span>
                          </div>
                        )}
                        {dept.engagementScore < 50 && (
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <AlertCircle size={14} />
                            <span>Boost team engagement activities</span>
                          </div>
                        )}
                        {dept.taskCompletionRate >= 85 && dept.engagementScore >= 75 && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle size={14} />
                            <span>Excellent performance!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Top Performers</h4>
            <div className="space-y-2">
              {productivityData
                .filter(dept => dept.taskCompletionRate >= 85)
                .sort((a, b) => b.engagementScore - a.engagementScore)
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.departmentName} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                      <span className="text-sm font-medium">{dept.departmentName}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {dept.engagementScore} pts
                    </span>
                  </div>
                ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
            <div className="space-y-2">
              {productivityData
                .filter(dept => dept.taskCompletionRate < 70 || dept.engagementScore < 50)
                .sort((a, b) => a.taskCompletionRate - b.taskCompletionRate)
                .slice(0, 3)
                .map((dept, index) => (
                  <div key={dept.departmentName} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-orange-500" size={16} />
                      <span className="text-sm font-medium">{dept.departmentName}</span>
                    </div>
                    <span className="text-sm text-orange-600 font-medium">
                      {dept.taskCompletionRate}% complete
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
