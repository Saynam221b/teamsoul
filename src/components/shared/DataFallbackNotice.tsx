interface DataFallbackNoticeProps {
  messages: string[];
  className?: string;
}

export default function DataFallbackNotice({
  messages,
  className = "",
}: DataFallbackNoticeProps) {
  const uniqueMessages = Array.from(new Set(messages.filter(Boolean)));
  if (!uniqueMessages.length) return null;

  return (
    <div
      className={`archive-panel public-card rounded-[18px] border border-amber-400/15 bg-amber-300/8 px-4 py-3 md:rounded-[20px] md:px-5 md:py-4 ${className}`.trim()}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-amber-100/72">
        Data source fallback
      </p>
      <div className="mt-2 space-y-1.5">
        {uniqueMessages.map((message) => (
          <p key={message} className="text-xs leading-6 text-amber-50/88 md:text-sm">
            {message}
          </p>
        ))}
      </div>
    </div>
  );
}
