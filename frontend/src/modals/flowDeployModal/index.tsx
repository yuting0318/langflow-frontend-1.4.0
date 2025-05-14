import { useEffect, useState } from "react";
import axios from "axios";
import useSaveFlow from "@/hooks/flows/use-save-flow";
import useAlertStore from "@/stores/alertStore";
import useFlowStore from "@/stores/flowStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { cloneDeep } from "lodash";
import EditFlowDeploy from "@/components//core/editFlowDeployComponent";
import IconComponent from "../../components/common/genericIconComponent";
import { SETTINGS_DIALOG_SUBTITLE } from "../../constants/constants";
import { FlowSettingsPropsType } from "@/types/components";
import { FlowType } from "@/types/flow";
import { isEndpointNameValid } from "@/utils/utils";
import BaseModal from "../baseModal";
import Loading from "@/components/ui/loading";
import ShadTooltip from "../../components/common/shadTooltipComponent";

export default function FlowSettingsModal({ open, setOpen }: FlowSettingsPropsType): JSX.Element {
    const saveFlow = useSaveFlow();
    const currentFlow = useFlowStore((state) => state.currentFlow);
    const setCurrentFlow = useFlowStore((state) => state.setCurrentFlow);
    const setSuccessData = useAlertStore((state) => state.setSuccessData);
    const setErrorData = useAlertStore((state) => state.setErrorData);
    const setProgressData = useAlertStore((state) => state.setProgressData);
    const flows = useFlowsManagerStore((state) => state.flows);
    const [name, setName] = useState(currentFlow!.name);
    const [description, setDescription] = useState(currentFlow!.description);
    const [endpoint_name, setEndpointName] = useState(currentFlow!.endpoint_name ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [disableSave, setDisableSave] = useState(false);
    const [returnUrl, setReturnUrl] = useState<string | null>(null);
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState(0);
    const [progrssid, setProgressid] = useState<string | undefined>();
    const autoSaving = useFlowsManagerStore((state) => state.autoSaving);
    const [nameLists, setNameList] = useState<string[]>([]);
    const notificationList = useAlertStore((state) => state.notificationList);

    useEffect(() => {
        if (
            (!nameLists.includes(name)) &&
            isEndpointNameValid(endpoint_name ?? "", 50)
        ) {
            setDisableSave(false);
        } else {
            setDisableSave(true);
        }
    }, [nameLists, currentFlow, description, endpoint_name, name]);

    useEffect(() => {
        setName(currentFlow!.name);
        setDescription(currentFlow!.description);
    }, [currentFlow?.name, currentFlow?.description, open]);

    const currentFlowId = useFlowsManagerStore((state) => state.currentFlowId);
    const currentFlowName = currentFlow?.name;
    const flowData = {
        id: currentFlowId,
        name: currentFlowName,
    };

    console.log(JSON.stringify(flowData));

    function handleClick(): void {
        setIsSaving(true);

        if (!currentFlow) return;

        const newFlow = cloneDeep(currentFlow);
        newFlow.name = transformName(name);
        newFlow.description = description;
        newFlow.endpoint_name = endpoint_name && endpoint_name.length > 0 ? endpoint_name : null;

        if (newFlow.name.length < 1 || newFlow.name.length > 63) {
            setErrorData({ title: "Name must be between 1 and 63 characters." });
            setIsSaving(false);
            return;
        }

        const nameRegex = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
        if (!nameRegex.test(newFlow.name)) {
            setErrorData({ title: "Please use a-z, 0-9, or \"-\"." });
            setIsSaving(false);
            return;
        }

        if (newFlow.name.toLowerCase().includes("untitled-document")) {
            setErrorData({ title: "Please rename." });
            setIsSaving(false);
            return;
        }

        let health =  { title: `Deploying ${currentFlow.name} Please wait ...`, progress, returnUrl: `https://${newFlow.name}-412195401920.asia-east1.run.app`, starttime: Date.now(), flowid: currentFlow.id, revision: '' , name: currentFlow.name};

        const healthUrl = `https://${newFlow.name}-412195401920.asia-east1.run.app/health`;
        axios.get(healthUrl)
            .then((response) => {
                if (response.status === 200 ) {
                    const revision = response.data.revision || "" ;
                    health = { title: `Deploying ${currentFlow.name}  Please wait ...`, progress, returnUrl: `https://${newFlow.name}-412195401920.asia-east1.run.app`, starttime: Date.now(), flowid: currentFlow.id, revision: revision ,name: currentFlow.name};
                }
            })
            .catch((err) => {
                console.log("Health check failed", err);
            })
            .finally(() => {
                const url = "https://cloudbuild.googleapis.com/v1/projects/csdfm-lab/locations/asia-east1/triggers/ifhir-flow-api:webhook?key=AIzaSyDUJgjVZZYrBjUwChruUWBkN_4uFNnx97E&secret=wVnKfCWo6RuTPv2TScj9t-5lnzdXoIU4&trigger=ifhir-flow-api&projectId=csdfm-lab";
                const body = {
                    service_name: newFlow.name,
                    flow_id: currentFlow.id,
                };

                axios.post(url, body)
                    .then(() => {
                        if (health) {
                            setProgressData(health);
                        }
                        setOpen(false);
                        setIsLoadingUrl(true);
                        setIntervalId(null);
                        setProgress(0);
                        const interval = setInterval(() => {
                            setProgress((prevProgress) => {
                                if (prevProgress >= 99) {
                                    clearInterval(interval);
                                    const returnUrl = `https://${newFlow.name}-412195401920.asia-east1.run.app`;
                                    setReturnUrl(returnUrl);
                                    setIsLoadingUrl(false);
                                    return 99;
                                }
                                return prevProgress + 1.67;
                            });
                            setIntervalId(interval);
                        }, 1000);
                    })
                    .catch((err) => {
                        console.log("Failed to trigger deployment", err);
                        setErrorData({ title: "Failed to trigger deployment" });
                    })
                    .finally(() => {
                        setIsSaving(false);
                        console.log("Save flow finally");
                    });
            });
    }

    useEffect(() => {
        if (flows) {
            const tempNameList: string[] = [];
            flows.forEach((flow: FlowType) => {
                if ((flow.is_component ?? false) === false) tempNameList.push(flow.name);
            });
            setNameList(tempNameList.filter((name) => name !== currentFlow!.name));
        }
    }, [flows]);


    const transformName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, '-');
    };

    useEffect(() => {
        const hasProgressNotification = notificationList.some(
            (notif) => notif.type === "progress" && notif.flowid === currentFlow?.id
        );

        if (
            (!nameLists.includes(name)) &&
            isEndpointNameValid(endpoint_name ?? "", 50) &&
            !hasProgressNotification
        ) {
            setDisableSave(false);
        } else {
            setDisableSave(true);
        }
    }, [nameLists, currentFlow, description, endpoint_name, name, notificationList]);

    return (
        <BaseModal open={open} setOpen={setOpen} size="x-small" onSubmit={handleClick}>
            <BaseModal.Header>
                <span className="pr-2 text-xl">Deploy</span>
                <IconComponent name="CloudUpload" className="mr-2 mt-1 h-6 w-6" />
            </BaseModal.Header>
            <BaseModal.Content>
                <>
                    <EditFlowDeploy invalidNameList={nameLists} name={transformName(name)} setName={setName}/>
                    <span className="text-red-500 text-sm m-0.5 mt-0.5 py-2 pr-2 font-semibold">Example :
                        <span className="font-semibold"> test123, hello-world</span>
                    </span>
                </>
            </BaseModal.Content>
            <BaseModal.Footer
                submit={{
                    label: "Create",
                    dataTestId: "save-flow-settings",
                    disabled: disableSave || isLoadingUrl,
                    loading: isSaving,
                }}
            />
        </BaseModal>
    );
}