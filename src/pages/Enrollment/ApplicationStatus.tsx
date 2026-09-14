import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { enrollmentService } from '../../services/enrollment.service';
import { useToast } from '../../hooks/useToast';

export const ApplicationStatus: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('warning', 'Email Required', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await enrollmentService.checkApplicationStatus(email);
      if (response.success && response.data) {
        setApplications(response.data);
        if (response.data.length === 0) {
          showToast('info', 'No Applications Found', 'No applications found for this email address.');
        }
      }
    } catch (error: any) {
      showToast('error', 'Failed to Check Status', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: 'bg-blue-100 text-blue-700',
      under_review: 'bg-amber-100 text-amber-700',
      needs_correction: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Check Application Status</h1>
            <p className="text-slate-500 mt-1">Track your enrollment application progress.</p>
          </div>
          <Button onClick={() => navigate('/enrollment')} variant="outline" size="sm">
            New Application
          </Button>
        </div>

        <Card className="p-8">
          <form onSubmit={checkStatus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-error">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan focus:border-cyan"
                />
                <Button type="submit" isLoading={isLoading} variant="primary">
                  Check Status
                </Button>
              </div>
            </div>
          </form>

          {hasSearched && (
            <div className="mt-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-navy border-t-cyan rounded-full animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No applications found for this email address.</p>
                  <p className="text-sm mt-1">Please check the email or submit a new application.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className="p-4 border border-slate-200 rounded-xl bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {app.firstName} {app.lastName}
                          </p>
                          <p className="text-sm text-slate-500">
                            Application #: {app.applicationNumber}
                          </p>
                          <p className="text-sm text-slate-500">
                            Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ApplicationStatus;