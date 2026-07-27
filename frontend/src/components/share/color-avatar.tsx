import { generateColorFromString } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  className?: string;
}

export function ColorAvatar({ name, className }: Props) {
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const { bg, fg } = generateColorFromString(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold shrink-0 select-none",
        className,
      )}
      style={{ backgroundColor: bg, color: fg }}
    >
      {getInitials(name)}
    </div>
  );
}
