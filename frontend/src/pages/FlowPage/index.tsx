import { SidebarProvider } from "@/components/ui/sidebar";
import { useGetFlow } from "@/controllers/API/queries/flows/use-get-flow";
import { useGetTypes } from "@/controllers/API/queries/flows/use-get-types";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useSaveFlow from "@/hooks/flows/use-save-flow";
import { useIsMobile } from "@/hooks/use-mobile";
import { SaveChangesModal } from "@/modals/saveChangesModal";
import useAlertStore from "@/stores/alertStore";
import { useTypesStore } from "@/stores/typesStore";
import { customStringify } from "@/utils/reactflowUtils";
import {useEffect, useRef, useState, createContext,} from "react";
import { useBlocker, useParams } from "react-router-dom";
import useFlowStore from "../../stores/flowStore";
import useFlowsManagerStore from "../../stores/flowsManagerStore";
import Page from "./components/PageComponent";
import { FlowSidebarComponent } from "./components/flowSidebarComponent";
import HomePage2 from "@/pages/MainPage/pages/homePage/index2";
import clsx from "clsx";
import IconComponent from "../../components/common/genericIconComponent";
import useAddFlow from "@/hooks/flows/use-add-flow";
import { useReactFlow } from "react-flow-renderer";
import noFlowCanva from "@/pages/FlowPage/noflow";
import {NodeDataType} from "@/types/flow";
import {dataContext} from "./components/PageComponent/DataContext";

