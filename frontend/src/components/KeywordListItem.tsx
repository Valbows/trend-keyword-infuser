import React from 'react';
import { YouTubeKeywordItem } from './TrendSidebar'; // Assuming YouTubeKeywordItem is exported from TrendSidebar or a shared types file

interface KeywordListItemProps {
  keywordItem: YouTubeKeywordItem;
  isSelected: boolean;
  onKeywordClick: (keyword: string) => void;
}

const KeywordListItem: React.FC<KeywordListItemProps> = ({ keywordItem, isSelected, onKeywordClick }) => {
  return (
    <li
      role="button"
      tabIndex={0}
      onClick={() => onKeywordClick(keywordItem.keyword)}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); // Prevent scrolling on spacebar
          onKeywordClick(keywordItem.keyword);
        }
      }}
      className={`p-3 rounded-lg shadow-md transition-all duration-200 cursor-pointer 
        ${isSelected 
          ? 'bg-sky-600 ring-2 ring-sky-400 scale-105' 
          : 'bg-slate-700/50 hover:bg-slate-700'}`}
    >
      <h3 className="text-md text-sky-300 font-semibold">{keywordItem.keyword}</h3>
      <p className="text-xs text-slate-400">
        Engagement Score: <span className="font-medium text-sky-400">{keywordItem.engagement_score}</span>
      </p>
      <p className="text-xs text-slate-400">
        Source Videos: <span className="font-medium text-slate-300">{keywordItem.source_video_count}</span> | Timeframe: <span className="font-medium text-slate-300">{keywordItem.timeframe}</span>
      </p>
      {keywordItem.aiRelevance && (
        <div className="mt-1 pt-1 border-t border-slate-600/50">
          {typeof keywordItem.aiRelevance.score === 'number' && (
            <p className="text-xs text-slate-400">
              AI Relevance: <span className="font-semibold text-teal-400">{keywordItem.aiRelevance.score}/5</span>
            </p>
          )}
          {keywordItem.aiRelevance.justification && (
            <p className="text-xs text-slate-500 italic">
              &ldquo;{keywordItem.aiRelevance.justification}&rdquo;
            </p>
          )}
          {keywordItem.aiRelevance.error && (
            <p className="text-xs text-amber-400">
              AI Note: <span className="italic">{keywordItem.aiRelevance.error}</span>
            </p>
          )}
        </div>
      )}
    </li>
  );
};

export default KeywordListItem;
