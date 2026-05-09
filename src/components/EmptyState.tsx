import Link from "next/link";

type Props = {
  icon?: string;
  title: string;
  description?: string;
  cta?: { href: string; label: string };
  secondary?: { href: string; label: string };
};

export function EmptyState({ icon = "🌱", title, description, cta, secondary }: Props) {
  return (
    <div className="card p-10 text-center">
      <div className="text-5xl">{icon}</div>
      <div className="mt-3 text-base font-bold text-ink-900 dark:text-ink-100">
        {title}
      </div>
      {description && (
        <div className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</div>
      )}
      {(cta || secondary) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {cta && (
            <Link href={cta.href} className="btn-primary">
              {cta.label}
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className="btn-outline">
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
