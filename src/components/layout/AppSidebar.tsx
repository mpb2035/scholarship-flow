import { LayoutDashboard, BarChart3, Shield, Bookmark, LayoutGrid, FolderKanban, MessageSquareWarning, Globe, Users, FileUp, Target, Footprints, ListTodo, CalendarDays, History, FileText, Plane, Clock, Wallet, ChevronDown } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useUserRole } from '@/hooks/useUserRole';
import { useSidebarConfig } from '@/hooks/useSidebarConfig';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  LayoutDashboard, Clock, Plane, MessageSquareWarning, BarChart3,
  Bookmark, FolderKanban, ListTodo, CalendarDays, Wallet, History,
  Globe, FileText, FileUp, LayoutGrid, Target,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const { getGroupItems, loading, iconMap } = useSidebarConfig();
  const collapsed = state === 'collapsed';

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    main: true,
    manpower_blueprint: true,
    running: true,
  });

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const renderItems = (groupName: string) => {
    const items = getGroupItems(groupName);
    return items.map((item) => {
      const iconName = iconMap[item.item_path] || 'LayoutDashboard';
      const IconComp = ICON_COMPONENTS[iconName] || LayoutDashboard;
      return (
        <SidebarMenuItem key={item.item_path}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.item_path}
              end={item.item_path === '/'}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
              activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
            >
              <IconComp className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.item_title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  if (loading) return <Sidebar className={collapsed ? 'w-14' : 'w-56'} collapsible="icon"><SidebarContent /></Sidebar>;

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-56'} collapsible="icon">
      <SidebarContent className="pt-4">
        {/* Main Nav - Collapsible */}
        <Collapsible open={openGroups.main} onOpenChange={() => toggleGroup('main')}>
          <SidebarGroup>
            {!collapsed && (
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Main
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openGroups.main ? 'rotate-0' : '-rotate-90'}`} />
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems('main')}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Manpower Blueprint - Collapsible */}
        <Collapsible open={openGroups.manpower_blueprint} onOpenChange={() => toggleGroup('manpower_blueprint')}>
          <SidebarGroup>
            {!collapsed && (
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manpower Blueprint
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openGroups.manpower_blueprint ? 'rotate-0' : '-rotate-90'}`} />
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems('manpower_blueprint')}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Running - Collapsible */}
        <Collapsible open={openGroups.running} onOpenChange={() => toggleGroup('running')}>
          <SidebarGroup>
            {!collapsed && (
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                <span className="flex items-center gap-2">
                  <Footprints className="h-4 w-4" />
                  Running
                </span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openGroups.running ? 'rotate-0' : '-rotate-90'}`} />
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>{renderItems('running')}</SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <Shield className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>Admin</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
