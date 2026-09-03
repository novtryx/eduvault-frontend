'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { NavList } from './nav-list';
import { SchoolSwitcher } from './school-switcher';
import { primaryNav, secondaryNav, supportNav } from './nav-config';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-16 items-center px-4">
          <SchoolSwitcher />
        </div>
        <Separator />
        <div className="space-y-6 px-3 py-4">
          <NavList items={primaryNav} onNavigate={() => setOpen(false)} />
          <div>
            <Separator className="mb-4" />
            <NavList items={secondaryNav} onNavigate={() => setOpen(false)} />
          </div>
          <div>
            <Separator className="mb-4" />
            <NavList items={supportNav} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
