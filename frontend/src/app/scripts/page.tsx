// frontend/src/app/scripts/page.tsx
'use client';

import React from 'react';
import ScriptWorkflowOrchestrator from '@/components/ScriptWorkflowOrchestrator'; // Assuming components are aliased to @/components

const ScriptsPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4 md:px-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-sky-400 mb-8 text-center">
          AI Script Studio
        </h1>
        <ScriptWorkflowOrchestrator />
      </div>
    </main>
  );
};

export default ScriptsPage;
