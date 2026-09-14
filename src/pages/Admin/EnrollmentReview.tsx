// src/pages/Admin/EnrollmentReview.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { useEnrollment } from '../../context/EnrollmentContext';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { enrollmentService } from '../../services/enrollment.service';
import type { EnrollmentApplicationWithDetails } from '../../types/enrollment';

// ============================================
// CREDENTIALS MODAL
// ============================================
const CredentialsModal: React.FC<{
  credentials: { email: string; studentNumber: string; password: string };
  onClose: () => void;
  onCopy: () => void;
}> = ({ credentials, onClose, onCopy }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-5 text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Enrollment Approved</h3>
        <p className="text-sm text-white/90 mt-1">Credentials sent to student's email</p>
      </div>

      <div className="p-6 space-y-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Student Number
          </p>
          <p className="text-2xl font-bold text-navy font-mono tracking-wider">
            {credentials.studentNumber}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">📧 Email</p>
            <p className="text-sm font-medium text-slate-900 break-all">
              {credentials.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">🔑 Password</p>
            <code className="inline-block bg-navy text-cyan-300 px-3 py-1.5 rounded-lg text-sm font-bold font-mono tracking-wider">
              {credentials.password}
            </code>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-xs text-amber-800">
          ⚠️ Save this information — you may need it if the student contacts you.
        </div>
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onCopy}
          className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
        >
          Copy
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-2.5 bg-gradient-to-r from-navy to-navy-dark text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Done
        </button>
      </div>
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export const EnrollmentReview: React.FC = () => {
  const navigate = useNavigate();
  const {
    applications,
    isLoading,
    fetchApplications,
    updateStatus,
    requestCorrection,
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
  } = useEnrollment();
  const { showToast } = useToast();
  const [selectedApp, setSelectedApp] = useState<EnrollmentApplicationWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [approvedCredentials, setApprovedCredentials] = useState<{
    email: string;
    studentNumber: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleViewSentEmails = () => {
    navigate('/admin/sent-emails');
  };

  // ============================================
  // APPROVE HANDLER
  // ============================================
  const handleApprove = async (id: string) => {
    setShowModal(false);

    const response = await enrollmentService.approveApplication(id);

    if (response.success && response.data) {
      setApprovedCredentials({
        email: response.data.email,
        studentNumber: response.data.studentNumber,
        password: response.data.password,
      });
      setShowCredentialsModal(true);
      showToast(
        'success',
        '✅ Enrollment Approved',
        `Student number: ${response.data.studentNumber}`
      );
      await fetchApplications();
    } else {
      showToast(
        'error',
        'Approval Failed',
        response.error?.message || 'Could not approve application.'
      );
    }
  };

  // ============================================
  // COPY CREDENTIALS
  // ============================================
  const handleCopyCredentials = () => {
    if (!approvedCredentials) return;
    navigator.clipboard.writeText(
      `Email: ${approvedCredentials.email}\nPassword: ${approvedCredentials.password}\nStudent Number: ${approvedCredentials.studentNumber}`
    );
    showToast('success', 'Copied', 'Credentials copied to clipboard');
  };

  // ============================================
  // OTHER HANDLERS
  // ============================================
  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus(id, status);
    setShowModal(false);
    setSelectedApp(null);
  };

  const handleRequestCorrection = async (id: string) => {
    if (!notes.trim()) {
      showToast('warning', 'Notes Required', 'Please provide correction notes.');
      return;
    }
    await requestCorrection(id, notes);
    setShowCorrectionModal(false);
    setNotes('');
    setSelectedApp(null);
  };

  const openReviewModal = (app: EnrollmentApplicationWithDetails) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const openCorrectionModal = (app: EnrollmentApplicationWithDetails) => {
    setSelectedApp(app);
    setShowCorrectionModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-600',
      submitted: 'bg-blue-100 text-blue-700',
      under_review: 'bg-amber-100 text-amber-700',
      needs_correction: 'bg-orange-100 text-orange-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-500',
    };
    return styles[status] || styles.draft;
  };

  const filteredApplications =
    filterStatus === 'all'
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  if (isLoading && applications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ============================================ */}
      {/* HEADER WITH BREADCRUMB + ACTIONS */}
      {/* ============================================ */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        <button
          onClick={handleBackToDashboard}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy transition-colors group w-fit"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>

        {/* Title + Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Enrollment Management</h1>
            <p className="text-slate-500 text-sm">
              Review and manage student enrollment applications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleViewSentEmails}
              variant="outline"
              className="flex items-center gap-2 border-slate-200"
            >
              <FileText className="w-4 h-4" />
              Sent Emails
            </Button>
            <Button
              onClick={() => fetchApplications()}
              variant="outline"
              className="flex items-center gap-2 border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Applications</p>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/50">
          <p className="text-sm text-amber-600">Pending Review</p>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
        </Card>
        <Card className="p-4 border-green-200 bg-green-50/50">
          <p className="text-sm text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-700">{approvedCount}</p>
        </Card>
        <Card className="p-4 border-red-200 bg-red-50/50">
          <p className="text-sm text-red-600">Rejected</p>
          <p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: totalCount, color: 'bg-navy' },
          { key: 'submitted', label: 'Submitted', color: 'bg-blue-600' },
          { key: 'under_review', label: 'Under Review', color: 'bg-amber-600' },
          { key: 'needs_correction', label: 'Needs Correction', color: 'bg-orange-600' },
          { key: 'approved', label: 'Approved', color: 'bg-green-600' },
          { key: 'rejected', label: 'Rejected', color: 'bg-red-600' },
        ].map((tab) => {
          const count =
            tab.key === 'all'
              ? totalCount
              : applications.filter((a) => a.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === tab.key
                  ? `${tab.color} text-white`
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-500">No applications found</p>
          <p className="text-sm text-slate-400 mt-1">
            Applications will appear here once students submit them.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Application #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {app.application_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {app.student?.first_name} {app.student?.last_name}
                      </div>
                      <div className="text-xs text-slate-400">{app.student?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">{app.section?.name}</div>
                      <div className="text-xs text-slate-400">{app.section?.code}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700">{app.courses?.length || 0} subjects</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          app.status
                        )}`}
                      >
                        {app.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openReviewModal(app)}
                          className="px-3 py-1 text-xs font-medium text-navy bg-navy/10 rounded-lg hover:bg-navy/20 transition-colors"
                        >
                          Review
                        </button>
                        {(app.status === 'submitted' || app.status === 'under_review') && (
                          <button
                            onClick={() => openCorrectionModal(app)}
                            className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            Request Correction
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* REVIEW MODAL */}
      {/* ============================================ */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Review Application #{selectedApp.application_number}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selectedApp.student?.first_name} {selectedApp.student?.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{selectedApp.student?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Section</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{selectedApp.section?.name}</p>
                  <p className="text-sm text-slate-500">{selectedApp.section?.code}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Actions</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(selectedApp.id, 'rejected')}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(false);
                      openCorrectionModal(selectedApp);
                    }}
                    variant="outline"
                    className="border-orange-400 text-orange-600 hover:bg-orange-50"
                  >
                    Request Correction
                  </Button>
                  <Button onClick={() => setShowModal(false)} variant="ghost">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CORRECTION MODAL */}
      {/* ============================================ */}
      {showCorrectionModal && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Request Correction</h3>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setNotes('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Provide notes to the student about what needs to be corrected.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter correction notes..."
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan transition-all resize-none h-32"
              />
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => handleRequestCorrection(selectedApp.id)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Send Correction Request
                </Button>
                <Button
                  onClick={() => {
                    setShowCorrectionModal(false);
                    setNotes('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CREDENTIALS MODAL */}
      {/* ============================================ */}
      {showCredentialsModal && approvedCredentials && (
        <CredentialsModal
          credentials={approvedCredentials}
          onCopy={handleCopyCredentials}
          onClose={() => {
            setShowCredentialsModal(false);
            setApprovedCredentials(null);
          }}
        />
      )}
    </div>
  );
};

export default EnrollmentReview;