import React from 'react';

interface TopicInputSectionProps {
  topic: string;
  onTopicChange: (value: string) => void;
  isLoading: boolean;
}

const TopicInputSection: React.FC<TopicInputSectionProps> = ({ topic, onTopicChange, isLoading }) => {
  return (
    <section id="generate-script-section" className="mb-8 w-full max-w-2xl scroll-mt-24">
      <label htmlFor="topicInput" className="block text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">
        Enter Your Video Topic:
      </label>
      <textarea
        id="topicInput"
        value={topic}
        onChange={(e) => onTopicChange(e.target.value)}
        placeholder="e.g., 'Future of Artificial Intelligence'"
        rows={3}
        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:text-slate-50 transition-colors duration-150 resize-y"
        disabled={isLoading}
      />
    </section>
  );
};

export default TopicInputSection;
