import React, { createContext, useState, ReactNode, useContext } from 'react';
import {NodeDataType} from "@/types/flow";


// Create the context with default values
export const dataContext = createContext<[NodeDataType[], React.Dispatch<React.SetStateAction<NodeDataType[]>>] | null>(null);