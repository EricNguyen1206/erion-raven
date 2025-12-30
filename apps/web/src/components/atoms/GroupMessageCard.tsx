import { ConversationDto } from '@raven/types';
import { Hash } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type GroupMessageCardProps = {
  convo: ConversationDto;
  isActive: boolean;
};

const GroupMessageCard = ({ convo, isActive }: GroupMessageCardProps) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        tooltip={convo.name}
        className={cn(
          "h-9 rounded-lg transition-all duration-200 hover:bg-sidebar-accent/5",
          isActive && "bg-sidebar-accent/10 hover:bg-sidebar-accent/10"
        )}
      >
        <Link to={`/messages/${convo.id}`} className="flex items-center gap-3">
          <Hash className="w-[16px] h-[16px] opacity-50" />
          <span className="text-sm font-light">{convo.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default GroupMessageCard;
