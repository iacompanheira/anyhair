import type { Dispatch, SetStateAction } from 'react';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  promotionalPrice?: number;
  minimumStock: number;
  isBestseller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Material {
  id: number;
  name: string;
  price: number;
  contentValue: number;
  contentUnit: string;
  servicesYield: number;
  currentStock: number;
  minimumStock: number;
}

export interface ServiceRecipeMaterial {
  materialId: number;
  quantity: number; // in the material's base unit (e.g., g, mL)
}

export interface ServiceRecipe {
  id: number;
  name: string;
  materials: ServiceRecipeMaterial[];
  yields: number;
  additionalCostsPercentage: number;
  safetyMarginPercentage: number;
  desiredProfitMargin: number;
  notes: string;
  associatedServiceId?: number;
  durationInMinutes?: number;
}

export type View = 
  | 'home' 
  | 'booking' 
  | 'login' 
  | 'confirmation' 
  | 'dashboard' 
  | 'appointments'
  | 'history'
  | 'subscription'
  | 'store'
  | 'profile';

export type AccessLevel = 'super_admin' | 'admin' | 'professional';

export interface UnifiedUser {
  id: number;
  name: string;
  email?: string; // Optional for professionals who might not have a login
  imageUrl: string;
  accessLevel: AccessLevel;
  isEnabled: boolean;
  birthdate?: string;
  
  // Professional-specific fields
  specialty?: string;
  serviceIds?: number[];
  displayOrder?: number;
}


export type DashboardView = 
  | 'main' 
  | 'appointments' 
  | 'calendar'
  | 'reports'
  | 'financial'
  | 'clients'
  | 'services'
  | 'users'
  | 'professionals'
  | 'admins'
  | 'marketing'
  | 'birthdays'
  | 'communication'
  | 'raffle'
  | 'branding'
  | 'salonSettings'
  | 'modules'
  | 'actionHistory'
  | 'commissions'
  | 'smartAnalytics'
  | 'pendingActions'
  | 'costAnalysis'
  | 'subscriptionManagement'
  | 'storeSettings';


export interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  isPriceHidden: boolean;
  productCost: number;
  includesServiceIds?: number[];
  icon?: string;
  isVisibleInCatalog?: boolean;
  isEssential?: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  period: 'mês' | 'ano';
  features: string[];
  includedServices: {
    serviceId: number;
    quantity: number;
  }[];
  discountPercentage?: number;
  isPopular?: boolean;
}

export interface DateTimeSelection {
  date: Date;
  time: string;
}

export type UserRole = 'admin' | 'customer';

export interface User {
  name: string;
  role: UserRole;
  isGuest?: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  displayLocation: 'main' | 'carousel' | 'floating' | 'none';
}

export interface PromoText {
  id: number;
  text: string;
  isActive: boolean;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthdate?: string;
  lastVisit: string;
}

export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  price: string;
  status: 'completed' | 'cancelled' | 'no-show' | 'scheduled';
}

export interface FullAppointment {
  id: string;
  date: Date;
  status: 'completed' | 'cancelled' | 'no-show' | 'scheduled';
  client: Client;
  professional: UnifiedUser;
  service: Service & { color: string };
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: string;
}

export interface TitlePartStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
}

export interface FontStyleControl {
  fontSize: number;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
}

export interface LayoutSettings {
  primaryFontFamily: string;
  baseFontSize: number;
  baseFontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  baseFontStyle: 'normal' | 'italic';
  borderRadius: number;
  sectionPaddingY: number;

  containerMaxWidth: number;
  elementSpacing: number; // For grids
  cardShadow: string; // Tailwind shadow class

  pageTitle: FontStyleControl;
  sectionTitle: FontStyleControl;
  sectionSubtitle: FontStyleControl;

  cardTitle: FontStyleControl;
  cardBody: FontStyleControl;
  cardPrice: FontStyleControl;

  buttonText: FontStyleControl;
  bottomNavText: FontStyleControl;

