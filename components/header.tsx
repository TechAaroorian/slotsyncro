import Link from "next/link";
import { getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { SignIn, SignOut } from "@/components/auth-components";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";

// Shadcn UI Primitives
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";

export async function Header() {
  const session = await auth();
  const locale = await getLocale();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="w-full border-b border-border bg-background/80 text-foreground backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href={`/${locale}`} className="flex items-center space-x-2 group">
          <Logo className="w-7 h-7 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-black tracking-tight group-hover:text-primary transition-colors">
            SlotSyncro 🗓️
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono px-1.5 py-0"
          >
            v1.0
          </Badge>
        </Link>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          <ThemeToggle />

          {session?.user ? (
            <div className="flex items-center space-x-3 border-l border-border pl-3">
              {/* User Dropdown with Shadcn Avatar */}
              <DropdownMenu>
                {/* Fixed TS2322: Styled Trigger directly without asChild */}
                <DropdownMenuTrigger
                  className={buttonVariants({
                    variant: "ghost",
                    className:
                      "relative h-9 rounded-full px-2 gap-2 hover:bg-muted outline-none",
                  })}
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage
                      src={session.user.image || ""}
                      alt={session.user.name || "User Avatar"}
                    />
                    <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-xs font-semibold max-w-25 truncate">
                    {session.user.name}
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  {/* Fixed TS2322: Wrapped Link directly inside DropdownMenuItem */}
                  <DropdownMenuItem className="cursor-pointer">
                    <Link href={`/${locale}/dashboard`} className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="p-0 cursor-pointer">
                    <div className="w-full">
                      <SignOut />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </header>
  );
}
