import React from 'react';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';

export const UploadDocumentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ResponsiveCard className="p-8 max-w-lg text-center">
        <ResponsiveText variant="h3" weight="semibold" className="mb-4">
          Upload Document
        </ResponsiveText>
        <ResponsiveText color="muted" className="mb-6">
          Document upload form not implemented yet.
        </ResponsiveText>
      </ResponsiveCard>
    </div>
  );
};
