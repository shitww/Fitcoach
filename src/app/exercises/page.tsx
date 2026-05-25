import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import ExercisesContent from './ExercisesContent';

export default function ExercisesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    }>
      <ExercisesContent />
    </Suspense>
  );
}
