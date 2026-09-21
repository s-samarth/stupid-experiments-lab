import { Icon } from "@/components/site/Icon";
import { formatCount } from "@/lib/format";

type Props = { count: number; suffix?: string; className?: string };

/** Eye icon + number. The visible label keeps it readable for screen readers too. */
export function ReadCount({ count, suffix = "", className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Icon name="eye" size={14} />
      <span>
        {formatCount(count)}
        <span className="sr-only"> reads</span>
        {suffix}
      </span>
    </span>
  );
}
