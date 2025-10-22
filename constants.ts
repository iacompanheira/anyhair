import type { Service, UnifiedUser, SubscriptionPlan, Product, Material } from './types';
import { getMockNow } from './utils/dateUtils';

export const SERVICES_DATA: Service[] = [
  {
    id: 1,
    name: 'Corte Feminino',
    description: 'Renove seu visual com um corte moderno e personalizado, realçando sua beleza natural.',
    price: 'R$ 79,90',
    duration: '60 min',
    imageUrl: 'https://picsum.photos/seed/cortefeminino/400/300',
    isPriceHidden: false,
    icon: 'fas fa-cut',
    productCost: 2.50,
    isVisibleInCatalog: true,
    isEssential: true,
  },
  {
    id: 2,
    name: 'Escova Progressiva',
    description: 'Alisamento perfeito e duradouro, com produtos de alta qualidade para um cabelo liso e sem frizz.',
    price: 'R$ 349,90',
    duration: '180 min',
    imageUrl: 'https://picsum.photos/seed/progressiva/400/300',
    isPriceHidden: false,
    icon: 'fas fa-stream',
    productCost: 20.00,
    isVisibleInCatalog: true,
    isEssential: true,
  },
  {
    id: 3,
    name: 'Coloração Completa',
    description: 'Cobertura total dos fios ou mudança de cor, utilizando técnicas e produtos que protegem e dão brilho.',
    price: 'R$ 159,90',
    duration: '120 min',
    imageUrl: 'https://picsum.photos/seed/coloracao/400/300',
    isPriceHidden: false,
    icon: 'fas fa-paint-brush',
    productCost: 15.00,
    isVisibleInCatalog: true,
    isEssential: true,
  },
  {
    id: 4,
    name: 'Manicure & Pedicure',
    description: 'Cuidado completo para suas mãos e pés, com esmaltação impecável e hidratação.',
    price: 'R$ 69,90',
    duration: '90 min',
    imageUrl: 'https://picsum.photos/seed/manicure/400/300',
    isPriceHidden: false,
    includesServiceIds: [7, 8],
    icon: 'fas fa-hand-sparkles',
    productCost: 3.50,
    isVisibleInCatalog: true,
    isEssential: true,
  },
  {
    id: 5,
    name: 'Hidratação Profunda',
    description: 'Tratamento intensivo para restaurar a saúde e a maciez dos seus cabelos.',
    price: 'R$ 69,90',
    duration: '45 min',
    imageUrl: 'https://picsum.photos/seed/hidratacao/400/300',
    isPriceHidden: false,
    icon: 'fas fa-tint',
    productCost: 8.00,
    isVisibleInCatalog: true,
    isEssential: false,
  },
  {
    id: 6,
    name: 'Design de Sobrancelha',
    description: 'Modelagem e alinhamento das sobrancelhas para harmonizar e valorizar o seu olhar.',
    price: 'R$ 59,90',
    duration: '30 min',
    imageUrl: 'https://picsum.photos/seed/sobrancelha/400/300',
    isPriceHidden: false,
    icon: 'fas fa-eye',
    productCost: 1.00,
    isVisibleInCatalog: true,
    isEssential: false,
  },
  {
    id: 7,
    name: 'Manicure',
    description: 'Cuidado para suas mãos, com esmaltação impecável e hidratação.',
    price: 'R$ 49,90',
    duration: '45 min',
    imageUrl: 'https://picsum.photos/seed/manicure_solo/400/300',
    isPriceHidden: false,
    icon: 'fas fa-hand-paper',
    productCost: 1.50,
    isVisibleInCatalog: true,
    isEssential: false,
  },
  {
    id: 8,
    name: 'Pedicure',
    description: 'Cuidado para seus pés, com esmaltação impecável e hidratação.',
    price: 'R$ 49,90',
    duration: '45 min',
    imageUrl: 'https://picsum.photos/seed/pedicure_solo/400/300',
    isPriceHidden: false,
    icon: 'fas fa-shoe-prints',
    productCost: 2.00,
    isVisibleInCatalog: true,
    isEssential: false,
  },
  {
    id: 9,
    name: 'Escova Simples',
    description: 'Modelagem dos fios com secador para um look polido e elegante.',
    price: 'R$ 59,90',
    duration: '45 min',
    imageUrl: 'https://picsum.photos/seed/escova/400/300',
    isPriceHidden: false,
    icon: 'fas fa-wind',
    productCost: 3.00,
    isVisibleInCatalog: true,
    isEssential: false,
  }
];

