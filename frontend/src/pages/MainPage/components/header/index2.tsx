import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DEFAULT_FOLDER,
  DEFAULT_FOLDER_DEPRECATED,
} from "@/constants/constants";
import { ENABLE_MCP } from "@/customization/feature-flags";
import { cn } from "@/utils/utils";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderComponentProps {
  flowType: "flows" | "components" | "mcp";
  setFlowType: (flowType: "flows" | "components" | "mcp") => void;
  view: "list" | "grid";
  setView: (view: "list" | "grid") => void;
  setNewProjectModal: (newProjectModal: boolean) => void;
  folderName?: string;
  setSearch: (search: string) => void;
  isEmptyFolder: boolean;
}

const HeaderComponent2 = ({
  folderName = "",
  flowType,
  setFlowType,
  view,
  setView,
  setNewProjectModal,
  setSearch,
  isEmptyFolder,
}: HeaderComponentProps) => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const isMCPEnabled = ENABLE_MCP;
  // Debounce the setSearch function from the parent
  const debouncedSetSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 1000),
    [setSearch],
  );

  useEffect(() => {
    debouncedSetSearch(debouncedSearch);

    return () => {
      debouncedSetSearch.cancel(); // Cleanup on unmount
    };
  }, [debouncedSearch, debouncedSetSearch]);

  // If current flowType is not available based on feature flag, switch to flows
  useEffect(() => {
    if (
      (flowType === "mcp" && !isMCPEnabled) ||
      (flowType === "components" && isMCPEnabled)
    ) {
      setFlowType("flows");
    }
  }, [flowType, isMCPEnabled, setFlowType]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedSearch(e.target.value);
  };

  // Determine which tabs to show based on feature flag
  const tabTypes = isMCPEnabled ? ["mcp", "flows"] : ["components", "flows"];

  return (
    <>
      {!isEmptyFolder && (
        <>
          {/* Search and filters */}
          {flowType !== "mcp" && (
              <div className="sticky top-0 bg-white z-10">
                <div className="flex justify-between pt-3 pb-1 px-2.5">
                  <div className="flex w-full xl:w-5/12"></div>
                  <ShadTooltip content="New Flow" side="bottom">
                    <Button
                        variant="default"
                        className="!px-3 md:!px-4 md:!pl-3.5"
                        onClick={() => setNewProjectModal(true)}
                        id="new-project-btn"
                        data-testid="new-project-btn"
                    >
                      <ForwardedIconComponent
                          name="Plus"
                          aria-hidden="true"
                          className="h-4 w-4"
                      />
                      <span className="hidden whitespace-nowrap font-semibold md:inline">
                        New Flow0123
                      </span>
                    </Button>
                  </ShadTooltip>
                </div>
              </div>
          )}
        </>
      )}
    </>
  );
};

export default HeaderComponent2;
