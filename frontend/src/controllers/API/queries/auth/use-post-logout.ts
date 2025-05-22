import useAuthStore from "@/stores/authStore";
import { useMutationFunctionType } from "@/types/api";

import {
  IS_AUTO_LOGIN,
  LANGFLOW_AUTO_LOGIN_OPTION,
} from "@/constants/constants";
import useFlowStore from "@/stores/flowStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useFolderStore } from "@/stores/foldersStore";
import { Cookies } from "react-cookie";
import { api } from "../../api";
import { getURL } from "../../helpers/constants";
import { UseRequestProcessor } from "../../services/request-processor";

export const useLogout: useMutationFunctionType<undefined, void> = (
  options?,
) => {
  const { mutate, queryClient } = UseRequestProcessor();
  const logout = useAuthStore((state) => state.logout);

  async function logoutUser(): Promise<any> {
    const autoLogin = useAuthStore.getState().autoLogin;

    if (autoLogin) {
      return {};
    }
    const res = await api.post(`${getURL("LOGOUT")}`);
    return res.data;
  }

  const mutation = mutate(["useLogout"], logoutUser, {
    onSuccess: () => {
      logout();

      queryClient.invalidateQueries({ queryKey: ["useGetRefreshFlowsQuery"] });
      queryClient.invalidateQueries({ queryKey: ["useGetFolders"] });
      queryClient.invalidateQueries({ queryKey: ["useGetFolder"] });
    },
    onError: (error) => {
      console.error(error);
    },
    ...options,
  });

  return mutation;
};