export const PRODUCTS_DATA: Product[] = [
  { id: 1, name: 'Shampoo Hidratante', description: 'Para cabelos secos e danificados. 250ml.', price: 45.90, imageUrl: 'https://picsum.photos/seed/shampoo/400/400', stock: 50, minimumStock: 10, isFeatured: true },
  { id: 2, name: 'Condicionador Nutritivo', description: 'Restaura a maciez e o brilho. 250ml.', price: 49.90, imageUrl: 'https://picsum.photos/seed/condicionador/400/400', stock: 8, minimumStock: 10, isBestseller: true },
  { id: 3, name: 'Máscara de Reparação', description: 'Tratamento intensivo semanal. 200g.', price: 79.90, promotionalPrice: 69.90, imageUrl: 'https://picsum.photos/seed/mascara/400/400', stock: 30, minimumStock: 15, isNew: true },
  { id: 4, name: 'Óleo Finalizador', description: 'Controle de frizz e brilho extra. 50ml.', price: 89.90, imageUrl: 'https://picsum.photos/seed/oleo/400/400', stock: 60, minimumStock: 20, isFeatured: true },
  { id: 5, name: 'Protetor Térmico', description: 'Protege os fios do calor do secador e chapinha. 150ml.', price: 65.00, imageUrl: 'https://picsum.photos/seed/protetor/400/400', stock: 40, minimumStock: 15 },
  { id: 6, name: 'Sérum Noturno', description: 'Tratamento noturno para pontas duplas. 30ml.', price: 99.90, imageUrl: 'https://picsum.photos/seed/serum/400/400', stock: 25, minimumStock: 5 },
];

