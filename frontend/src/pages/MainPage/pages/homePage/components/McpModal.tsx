import { TweaksComponent } from "@/components/core/codeTabsComponent/components/tweaksComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomAPIGenerator } from "@/customization/components/custom-api-generator";
import useAuthStore from "@/stores/authStore";
import useFlowStore from "@/stores/flowStore";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
import { ReactNode, useEffect, useState } from "react";
import { useTweaksStore } from "../../../../../stores/tweaksStore"
import BaseModal from "@/modals/baseModal";
import McpServerTab from "@/pages/MainPage/pages/homePage/components/McpServerTab";
import {useFolderStore} from "@/stores/foldersStore";
import {useParams} from "react-router-dom";


export default function McpModal({
                                     children,
                                     open: myOpen,
                                     setOpen: mySetOpen,
                                 }: {
    children: ReactNode;
    open?: boolean;
    setOpen?: (a: boolean | ((o?: boolean) => boolean)) => void;
}) {
    const autoLogin = useAuthStore((state) => state.autoLogin);
    const nodes = useFlowStore((state) => state.nodes);
    const [openTweaks, setOpenTweaks] = useState(false);
    const tweaks = useTweaksStore((state) => state.tweaks);
    const [open, setOpen] =
        mySetOpen !== undefined && myOpen !== undefined
            ? [myOpen, mySetOpen]
            : useState(false);
    const newInitialSetup = useTweaksStore((state) => state.newInitialSetup);

    useEffect(() => {
        if (open) newInitialSetup(nodes);
    }, [open]);

    const { folderId } = useParams();
    const folders = useFolderStore((state) => state.folders);
    const folderName =
        folders.find((folder) => folder.id === folderId)?.name ??
        folders[0]?.name ??
        "";

    return (
        <>
            <BaseModal
                closeButtonClassName="!top-3"
                open={open}
                setOpen={setOpen}
                size="large-h-full"

            >
                <BaseModal.Trigger asChild>{children}</BaseModal.Trigger>
                <BaseModal.Content >
                    <div >
                    <McpServerTab folderName={folderName} />
                    </div>
                </BaseModal.Content>
            </BaseModal>

        </>
    );
}
