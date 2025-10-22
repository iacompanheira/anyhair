import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_USERS, SERVICES_DATA, INITIAL_SUBSCRIPTION_PLANS_DATA, PRODUCTS_DATA, MOCK_MATERIALS_DATA } from '../constants';
import type { AppContextType, Service, Campaign, PromoText, Client, Appointment, Branding, FeatureFlags, User, UnifiedUser, DateTimeSelection, SubscriptionPlan, FinancialSettings, Product, FixedCosts, Material, ServiceRecipe, Reminder } from '../types';
import { getFeatureFlags } from '../featureFlags';

const AppContext = createContext<AppContextType | null>(null);

// Helper to get initial state from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const parseDurationToMinutes = (duration: string): number => {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(' ');
    if (parts.length < 1) return 0;
    const value = parseInt(parts[0], 10);
    if (isNaN(value)) return 0;
    if (parts.length > 1 && parts[1].toLowerCase().startsWith('h')) {
        return value * 60;
    }
    return value;
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loggedInStaff, setLoggedInStaff] = useState<UnifiedUser | null>(null);
    const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
    
    const [services, setServices] = useState<Service[]>(SERVICES_DATA);
    const [users, setUsers] = useState<UnifiedUser[]>(MOCK_USERS);
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTION_PLANS_DATA);
    const [products, setProducts] = useState<Product[]>(PRODUCTS_DATA);
    const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS_DATA);
    const [serviceRecipes, setServiceRecipes] = useState<ServiceRecipe[]>(() => {
        let initialRecipes = getInitialState('serviceRecipes', [
            {
                id: 1,
                name: 'Receita de Coloração Exemplo',
                materials: [
                    { materialId: 3, quantity: 60 }, // Tinta Coloração 6.7 Chocolate
                    { materialId: 2, quantity: 90 }, // Oxigenada Cremosa 30 Vol
                ],
                yields: 1,
                additionalCostsPercentage: 20,
                safetyMarginPercentage: 2,
                desiredProfitMargin: 150,
                notes: 'Receita base para coloração de cabelo médio.',
                associatedServiceId: 3, // Link to 'Coloração Completa'
                durationInMinutes: 120,
            },
            {
                id: 2,
                name: 'Receita de Descoloração Leve',
                materials: [],
                yields: 1,
                additionalCostsPercentage: 15,
                safetyMarginPercentage: 2,
                desiredProfitMargin: 200,
                notes: 'Adicionar materiais conforme a necessidade do cliente.',
                durationInMinutes: 0,
            }
        ]);

        const serviceMap = new Map(SERVICES_DATA.map(s => [s.id, s]));

        // 1. Sincroniza as receitas existentes que estão associadas a um serviço do catálogo.
        // Isso garante que nomes, descrições e durações estejam sempre atualizados.
        const updatedRecipes = initialRecipes.map(recipe => {
            if (recipe.associatedServiceId && serviceMap.has(recipe.associatedServiceId)) {
                const service = serviceMap.get(recipe.associatedServiceId)!;
                return {
                    ...recipe,
                    name: service.name,
                    notes: service.description,
                    durationInMinutes: parseDurationToMinutes(service.duration)
                };
            }
            return recipe;
        });

        // 2. Adiciona receitas para serviços individuais do catálogo que ainda não têm uma.
        const recipesToAdd: ServiceRecipe[] = [];
        const existingRecipeServiceIds = new Set(updatedRecipes.map(r => r.associatedServiceId));

        SERVICES_DATA.forEach(service => {
            if ((!service.includesServiceIds || service.includesServiceIds.length === 0) && !existingRecipeServiceIds.has(service.id)) {
                recipesToAdd.push({
                    id: service.id + 100, // ID previsível para evitar colisões
                    name: service.name,
                    materials: [],
                    yields: 1,
                    additionalCostsPercentage: 10,
                    safetyMarginPercentage: 5,
                    desiredProfitMargin: 150,
                    notes: service.description,
                    associatedServiceId: service.id,
                    durationInMinutes: parseDurationToMinutes(service.duration),
                });
            }
        });

        // Retorna a lista combinada e totalmente sincronizada.
        return [...updatedRecipes, ...recipesToAdd];
    });
    
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: 1, name: 'Promoção de Outono', description: '20% de desconto em todos os serviços de coloração.', imageUrl: 'https://picsum.photos/seed/promo1/400/300', isActive: true, displayLocation: 'main' },
        { id: 2, name: 'Pacote Relaxamento', description: 'Massagem + Hidratação por um preço especial.', imageUrl: 'https://picsum.photos/seed/promo2/400/300', isActive: true, displayLocation: 'main' },
        { id: 3, name: 'Dia dos Pais', description: 'Traga seu pai e o corte dele é por nossa conta!', imageUrl: 'https://picsum.photos/seed/promo3/400/300', isActive: false, displayLocation: 'none' },
        { id: 4, name: 'Oferta Relâmpago!', description: 'Manicure e Pedicure com 15% OFF, só hoje!', imageUrl: 'https://picsum.photos/seed/promo4/400/300', isActive: true, displayLocation: 'floating' },
    ]);
    const [promoTexts, setPromoTexts] = useState<PromoText[]>([
        { id: 1, text: 'Agende seu horário online e ganhe 10% de desconto!', isActive: true },
        { id: 2, text: 'Conheça nossos novos pacotes de tratamento capilar.', isActive: true },
        { id: 3, text: 'Siga-nos no Instagram @anyhair para novidades.', isActive: false },
    ]);
    const [promoTextInterval, setPromoTextInterval] = useState(5);
    const [isFloatingWidgetEnabled, setIsFloatingWidgetEnabled] = useState(false);
    const [floatingWidgetPosition, setFloatingWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
    const [floatingWidgetSize, setFloatingWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [isTextOverlayEnabled, setIsTextOverlayEnabled] = useState(false);
    const [currentUserSubscriptionId, setCurrentUserSubscriptionId] = useState<number | null>(2); // Mock: user has plan 2
    const [financialSettings, setFinancialSettings] = useState<FinancialSettings>(() => getInitialState('financialSettings', {
        salaryPerEmployee: 3000,
        individualSalaries: {},
        fixedCosts: {
            rent: 7000,
            bills: 6000,
            products: 10000,
            marketing: 1000,
            accounting: 500,
            managementSystem: 500,
            maintenance: 1000,
            proLabore: 3000,
            fixedTaxes: 1000,
            depreciation: 500,
            others: 500,
        },
        socialChargesPercentage: 30,
        workDaysInMonth: 26,
        defaultCommission: 40,
        individualCommissions: {},
        planSafetyMargin: 15,
        cardFeePercentage: 4.5,
        taxOnServicesPercentage: 6,
    }));

    const [branding, setBranding] = useState<Branding>(() => {
// FIX: Explicitly type `initialBranding` as `any` to allow for backward-compatible addition of the `store` property for branding settings loaded from localStorage that may not have it. This resolves the TypeScript error where `store` was not found on the inferred type.
      const initialBranding: any = getInitialState('branding', {
        logoUrl: 'https://i.imgur.com/e9uj5Yx.png',
        logoSize: 64,
        logoPosition: 'left',
        logoVerticalOffset: 0,
        salonNameFirstPart: 'Any',
        salonNameSecondPart: 'Hair',
        headerTitleFirstPartStyle: { fontFamily: 'Prata', fontSize: 28, color: '#DB2777', fontWeight: '700', fontStyle: 'normal' },
        headerTitleSecondPartStyle: { fontFamily: 'Poppins', fontSize: 28, color: '#1F2937', fontWeight: '700', fontStyle: 'normal' },
        heroTitleFirstPartStyle: { fontFamily: 'Prata', fontSize: 72, color: '#FFFFFF', fontWeight: '700', fontStyle: 'normal' },
        heroTitleSecondPartStyle: { fontFamily: 'Poppins', fontSize: 72, color: '#FFFFFF', fontWeight: '700', fontStyle: 'normal' },
        heroSloganStyle: { fontFamily: 'Poppins', fontSize: 20, color: '#FCE7F3', fontWeight: '400', fontStyle: 'normal' },
        slogan: 'Onde a beleza e o estilo se encontram.',
        heroImageUrl: 'https://picsum.photos/seed/hero/1920/1080',
        colors: {
            primary: '#DB2777',
            secondary: '#FCE7F3',
            dark: '#1F2937',
            light: '#F8FAFC',
            accent: '#F472B6',
            inputBackground: '#1F2937',
        },
        isHeaderTransparent: false,
        headerBackgroundColor: '#FFFFFF',
        layout: {
            primaryFontFamily: 'Poppins',
            baseFontSize: 16,
            baseFontWeight: '400',
            baseFontStyle: 'normal',
            borderRadius: 8,
            sectionPaddingY: 16,
            containerMaxWidth: 1280,
            elementSpacing: 32,
            cardShadow: 'shadow-lg',
            pageTitle: { fontSize: 18, fontWeight: '700', fontStyle: 'normal' },
            sectionTitle: { fontSize: 40, fontWeight: '700', fontStyle: 'normal' },
            sectionSubtitle: { fontSize: 18, fontWeight: '700', fontStyle: 'normal' },
            cardTitle: { fontSize: 20, fontWeight: '700', fontStyle: 'normal' },
            cardBody: { fontSize: 14, fontWeight: '700', fontStyle: 'normal' },
            cardPrice: { fontSize: 14, fontWeight: '700', fontStyle: 'normal' },
            buttonText: { fontSize: 16, fontWeight: '700', fontStyle: 'normal' },
            bottomNavText: { fontSize: 12, fontWeight: '700', fontStyle: 'normal' },
            inputLabelText: { fontSize: 14, fontWeight: '700', fontStyle: 'normal' },
            inputText: { fontSize: 16, fontWeight: '700', fontStyle: 'normal' },
            footerText: { fontSize: 14, fontWeight: '700', fontStyle: 'normal' },
        }
    });

    // Ensure store settings exist, providing defaults if not
    if (!initialBranding.store) {
        initialBranding.store = {
            titleText: 'Nossa Loja',
            subtitleText: 'Leve a qualidade do Any Hair para casa. Produtos selecionados por nossos especialistas.',
            sectionTitle: initialBranding.layout.sectionTitle,
            sectionSubtitle: initialBranding.layout.sectionSubtitle,
            cardTitle: initialBranding.layout.cardTitle,
            cardDescription: initialBranding.layout.cardBody,
            cardPrice: initialBranding.layout.cardPrice,
            cardButtonText: initialBranding.layout.buttonText,
            colors: {
                sectionBg: initialBranding.colors.secondary,
                cardBg: '#FFFFFF',
                titleColor: initialBranding.colors.primary,
                priceColor: initialBranding.colors.dark,
                buttonBg: initialBranding.colors.primary,
                buttonTextColor: '#FFFFFF',
                buttonHoverBg: '#FFFFFF',
                buttonHoverTextColor: initialBranding.colors.primary,
            }
        };
    }

    return initialBranding;
});

    // Settings state with persistence from localStorage
    const [isMasterPasswordEnabled, setIsMasterPasswordEnabled] = useState<boolean>(() => getInitialState('isMasterPasswordEnabled', true));
    const [masterPassword, setMasterPassword] = useState<string>(() => getInitialState('masterPassword', 'admin123'));
    const [isPaymentMandatory, setIsPaymentMandatory] = useState<boolean>(() => getInitialState('isPaymentMandatory', false));
    const [isLoginRequiredForBooking, setIsLoginRequiredForBooking] = useState<boolean>(() => getInitialState('isLoginRequiredForBooking', false));
    const [serviceSelectionMode, setServiceSelectionMode] = useState<'single' | 'multiple'>(() => getInitialState('serviceSelectionMode', 'single'));
    const [suggestedSlotsCount, setSuggestedSlotsCount] = useState<number>(() => getInitialState('suggestedSlotsCount', 6));
    const [suggestedDatesCount, setSuggestedDatesCount] = useState<number>(() => getInitialState('suggestedDatesCount', 8));
    const [favoriteServiceIds, setFavoriteServiceIds] = useState<number[]>(() => getInitialState('favoriteServiceIds', []));
    const [reminders, setReminders] = useState<Reminder[]>(() => getInitialState('reminders', []));


    // Booking state moved from App.tsx
    const [selectedServices, setSelectedServices] = useState<Service[]>(() => {
        try {
            const saved = sessionStorage.getItem('booking_selectedServices');
            return saved ? JSON.parse(saved) : [];
        } catch {
            sessionStorage.removeItem('booking_selectedServices');
            return [];
        }
    });
    const [selectedProfessional, setSelectedProfessional] = useState<UnifiedUser | null>(() => {
        try {
            const saved = sessionStorage.getItem('booking_selectedProfessional');
            return saved ? JSON.parse(saved) : null;
        } catch {
            sessionStorage.removeItem('booking_selectedProfessional');
            return null;
        }
    });
    const [selectedDateTime, setSelectedDateTime] = useState<DateTimeSelection | null>(() => {
        try {
            const saved = sessionStorage.getItem('booking_selectedDateTime');
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            if (parsed && parsed.date) {
                parsed.date = new Date(parsed.date);
            }
            return parsed;
        } catch {
            sessionStorage.removeItem('booking_selectedDateTime');
            return null;
        }
    });

    // useEffects for sessionStorage moved from App.tsx
    useEffect(() => {
        sessionStorage.setItem('booking_selectedServices', JSON.stringify(selectedServices));
    }, [selectedServices]);

    useEffect(() => {
        if (selectedProfessional) {
            sessionStorage.setItem('booking_selectedProfessional', JSON.stringify(selectedProfessional));
        } else {
            sessionStorage.removeItem('booking_selectedProfessional');
        }
    }, [selectedProfessional]);

    useEffect(() => {
        if (selectedDateTime) {
            sessionStorage.setItem('booking_selectedDateTime', JSON.stringify(selectedDateTime));
        } else {
            sessionStorage.removeItem('booking_selectedDateTime');
        }
    }, [selectedDateTime]);
    
    // resetBooking function moved from App.tsx
    const resetBooking = useCallback(() => {
        setSelectedServices([]);
        setSelectedProfessional(null);
        setSelectedDateTime(null);
        sessionStorage.removeItem('booking_selectedServices');
        sessionStorage.removeItem('booking_selectedProfessional');
        sessionStorage.removeItem('booking_selectedDateTime');
    }, []);


    useEffect(() => {
        setFeatureFlags(getFeatureFlags());
        // Simulate a logged-in admin for the dashboard
        const superAdmin = MOCK_USERS.find(u => u.accessLevel === 'super_admin');
        if (superAdmin) {
            setLoggedInStaff(superAdmin);
        }
    }, []);

    useEffect(() => {
        const fontName = branding.layout.primaryFontFamily;
        if (fontName && fontName !== 'Poppins' && fontName !== 'Playfair Display') { // Don't reload default fonts
            const linkId = 'google-font-primary-link';
            const existingLink = document.getElementById(linkId);
            if (existingLink) {
                existingLink.remove();
            }
            
            const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;
            
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = fontUrl;
            
            document.head.appendChild(link);
        }
    }, [branding.layout.primaryFontFamily]);
    
    useEffect(() => {
        localStorage.setItem('branding', JSON.stringify(branding));

        const root = document.documentElement;
        // Colors
        root.style.setProperty('--color-primary', branding.colors.primary);
        root.style.setProperty('--color-secondary', branding.colors.secondary);
        root.style.setProperty('--color-dark', branding.colors.dark);
        root.style.setProperty('--color-light', branding.colors.light);
        root.style.setProperty('--color-accent', branding.colors.accent);
        root.style.setProperty('--color-input-bg', branding.colors.inputBackground);
        
        // Layout & Typography
        root.style.setProperty('--font-family-primary', branding.layout.primaryFontFamily);
        root.style.setProperty('--font-size-base', `${branding.layout.baseFontSize}px`);
        root.style.setProperty('--font-weight-base', branding.layout.baseFontWeight);
        root.style.setProperty('--font-style-base', branding.layout.baseFontStyle);
        root.style.setProperty('--border-radius-global', `${branding.layout.borderRadius}px`);
        root.style.setProperty('--section-padding-y', `${branding.layout.sectionPaddingY * 4}px`);
        root.style.setProperty('--container-max-width', `${branding.layout.containerMaxWidth}px`);
        root.style.setProperty('--element-spacing', `${branding.layout.elementSpacing}px`);
        root.style.setProperty('--font-size-button', `${branding.layout.buttonText.fontSize}px`);
        root.style.setProperty('--font-weight-button', branding.layout.buttonText.fontWeight);
        root.style.setProperty('--font-size-input-label', `${branding.layout.inputLabelText.fontSize}px`);
        root.style.setProperty('--font-weight-input-label', branding.layout.inputLabelText.fontWeight);
        root.style.setProperty('--font-size-input', `${branding.layout.inputText.fontSize}px`);
        root.style.setProperty('--font-weight-input', branding.layout.inputText.fontWeight);

    }, [branding]);

    // --- SETTINGS PERSISTENCE ---
    useEffect(() => { localStorage.setItem('isMasterPasswordEnabled', JSON.stringify(isMasterPasswordEnabled)); }, [isMasterPasswordEnabled]);
    useEffect(() => { localStorage.setItem('masterPassword', JSON.stringify(masterPassword)); }, [masterPassword]);
    useEffect(() => { localStorage.setItem('isPaymentMandatory', JSON.stringify(isPaymentMandatory)); }, [isPaymentMandatory]);
    useEffect(() => { localStorage.setItem('isLoginRequiredForBooking', JSON.stringify(isLoginRequiredForBooking)); }, [isLoginRequiredForBooking]);
    useEffect(() => { localStorage.setItem('serviceSelectionMode', JSON.stringify(serviceSelectionMode)); }, [serviceSelectionMode]);
    useEffect(() => { localStorage.setItem('suggestedSlotsCount', JSON.stringify(suggestedSlotsCount)); }, [suggestedSlotsCount]);
    useEffect(() => { localStorage.setItem('suggestedDatesCount', JSON.stringify(suggestedDatesCount)); }, [suggestedDatesCount]);
    useEffect(() => { localStorage.setItem('financialSettings', JSON.stringify(financialSettings)); }, [financialSettings]);
    useEffect(() => { localStorage.setItem('serviceRecipes', JSON.stringify(serviceRecipes)); }, [serviceRecipes]);
    useEffect(() => { localStorage.setItem('favoriteServiceIds', JSON.stringify(favoriteServiceIds)); }, [favoriteServiceIds]);
    useEffect(() => { localStorage.setItem('reminders', JSON.stringify(reminders)); }, [reminders]);


    const value = useMemo(() => ({
        currentUser, setCurrentUser,
        loggedInStaff, setLoggedInStaff,
        featureFlags, setFeatureFlags,
        services, setServices,
        users, setUsers,
        clients, setClients,
        appointments, setAppointments,
        campaigns, setCampaigns,
        promoTexts, setPromoTexts,
        promoTextInterval, setPromoTextInterval,
        isFloatingWidgetEnabled, setIsFloatingWidgetEnabled,
        floatingWidgetPosition, setFloatingWidgetPosition,
        floatingWidgetSize, setFloatingWidgetSize,
        isTextOverlayEnabled, setIsTextOverlayEnabled,
        branding, setBranding,
        isMasterPasswordEnabled, setIsMasterPasswordEnabled,
        masterPassword, setMasterPassword,
        isPaymentMandatory, setIsPaymentMandatory,
        isLoginRequiredForBooking, setIsLoginRequiredForBooking,
        serviceSelectionMode, setServiceSelectionMode,
        suggestedSlotsCount, setSuggestedSlotsCount,
        suggestedDatesCount, setSuggestedDatesCount,
        selectedServices, setSelectedServices,
        selectedProfessional, setSelectedProfessional,
        selectedDateTime, setSelectedDateTime,
        currentUserSubscriptionId, setCurrentUserSubscriptionId,
        subscriptionPlans, setSubscriptionPlans,
        financialSettings, setFinancialSettings,
        products, setProducts,
        materials, setMaterials,
        serviceRecipes, setServiceRecipes,
        favoriteServiceIds, setFavoriteServiceIds,
        reminders, setReminders,
        resetBooking,
    }), [
        currentUser, loggedInStaff, featureFlags, services, users, clients, appointments, campaigns,
        promoTexts, promoTextInterval, isFloatingWidgetEnabled,
        floatingWidgetPosition, floatingWidgetSize, isTextOverlayEnabled, branding,
        isMasterPasswordEnabled, masterPassword, isPaymentMandatory, isLoginRequiredForBooking,
        serviceSelectionMode, suggestedSlotsCount, suggestedDatesCount,
        selectedServices, selectedProfessional, selectedDateTime, resetBooking,
        currentUserSubscriptionId, subscriptionPlans, financialSettings, products, materials, serviceRecipes,
        favoriteServiceIds, reminders
    ]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};