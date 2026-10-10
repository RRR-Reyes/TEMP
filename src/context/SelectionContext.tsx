import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { SelectionState, CropType } from '@/types';

interface SelectionContextValue extends SelectionState {
  setState: (stateCode: string, stateName: string) => void;
  setCounty: (fips: string, name: string) => void;
  setCrop: (crop: CropType) => void;
  setThreat: (threatId: string) => void;
  clearState: () => void;
  clearCounty: () => void;
  clearThreat: () => void;
}

const defaultState: SelectionState = {
  stateCode: null,
  stateName: null,
  countyFips: null,
  countyName: null,
  crop: 'corn',
  threatId: null,
};

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<SelectionState>(defaultState);

  const setState = useCallback((stateCode: string, stateName: string) => {
    setStateInternal((prev) => ({ ...prev, stateCode, stateName, countyFips: null, countyName: null }));
  }, []);

  const setCounty = useCallback((fips: string, name: string) => {
    setStateInternal((prev) => ({ ...prev, countyFips: fips, countyName: name }));
  }, []);

  const setCrop = useCallback((crop: CropType) => {
    setStateInternal((prev) => ({ ...prev, crop }));
  }, []);

  const setThreat = useCallback((threatId: string) => {
    setStateInternal((prev) => ({ ...prev, threatId }));
  }, []);

  const clearState = useCallback(() => {
    setStateInternal((prev) => ({
      ...prev,
      stateCode: null,
      stateName: null,
      countyFips: null,
      countyName: null,
    }));
  }, []);

  const clearCounty = useCallback(() => {
    setStateInternal((prev) => ({ ...prev, countyFips: null, countyName: null }));
  }, []);

  const clearThreat = useCallback(() => {
    setStateInternal((prev) => ({ ...prev, threatId: null }));
  }, []);

  return (
    <SelectionContext.Provider
      value={{ ...state, setState, setCounty, setCrop, setThreat, clearState, clearCounty, clearThreat }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
