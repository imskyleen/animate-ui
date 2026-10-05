import { createContext, useContext } from 'react';

export function getStrictContext<T>(name: string) {
  const Context = createContext<T | undefined>(undefined);

  const useStrictContext = () => {
    const ctx = useContext(Context);
    if (!ctx) {
      throw new Error(`${name} is missing a Context Provider`);
    }
    return ctx;
  };

  return [Context.Provider, useStrictContext] as const;
}
