// /hooks/useFeatureFlags.ts

import { useState, useEffect } from 'react';
import { getFeatureFlags } from '../featureFlags';
import type { FeatureFlags } from '../types';

/**
 * Hook personalizado para carregar e fornecer as feature flags para a aplicação.
 * 
 * @returns {FeatureFlags | null} O objeto de flags, ou nulo enquanto carrega.
 */
export const useFeatureFlags = (): FeatureFlags | null => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);

  useEffect(() => {
    // Simula uma chamada assíncrona para buscar as flags, como seria em uma API.
    const flagsData = getFeatureFlags();
    setFlags(flagsData);
  }, []);

  return flags;
};