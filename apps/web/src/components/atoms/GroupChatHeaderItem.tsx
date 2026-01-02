import { Users } from "lucide-react";

interface GroupChatHeaderProps {
  name: string;
  participantCount: number;
  onMemberCountClick: () => void;
}

export default function GroupChatHeader({
  name,
  participantCount,
  onMemberCountClick,
}: GroupChatHeaderProps) {
  return (
    <div>
      <h2 className="font-light text-base text-foreground tracking-wide">
        #{name}
      </h2>
      <button
        onClick={onMemberCountClick}
        className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-0.5 hover:text-muted-foreground transition-colors"
      >
        <Users className="w-3 h-3 opacity-50" />
        <span className="font-light hover:underline">
          {participantCount} members
        </span>
      </button>
    </div>
  );
}
