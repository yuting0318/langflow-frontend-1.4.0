import SideBarButtonsComponent from "@/components/core/sidebarComponent";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  ENABLE_DATASTAX_LANGFLOW,
  ENABLE_PROFILE_ICONS,
} from "@/customization/feature-flags";
import useAuthStore from "@/stores/authStore";
import { useStoreStore } from "@/stores/storeStore";
import { Outlet } from "react-router-dom";
import ForwardedIconComponent from "../../components/common/genericIconComponent";
import PageLayout from "../../components/common/pageLayout";

export default function SettingsPage(): JSX.Element {
  const autoLogin = useAuthStore((state) => state.autoLogin);
  const hasStore = useStoreStore((state) => state.hasStore);

  // Hides the General settings if there is nothing to show
  const showGeneralSettings = ENABLE_PROFILE_ICONS || hasStore || !autoLogin;

  const sidebarNavItems: {
    href?: string;
    title: string;
    icon: React.ReactNode;
  }[] = [];

  if (showGeneralSettings) {
    sidebarNavItems.push({
      title: "General",
      href: "/admin/general",
      icon: (
        <ForwardedIconComponent
          name="SlidersHorizontal"
          className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
        />
      ),
    });
  }

  sidebarNavItems.push(
    {
      title: "Global Variables",
      href: "/admin/global-variables",
      icon: (
        <ForwardedIconComponent
          name="Globe"
          className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
        />
      ),
    },
    {
      title: "Manage Accounts",
      href: "/admin/manage-accounts",
      icon: (
        <ForwardedIconComponent
          name="UserCog2"
          className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
        />
      ),
    },
    {
      title: "Shortcuts",
      href: "/admin/shortcuts",
      icon: (
        <ForwardedIconComponent
          name="Keyboard"
          className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
        />
      ),
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: (
        <ForwardedIconComponent
          name="MessagesSquare"
          className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
        />
      ),
    },
  );

  if (!ENABLE_DATASTAX_LANGFLOW) {
    const langflowItems = [
      {
        title: "Langflow API Keys",
        href: "/admin/api-keys",
        icon: (
          <ForwardedIconComponent
            name="Key"
            className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
          />
        ),
      },
      {
        title: "Langflow Store",
        href: "/admin/store",
        icon: (
          <ForwardedIconComponent
            name="Store"
            className="w-4 flex-shrink-0 justify-start stroke-[1.5]"
          />
        ),
      },
    ];

    sidebarNavItems.splice(2, 0, ...langflowItems);
  }

  return (
    <PageLayout
      backTo={"/"}
      title="Settings"
      description="Manage the general settings for Langflow."
    >
      <SidebarProvider width="15rem" defaultOpen={false}>
        <SideBarButtonsComponent items={sidebarNavItems} />
        <main className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-x-hidden pt-1">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </PageLayout>
  );
}
