type Pt = { label: string; value: number };

export function BarChart({
  data,
  height = 140,
  color = "#f97316",
  formatValue,
}: {
  data: Pt[];
  height?: number;
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      <div
        className="flex items-end gap-1.5"
        style={{ height }}
      >
        {data.map((d) => {
          const h = (d.value / max) * (height - 24);
          return (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-[10px] font-semibold text-ink-700">
                {formatValue ? formatValue(d.value) : d.value}
              </div>
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: Math.max(2, h),
                  background: color,
                  opacity: 0.4 + (d.value / max) * 0.6,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 text-[10px] text-ink-500">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HBarChart({
  data,
  color = "#f97316",
  formatValue,
}: {
  data: Pt[];
  color?: string;
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <div className="w-20 truncate text-xs text-ink-700">{d.label}</div>
          <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-ink-100">
            <div
              className="h-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>
          <div className="w-12 text-right text-xs font-semibold text-ink-700">
            {formatValue ? formatValue(d.value) : d.value}
          </div>
        </div>
      ))}
    </div>
  );
}
