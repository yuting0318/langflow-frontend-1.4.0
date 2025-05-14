import AlertDropdown from "@/alerts/alertDropDown";
// @ts-ignore
import DataStaxLogo from "@/assets/DataStaxLogo.svg?react";
// @ts-ignore
import Logo from "@/assets/Logo.svg?react";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomOrgSelector } from "@/customization/components/custom-org-selector";
import { CustomProductSelector } from "@/customization/components/custom-product-selector";
import { ENABLE_DATASTAX_LANGFLOW ,ENABLE_DARK_MODE,} from "@/customization/feature-flags";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useTheme from "@/customization/hooks/use-custom-theme";
import { useResetDismissUpdateAll } from "@/hooks/use-reset-dismiss-update-all";
import useAlertStore from "@/stores/alertStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useFolderStore } from "@/stores/foldersStore";
import { useEffect, useRef, useState } from "react";
import { AccountMenu } from "./components/AccountMenu";
import FlowMenu from "./components/FlowMenu";
import LangflowCounts from "./components/langflow-counts";
import { useDarkStore } from "@/stores/darkStore";
import IconComponent from "@/components/common/genericIconComponent";
import {useLogout} from "@queries/auth";
import useAuthStore from "@/stores/authStore";

export default function AppHeader(): JSX.Element {
  const dark = useDarkStore((state) => state.dark);
  const setDark = useDarkStore((state) => state.setDark);
  const notificationCenter = useAlertStore((state) => state.notificationCenter);
  const notificationList = useAlertStore((state) => state.notificationList);
  const navigate = useCustomNavigate();
  const [activeState, setActiveState] = useState<"notifications" | null>(null);
  const lastPath = window.location.pathname.split("/").filter(Boolean).pop();
  const notificationRef = useRef<HTMLButtonElement | null>(null);
  const notificationContentRef = useRef<HTMLDivElement | null>(null);
  useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isNotificationButton = notificationRef.current?.contains(target);
      const isNotificationContent =
        notificationContentRef.current?.contains(target);

      if (!isNotificationButton && !isNotificationContent) {
        setActiveState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useResetDismissUpdateAll();

  const getNotificationBadge = () => {
    const baseClasses = "absolute h-1 w-1 rounded-full bg-destructive";
    return notificationCenter
      ? `${baseClasses} right-[5.1rem] top-[5px]`
      : "hidden";
  };

  const { mutate: mutationLogout } = useLogout();

  const handleLogout = () => {
    mutationLogout();
  };
  const { isAdmin, autoLogin } = useAuthStore((state) => ({
    isAdmin: state.isAdmin,
    autoLogin: state.autoLogin,
  }));

  return (
    <div
      className={`flex h-[48px] w-full items-center justify-between border-b px-6 dark:bg-background`}
      data-testid="app-header"
    >
      {/* Left Section */}
      <div
        className={`z-30 flex items-center gap-2`}
        data-testid="header_left_section_wrapper"
      >
        <Button
          unstyled
          onClick={() => navigate("/")}
          className="mr-1 flex h-10 w-10 items-center"
          data-testid="icon-ChevronLeft"
        >
          {ENABLE_DATASTAX_LANGFLOW ? (
            <DataStaxLogo className="fill-black dark:fill-[white]" />
          ) : (
              <Logo className="h-10 w-10" />
          )}
        </Button>
      </div>

      {/* Middle Section */}
      <div className="w-full flex-1 truncate lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        <FlowMenu />
      </div>

      {/* Right Section */}
      <div
        className={`relative left-3 z-30 flex items-center gap-1`}
        data-testid="header_right_section_wrapper"
      >
        <AlertDropdown
          notificationRef={notificationContentRef}
          onClose={() => setActiveState(null)}
        >
            <AlertDropdown onClose={() => setActiveState(null)}>
              <Button
                ref={notificationRef}
                unstyled
                onClick={() =>
                  setActiveState((prev) =>
                    prev === "notifications" ? null : "notifications",
                  )
                }
                data-testid="notification_button"
              >
                <ShadTooltip
                    content="Notifications and errors"
                    side="bottom"
                    styleClasses=""
                >
                <div className="hit-area-hover group flex items-center gap-2 rounded-md p-2.5 px-3.5">
                  <span className={getNotificationBadge()} />
                  <ForwardedIconComponent
                      name="Bell"
                      className="side-bar-button-size h-[18px] w-[18px]"
                  />
                  <span className="hidden whitespace-nowrap text-[14px] 2xl:inline">Notifications</span>
                </div>
                </ShadTooltip>
              </Button>
            </AlertDropdown>
        </AlertDropdown>
        {ENABLE_DARK_MODE && (
            <ShadTooltip content="Dark Mode" side="bottom" styleClasses="z-999">
              <Button
                  className="extra-side-bar-save-disable  hover:bg-gray-100  rounded-lg px-2 py-1  dark:bg-background dark:hover:bg-zinc-700 text-black dark:text-white"
                  variant="ghost"
                  onClick={() => {
                    setDark(!dark);
                  }}
              >
                {dark ? (
                    <>
                      <IconComponent
                          name="SunIcon"
                          className="side-bar-button-size"
                      />
                      <span className="hidden whitespace-nowrap 2xl:inline">Dark Mode</span>
                    </>

                ) : (
                    <>
                      <IconComponent
                          name="MoonIcon"
                          className="side-bar-button-size"
                      />
                      <span className="hidden whitespace-nowrap 2xl:inline">Dark Mode</span>
                    </>
                )}

              </Button>
            </ShadTooltip>
        )}
        {isAdmin && !autoLogin && (
            <ShadTooltip content="Settings" side="bottom" styleClasses="z-999">
              <Button
                  data-testid="user-profile-settings"
                  variant="ghost"
                  className="flex text-sm font-medium"
                  onClick={() => navigate("/admin")}
              >
                <ForwardedIconComponent
                    name="Settings"
                    className="side-bar-button-size h-[18px] w-[18px]"
                />
                <span className="hidden whitespace-nowrap 2xl:inline">Settings</span>
              </Button>
            </ShadTooltip>
        )}
        <ShadTooltip content="Logout" side="bottom" styleClasses="z-999">
          <Button
              data-testid="user-profile-settings"
              variant="ghost"
              className="flex text-sm font-medium"
              onClick={handleLogout}
          >
            <ForwardedIconComponent
                name="LogOut"
                className="side-bar-button-size h-[18px] w-[18px]"
            />
            <span className="hidden whitespace-nowrap 2xl:inline">
              Logout
            </span>
          </Button>
        </ShadTooltip>

      </div>
    </div>
  );
}
