export interface Script {
  id: string;
  topic: string;
  generated_script: string;
  trends_used: string[];
  user_id: string | null;
  created_at: string;
  engagement_rate?: number;
  video_url?: string;
}