export const MOCK_MATERIALS_DATA: Material[] = [
  { id: 1, name: 'Pó Descolorante Super Clareador', price: 89.90, contentValue: 500, contentUnit: 'g', servicesYield: 25, currentStock: 10, minimumStock: 5 },
  { id: 2, name: 'Oxigenada Cremosa 30 Vol', price: 15.50, contentValue: 900, contentUnit: 'mL', servicesYield: 30, currentStock: 8, minimumStock: 10 },
  { id: 3, name: 'Tinta Coloração 6.7 Chocolate', price: 22.00, contentValue: 60, contentUnit: 'g', servicesYield: 1, currentStock: 50, minimumStock: 20 },
  { id: 4, name: 'Shampoo Hidratante Profissional (5L)', price: 120.00, contentValue: 5000, contentUnit: 'mL', servicesYield: 500, currentStock: 3, minimumStock: 2 },
  { id: 5, name: 'Máscara de Reconstrução (1Kg)', price: 150.00, contentValue: 1000, contentUnit: 'g', servicesYield: 100, currentStock: 5, minimumStock: 5 },
  { id: 6, name: 'Luvas Descartáveis (Caixa c/ 100 un)', price: 35.00, contentValue: 100, contentUnit: 'Unidades', servicesYield: 50, currentStock: 15, minimumStock: 10 },
  { id: 7, name: "Shampoo Profissional (Pré-Lavagem)", price: 120.00, contentValue: 1000, contentUnit: "mL", servicesYield: 57, currentStock: 12, minimumStock: 8 },
  { id: 8, name: "Máscara de Hidratação Concentrada", price: 800.00, contentValue: 500, contentUnit: "g", servicesYield: 25, currentStock: 2, minimumStock: 4 },
  { id: 9, name: "Condicionador/Selador", price: 90.00, contentValue: 1000, contentUnit: "mL", servicesYield: 80, currentStock: 10, minimumStock: 10 },
  { id: 10, name: "Protetor Térmico/Leave-in", price: 150.00, contentValue: 300, contentUnit: "mL", servicesYield: 60, currentStock: 25, minimumStock: 15 },
  { id: 11, name: "Touca Térmica Descartável (Unidade)", price: 1.50, contentValue: 1, contentUnit: "Unidades", servicesYield: 1, currentStock: 200, minimumStock: 100 },
  { id: 12, name: "Toalhas Descartáveis (Unidade)", price: 0.80, contentValue: 1, contentUnit: "Unidades", servicesYield: 1, currentStock: 500, minimumStock: 250 },
  { id: 13, name: "Shampoo Profissional (Galão de Lavatório)", price: 80.00, contentValue: 5000, contentUnit: "mL", servicesYield: 333, currentStock: 5, minimumStock: 3 },
  { id: 14, name: "Condicionador Profissional (Galão de Lavatório)", price: 90.00, contentValue: 5000, contentUnit: "mL", servicesYield: 500, currentStock: 2, minimumStock: 3 },
  { id: 15, name: "Máscara de Hidratação (Pote Grande)", price: 180.00, contentValue: 1000, contentUnit: "g", servicesYield: 50, currentStock: 8, minimumStock: 5 },
  { id: 16, name: "Finalizador / Leave-in (500ml)", price: 100.00, contentValue: 500, contentUnit: "mL", servicesYield: 100, currentStock: 15, minimumStock: 10 },
  { id: 17, name: "Protetor Térmico (Spray ou Creme)", price: 120.00, contentValue: 300, contentUnit: "mL", servicesYield: 100, currentStock: 10, minimumStock: 10 },
  { id: 18, name: "Tinta de Coloração Profissional (Tubo)", price: 35.00, contentValue: 60, contentUnit: "g", servicesYield: 1, currentStock: 100, minimumStock: 40 },
  { id: 19, name: "Pó Descolorante (500g)", price: 120.00, contentValue: 500, contentUnit: "g", servicesYield: 16, currentStock: 6, minimumStock: 8 },
  { id: 20, name: "Água Oxigenada (OX) 900ml", price: 30.00, contentValue: 900, contentUnit: "mL", servicesYield: 10, currentStock: 20, minimumStock: 15 },
  { id: 21, name: "Neutralizante / Estabilizador Pós-Química", price: 90.00, contentValue: 1000, contentUnit: "mL", servicesYield: 33, currentStock: 5, minimumStock: 5 },
  { id: 22, name: "Luvas Descartáveis (Par)", price: 0.35, contentValue: 1, contentUnit: "Unidades", servicesYield: 1, currentStock: 400, minimumStock: 200 },
  { id: 23, name: "Touca Descartável (Unidade)", price: 0.15, contentValue: 1, contentUnit: "Unidades", servicesYield: 1, currentStock: 150, minimumStock: 100 },
  { id: 24, name: "Papel Alumínio (Folha)", price: 0.20, contentValue: 1, contentUnit: "Unidades", servicesYield: 1, currentStock: 300, minimumStock: 150 },
];

