// src/pages/Enrollment/ApplicationStatus.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Mail,
  Loader2,
} from 'lucide-react';
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

  // ============================================
  // PRE-FILL EMAIL FROM PREVIOUS SESSION
  // ============================================
  useEffect(() => {
    // Auto-fill email if user previously submitted an application
    const savedEmail = localStorage.getItem('enrollment_email');
    const lastApplicationNumber = localStorage.getItem('last_application_number');

    if (savedEmail) {
      setEmail(savedEmail);
    }

    // If user has a recent application, auto-search
    if (savedEmail && lastApplicationNumber) {
      const autoSearch = async () => {
        setIsLoading(true);
        setHasSearched(true);
        try {
          const response = await enrollmentService.checkApplicationStatus(savedEmail);
          if (response.success && response.data) {
            setApplications(response.data);
          }
        } catch {
          // Silent fail — user can search manually
        } finally {
          setIsLoading(false);
        }
      };
      autoSearch();
    }
  }, []);

  // ============================================
  // CHECK STATUS
  // ============================================
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
        // Save email for next visit
        localStorage.setItem('enrollment_email', email);

        if (response.data.length === 0) {
          showToast(
            'info',
            'No Applications Found',
            'No applications found for this email address.'
          );
        }
      }
    } catch (error: any) {
      showToast('error', 'Failed to Check Status', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // STATUS CONFIG
  // ============================================
  const getStatusConfig = (status: string) => {
    const configs: Record<
      string,
      { badge: string; icon: React.ElementType; iconColor: string; label: string }
    > = {
      submitted: {
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Clock,
        iconColor: 'text-blue-600',
        label: 'Submitted',
      },
      under_review: {
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock,
        iconColor: 'text-amber-600',
        label: 'Under Review',
      },
      needs_correction: {
        badge: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertTriangle,
        iconColor: 'text-orange-600',
        label: 'Needs Correction',
      },
      approved: {
        badge: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle2,
        iconColor: 'text-green-600',
        label: 'Approved',
      },
      rejected: {
        badge: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600',
        label: 'Rejected',
      },
    };

    return (
      configs[status] || {
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: FileText,
        iconColor: 'text-slate-500',
        label: status.replace('_', ' '),
      }
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/enrollment')}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy transition-colors group mb-4"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Enrollment
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Check Application Status</h1>
              <p className="text-slate-500 mt-1">
                Track your enrollment application progress.
              </p>
            </div>
            <Button
              onClick={() => navigate('/enrollment')}
              variant="outline"
              size="sm"
              className="border-slate-200"
            >
              <FileText className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* ============================================ */}
        {/* SEARCH CARD */}
        {/* ============================================ */}
        <Card className="p-8 shadow-xl shadow-slate-200/50 border-slate-200/60 rounded-2xl">
          <form onSubmit={checkStatus} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span className="text-error">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  variant="primary"
                  className="bg-gradient-to-r from-navy to-navy-dark hover:from-navy-dark hover:to-navy px-6"
                >
                  {!isLoading && <Search className="w-4 h-4 mr-2" />}
                  Check Status
                </Button>
              </div>
            </div>
          </form>

          {/* ============================================ */}
          {/* RESULTS */}
          {/* ============================================ */}
          {hasSearched && (
            <div className="mt-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-10 h-10 text-cyan animate-spin" />
                  <p className="text-sm text-slate-500">Checking your application...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-700">
                    No applications found
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    No applications found for this email address.
                  </p>
                  <p className="text-xs text-slate-400 mt-3">
                    Please check the email or{' '}
                    <button
                      onClick={() => navigate('/enrollment')}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline underline-offset-2"
                    >
                      submit a new application
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Found {applications.length} application{applications.length !== 1 ? 's' : ''}
                  </p>

                  {applications.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={app.id}
                        className="p-5 border-2 border-slate-200 rounded-xl bg-gradient-to-br from-white to-slate-50/50 hover:border-cyan/40 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0 ${statusConfig.iconColor}`}>
                              <StatusIcon className="w-6 h-6" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 text-base">
                                {app.firstName} {app.lastName}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                <p className="text-slate-500">
                                  <span className="font-medium text-slate-600">App #:</span>{' '}
                                  <span className="font-mono text-slate-700">
                                    {app.applicationNumber}
                                  </span>
                                </p>
                                <p className="text-slate-500">
                                  <span className="font-medium text-slate-600">Submitted:</span>{' '}
                                  {new Date(app.submittedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                                {app.enrollmentType && (
                                  <p className="text-slate-500 sm:col-span-2">
                                    <span className="font-medium text-slate-600">Type:</span>{' '}
                                    <span className="capitalize">{app.enrollmentType}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border flex-shrink-0 ${statusConfig.badge}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label.toUpperCase()}
                          </span>
                        </div>

                        {/* Status message */}
                        {app.status === 'approved' && (
                          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <p className="text-xs text-green-800">
                              🎉 Congratulations! Your enrollment has been approved. Check your
                              email for login credentials.
                            </p>
                          </div>
                        )}
                        {app.status === 'needs_correction' && (
                          <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
                            <p className="text-xs text-orange-800">
                              ⚠️ Your application needs correction. Please check your email for
                              details.
                            </p>
                          </div>
                        )}
                        {app.status === 'rejected' && (
                          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <p className="text-xs text-red-800">
                              Your application was not approved. Contact the admissions office for
                              more information.
                            </p>
                          </div>
                        )}
                        {app.status === 'under_review' && (
                          <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                            <p className="text-xs text-amber-800">
                              ⏳ Your application is currently under review. Please wait for
                              further updates.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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