  inputLabelText: FontStyleControl;
  inputText: FontStyleControl;
  footerText: FontStyleControl;
}

export interface StoreBranding {
    titleText: string;
    subtitleText: string;
    sectionTitle: FontStyleControl;
    sectionSubtitle: FontStyleControl;
    cardTitle: FontStyleControl;
    cardDescription: FontStyleControl;
    cardPrice: FontStyleControl;
    cardButtonText: FontStyleControl;
    
    colors: {
        sectionBg: string;
        cardBg: string;
        titleColor: string;
        priceColor: string;
        buttonBg: string;
        buttonTextColor: string;
        buttonHoverBg: string;
        buttonHoverTextColor: string;
    }
}

export interface Branding {
  logoUrl: string;
  logoSize: number;
  logoPosition: 'left' | 'right';
  logoVerticalOffset: number;
  salonNameFirstPart: string;
  salonNameSecondPart: string;
  headerTitleFirstPartStyle: TitlePartStyle;
  headerTitleSecondPartStyle: TitlePartStyle;
  heroTitleFirstPartStyle: TitlePartStyle;
  heroTitleSecondPartStyle: TitlePartStyle;
  heroSloganStyle: TitlePartStyle;
  slogan: string;
  heroImageUrl: string;
  colors: {
    primary: string;
    secondary: string;
    dark: string;
    light: string;
    accent: string;
    inputBackground: string;
  };
  isHeaderTransparent: boolean;
  headerBackgroundColor: string;
  layout: LayoutSettings;
  store: StoreBranding;
}

export interface FixedCosts {
  rent: number; // aluguel
  bills: number; // água, luz, telefone, internet e televisão
  products: number; // compra de materiais e produtos (estimativa fixa mensal)
  marketing: number; // serviços de marketing
  accounting: number; // assessoria contábil
  managementSystem: number; // sistema de gestão e atendimento
  maintenance: number; // limpeza e manutenção
  proLabore: number; // remuneração dos donos ou sócios
  fixedTaxes: number; // impostos (IPTU, etc.)
  depreciation: number; // depreciação
  others: number; // assinatura de revistas, etc.
}

export interface FinancialSettings {
  salaryPerEmployee: number; // Base salary
  individualSalaries: Record<number, number>; // userId -> salary amount
  fixedCosts: FixedCosts;
  socialChargesPercentage: number; // encargos sociais e trabalhistas (%)
  workDaysInMonth: number;
  defaultCommission: number; // in percentage
  individualCommissions: Record<number, number>; // userId -> commission percentage
  planSafetyMargin: number; // in percentage
  cardFeePercentage: number; // in percentage
  taxOnServicesPercentage: number; // in percentage
}

export interface FeatureFlags {
  dashboard: boolean;
  appointments: boolean;
  calendar: boolean;
  clients: boolean;
  reports: boolean;
  financial: boolean;
  commissions: boolean;
  services: boolean;
  professionals: boolean;
  costAnalysis: boolean;
  smartAnalytics: boolean;
  pendingActions: boolean;
  marketingTools: {
    marketing: boolean;
    communication: boolean;
    birthdays: boolean;
    raffle: boolean;
  };
  settings: {
    branding: boolean;
    salonHours: boolean;
    admins: boolean;
    actionHistory: boolean;
    subscriptionManagement: boolean;
    storeSettings: boolean;
  };
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: 'Salário' | 'Aluguel' | 'Marketing' | 'Produtos' | 'Contas' | 'Outros';
  paymentMethod: 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro';
}

export interface AuditLogEntry {
  id: number;
  timestamp: Date;
  userId: number;
  userName: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'status_change' | 'setting_change';
  entityType: 'user' | 'client' | 'appointment' | 'service' | 'branding' | 'settings' | 'campaign' | 'security';
  entityId?: number | string;
  description: string;
}

export interface Reminder {
  id: string; // unique id for the reminder, can be based on appointment id
  remindAt: number; // timestamp
  title: string;
  body: string;
  appointmentId: string;
}

