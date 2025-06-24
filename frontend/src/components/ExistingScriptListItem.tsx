import React, { useState } from 'react';

// G.O.A.T. C.O.D.E.X. B.O.T. - 'Elegant' and 'Xtensible' type definitions
export interface ScriptSummary {
  id: string;
  title: string;
  topic: string;
  created_at: string;
  // 'Clairvoyant' inclusion of optional engagement metrics
  published_video_id?: string;
  engagement_rate?: number;
  views?: number;
  likes?: number;
  comments?: number;
  engagement_retrieved_at?: string;
}

interface ExistingScriptListItemProps {
  script: ScriptSummary;
  onSelect: (script: ScriptSummary) => void;
  onEngagementRecorded: (updatedScript: ScriptSummary) => void; // 'Altruistic' callback to notify parent of updates
}

// G.O.A.T. C.O.D.E.X. B.O.T. - 'Durable' and 'Optimized' component implementation
const ExistingScriptListItem: React.FC<ExistingScriptListItemProps> = ({ script, onSelect, onEngagementRecorded }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent onSelect from firing on form submission
    setIsLoading(true);
    setError(null);

    // 'Tactical' API call to the backend
    try {
      const response = await fetch(`/api/v1/scripts/${script.id}/record-engagement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to record engagement');
      }

      // 'Optimized' success path
      setVideoUrl('');
      onEngagementRecorded(result.data); // Trigger data refresh in the parent component
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record engagement');
    } finally {
      setIsLoading(false);
    }
  };

  // 'Elegant' conditional rendering logic
  return (
    <li 
      key={script.id} 
      onClick={() => onSelect(script)} 
      className="p-4 bg-gray-800 rounded-lg mb-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200 shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-indigo-400">{script.title}</h3>
          <p className="text-gray-400 text-sm">Topic: {script.topic}</p>
          <p className="text-gray-500 text-xs mt-1">Created: {new Date(script.created_at).toLocaleString()}</p>
        </div>
        
        {/* 'Clairvoyant' display of engagement data or input form */}
        <div className="w-1/2 pl-4">
          {script.engagement_rate !== null && script.engagement_rate !== undefined ? (
            <div className='text-right'>
              <h4 className='text-lg font-semibold text-green-400'>Engagement Rate: {script.engagement_rate.toFixed(2)}%</h4>
              <p className='text-sm text-gray-300'>Views: {script.views?.toLocaleString()}</p>
              <p className='text-sm text-gray-300'>Likes: {script.likes?.toLocaleString()}</p>
              <p className='text-sm text-gray-300'>Comments: {script.comments?.toLocaleString()}</p>
              <p className='text-xs text-gray-500 mt-1'>Last updated: {script.engagement_retrieved_at ? new Date(script.engagement_retrieved_at).toLocaleString() : 'N/A'}</p>
            </div>
          ) : (
            <form onSubmit={handleRecordEngagement} onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col items-end">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube Video URL"
                  className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-500 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Recording...' : 'Record Engagement'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-right">{error}</p>}
              </div>
            </form>
          )}
        </div>
      </div>
    </li>
  );
};

export default ExistingScriptListItem;
