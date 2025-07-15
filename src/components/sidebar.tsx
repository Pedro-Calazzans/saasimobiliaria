'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  Users,
  KanbanSquare,
  Calendar,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/imoveis', label: 'Imóveis', icon: Home },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/kanban', label: 'Funil de Vendas', icon: KanbanSquare },
  { href: '/visitas', label: 'Visitas', icon: Calendar },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Imobi SaaS</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 p-4 text-gray-700 hover:bg-gray-100 transition-colors ${
                  pathname === href
                    ? 'bg-gray-200 font-semibold text-gray-900'
                    : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