export const INITIAL_SUBSCRIPTION_PLANS_DATA: SubscriptionPlan[] = [
  {
    id: 4,
    name: 'Plano Unhas Perfeitas',
    price: 69,
    period: 'mês',
    features: [
      '4 Manicures por mês',
      '2 Pedicures por mês',
      '5% de desconto em outros serviços'
    ],
    includedServices: [
      { serviceId: 7, quantity: 4 },
      { serviceId: 8, quantity: 2 },
    ],
    discountPercentage: 5,
  },
  {
    id: 1,
    name: 'Plano Essencial',
    price: 79,
    period: 'mês',
    features: [
      '2 Manicures por mês',
      '1 Pedicure por mês',
      '1 Design de Sobrancelha por mês',
      '5% de desconto em outros serviços'
    ],
    includedServices: [
      { serviceId: 7, quantity: 2 },
      { serviceId: 8, quantity: 1 },
      { serviceId: 6, quantity: 1 },
    ],
    discountPercentage: 5,
  },
  {
    id: 2,
    name: 'Plano Completo',
    price: 129,
    originalPrice: 149,
    period: 'mês',
    features: [
      '4 Manicures por mês',
      '2 Pedicures por mês',
      '2 Escovas Simples por mês',
      '1 Hidratação Profunda por mês',
      '10% de desconto em outros serviços'
    ],
    includedServices: [
      { serviceId: 7, quantity: 4 },
      { serviceId: 8, quantity: 2 },
      { serviceId: 9, quantity: 2 },
      { serviceId: 5, quantity: 1 },
    ],
    isPopular: true,
    discountPercentage: 10,
  },
  {
    id: 3,
    name: 'Plano Premium',
    price: 199,
    originalPrice: 229,
    period: 'mês',
    features: [
      'Tudo do Plano Completo',
      '+ 1 Corte Feminino por mês',
      '+ 1 Coloração Mensal',
      '15% de desconto em outros serviços'
    ],
    includedServices: [
      { serviceId: 7, quantity: 4 },
      { serviceId: 8, quantity: 2 },
      { serviceId: 9, quantity: 2 },
      { serviceId: 5, quantity: 1 },
      { serviceId: 1, quantity: 1 },
      { serviceId: 3, quantity: 1 },
    ],
    discountPercentage: 15,
  },
  {
    id: 5,
    name: 'Plano Diamante',
    price: 249,
    period: 'mês',
    features: [
      '4 Manicures por mês',
      '4 Pedicures por mês',
      '1 Corte Feminino por mês',
      '1 Coloração Completa por mês',
      '4 Escovas Simples por mês',
      '20% de desconto em outros serviços'
    ],
    includedServices: [
      { serviceId: 7, quantity: 4 },
      { serviceId: 8, quantity: 4 },
      { serviceId: 1, quantity: 1 },
      { serviceId: 3, quantity: 1 },
      { serviceId: 9, quantity: 4 },
    ],
    discountPercentage: 20,
  }
];

const ALL_SERVICE_IDS = SERVICES_DATA.map(s => s.id);

