export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  meeting_date: string;
  meeting_time: string | null;
  location: string | null;
  meeting_type: 'meeting' | 'event' | 'reminder' | 'deadline';
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface MeetingInput {
  title: string;
  description?: string;
  meeting_date: string;
  meeting_time?: string;
  location?: string;
  meeting_type?: 'meeting' | 'event' | 'reminder' | 'deadline';
  status?: 'scheduled' | 'completed' | 'cancelled';
}
