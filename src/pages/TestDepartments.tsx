// src/pages/TestDepartments.tsx
import React, { useState, useEffect } from 'react';
import { academicService } from '../services/academic.service';

export const TestDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log('🔍 Test: Fetching departments...');
        const response = await academicService.getDepartments();
        console.log('📦 Test: Full Response:', JSON.stringify(response, null, 2));
        
        // Store raw response for display
        setRawResponse(response);
        
        if (response && response.data) {
          setDepartments(response.data);
        } else {
          setError('No departments found or invalid response');
        }
      } catch (err: any) {
        console.error('❌ Test: Error:', err);
        setError(err.message || 'Failed to fetch departments');
        setRawResponse(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Testing Departments API</h2>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-navy border-t-cyan rounded-full animate-spin" />
          <span>Loading departments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Testing Departments API</h2>
      
      {/* Raw Response */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">📡 Raw Response from API:</h3>
        <div className="bg-slate-900 text-white rounded-lg p-4 overflow-auto max-h-60 font-mono text-sm">
          <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
        </div>
      </div>

      {/* Error if any */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700">
          <p className="font-semibold">❌ Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Departments Table */}
      {departments && departments.length > 0 ? (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-green-700">
            ✅ Success! Found {departments.length} departments
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">ID</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Code</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{dept.id?.substring(0, 8) || 'N/A'}...</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{dept.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{dept.code || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {dept.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Total:</span> {departments.length} departments loaded
            </p>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
          <p className="font-semibold">⚠️ No departments found</p>
          <p className="text-sm mt-1">The API returned a response but no departments data was found.</p>
        </div>
      )}
    </div>
  );
};

export default TestDepartments;