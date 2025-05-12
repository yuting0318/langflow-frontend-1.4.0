import ForwardedIconComponent from "@/components/common/genericIconComponent";
import useDragStart from "@/components/core/cardComponent/hooks/use-on-drag-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useDeleteFlow from "@/hooks/flows/use-delete-flow";
import DeleteConfirmationModal from "@/modals/deleteConfirmationModal";
import FlowSettingsModal from "@/modals/flowSettingsModal";
import useAlertStore from "@/stores/alertStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { FlowType } from "@/types/flow";
import { swatchColors } from "@/utils/styleUtils";
import { cn, getNumberFromString } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useParams,useLocation } from "react-router-dom";
import useDescriptionModal from "../../hooks/use-description-modal";
import { useGetTemplateStyle } from "../../utils/get-template-style";
import { timeElapsed } from "../../utils/time-elapse";
import DropdownComponent from "../dropdown";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import noFlowCanva from "@/pages/FlowPage/noflow";
import {useContext} from "react";


const ListComponent = ({ flowData }: { flowData: FlowType }) => {
  const navigate = useCustomNavigate();

  const [openDelete, setOpenDelete] = useState(false);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const { deleteFlow } = useDeleteFlow();
  const setErrorData = useAlertStore((state) => state.setErrorData);
  const { folderId } = useParams();
  const { noFlow, setNoFlow } = useContext(noFlowCanva);
  const currentFlowId = useFlowsManagerStore((state) => state.currentFlowId);
  const [openSettings, setOpenSettings] = useState(false);
  const isComponent = flowData.is_component ?? false;
  const setFlowToCanvas = useFlowsManagerStore(
    (state) => state.setFlowToCanvas,
  );
  const { getIcon } = useGetTemplateStyle(flowData);

  const editFlowLink = `/flow/${flowData.id}${folderId ? `/folder/${folderId}` : ""}`;

  const handleClick = async () => {
    if (!isComponent) {
      await setFlowToCanvas(flowData);
      navigate(editFlowLink);
    }
  };

  const location = useLocation();
  useEffect(() => {
    if (location.pathname.includes(flowData.id) && noFlow) {
      setNoFlow(false);
    }
  }, [location]);

  const handleDelete = () => {
    if (currentFlowId === flowData.id) {
      setNoFlow(true);
    }
    deleteFlow({ id: [flowData.id] })
      .then(() => {
        setSuccessData({
          title: "Selected items deleted successfully",
        });
      })
      .catch(() => {
        setNoFlow(false);
        setErrorData({
          title: "Error deleting items",
          list: ["Please try again"],
        });
      });
  };

  const { onDragStart } = useDragStart(flowData);

  const descriptionModal = useDescriptionModal(
    [flowData?.id],
    flowData.is_component ? "component" : "flow",
  );

  const swatchIndex =
    (flowData.gradient && !isNaN(parseInt(flowData.gradient))
      ? parseInt(flowData.gradient)
      : getNumberFromString(flowData.gradient ?? flowData.id)) %
    swatchColors.length;

  const [icon, setIcon] = useState<string>("");

  useEffect(() => {
    getIcon().then(setIcon);
  }, [getIcon]);


  const selectedFlowsComponentsCards = useFlowsManagerStore(
      (state) => state.selectedFlowsComponentsCards,
  );
  const isSelectedCard = selectedFlowsComponentsCards?.includes(flowData?.id) ?? false;
  const flowIdFromUrl = location.pathname.split("/")[2];
  const isRedBorder = flowIdFromUrl === flowData.id;

  return (
    <>
      <Card
        key={flowData.id}
        draggable
        onDragStart={onDragStart}
        onClick={handleClick}
        className={`my-1.5 flex flex-row bg-background h-24 ${
            isComponent ? "cursor-default" : "cursor-pointer"
        } group justify-between rounded-lg bg-clip-padding border  p-1.5  hover:shadow-sm hover:bg-blue-100/50 hover:scale-105 hover:border-blue-100/50 hover:dark:bg-wooblue/20 dark:text-white1 ${
            isSelectedCard ? "border border-blue-100/50 ring-2 ring-blue-100/50" : ""
        } ${
            isRedBorder ? "border border-blue-100/50 ring-blue-100/50 bg-blue-100/50 dark:bg-wooblue/20 dark:border-wooblue/20  dark:text-white1 " : ""
        }`}
      >
        <ShadTooltip content={flowData.name} side="top">
          <div
            className={`flex min-w-0 flex-col ${
              isComponent ? "cursor-default" : "cursor-pointer"
            } gap-1`}
          >
            <div className="line-clamp-1 flex min-w-0 flex-row items-center gap-3 truncate">
              <div
                  className={cn(
                      `item-center flex justify-center rounded-lg p-2 shrink-0 bg-wooblue text-white1 dark:bg-wooblue dark:text-white1`,
                  )}
              >
                <ForwardedIconComponent
                  name={flowData?.icon || getIcon()}
                  aria-hidden="true"
                  className="flex h-4 w-4 items-center justify-center"

                />
              </div>
              <div className="flex w-7/12 flex-col">
                <div className="text-md overflow-hidden truncate text-ellipsis whitespace-nowrap pr-2 font-semibold">
                  {flowData.name}
                </div>

                <div className="text-xs text-muted-foreground">
                  Edited {timeElapsed(flowData.updated_at)} ago
                </div>
              </div>
              <div className="ml-1 pb-5 flex items-center justify-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="iconMd"
                      data-testid="home-dropdown-menu"
                      className="group"
                    >
                      <ForwardedIconComponent
                        name="Ellipsis"
                        aria-hidden="true"
                        className="h-5 w-5 text-muted-foreground group-hover:text-foreground"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[185px]"
                    sideOffset={5}
                    side="bottom"
                  >
                    <DropdownComponent
                      flowData={flowData}
                      setOpenDelete={setOpenDelete}
                      handleEdit={() => {
                        setOpenSettings(true);
                      }}
                      handlePlaygroundClick={() => {
                        // handlePlaygroundClick();
                      }}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="overflow-hidden text-sm text-primary">
              <span className="block max-w-[110ch] truncate">
                {flowData.description}
              </span>
            </div>
          </div>
        </ShadTooltip>
      </Card>

      {openDelete && (
        <DeleteConfirmationModal
          open={openDelete}
          setOpen={setOpenDelete}
          set
          onConfirm={handleDelete}
          description={descriptionModal}
          note={
            !flowData.is_component
              ? "Deleting the selected flow will remove all associated messages."
              : ""
          }
        >
          <></>
        </DeleteConfirmationModal>
      )}
      <FlowSettingsModal
        open={openSettings}
        setOpen={setOpenSettings}
        flowData={flowData}
        details
      />
    </>
  );
};

export default ListComponent;
