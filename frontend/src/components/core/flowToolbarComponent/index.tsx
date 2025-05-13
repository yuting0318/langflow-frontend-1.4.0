import ShadTooltip from "@/components/common/shadTooltipComponent";
import { track } from "@/customization/utils/analytics";
import { Panel } from "@xyflow/react";
import { memo, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ShareModal from "../../../modals/shareModal";
import useFlowStore from "../../../stores/flowStore";
import { useShortcutsStore } from "../../../stores/shortcuts";
import { useStoreStore } from "../../../stores/storeStore";
import { classNames, cn, isThereModal } from "../../../utils/utils";
import ForwardedIconComponent from "../../common/genericIconComponent";
import FlowToolbarOptions from "./components/flow-toolbar-options";
import { Separator } from "@radix-ui/react-separator";
import {BuildStatus} from "@/constants/enums";
import {useBuildStatus} from "@/CustomNodes/GenericNode/hooks/use-get-build-status";
import {APIClassType} from "@/types/api";
import { NodeDataType } from "@/types/flow";
import {findLastNode} from "@/utils/reactflowUtils";

function IconComponent(props: { name: string; className: string }) {
  return null;
}

const FlowToolbar = memo(function FlowToolbar(
    {
      data
    }:{
      data: NodeDataType,
    }
): JSX.Element {
  const preventDefault = true;
  const [open, setOpen] = useState<boolean>(false);
  const [openCodeModal, setOpenCodeModal] = useState<boolean>(false);
  const [openShareModal, setOpenShareModal] = useState<boolean>(false);
  function handleAPIWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !openCodeModal) return;
    setOpenCodeModal((oldOpen) => !oldOpen);
  }

  function handleChatWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !open) return;
    if (useFlowStore.getState().hasIO) {
      setOpen((oldState) => !oldState);
    }
  }

  function handleShareWShortcut(e: KeyboardEvent) {
    if (isThereModal() && !openShareModal) return;
    setOpenShareModal((oldState) => !oldState);
  }

  const openPlayground = useShortcutsStore((state) => state.openPlayground);
  const api = useShortcutsStore((state) => state.api);
  const flow = useShortcutsStore((state) => state.flow);

  useHotkeys(openPlayground, handleChatWShortcut, { preventDefault });
  useHotkeys(api, handleAPIWShortcut, { preventDefault });
  useHotkeys(flow, handleShareWShortcut, { preventDefault });

  useEffect(() => {
    if (open) {
      track("Playground Button Clicked");
    }
  }, [open]);
  const buildFlow = useFlowStore((state) => state.buildFlow);


  const handleClickRun = () => {
    buildFlow({ stopNodeId: data.id });
  };


  return (
    <>
      <Panel className="!m-3" position="bottom-center">
        <div className="flex gap-2">
          <div
              className={cn(
                  "hover:shadow-round-btn-shadow flex h-11 items-center justify-center gap-3 rounded-md border bg-background px-1.5 shadow transition-all"
              )}
          >
            <FlowToolbarOptions />
            <div className="h-6 bg-border border-1.5" />
            <button
                onClick={handleClickRun}
                className="whitespace-nowrap relative inline-flex w-full items-center justify-center gap-1 px-3 py-1.5 text-sm font-semibold text-foreground transition-all duration-150 ease-in-out hover:bg-hover"
            >
              <IconComponent name="Play" className="h-5 w-5" />
              Run All
            </button>
        </div>
        </div>
      </Panel>
    </>
  );
});

export default FlowToolbar;
