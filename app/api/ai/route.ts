import { NextResponse } from 'next/server';
import { processAIRequest } from '@/lib/ai-agent';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('AI API route called');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { message, context } = body;

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing message:', message);
    const response = await processAIRequest(message, context);
    console.log('AI response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        details: error instanceof Error ? error.message : 'Unknown error',
        explanation: 'Sorry, I encountered an error. The system is working but could not process your request.',
        actions: []
      },
      { status: 500 }
    );
  }
}
