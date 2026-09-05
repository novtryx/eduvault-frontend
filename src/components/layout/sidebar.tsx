import { Separator } from '@/components/ui/separator';
import { NavList } from './nav-list';
import { SchoolSwitcher } from './school-switcher';
import { primaryNav, secondaryNav, supportNav } from './nav-config';

export function Sidebar() {
  return (
    // sticky + top-0 pins the sidebar to the viewport as the PAGE
    // scrolls — h-screen alone doesn't do this, since the sidebar is a
    // flex sibling of `main`: once main's content is taller than the
    // viewport, the shared flex row grows to match it and the sidebar
    // (a normal-flow item in that row) grows and scrolls right along
    // with it. `sticky` takes the sidebar out of that shared-height
    // problem entirely by anchoring it to the viewport instead.
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-16 shrink-0 items-center px-4">
        <SchoolSwitcher />
      </div>
      <Separator className="shrink-0" />
      {/* Only this middle section scrolls if the nav list genuinely
          exceeds viewport height (e.g. a short laptop screen, browser
          zoom, or a school switcher that wraps to two lines) — the
          header and Help & Support stay pinned in place rather than
          the whole sidebar (including the school switcher) scrolling
          as one block. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          <NavList items={primaryNav} />
          <div>
            <Separator className="mb-4" />
            <NavList items={secondaryNav} />
          </div>
        </div>
      </div>
      <div className="shrink-0 px-3 py-4">
        <Separator className="mb-4" />
        <NavList items={supportNav} />
      </div>
    </aside>
  );
}