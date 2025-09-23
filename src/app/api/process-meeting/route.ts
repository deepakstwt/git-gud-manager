import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = session.userId;

    const url = new URL(request.url);
    const meetingId = url.searchParams.get('meetingId');
    if (!meetingId) {
      return new Response('Meeting ID is required', { status: 400 });
    }

    // Get meeting
    const meeting = await db.meeting.findFirst({
      where: {
        id: meetingId,
        userId,
      },
    });

    if (!meeting) {
      return new Response('Meeting not found', { status: 404 });
    }

    // Start asynchronous processing
    // TODO: Implement AssemblyAI integration
    // For now, just simulate processing by updating status after a delay
    setTimeout(async () => {
      try {
        await db.meeting.update({
          where: { id: meetingId },
          data: {
            status: 'COMPLETED',
            transcription: 'Sample transcription',
            summary: 'Sample summary',
          },
        });
      } catch (error) {
        console.error('Error updating meeting:', error);
        await db.meeting.update({
          where: { id: meetingId },
          data: {
            status: 'FAILED',
          },
        });
      }
    }, 5000);

    return new Response('Processing started', { status: 200 });
  } catch (error) {
    console.error('Error processing meeting:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
