
'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Boxes,
  Home,
  Settings,
  ShoppingCart,
  DollarSign,
  BarChart,
  Calendar,
  Users,
  Leaf,
  Lock,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { LiveClock } from '@/components/live-clock';
import { useEffect, useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/data';
import Loading from './loading';

const allNavItems = [
  { href: '/', label: 'Panel', icon: Home, adminOnly: false },
  { href: '/inventory', label: 'Inventario', icon: Boxes, adminOnly: false },
  { href: '/sales', label: 'Ventas', icon: DollarSign, adminOnly: false },
  { href: '/orders', label: 'Pedidos', icon: ShoppingCart, adminOnly: true },
  { href: '/stats', label: 'Estadísticas', icon: BarChart, adminOnly: true },
  { href: '/calendar', label: 'Calendario', icon: Calendar, adminOnly: false },
  { href: '/users', label: 'Usuarios', icon: Users, adminOnly: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
      setIsLoading(false);
    }
  }, [router]);

  const isAdmin = useMemo(() => currentUser?.role === 'Admin', [currentUser]);

  const navItems = useMemo(() => {
    if (!currentUser) return [];
    return allNavItems.filter(item => !item.adminOnly || isAdmin);
  }, [currentUser, isAdmin]);

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Panel';
    const activeItem = allNavItems.find(item => item.href !== '/' && path.startsWith(item.href));
    return activeItem ? activeItem.label : 'Panel';
  }

  if (isLoading || !currentUser) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-headline text-lg group-data-[collapsible=icon]:hidden">
                  El amigo
                </span>
              </Link>
            </SidebarHeader>
            <SidebarMenu>
              {allNavItems.map((item) => (
                (item.href !== '/users' || isAdmin) &&
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                    disabled={item.adminOnly && !isAdmin}
                  >
                    <Link 
                      href={item.adminOnly && !isAdmin ? '#' : item.href}
                      className={item.adminOnly && !isAdmin ? 'cursor-not-allowed' : ''}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      {item.adminOnly && !isAdmin && <Lock className="ml-auto h-4 w-4" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'} tooltip={{children: "Ajustes"}}>
                        <Link href="/settings">
                            <Settings/>
                            <span>Ajustes</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:h-16 sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
              <h1 className="text-lg font-semibold capitalize">
                {getPageTitle(pathname)}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <LiveClock />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
