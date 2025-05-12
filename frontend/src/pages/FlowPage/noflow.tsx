import {createContext} from "react";

const noFlow = createContext({
    noFlow: false,
    setNoFlow: (noFlow: boolean) => {},
})

export default noFlow;