import { createContext, useContext } from 'react';
const C = createContext({});
export const FormProvider = C.Provider;
export const useFormContext = () => useContext(C);
