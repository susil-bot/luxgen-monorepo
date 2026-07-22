import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'luxgen_onboarding_v1';

export interface OnboardingStep {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

const DEFAULT_STEPS: Omit<OnboardingStep, 'done'>[] = [
  { id: 'course', label: 'Add your first course', href: '/products/new' },
  { id: 'learner', label: 'Invite a learner', href: '/users' },
  { id: 'billing', label: 'Set up billing', href: '/settings/billing' },
];

interface StoredOnboarding {
  completed: string[];
  dismissed: boolean;
}

function loadState(): StoredOnboarding {
  if (typeof window === 'undefined') return { completed: [], dismissed: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [], dismissed: false };
    return JSON.parse(raw) as StoredOnboarding;
  } catch {
    return { completed: [], dismissed: false };
  }
}

function saveState(state: StoredOnboarding): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Step 1 of tenant onboarding wizard — checklist widget for dashboard */
export function OnboardingWizardStep1({ tenant }: { tenant: string }) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const state = loadState();
    setDismissed(state.dismissed);
    setSteps(
      DEFAULT_STEPS.map((s) => ({
        ...s,
        href: s.href.includes('?') ? s.href : `${s.href}?tenant=${encodeURIComponent(tenant)}`,
        done: state.completed.includes(s.id),
      })),
    );
  }, [tenant]);

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = steps.length > 0 && completedCount === steps.length;

  if (dismissed || allDone || steps.length === 0) return null;

  const markDone = (id: string) => {
    const state = loadState();
    if (!state.completed.includes(id)) {
      state.completed = [...state.completed, id];
      saveState(state);
    }
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: true } : s)));
  };

  const dismiss = () => {
    const state = loadState();
    state.dismissed = true;
    saveState(state);
    setDismissed(true);
  };

  return (
    <section className="ios-card p-6 mb-6" aria-labelledby="onboarding-title">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 id="onboarding-title" className="text-lg font-semibold text-primary">
            Get started
          </h2>
          <p className="text-sm text-secondary mt-1">
            Step 1 — Complete these setup tasks to activate your workspace ({completedCount}/{steps.length})
          </p>
        </div>
        <button type="button" className="text-xs text-tertiary hover:text-secondary" onClick={dismiss}>
          Dismiss
        </button>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? 'bg-green-500 text-white' : 'bg-[var(--color-fill-secondary)] text-secondary'
              }`}
            >
              {step.done ? '✓' : index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Link href={step.href} className="text-sm font-medium text-primary hover:underline">
                {step.label}
              </Link>
            </div>
            {!step.done && (
              <button type="button" className="ios-btn-secondary text-xs py-1 px-2" onClick={() => markDone(step.id)}>
                Mark done
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
