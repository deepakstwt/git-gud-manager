'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Upload } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createMeeting } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { uploadFile } from '@/lib/firebase';

interface MeetingCardProps {
  projectId: string;
}

export function MeetingCard({ projectId }: MeetingCardProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meetingName, setMeetingName] = useState('');
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('audio')) {
      setError('Please upload an audio file (MP3, WAV, etc.)');
      return;
    }

    if (!meetingName.trim()) {
      setError('Please enter a meeting name');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      setIsUploading(true);
      setError(null);
      
      const downloadURL = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Create meeting in database with PROCESSING status
      const result = await createMeeting({
        name: meetingName,
        audioUrl: downloadURL,
        projectId
      });

      if (result.success && result.meeting) {
        // Kick off async processing
        const processResponse = await fetch(`/api/process-meeting?meetingId=${result.meeting.id}`, {
          method: 'POST',
        });

        if (!processResponse.ok) {
          throw new Error('Failed to start meeting processing');
        }

        router.refresh();
      } else {
        throw new Error(result.error || 'Meeting creation failed');
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [meetingName, projectId, router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="meetingName" className="text-sm font-medium">
            Meeting Name
          </label>
          <Input
            id="meetingName"
            value={meetingName}
            onChange={(e) => setMeetingName(e.target.value)}
            placeholder="Enter meeting name"
            disabled={isUploading}
          />
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200 rag-gradient-card
            ${isDragActive ? 'border-primary' : 'border-border'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20">
                <CircularProgressbar
                  value={uploadProgress}
                  text={`${Math.round(uploadProgress)}%`}
                  styles={buildStyles({
                    pathColor: 'hsl(var(--primary))',
                    textColor: 'hsl(var(--primary))',
                    trailColor: 'hsl(var(--muted))',
                  })}
                />
              </div>
              <p className="text-sm text-muted-foreground">Uploading audio file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground text-center">
                  {isDragActive
                    ? 'Drop the audio file here...'
                    : 'Drag & drop an audio file here, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Supported formats: MP3, WAV, M4A (max 50MB)
                </p>
              </div>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive mt-4 text-center">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
