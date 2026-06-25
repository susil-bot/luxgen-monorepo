interface CheckoutStepsProps { current: 1 | 2 | 3; }
const STEPS = ['Cart', 'Pay', 'Confirm'] as const;
export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <ol className="flex items-center gap-2 mb-6 text-xs font-medium" aria-label="Checkout progress">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex items-center gap-2 flex-1">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${active || done ? 'text-white' : 'text-secondary'}`}
              style={{ backgroundColor: active || done ? 'var(--color-blue)' : 'var(--color-fill-tertiary)' }}>{step}</span>
            <span className={active ? 'text-primary' : 'text-secondary'}>{label}</span>
            {i < 2 && <span className="flex-1 h-px" style={{ backgroundColor: 'var(--color-separator)' }} />}
          </li>
        );
      })}
    </ol>
  );
}
