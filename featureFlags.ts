// /featureFlags.ts
import type { FeatureFlags } from './types';


/**
 * Define a estrutura das feature flags disponíveis na aplicação.
 * Em uma aplicação real, este objeto viria de uma API baseada
 * no plano de assinatura do cliente.
 */

// Simula a configuração de um plano "Premium" onde tudo está habilitado.
// Para um plano "Básico", você poderia ter reports: false, marketingTools: { ...false }
const activeFlags: FeatureFlags = {
  dashboard: true,
  appointments: true,
  calendar: true,
  clients: true,
  reports: true,
  financial: true,
  commissions: true,
  services: true,
  professionals: true,
  costAnalysis: true,
  smartAnalytics: true,
  pendingActions: true,
  marketingTools: {
    marketing: true,
    communication: true,
    birthdays: true,
    raffle: true,
  },
  settings: {
    branding: true,
    salonHours: true,
    admins: true,
    actionHistory: true,
    subscriptionManagement: true,
    storeSettings: true,
  },
};

/**
 * Simula a obtenção das flags. Em um app real, faria uma chamada de API.
 * @returns {FeatureFlags} A configuração de flags ativas.
 */
export const getFeatureFlags = (): FeatureFlags => {
  // Aqui você pode adicionar lógica para carregar flags diferentes
  // com base no cliente, por exemplo.
  return activeFlags;
};