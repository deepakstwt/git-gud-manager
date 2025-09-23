'use client';

import { useEffect, useState } from 'react';
import { getMeetings } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface Meeting {
  id: string;
  name: string;
  audioUrl: string;
  transcription: string | null;
  summary: string | null;
  createdAt: string;
}

interface MeetingListProps {
  projectId: string;
}

export function MeetingList({ projectId }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!projectId) {
      setError('No project selected');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    async function loadMeetings() {
      try {
        const result = await getMeetings(projectId);
        if (result.success && result.meetings) {
          setMeetings(
            result.meetings.map(meeting => ({
              ...meeting,
              createdAt: new Date(meeting.createdAt).toISOString()
            }))
          );
          setError(null);
        } else {
          throw new Error(result.error || 'Failed to load meetings');
        }
      } catch (err) {
        console.error('Error loading meetings:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load meetings. Please try again.'
        );
        // Retry up to 3 times with increasing delay
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, Math.pow(2, retryCount) * 1000); // Exponential backoff
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadMeetings();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full h-32 bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-4">
        <div className="text-center space-y-4">
          <div className="text-destructive">{error}</div>
          {retryCount < 3 && (
            <div className="text-sm text-muted-foreground">
              Retrying... Attempt {retryCount + 1} of 3
            </div>
          )}
          {retryCount >= 3 && (
            <button
              onClick={() => {
                setRetryCount(0);
                setError(null);
              }}
              className="text-sm text-primary hover:underline"
            >
              Try Again
            </button>
          )}
        </div>
      </Card>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-4">
        No meetings found. Upload an audio file to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="rag-gradient-card">
          <CardHeader>
            <CardTitle>{meeting.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Added {formatDistanceToNow(new Date(meeting.createdAt))} ago
              </div>
              {meeting.summary && (
                <div className="text-sm mt-2">
                  <strong>Summary:</strong> {meeting.summary}
                </div>
              )}
              {!meeting.transcription && !meeting.summary && (
                <div className="text-sm text-muted-foreground">
                  Processing... Check back soon for transcription and summary.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