export default function FlowPage({ view }: { view?: boolean }): JSX.Element {
  const types = useTypesStore((state) => state.types);

  useGetTypes({
    enabled: Object.keys(types).length <= 0,
  });

  const setCurrentFlow = useFlowsManagerStore((state) => state.setCurrentFlow);
  const currentFlow = useFlowStore((state) => state.currentFlow);
  const currentSavedFlow = useFlowsManagerStore((state) => state.currentFlow);
  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const [isLoading, setIsLoading] = useState(false);

  const changesNotSaved =
    customStringify(currentFlow) !== customStringify(currentSavedFlow) &&
    (currentFlow?.data?.nodes?.length ?? 0) > 0;

  const isBuilding = useFlowStore((state) => state.isBuilding);
  const blocker = useBlocker(changesNotSaved || isBuilding);

  const setOnFlowPage = useFlowStore((state) => state.setOnFlowPage);
  const { id } = useParams();
  const navigate = useCustomNavigate();
  const saveFlow = useSaveFlow();

  const flows = useFlowsManagerStore((state) => state.flows);
  const currentFlowId = useFlowsManagerStore((state) => state.currentFlowId);

  const flowToCanvas = useFlowsManagerStore((state) => state.flowToCanvas);

  const updatedAt = currentSavedFlow?.updated_at;
  const autoSaving = useFlowsManagerStore((state) => state.autoSaving);
  const stopBuilding = useFlowStore((state) => state.stopBuilding);

  const { mutateAsync: getFlow } = useGetFlow();

  const handleSave = () => {
    let saving = true;
    let proceed = false;
    setTimeout(() => {
      saving = false;
      if (proceed) {
        blocker.proceed && blocker.proceed();
        setSuccessData({
          title: "Flow saved successfully!",
        });
      }
    }, 1200);
    saveFlow().then(() => {
      if (!autoSaving || saving === false) {
        blocker.proceed && blocker.proceed();
        setSuccessData({
          title: "Flow saved successfully!",
        });
      }
      proceed = true;
    });
  };

  const addFlow = useAddFlow();
  const hasCreatedFlow = useRef(false);
  const setTypes = useTypesStore((state) => state.setTypes);

  useEffect(() => {
    const awaitgetTypes = async () => {
      if (flows && currentFlowId === "" && !hasCreatedFlow.current) {
        const sortedFlows = flows.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());
        const filteredFlows = sortedFlows.filter((flow) => flow.user_id !== null);
        const isAnExistingFlow = filteredFlows.find((flow) => flow.id === id);
        console.log("Filtered flows", filteredFlows);
        if (id === undefined) {
          if (filteredFlows.length === 0) {
            hasCreatedFlow.current = true; // Mark as created
            const newFlowId = await addFlow();
            window.location.href = `/flow/${newFlowId}`;
            return;
          } else {
            const length = filteredFlows.length;
            const firstFlow = filteredFlows[length - 1];
            const firstFlowId = firstFlow.id;
            window.location.href = `/flow/${firstFlowId}`;
          }
        } else {
          const isAnExistingFlow = filteredFlows.find((flow) => flow.id === id);
          if (!isAnExistingFlow) {
            if (filteredFlows.length === 0) {
              hasCreatedFlow.current = true; // Mark as created
              const newFlowId = await addFlow();
              window.location.href = `/flow/${newFlowId}`;
            } else {
              const length = filteredFlows.length;
              const lastFlow = filteredFlows[length - 1];
              const lastFlowId = lastFlow.id;
              window.location.href = `/flow/${lastFlowId}`;
            }
          }
        }
        console.log("Flow found", isAnExistingFlow);
      
      } else if (!flows) {
        setIsLoading(true);
        // await refreshFlows(undefined);
        await setTypes([]);
        setIsLoading(false);
      }
    };
    console.log("Current flow", currentFlow);
    awaitgetTypes();
  }, [id, flows, currentFlowId, setCurrentFlow, setIsLoading, setTypes]);


  const handleExit = () => {
    if (isBuilding) {
      // Do nothing, let the blocker handle it
    } else if (changesNotSaved) {
      if (blocker.proceed) blocker.proceed();
    } else {
      navigate("/all");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (changesNotSaved || isBuilding) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [changesNotSaved, isBuilding]);

  // Set flow tab id
  useEffect(() => {
    const awaitgetTypes = async () => {
      if (flows && currentFlowId === "") {
        const isAnExistingFlow = flows.find((flow) => flow.id === id);

        if (!isAnExistingFlow) {
          // navigate("/all");
          return;
        }

        const isAnExistingFlowId = isAnExistingFlow.id;

        flowToCanvas
          ? setCurrentFlow(flowToCanvas)
          : getFlowToAddToCanvas(isAnExistingFlowId);
      }
    };
    awaitgetTypes();
  }, [id, flows, currentFlowId, flowToCanvas]);

  useEffect(() => {
    setOnFlowPage(true);

    return () => {
      setOnFlowPage(false);
      setCurrentFlow(undefined);
    };
  }, [id]);

  useEffect(() => {
    if (
      blocker.state === "blocked" &&
      autoSaving &&
      changesNotSaved &&
      !isBuilding
    ) {
      handleSave();
    }
  }, [blocker.state, isBuilding]);

  useEffect(() => {
    if (blocker.state === "blocked") {
      if (isBuilding) {
        stopBuilding();
      } else if (!changesNotSaved) {
        blocker.proceed && blocker.proceed();
      }
    }
  }, [blocker.state, isBuilding]);

  const getFlowToAddToCanvas = async (id: string) => {
    const flow = await getFlow({ id: id });
    setCurrentFlow(flow);
  };

  const isMobile = useIsMobile();

  const [showHomePage, setShowHomePage] = useState(true); // 控制 HomePage2 是否顯示
  const toggleHomePage = () => setShowHomePage(prev => !prev);
  const [noFlow, setNoFlow] = useState(false);

  const [value, setValue] = useState<NodeDataType[]>([]);

  return (
    <>
      <dataContext.Provider value={[value, setValue]}>
      <noFlowCanva.Provider value={{ noFlow, setNoFlow }}>
      <div className="flow-page-positioning">
        {currentFlow && (
          <div className="flex h-full  overflow-hidden">
            <SidebarProvider width="17.5rem" defaultOpen={!isMobile}>
              {!view && (
                  <>
                    <div
                        className={clsx(
                            "transition-all duration-500 ease-in-out relative",
                            showHomePage
                                ? "max-w-[279.2px] w-[60vw] opacity-100 transform scale-100"
                                : "max-w-0 opacity-0 overflow-hidden transform scale-95"
                        )}
                        style={{ margin: "0 auto" }}
                    >
                      <button
                          onClick={toggleHomePage}
                          className="absolute top-2 left-3 border-1.5 border-gray-300  bg-white dark:bg-background px-2 py-1 rounded z-999"
                      >
                        <IconComponent name="menu" className="m-1 w-4" />
                      </button>
                      <HomePage2 type="flows" />
                    </div>
                    {!showHomePage && (
                          <button
                              onClick={toggleHomePage}
                              className="absolute top-[55px] left-3 px-2 py-1 rounded border-1.5 border-gray-300 z-50 bg-white dark:bg-background"
                          >
                            <IconComponent name="menu" className="m-1 w-4" />
                          </button>
                    )}
                  </>
              )}
              <main className="flex w-full overflow-hidden">
                <div className="h-full w-full">
                  <Page setIsLoading={setIsLoading} data={value}/>
                </div>
                {!view && <FlowSidebarComponent isLoading={isLoading} />}
              </main>
            </SidebarProvider>
          </div>
        )}
      </div>
    </noFlowCanva.Provider>
      {blocker.state === "blocked" && (
        <>
          {!isBuilding && currentSavedFlow && (
            <SaveChangesModal
              onSave={handleSave}
              onCancel={() => blocker.reset?.()}
              onProceed={handleExit}
              flowName={currentSavedFlow.name}
              lastSaved={
                updatedAt
                  ? new Date(updatedAt).toLocaleString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      month: "numeric",
                      day: "numeric",
                    })
                  : undefined
              }
              autoSave={autoSaving}
            />
          )}
        </>
      )}
      </dataContext.Provider>
      </>
  );
}
