// src/pages/Admin/SentEmails.tsx
import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Eye, X, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { useToast } from '../../hooks/useToast';
import apiClient from '../../services/api';
import type { ApiResponse } from '../../types';

interface EmailRecord {
  id: string;
  to_email: string;
  subject: string;
  body_html: string;
  status: string;
  sent_at?: string;
  created_at: string;
}

export const SentEmails: React.FC = () => {
  const { showToast } = useToast();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<ApiResponse<EmailRecord[]>>('/admin/emails');
      if (response.success && response.data) {
        setEmails(response.data);
      }
    } catch (error: any) {
      showToast('error', 'Failed to Load', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filtered = emails.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return e.to_email.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q);
  });

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sent Emails</h1>
          <p className="text-slate-500 mt-1 text-sm">
            All emails sent from the system — enrollment credentials, notifications, and more.
          </p>
        </div>
        <Button onClick={fetchEmails} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or subject..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-cyan/10 focus:border-cyan focus:bg-white transition-all"
          />
        </div>
      </Card>

      {/* List */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No emails yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Emails sent by the system will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((email) => (
              <li
                key={email.id}
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {email.subject}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          To: <span className="font-medium">{email.to_email}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-slate-400">
                          {formatDate(email.created_at)}
                        </span>
                        <Eye className="w-4 h-4 text-slate-300 group-hover:text-cyan transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {selectedEmail.subject}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  To: {selectedEmail.to_email} · {formatDate(selectedEmail.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email content */}
            <div className="flex-1 overflow-auto bg-slate-100 p-6">
              <div
                className="bg-white rounded-xl shadow-sm"
                dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentEmails;