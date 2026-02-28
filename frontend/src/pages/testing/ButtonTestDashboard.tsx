import React, { useState, useEffect } from 'react';
import { buttonInventory, testResults, generateTestReport } from '../../utils/buttonInventory';
import { CheckCircle, XCircle, AlertCircle, Download, Play, RefreshCw } from 'lucide-react';

export const ButtonTestDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = () => {
    setReport(generateTestReport());
  };

  const runAllTests = async () => {
    // This would programmatically click all buttons
    console.log('Running all button tests...');
    // Implementation would depend on your testing framework
  };

  const exportResults = () => {
    const data = {
      inventory: buttonInventory,
      results: testResults,
      report: generateTestReport()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `button-test-results-${new Date().toISOString()}.json`;
    a.click();
  };

  if (!report) return <div>Loading...</div>;

  const filteredButtons = Object.values(buttonInventory).filter(button => {
    const matchesSearch = button.text.toLowerCase().includes(search.toLowerCase()) ||
                         button.component.toLowerCase().includes(search.toLowerCase()) ||
                         button.action.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const buttonTest = testResults.find(r => r.buttonId === button.id);
    
    if (filter === 'passed') return buttonTest?.success;
    if (filter === 'failed') return buttonTest && !buttonTest.success;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Button Functionality Test Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={runAllTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Play size={18} />
              Run All Tests
            </button>
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} />
              Export Results
            </button>
            <button
              onClick={loadReport}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">{report.summary.total}</div>
            <div className="text-sm text-gray-600">Total Buttons</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{report.summary.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-red-600 mb-2">{report.summary.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{report.summary.passRate}</div>
            <div className="text-sm text-gray-600">Pass Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search buttons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              aria-label="Filter buttons"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Buttons</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>

        {/* Failed Buttons (Priority) */}
        {report.failedButtons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Failed Buttons - Fix Immediately
            </h2>
            <div className="space-y-3">
              {report.failedButtons.map((failed: any) => (
                <div key={failed.buttonId} className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-red-900">{failed.buttonInfo?.text}</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Component: {failed.buttonInfo?.component}
                      </p>
                      <p className="text-sm text-red-700">
                        Path: {failed.buttonInfo?.path}
                      </p>
                      <p className="text-sm text-red-700">
                        Action: {failed.buttonInfo?.action}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                      {failed.error}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Buttons Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Button</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Test</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredButtons.map((button) => {
                const testResult = testResults.find(r => r.buttonId === button.id);
                return (
                  <tr key={button.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{button.text}</div>
                      <div className="text-xs text-gray-500">{button.type}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{button.component}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{button.action}</td>
                    <td className="px-6 py-4">
                      {testResult ? (
                        testResult.success ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} />
                            Passed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={16} />
                            Failed
                          </span>
                        )
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <AlertCircle size={16} />
                          Not Tested
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {testResult ? new Date(testResult.timestamp).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
