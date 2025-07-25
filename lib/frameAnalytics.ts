import * as frame from '@farcaster/frame-sdk';

export const trackFrameEvent = (eventName: string, properties: Record<string, any>) => {
  try {
    frame.sdk.actions.track(eventName, properties);
  } catch (error) {
    console.error('Failed to track frame event:', error);
  }
};

export const logFrameInteraction = (interactionType: string, puzzleId: string) => {
  trackFrameEvent('frame_interaction', {
    type: interactionType,
    puzzleId,
    timestamp: Date.now()
  });
};
