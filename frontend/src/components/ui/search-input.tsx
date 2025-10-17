import { Input } from "@/components/ui/input";
import { IconSearch } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onUpdate: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function SearchInput({ 
  value, 
  onUpdate, 
  className,
  placeholder = "Search..." 
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
