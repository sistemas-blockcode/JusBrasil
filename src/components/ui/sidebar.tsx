'use client'
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  UserPlus, 
  Users, 
  User, 
  Activity, 
  LogOut 
} from 'lucide-react';

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarLink({ icon: Icon, label, href, active, onClick }: SidebarLinkProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors 
        ${active ? 'bg-white text-blue-500 shadow-md' : 'text-white hover:bg-blue-600'}`}
    >
      <Icon size={21} />
      <span className="sr-only">{label}</span>
    </button>
  );
}

const sidebarData = [
  { icon: Home, label: 'Visão Geral', href: '/dashboard' },
  { icon: UserPlus, label: 'Cadastro de Cliente', href: '/cadastro-cliente' },
  { icon: Users, label: 'Lista de Clientes', href: '/lista-clientes' },
  { icon: Activity, label: 'Logs e Status', href: '/logs-status' },
];

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const activeItem = sidebarData.findIndex((item) => item.href === pathname);
    if (activeItem !== -1) {
      setActiveIndex(activeItem);
    }
  }, [pathname]);

  const handleNavigation = (href: string, index: number) => {
    setActiveIndex(index);
    router.push(href);
  };

  return (
    <nav className="flex flex-col items-center bg-gradient-to-t from-blue-700 to-blue-500 w-20 min-h-screen py-4 rounded-br-2xl rounded-tr-2xl">
      
      <div className="flex flex-col items-center gap-1 flex-1">
        {sidebarData.map((link, index) => (
          <SidebarLink 
            key={link.label}
            icon={link.icon}
            label={link.label}
            href={link.href}
            active={index === activeIndex}
            onClick={() => handleNavigation(link.href, index)}
          />
        ))}
      </div>

      
      <div className="flex flex-col items-center gap-4">
        <SidebarLink icon={LogOut} label="Logout" href="/logout" />
      </div>
    </nav>
  );
}