export const MOCK_USERS: UnifiedUser[] = [
    // Super Admin
    { 
        id: 101, 
        name: 'Admin Principal', 
        email: 'admin@anyhair.com', 
        imageUrl: 'https://i.imgur.com/3Doa26k.png', 
        accessLevel: 'super_admin',
        isEnabled: true,
    },
    // Admins
    { 
        id: 102, 
        name: 'Gerente da Manhã', 
        email: 'gerente.manha@anyhair.com', 
        imageUrl: 'https://i.imgur.com/3Doa26k.png', 
        accessLevel: 'admin', 
        serviceIds: [1, 5], // An admin can also be a professional
        isEnabled: true,
    },
    { 
        id: 103, 
        name: 'Gerente da Tarde', 
        email: 'gerente.tarde@anyhair.com', 
        imageUrl: 'https://i.imgur.com/3Doa26k.png', 
        accessLevel: 'admin',
        isEnabled: true, 
    },
    // Professionals
    {
        id: 1,
        name: 'Gabriel Fonseca',
        email: 'gabriel.f@anyhair.com',
        specialty: 'Cabeleireiro',
        imageUrl: 'https://picsum.photos/seed/pro1/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 2,
        isEnabled: true,
        birthdate: '1990-10-25',
    },
    {
        id: 2,
        name: 'Rafael Evangelista',
        email: 'rafael.e@anyhair.com',
        specialty: 'Estilista Capilar',
        imageUrl: 'https://picsum.photos/seed/pro2/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 1,
        isEnabled: true,
        birthdate: '1988-11-12',
    },
    {
        id: 3,
        name: 'João Calmon',
        email: 'joao.c@anyhair.com',
        specialty: 'Manicure & Designer',
        imageUrl: 'https://picsum.photos/seed/pro3/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 3,
        isEnabled: true,
        birthdate: '1995-10-05',
    },
    {
        id: 4,
        name: 'Camila Souza',
        email: 'camila.s@anyhair.com',
        specialty: 'Maquiadora',
        imageUrl: 'https://picsum.photos/seed/pro4/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 4,
        isEnabled: true,
    },
    {
        id: 5,
        name: 'Bruno Alves',
        email: 'bruno.a@anyhair.com',
        specialty: 'Barbeiro',
        imageUrl: 'https://picsum.photos/seed/pro5/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 5,
        isEnabled: true,
    },
    {
        id: 6,
        name: 'Juliana Ribeiro',
        email: 'juliana.r@anyhair.com',
        specialty: 'Esteticista',
        imageUrl: 'https://picsum.photos/seed/pro6/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 6,
        isEnabled: true,
    },
    {
        id: 7,
        name: 'Lucas Martins',
        email: 'lucas.m@anyhair.com',
        specialty: 'Colorista',
        imageUrl: 'https://picsum.photos/seed/pro7/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 7,
        isEnabled: true,
    },
    {
        id: 8,
        name: 'Fernanda Lima',
        email: 'fernanda.l@anyhair.com',
        specialty: 'Penteados e Estilo',
        imageUrl: 'https://picsum.photos/seed/pro8/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 8,
        isEnabled: true,
    },
    {
        id: 9,
        name: 'Marcos Costa',
        email: 'marcos.c@anyhair.com',
        specialty: 'Terapeuta Capilar',
        imageUrl: 'https://picsum.photos/seed/pro9/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 9,
        isEnabled: true,
    },
    {
        id: 10,
        name: 'Larissa Gomes',
        email: 'larissa.g@anyhair.com',
        specialty: 'Especialista em Unhas',
        imageUrl: 'https://picsum.photos/seed/pro10/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 10,
        isEnabled: true,
    },
    {
        id: 11,
        name: 'Thiago Pereira',
        email: 'thiago.p@anyhair.com',
        specialty: 'Barbeiro Especialista',
        imageUrl: 'https://picsum.photos/seed/pro11/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 11,
        isEnabled: true,
    },
    {
        id: 12,
        name: 'Beatriz Oliveira',
        email: 'beatriz.o@anyhair.com',
        specialty: 'Colorista e Química',
        imageUrl: 'https://picsum.photos/seed/pro12/400/400',
        serviceIds: ALL_SERVICE_IDS,
        accessLevel: 'professional',
        displayOrder: 12,
        isEnabled: true,
    }
];

// For the booking flow, we need a list of professionals including the "no preference" option
export const PROFESSIONALS_FOR_BOOKING: UnifiedUser[] = [
    {
        id: 0,
        name: 'Sem preferência',
        specialty: 'Você será atendido por um profissional disponível.',
        imageUrl: 'https://i.imgur.com/S6qjE6h.png',
        accessLevel: 'professional',
        serviceIds: [],
        isEnabled: true,
    },
    ...MOCK_USERS.filter(u => u.accessLevel === 'professional').sort((a,b) => (a.displayOrder || 99) - (b.displayOrder || 99))
];

const generateDynamicAvailability = (): Record<number, Record<string, string[]>> => {
  const availability: Record<number, Record<string, string[]>> = {};
  const today = getMockNow();
  today.setHours(0, 0, 0, 0);

  const professionals = MOCK_USERS.filter(u => u.accessLevel === 'professional');

  professionals.forEach(pro => {
    availability[pro.id] = {};
    for (let i = 0; i < 90; i++) { // Generate for the next 90 days
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      // Simple logic: professionals have different days off
      const dayOfWeek = date.getDay();
      if (pro.id % 3 === dayOfWeek % 3) { // pseudo-random day off
        continue;
      }
      
      // Generate some random slots
      const slots = new Set<string>();
      const numSlots = 8 + Math.floor(Math.random() * 8); // 8 to 15 slots per day
      for (let j = 0; j < numSlots; j++) {
        const hour = 8 + Math.floor(Math.random() * 12); // 8 AM to 7 PM
        const minute = Math.random() > 0.5 ? 30 : 0;
        slots.add(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      }
      availability[pro.id][dateKey] = Array.from(slots).sort();
    }
  });

  return availability;
};

export const MOCK_AVAILABILITY = generateDynamicAvailability();