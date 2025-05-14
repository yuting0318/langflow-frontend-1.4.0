import { uniqueId } from "lodash";
import { create } from "zustand";
import { AlertItemType } from "@/types/alerts";
import { AlertStoreType } from "@/types/zustand/alert";
import { customStringify } from "@/utils/reactflowUtils";

const pushNotificationList = (
    list: AlertItemType[],
    notification: AlertItemType,
) => {
  list.unshift(notification);
  return list;
};

const useAlertStore = create<AlertStoreType>((set, get) => ({
  errorData: { title: "", list: [] },
  noticeData: { title: "", link: "" },
  successData: { title: "", returnUrl: "" },
  progressData: { starttime: 0 ,returnUrl: "" ,},
  notificationCenter: false,
  notificationList: [],
  tempNotificationList: [],
  setErrorData: (newState: { title: string; list?: Array<string> }) => {
    if (newState.title && newState.title !== "") {
      set({
        errorData: newState,
        notificationCenter: true,
        notificationList: [
          {
            type: "error",
            title: newState.title,
            list: newState.list,
            id: uniqueId(),
          },
          ...get().notificationList,
        ],
      });
      const tempList = get().tempNotificationList;
      if (
          !tempList.some((item) => {
            return (
                customStringify({
                  title: item.title,
                  type: item.type,
                  list: item.list,
                }) === customStringify({ ...newState, type: "error" })
            );
          })
      ) {
        set({
          tempNotificationList: [
            {
              type: "error",
              title: newState.title,
              list: newState.list,
              id: uniqueId(),
            },
            ...get().tempNotificationList,
          ],
        });
      }
    }
  },
  setNoticeData: (newState: { title: string; link?: string }) => {
    if (newState.title && newState.title !== "") {
      set({
        noticeData: newState,
        notificationCenter: true,
        notificationList: [
          {
            type: "notice",
            title: newState.title,
            link: newState.link,
            id: uniqueId(),
          },
          ...get().notificationList,
        ],
      });
      const tempList = get().tempNotificationList;
      if (
          !tempList.some((item) => {
            return (
                customStringify({
                  title: item.title,
                  type: item.type,
                  link: item.link,
                }) === customStringify({ ...newState, type: "notice" })
            );
          })
      ) {
        set({
          tempNotificationList: [
            {
              type: "notice",
              title: newState.title,
              link: newState.link,
              id: uniqueId(),
            },
            ...get().tempNotificationList,
          ],
        });
      }
    }
  },
  setSuccessData: (newState: { title: string; returnUrl?: string  }) => {
    if (newState.title && newState.title !== "") {
      set({
        successData: newState,
        notificationCenter: true,
        notificationList: [
          {
            type: "success",
            title: newState.title,
            returnUrl: newState.returnUrl,
            id: uniqueId(),
          },
          ...get().notificationList,
        ],
      });
      const tempList = get().tempNotificationList;
      if (
          !tempList.some((item) => {
            return (
                customStringify({ title: item.title, type: item.type,returnUrl: item.returnUrl }) ===
                customStringify({ ...newState, type: "success" })
            );
          })
      ) {
        set({
          tempNotificationList: [
            {
              type: "success",
              title: newState.title,
              returnUrl: newState.returnUrl,
              id: uniqueId(),
            },
            ...get().tempNotificationList,
          ],
        });
      }
    }
  },
  setProgressData: (newState: { starttime: Date, returnUrl:string ,flowid?: string,revision:string ,name:string}, id = uniqueId()) => {
    const currentState = get();

    // Check if the ID already exists in notificationList
    const existingNotificationIndex = currentState.notificationList.findIndex(
        (item) => item.id === id
    );

    if (existingNotificationIndex !== -1) {
      // Update the existing notification
      const updatedNotificationList = [...currentState.notificationList];
      updatedNotificationList[existingNotificationIndex] = {
        ...updatedNotificationList[existingNotificationIndex],
        starttime: newState.starttime,
      };

      set({
        notificationList: updatedNotificationList,
      });
    } else {
      set({
        progressData: newState,
        notificationCenter: true,
        notificationList: [
          {
            type: "progress",
            title: newState.title,
            starttime: newState.starttime,
            flowid: newState.flowid,
            returnUrl : newState.returnUrl,
            id,
            name:newState.name,
            revision:newState.revision ,
          },
          ...currentState.notificationList,
        ],
      });
    }

    const tempList = currentState.tempNotificationList;

    if (
        !tempList.some((item) =>
            customStringify({ starttime: item.starttime, type: item.type }) ===
            customStringify({ ...newState, type: "progress" })
        )
    ) {
      set({
        tempNotificationList: [
          {
            type: "progress",
            title: newState.title,
            starttime: newState.starttime,
            returnUrl : newState.returnUrl,
            flowid: newState.flowid,
            revision:newState.revision ,
            name:newState.name,
            id,
          },
          ...tempList,
        ],
      });
    }

    return id;
  },
  setNotificationCenter: (newState: boolean) => {
    set({ notificationCenter: newState });
  },
  clearNotificationList: () => {
    set({ notificationList: [] });
  },
  removeFromNotificationList: (index: string) => {
    set({
      notificationList: get().notificationList.filter(
          (item) => item.id !== index,
      ),
    });
  },
  clearTempNotificationList: () => {
    set({ tempNotificationList: [] });
  },
  removeFromTempNotificationList: (index: string) => {
    set({
      tempNotificationList: get().tempNotificationList.filter(
          (item) => item.id !== index,
      ),
    });
  },
}));

export default useAlertStore;