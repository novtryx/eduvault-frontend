import { Separator } from '@/components/ui/separator';
import { NavList } from './nav-list';
import { SchoolSwitcher } from './school-switcher';
import { primaryNav, secondaryNav, supportNav } from './nav-config';

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-4">
        <SchoolSwitcher />
      </div>
      <Separator />
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          <NavList items={primaryNav} />
          <div>
            <Separator className="mb-4" />
            <NavList items={secondaryNav} />
          </div>
        </div>
        <div>
          <Separator className="mb-4" />
          <NavList items={supportNav} />
        </div>
      </div>
    </aside>
  );
}
