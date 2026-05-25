'use client';

/**
 * useWorkoutEffects — Effect Layer for the Workout Domain
 *
 * Subscribes to the workout event bus and executes all UI side-effects:
 * audio, vibration, toast notifications.
 *
 * Mount once at the top of WorkoutContent (or any workout-scoped component).
 * Components must NOT call toast/audio/vibrate directly for workout events.
 */

import { useEffect, useRef } from 'react';
import { subscribe, type WorkoutEvent } from '@/lib/workout/events';
import { isReplayMode } from '@/lib/workout/eventLog';
import { useToast } from '@/components/Toast';

const AUDIO_URL = 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3';

export function useWorkoutEffects(): void {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(AUDIO_URL);
    return () => { audioRef.current = null; };
  }, []);

  useEffect(() => {
    return subscribe((event: WorkoutEvent) => {
      if (isReplayMode()) return; // Silent during replay — no audio / vibration / toast
      switch (event.type) {
        case 'REST_COMPLETED':
          audioRef.current?.play().catch(() => {});
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          toast({ message: '休息结束，开始下一组！', type: 'success', duration: 2500 });
          break;

        case 'REST_SKIPPED':
          toast({ message: '已跳过休息', type: 'info', duration: 1500 });
          break;

        case 'REST_STARTED':
          // Future: subtle haptic on rest start
          break;

        case 'SET_COMPLETED':
          // Future: subtle haptic + save animation trigger
          break;

        default:
          break;
      }
    });
  }, [toast]);
}
