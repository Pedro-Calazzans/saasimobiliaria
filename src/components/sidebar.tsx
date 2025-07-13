'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/imoveis', label: 'Imóveis' },
  { href: '/leads', label: 'Leads' },
  { href: '/kanban', label: 'Funil de Vendas' },
  { href: '/visitas', label: 'Visitas' },
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
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`block p-4 text-gray-700 hover:bg-gray-200 ${pathname === href ? 'bg-gray-300' : ''}`}>
                  {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;