// Type for the App Context
export interface AppContextType {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  loggedInStaff: UnifiedUser | null;
  setLoggedInStaff: Dispatch<SetStateAction<UnifiedUser | null>>;
  featureFlags: FeatureFlags | null;
  setFeatureFlags: Dispatch<SetStateAction<FeatureFlags | null>>;
  services: Service[];
  setServices: Dispatch<SetStateAction<Service[]>>;
  clients: Client[];
  setClients: Dispatch<SetStateAction<Client[]>>;
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  campaigns: Campaign[];
  setCampaigns: Dispatch<SetStateAction<Campaign[]>>;
  promoTexts: PromoText[];
  setPromoTexts: Dispatch<SetStateAction<PromoText[]>>;
  promoTextInterval: number;
  setPromoTextInterval: Dispatch<SetStateAction<number>>;
  isFloatingWidgetEnabled: boolean;
  setIsFloatingWidgetEnabled: Dispatch<SetStateAction<boolean>>;
  floatingWidgetPosition: 'bottom-right' | 'bottom-left';
  setFloatingWidgetPosition: Dispatch<SetStateAction<'bottom-right' | 'bottom-left'>>;
  floatingWidgetSize: 'small' | 'medium' | 'large';
  setFloatingWidgetSize: Dispatch<SetStateAction<'small' | 'medium' | 'large'>>;
  isTextOverlayEnabled: boolean;
  setIsTextOverlayEnabled: Dispatch<SetStateAction<boolean>>;
  branding: Branding;
  setBranding: Dispatch<SetStateAction<Branding>>;
  users: UnifiedUser[];
  setUsers: Dispatch<SetStateAction<UnifiedUser[]>>;
  isMasterPasswordEnabled: boolean;
  setIsMasterPasswordEnabled: Dispatch<SetStateAction<boolean>>;
  masterPassword: string;
  setMasterPassword: Dispatch<SetStateAction<string>>;
  isPaymentMandatory: boolean;
  setIsPaymentMandatory: Dispatch<SetStateAction<boolean>>;
  isLoginRequiredForBooking: boolean;
  setIsLoginRequiredForBooking: Dispatch<SetStateAction<boolean>>;
  serviceSelectionMode: 'single' | 'multiple';
  setServiceSelectionMode: Dispatch<SetStateAction<'single' | 'multiple'>>;
  suggestedSlotsCount: number;
  setSuggestedSlotsCount: Dispatch<SetStateAction<number>>;
  suggestedDatesCount: number;
  setSuggestedDatesCount: Dispatch<SetStateAction<number>>;
  selectedServices: Service[];
  setSelectedServices: Dispatch<SetStateAction<Service[]>>;
  selectedProfessional: UnifiedUser | null;
  setSelectedProfessional: Dispatch<SetStateAction<UnifiedUser | null>>;
  selectedDateTime: DateTimeSelection | null;
  setSelectedDateTime: Dispatch<SetStateAction<DateTimeSelection | null>>;
  currentUserSubscriptionId: number | null;
  setCurrentUserSubscriptionId: Dispatch<SetStateAction<number | null>>;
  subscriptionPlans: SubscriptionPlan[];
  setSubscriptionPlans: Dispatch<SetStateAction<SubscriptionPlan[]>>;
  financialSettings: FinancialSettings;
  setFinancialSettings: Dispatch<SetStateAction<FinancialSettings>>;
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  materials: Material[];
  setMaterials: Dispatch<SetStateAction<Material[]>>;
  serviceRecipes: ServiceRecipe[];
  setServiceRecipes: Dispatch<SetStateAction<ServiceRecipe[]>>;
  favoriteServiceIds: number[];
  setFavoriteServiceIds: Dispatch<SetStateAction<number[]>>;
  reminders: Reminder[];
  setReminders: Dispatch<SetStateAction<Reminder[]>>;
  resetBooking: () => void;
}