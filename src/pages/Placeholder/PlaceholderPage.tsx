// src/pages/Placeholder/PlaceholderPage.tsx
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-white border-2 border-cyan-200 flex items-center justify-center shadow-lg shadow-cyan-100/50">
          <Construction className="w-10 h-10 text-cyan-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-2 text-sm">
          This page is under development. Check back soon!
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;