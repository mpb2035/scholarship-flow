import { LayoutDashboard, BarChart3, Shield, Bookmark, LayoutGrid, FolderKanban, MessageSquareWarning, Globe, Users, FileUp, Target, Footprints, ListTodo, CalendarDays, History, FileText, Plane, Clock, Wallet } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useUserRole } from '@/hooks/useUserRole';
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

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'In Process', url: '/in-process', icon: Clock },
  { title: 'Attachment Overseas', url: '/attachment-overseas', icon: Plane },
  { title: 'Pending Response', url: '/pending-response', icon: MessageSquareWarning },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'My Directory', url: '/directory', icon: Bookmark },
  { title: 'Project Workflow', url: '/project-workflow', icon: FolderKanban },
  { title: 'To Do', url: '/todo', icon: ListTodo },
  { title: 'Leave Planner', url: '/leave-planner', icon: CalendarDays },
  { title: 'Financial Plan', url: '/financial-plan', icon: Wallet },
  { title: 'Previous Meetings', url: '/previous-meetings', icon: History },
];

const manpowerBlueprintItems = [
  { title: 'GTCI Analysis', url: '/gtci', icon: Globe },
  { title: 'GTCI Strategic', url: '/gtci-strategic', icon: FileText },
  { title: 'GTCI Upload', url: '/gtci-upload', icon: FileUp },
  { title: 'Playground', url: '/playground', icon: LayoutGrid },
];

const runningItems = [
  { title: 'Triathlete Goal', url: '/triathlete-goal', icon: Target },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useUserRole();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar
      className={collapsed ? 'w-14' : 'w-56'}
      collapsible="icon"
    >
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider'}>
            <Users className="h-4 w-4" />
            Manpower Blueprint
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manpowerBlueprintItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : 'flex items-center gap-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider'}>
            <Footprints className="h-4 w-4" />
            Running
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {runningItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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