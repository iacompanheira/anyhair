import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import type { Branding, TitlePartStyle, LayoutSettings, FontStyleControl, Service, FinancialSettings, UnifiedUser, ServiceRecipe } from '../../types';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { HelpTooltip } from '../../components/ui/HelpTooltip';
import { formatCurrency } from '../../utils/formatters';

// --- ICONS (MERGED FROM BOTH FILES) ---
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const ImageUploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const TrashIconForImage: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>;
const AlertIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.85-1.21 3.486 0l5.58 10.622c.636 1.21-.462 2.779-1.743 2.779H4.42c-1.281 0-2.379-1.569-1.743-2.779L8.257 3.099zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PencilIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const FONT_LIST = [ 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro', 'Oswald', 'Raleway', 'Nunito', 'Merriweather', 'Playfair Display', 'Lora', 'PT Sans', 'Slabo 27px', 'Ubuntu', 'Arimo', 'Noto Sans', 'Fira Sans', 'Work Sans', 'Quicksand', 'Dosis', 'Josefin Sans', 'Inconsolata', 'Pacifico', 'Lobster', 'Caveat', 'Dancing Script', 'Shadows Into Light', 'Bebas Neue', 'Anton', 'Yanone Kaffeesatz', 'Comfortaa', 'Exo 2', 'Teko', 'Archivo', 'Crimson Text', 'Cabin', 'Karla', 'Rubik', 'Inter', 'Barlow', 'Mukta', 'Heebo', 'Kanit', 'Titillium Web', 'Manrope', 'DM Sans', 'Public Sans', 'Space Grotesk', 'Syne' ];
const FONT_WEIGHTS = [ { value: '300', label: 'Leve (300)'}, { value: '400', label: 'Normal (400)'}, { value: '500', label: 'Médio (500)'}, { value: '600', label: 'Semi-negrito (600)'}, { value: '700', label: 'Negrito (700)'}, { value: '800', label: 'Extra-negrito (800)'}, { value: '900', label: 'Preto (900)'}, ];

const DEFAULT_PROJECT_COLORS = {
  name: 'Padrão do Projeto',
  colors: [
    '#DB2777',
    '#FCE7F3',
    '#F472B6',
    '#1F2937',
    '#F8FAFC',
    '#1F2937',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#6B7280'
  ]
};

const REPORT_COLORS = [
    '#8b5cf6', '#f59e0b', '#6366f1', '#3b82f6', '#a855f7', '#ec4899',
    '#ef4444', '#f43f5e', '#d946ef', '#c026d3', '#be185d', '#9d174d',
    '#dc2626', '#b91c1c', '#991b1b', '#f97316', '#ea580c', '#c2410c',
    '#eab308', '#ca8a04', '#a16207', '#f59f00', '#e67700', '#10b981',
    '#22c55e', '#16a34a', '#15803d', '#84cc16', '#65a30d', '#4d7c0f',
    '#06b6d4', '#0891b2', '#0e7490', '#20c997', '#099268', '#0ea5e9',
    '#0284c7', '#0369a1', '#4f46e5', '#4338ca', '#1d4ed8', '#1e3a8a',
    '#1e40af', '#9333ea', '#7e22ce', '#6d28d9', '#5b21b6', '#4c1d95',
    '#862e9c', '#5f0f40', '#64748b', '#475569', '#334155', '#71717a',
    '#52525b', '#ff6b6b', '#48dbfb', '#ff9f43', '#1dd1a1', '#feca57',
    '#54a0ff', '#5f27cd', '#ff6b81', '#00d2d3', '#ff9f1c', '#ffc312',
    '#c7ecee', '#e056fd', '#7ed6df', '#ff7f50', '#6a89cc', '#b8e994',
    '#f6e58d', '#badc58', '#ffbe76', '#eccc68', '#ff7979', '#f8a5c2',
    '#63cdda', '#30336b', '#130f40', '#eb4d4b', '#6ab04c', '#f9ca24',
    '#f0932b', '#be2edd', '#22a6b3', '#40407a', '#2c2c54', '#ff5e57',
    '#4834d4', '#009432', '#006266', '#1B1464', '#5758BB', '#01a3a4',
    '#ffc5d9', '#d1ccc0'
];

const uniqueReportColors = [...new Set(REPORT_COLORS)];

const newPaletteNames = [
    "Mix Elétrico de Roxo, Laranja e Pink",
    "Cores de Pôr do Sol e Outono Intenso",
    "Tons de Verde Terroso e Cítrico",
    "Paleta Oceânica de Azuis e Turquesas",
    "Tons Noturnos de Azul Royal e Violeta",
    "Neutros Modernos com Destaques Vibrantes",
    "Cores Doces e Divertidas (Candy)",
    "Paleta Pastel com Contraste Profundo",
    "Cores Sólidas com Tinta Escura",
    "Joias Escuras com Toques de Pastel",
    "Harmonia Cítrica e Aquática",
    "Tons de Especiarias e Terra",
];

const newPalettesFromReports: { name: string, colors: string[] }[] = [];
for (let i = 0; i < uniqueReportColors.length; i += 10) {
    const paletteIndex = Math.floor(i / 10);
    const chunk = uniqueReportColors.slice(i, i + 10);
    if (chunk.length > 0 && newPalettesFromReports.length < 14) { // Generate 14 new palettes
      newPalettesFromReports.push({
        name: newPaletteNames[paletteIndex] || `Grupo ${7 + paletteIndex}: Combinação de Cores ${paletteIndex + 1}`,
        colors: chunk.length < 10 ? chunk.concat(uniqueReportColors.slice(0, 10 - chunk.length)) : chunk
      });
    }
}

const PALETTES = [
    DEFAULT_PROJECT_COLORS,
    { name: 'Grupo 1: Tons Quentes de Vermelho, Rosa e Laranja (Vibrantes)', colors: ['#fc325b', '#fa7f4b', '#c72546', '#fe6c63', '#240910', '#240910', '#d2887f', '#a8665f', '#7f443f', '#552220'] },
    { name: 'Grupo 2: Tons de Laranja e Amarelo (Outono e Terrosos)', colors: ['#df8615', '#f84600', '#f6b149', '#f8572d', '#df2a33', '#6b312d', '#f19601', '#f21f26', '#ebc83a', '#a22543'] },
    { name: 'Grupo 3: Tons Neutros e Terrosos (Sóbrios)', colors: ['#a68c69', '#f0e5c9', '#c5bc8e', '#36393b', '#f4f4f4', '#36393b', '#696758', '#45484b', '#594433', '#66424c'] },
    { name: 'Grupo 4: Tons de Verde e Ciano (Frios)', colors: ['#519548', '#b3c262', '#88c425', '#24434b', '#EAFDE6', '#24434b', '#bfbc84', '#63997a', '#9ba657', '#768a4f'] },
    { name: 'Grupo 5: Tons de Azul, Verde Pastel e Bege (Mistos)', colors: ['#7375a5', '#d4f1db', '#73b295', '#251819', '#F0F0D8', '#251819', '#21a3a3', '#13c8b5', '#6cf3d5', '#2b364a'] },
    { name: 'Grupo 6: Tons Claros, Terrosos e Frios Restantes', colors: ['#57c5c7', '#dddd92', '#00b5b9', '#463a2a', '#eafde6', '#463a2a', '#5c4b37', '#7a8370', '#f2502c', '#d8d8c0'] },
    ...newPalettesFromReports,
];


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ColorInput: React.FC<{ label: string; description: string; value: string; onChange: (value: string) => void; isActive: boolean; onActivate: () => void; }> = ({ label, description, value, onChange, isActive, onActivate }) => (
    <div
        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${isActive ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-pink-50' : 'border-gray-200 bg-gray-50'}`}
        onClick={onActivate}
    >
        <div className="flex justify-between items-start">
            <div>
                <label className="font-semibold text-gray-800 flex items-center gap-2">
                    {label}
                    <HelpTooltip text={description} />
                </label>
            </div>
            <div className="flex items-center gap-2 border border-gray-300 bg-white rounded-lg px-2">
                <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 bg-transparent border-none cursor-pointer" onFocus={onActivate} />
                <input type="text" value={value} onChange={e => onChange(e.target.value)} className="font-mono text-sm p-1 w-20 outline-none" onFocus={onActivate} />
            </div>
        </div>
    </div>
);

const TitleStyleEditor: React.FC<{ style: TitlePartStyle, onStyleChange: (field: keyof TitlePartStyle, value: any) => void }> = ({ style, onStyleChange }) => (
    <div className="space-y-4 p-4 rounded-lg border bg-gray-50">
        <div>
            <label className="text-xs text-gray-600">Fonte</label>
            <select value={style.fontFamily} onChange={e => onStyleChange('fontFamily', e.target.value)} className="select-dark text-sm w-full mt-1">
                {FONT_LIST.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
        </div>
        <div>
            <label className="text-xs text-gray-600">Tamanho da Fonte</label>
            <div className="flex items-center gap-2">
                <input type="range" min="10" max="120" value={style.fontSize} onChange={e => onStyleChange('fontSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-center text-gray-800 w-16">{style.fontSize}px</span>
            </div>
        </div>
        <div>
            <label className="text-xs text-gray-600">Peso da Fonte</label>
            <select value={style.fontWeight} onChange={e => onStyleChange('fontWeight', e.target.value)} className="select-dark text-sm w-full mt-1">
                {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
        </div>
        <div>
             <label className="text-xs text-gray-600">Estilo e Cor</label>
             <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => onStyleChange('fontStyle', 'normal')} className={`px-3 py-1.5 rounded-md border text-sm font-semibold transition-colors flex-1 ${style.fontStyle === 'normal' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>Normal</button>
                <button type="button" onClick={() => onStyleChange('fontStyle', 'italic')} className={`px-3 py-1.5 rounded-md border text-sm italic transition-colors flex-1 ${style.fontStyle === 'italic' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>Itálico</button>
                <input type="color" value={style.color} onChange={e => onStyleChange('color', e.target.value)} className="w-10 h-9 p-1 bg-transparent border border-gray-300 rounded-md cursor-pointer" />
            </div>
        </div>
    </div>
);

const FontStyleEditor: React.FC<{ label: string, style: FontStyleControl, onStyleChange: (field: keyof FontStyleControl, value: any) => void }> = ({ label, style, onStyleChange }) => {
    return (
        <div className="p-4 rounded-lg border bg-gray-50">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-600">Tamanho da Fonte</label>
                    <div className="flex items-center gap-2">
                        <input type="range" min="10" max="72" value={style.fontSize} onChange={e => onStyleChange('fontSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                        <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-center text-gray-800 w-14">{style.fontSize}px</span>
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-600">Peso da Fonte</label>
                    <select value={style.fontWeight} onChange={e => onStyleChange('fontWeight', e.target.value)} className="select-dark text-sm w-full mt-1">
                        {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                </div>

                <div>
                     <label className="text-xs text-gray-600">Estilo da Fonte</label>
                     <div className="flex items-center gap-2 mt-1">
                        <button
                            type="button"
                            onClick={() => onStyleChange('fontStyle', 'normal')}
                            className={`px-3 py-1.5 rounded-md border text-sm font-semibold transition-colors flex-1 ${style.fontStyle === 'normal' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                        >Normal</button>
                         <button
                            type="button"
                            onClick={() => onStyleChange('fontStyle', 'italic')}
                            className={`px-3 py-1.5 rounded-md border text-sm italic transition-colors flex-1 ${style.fontStyle === 'italic' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                        >Itálico</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-6 text-left">
            <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
            <ChevronDownIcon className={isOpen ? 'rotate-180' : ''} />
        </button>
        {isOpen && (
            <div className="p-6 pt-0 animate-fade-in-down">
                {children}
            </div>
        )}
    </div>
);

const ServiceEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Service) => void;
    serviceToEdit: Service | null;
}> = ({ isOpen, onClose, onSave, serviceToEdit }) => {
    const [draft, setDraft] = useState<Service | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (serviceToEdit) {
            setDraft({ ...serviceToEdit });
        }
        setImageFile(null); // Reset file on open
    }, [serviceToEdit]);

    useEffect(() => {
        const blobUrl = draft?.imageUrl;
        return () => {
            if (blobUrl && blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [draft?.imageUrl]);

    if (!isOpen || !draft) return null;

    const handleChange = (field: keyof Service, value: any) => {
        setDraft(prev => (prev ? { ...prev, [field]: value } : null));
    };
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (draft.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(draft.imageUrl);
            }
            setImageFile(file);
            handleChange('imageUrl', URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        if (draft.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.imageUrl);
        }
        setImageFile(null);
        handleChange('imageUrl', '');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draft) return;
        
        let finalDraft = { ...draft };
        if (imageFile) {
            finalDraft.imageUrl = await fileToBase64(imageFile);
        }

        onSave(finalDraft);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">Editar Apresentação do Serviço</h3></header>
                <form onSubmit={handleSave}>
                    <main className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div><label className="input-label-layout">Nome do Serviço</label><input type="text" value={draft.name} onChange={e => handleChange('name', e.target.value)} required className="input-dark mt-1"/></div>
                        <div><label className="input-label-layout">Descrição</label><textarea value={draft.description} onChange={e => handleChange('description', e.target.value)} required className="textarea-dark mt-1" rows={3}/></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label-layout flex items-center gap-2">
                                    Preço
                                    <HelpTooltip text="O preço final é definido na tela Financeira, na seção de precificação de serviços." />
                                </label>
                                <input type="text" value={draft.price.replace('R$ ', '')} readOnly className="input-dark mt-1 bg-gray-200 text-gray-500 cursor-not-allowed"/>
                            </div>
                            <div><label className="input-label-layout">Duração</label><input type="text" value={draft.duration} onChange={e => handleChange('duration', e.target.value)} required className="input-dark mt-1"/></div>
                        </div>
                        <div><label className="input-label-layout">Custo de Produto (Referência)</label><input type="text" value={formatCurrency(draft.productCost)} readOnly className="input-dark mt-1 bg-gray-200 text-gray-500 cursor-not-allowed"/></div>
                        <div>
                            <label className="input-label-layout">Imagem do Serviço</label>
                            <div className="mt-1 p-4 bg-gray-50 rounded-lg border space-y-3">
                                {draft.imageUrl && (<div className="relative w-full aspect-video rounded-lg overflow-hidden group shadow-sm bg-gray-200"><img src={draft.imageUrl} alt="Preview" className="w-full h-full object-cover" /><button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIconForImage /></button></div>)}
                                <button type="button" onClick={() => document.getElementById('edit-service-file-upload')?.click()} className="w-full btn-secondary flex items-center justify-center"><ImageUploadIcon /> Carregar Arquivo</button>
                                <input id="edit-service-file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                                <div className="relative flex items-center"><LinkIcon /><input type="text" value={draft.imageUrl.startsWith('blob:') ? '' : draft.imageUrl} onChange={e => handleChange('imageUrl', e.target.value)} placeholder="Ou cole a URL da imagem" className="w-full pl-8 input-dark"/></div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border flex justify-between items-center"><label className="font-medium text-gray-800">Ocultar preço para o cliente</label><ToggleSwitch enabled={draft.isPriceHidden} setEnabled={value => handleChange('isPriceHidden', value)}/></div>
                    </main>
                    <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl"><button type="button" onClick={onClose} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Salvar Alterações</button></footer>
                </form>
            </div>
        </div>
    );
};

const BrandingScreen: React.FC = () => {
    const { branding, setBranding, services, setServices, setServiceRecipes } = useAppContext();
    const [draft, setDraft] = useState<Branding>(branding);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [logoImageFile, setLogoImageFile] = useState<File | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const [activeColorKey, setActiveColorKey] = useState<string | null>(null);
    const [palettesOpen, setPalettesOpen] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>('catalog');
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);


    const handleAccordionToggle = (accordionId: string) => {
        setOpenAccordion(prev => (prev === accordionId ? null : accordionId));
    };

    const shadowOptions = [
      { value: 'shadow-none', label: 'Nenhuma' },
      { value: 'shadow', label: 'Leve' },
      { value: 'shadow-md', label: 'Média' },
      { value: 'shadow-lg', label: 'Grande' },
    ];

    useEffect(() => {
        setHasChanges(JSON.stringify(draft) !== JSON.stringify(branding));
    }, [draft, branding]);
    
     useEffect(() => {
        const heroBlobUrl = draft.heroImageUrl;
        const logoBlobUrl = draft.logoUrl;
        return () => {
            if (heroBlobUrl && heroBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(heroBlobUrl);
            }
            if (logoBlobUrl && logoBlobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(logoBlobUrl);
            }
        };
    }, [draft.heroImageUrl, draft.logoUrl]);

    const handleRevert = () => {
        if (draft.heroImageUrl && draft.heroImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.heroImageUrl);
        }
        if (draft.logoUrl && draft.logoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.logoUrl);
        }
        setHeroImageFile(null);
        setLogoImageFile(null);
        setDraft(branding);
    };
    
    const handleSave = async () => {
        setSaveStatus('saving');
        
        let finalHeroImageUrl = draft.heroImageUrl;
        if (heroImageFile) {
            finalHeroImageUrl = await fileToBase64(heroImageFile);
            setHeroImageFile(null);
        }
        
        let finalLogoUrl = draft.logoUrl;
        if (logoImageFile) {
            finalLogoUrl = await fileToBase64(logoImageFile);
            setLogoImageFile(null);
        }

        const finalDraft = { ...draft, heroImageUrl: finalHeroImageUrl, logoUrl: finalLogoUrl };
        setDraft(finalDraft);

        setTimeout(() => {
            setBranding(finalDraft);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1000);
    };
    
    const handleVisibilityToggle = (serviceId: number, isVisible: boolean) => {
        setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isVisibleInCatalog: isVisible } : s));
    };
    
    const handleSaveFromModal = (updatedService: Service) => {
        setServices(prev => prev.map(s => (s.id === updatedService.id ? updatedService : s)));
        setServiceRecipes(prevRecipes => prevRecipes.map(r => 
            r.associatedServiceId === updatedService.id 
            ? { ...r, name: updatedService.name, notes: updatedService.description } 
            : r
        ));
        setServiceToEdit(null); // Close modal
    };

    const handleBrandingChange = (field: keyof Omit<Branding, 'colors' | 'layout'>, value: any) => {
        setDraft(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (colorName: keyof Branding['colors'], value: string) => {
        setDraft(prev => ({ ...prev, colors: { ...prev.colors, [colorName]: value } }));
    };
    
    const handleApplyPalette = (paletteColors: string[]) => {
        setDraft(prev => ({
            ...prev,
            colors: {
                primary: paletteColors[0] || prev.colors.primary,
                secondary: paletteColors[1] || prev.colors.secondary,
                accent: paletteColors[2] || prev.colors.accent,
                dark: paletteColors[3] || prev.colors.dark,
                light: paletteColors[4] || prev.colors.light,
                inputBackground: paletteColors[5] || prev.colors.inputBackground,
            }
        }));
    };

    const handleTitleStyleChange = (part: keyof Branding, field: keyof TitlePartStyle, value: any) => {
        setDraft(prev => ({ ...prev, [part]: { ...(prev[part] as TitlePartStyle), [field]: value } }));
    };
    
    const handleLayoutChange = (field: keyof LayoutSettings, value: any) => {
        setDraft(prev => ({ ...prev, layout: { ...prev.layout, [field]: value } }));
    };

    const handleFontStyleChange = (styleKey: keyof LayoutSettings, field: keyof FontStyleControl, value: any) => {
        setDraft(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                [styleKey]: {
                    ...(prev.layout[styleKey] as FontStyleControl),
                    [field]: value
                }
            }
        }));
    };

    const handleHeroImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (draft.heroImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(draft.heroImageUrl);
            }
            setHeroImageFile(file);
            handleBrandingChange('heroImageUrl', URL.createObjectURL(file));
        }
    };

    const handleHeroImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (heroImageFile && draft.heroImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.heroImageUrl);
        }
        setHeroImageFile(null);
        handleBrandingChange('heroImageUrl', e.target.value);
    };

    const handleRemoveHeroImage = () => {
        if (heroImageFile && draft.heroImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(draft.heroImageUrl);
        }
        setHeroImageFile(null);
        handleBrandingChange('heroImageUrl', '');
    };

    const handleLogoImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (draft.logoUrl.startsWith('blob:')) { URL.revokeObjectURL(draft.logoUrl); }
            setLogoImageFile(file);
            handleBrandingChange('logoUrl', URL.createObjectURL(file));
        }
    };

    const handleLogoImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (logoImageFile && draft.logoUrl.startsWith('blob:')) { URL.revokeObjectURL(draft.logoUrl); }
        setLogoImageFile(null);
        handleBrandingChange('logoUrl', e.target.value);
    };

    const handleRemoveLogoImage = () => {
        if (logoImageFile && draft.logoUrl.startsWith('blob:')) { URL.revokeObjectURL(draft.logoUrl); }
        setLogoImageFile(null);
        handleBrandingChange('logoUrl', '');
    };
    
    const colorFields: { key: keyof Branding['colors']; label: string; description: string }[] = [
        { key: 'primary', label: 'Primária', description: 'A cor principal da sua marca. Usada em botões de ação (como "Agendar"), ícones, links e outros destaques visuais importantes em todo o site.' },
        { key: 'secondary', label: 'Secundária', description: 'Uma cor de apoio, usada em fundos de seções ou detalhes sutis (como a cor de fundo da seção de promoções) para complementar a cor primária.' },
        { key: 'accent', label: 'Destaque', description: 'Usada para detalhes que precisam chamar a atenção, como links ou promoções especiais. Geralmente uma variação da cor primária.' },
        { key: 'dark', label: 'Texto (Escuro)', description: 'A cor principal para a maioria dos textos do site, como títulos de seção e parágrafos, garantindo boa legibilidade em fundos claros.' },
        { key: 'light', label: 'Fundo (Claro)', description: 'A cor de fundo principal da maior parte do site (a cor "de base" da página).' },
        { key: 'inputBackground', label: 'Fundo de Inputs (Escuro)', description: 'A cor de fundo para campos de formulário (inputs) que usam o estilo escuro com texto branco. Deve ser um tom escuro para o texto branco ser legível.' },
    ];

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
             <style>{`.animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; } @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-15px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
            
            <ServiceEditModal 
                isOpen={!!serviceToEdit}
                onClose={() => setServiceToEdit(null)}
                onSave={handleSaveFromModal}
                serviceToEdit={serviceToEdit}
            />
            
            <AccordionItem title="Catálogo da Página Inicial" isOpen={openAccordion === 'catalog'} onToggle={() => handleAccordionToggle('catalog')}>
                 <p className="text-sm text-gray-600 mb-4">
                    Controle aqui quais serviços e pacotes aparecem na sua página inicial. As informações são carregadas automaticamente da tela Financeira. Você pode editar a <strong className="font-semibold">apresentação</strong> (nome, descrição, imagem) clicando em "Editar", mas o <strong className="font-semibold">preço</strong> é fixo e gerenciado na área financeira.
                </p>
                <div className="space-y-3">
                    {services.map(service => (
                        <div key={service.id} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               {service.icon ? (
                                    <div className="w-10 h-10 rounded-md bg-brand-secondary flex items-center justify-center shrink-0">
                                        <i className={`${service.icon} text-brand-primary text-xl`}></i>
                                    </div>
                                ) : (
                                    <img src={service.imageUrl} alt={service.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{service.name}</p>
                                    <p className="text-sm text-gray-500">{service.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-600">Visível no site</span>
                                    <ToggleSwitch enabled={service.isVisibleInCatalog ?? true} setEnabled={val => handleVisibilityToggle(service.id, val)} />
                                </div>
                                <button onClick={() => setServiceToEdit(service)} className="p-2 hover:bg-gray-200 rounded-full" aria-label={`Editar ${service.name}`}>
                                    <PencilIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionItem>
            
            <AccordionItem title="Identidade do Salão" isOpen={openAccordion === 'identidade'} onToggle={() => handleAccordionToggle('identidade')}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Nome (Parte 1)</label><input type="text" value={draft.salonNameFirstPart} onChange={e => handleBrandingChange('salonNameFirstPart', e.target.value)} className="input-dark" /></div>
                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Nome (Parte 2)</label><input type="text" value={draft.salonNameSecondPart} onChange={e => handleBrandingChange('salonNameSecondPart', e.target.value)} className="input-dark" /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1 text-gray-700">Slogan</label><input type="text" value={draft.slogan} onChange={e => handleBrandingChange('slogan', e.target.value)} className="input-dark" /></div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-2">
                            Logo do Salão
                            <HelpTooltip text="Esta é a imagem do seu logo que aparece ao lado do nome do salão no topo de todas as páginas. Recomendamos usar um arquivo com fundo transparente (PNG)." />
                        </label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tamanho do Logo</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="20" max="200" value={draft.logoSize} onChange={e => handleBrandingChange('logoSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.logoSize}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alinhamento Vertical do Logo</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="-50" max="50" value={draft.logoVerticalOffset || 0} onChange={e => handleBrandingChange('logoVerticalOffset', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.logoVerticalOffset || 0}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Posição do Logo</label>
                                <div className="flex gap-4 mt-1">
                                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-all font-medium text-gray-800 ${draft.logoPosition === 'left' ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="logo-position" value="left" checked={draft.logoPosition === 'left'} onChange={() => handleBrandingChange('logoPosition', 'left')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                                        Esquerda do Nome
                                    </label>
                                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 transition-all font-medium text-gray-800 ${draft.logoPosition === 'right' ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="logo-position" value="right" checked={draft.logoPosition === 'right'} onChange={() => handleBrandingChange('logoPosition', 'right')} className="h-4 w-4 text-brand-primary focus:ring-brand-primary"/>
                                        Direita do Nome
                                    </label>
                                </div>
                            </div>
                            {draft.logoUrl && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden group shadow-sm bg-gray-200">
                                    <img src={draft.logoUrl} alt="Preview da Logo" className="w-full h-full object-contain p-2" />
                                    <button type="button" onClick={handleRemoveLogoImage} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIconForImage />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="logo-file-upload" className="flex-1 btn-secondary text-center cursor-pointer flex items-center justify-center">
                                    <ImageUploadIcon /> Carregar Arquivo
                                </label>
                                <input id="logo-file-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoImageFileChange} />
                            </div>
                            <div className="relative flex items-center">
                                <LinkIcon />
                                <input 
                                    type="text" 
                                    value={draft.logoUrl.startsWith('blob:') ? '' : draft.logoUrl} 
                                    onChange={handleLogoImageUrlChange} 
                                    placeholder="Ou cole a URL da imagem aqui" 
                                    className="input-dark pl-8" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 flex items-center gap-2">
                            Imagem Principal (Hero)
                            <HelpTooltip text="A imagem de fundo principal exibida no topo da página inicial, atrás do nome e slogan do seu salão. Escolha uma imagem de alta qualidade para causar uma ótima primeira impressão." />
                        </label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                            {draft.heroImageUrl && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden group shadow-sm bg-gray-200">
                                    <img src={draft.heroImageUrl} alt="Preview da Imagem Principal" className="w-full h-full object-cover" />
                                    <button type="button" onClick={handleRemoveHeroImage} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIconForImage />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="hero-file-upload" className="flex-1 btn-secondary text-center cursor-pointer flex items-center justify-center">
                                    <ImageUploadIcon /> Carregar Arquivo
                                </label>
                                <input id="hero-file-upload" type="file" className="hidden" accept="image/*" onChange={handleHeroImageFileChange} />
                            </div>
                            <div className="relative flex items-center">
                                <LinkIcon />
                                <input 
                                    type="text" 
                                    value={draft.heroImageUrl.startsWith('blob:') ? '' : draft.heroImageUrl} 
                                    onChange={handleHeroImageUrlChange} 
                                    placeholder="Ou cole a URL da imagem aqui" 
                                    className="input-dark pl-8" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionItem>
            
            <AccordionItem title="Título da Página Inicial (Hero)" isOpen={openAccordion === 'hero-title'} onToggle={() => handleAccordionToggle('hero-title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">Parte 1: "{draft.salonNameFirstPart}" <HelpTooltip text="Configurações para a primeira parte do nome do salão no banner principal." /></h4>
                        <TitleStyleEditor style={draft.heroTitleFirstPartStyle} onStyleChange={(field, value) => handleTitleStyleChange('heroTitleFirstPartStyle', field, value)} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">Parte 2: "{draft.salonNameSecondPart}" <HelpTooltip text="Configurações para a segunda parte do nome do salão no banner principal." /></h4>
                        <TitleStyleEditor style={draft.heroTitleSecondPartStyle} onStyleChange={(field, value) => handleTitleStyleChange('heroTitleSecondPartStyle', field, value)} />
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem title="Slogan da Página Inicial (Hero)" isOpen={openAccordion === 'hero-slogan'} onToggle={() => handleAccordionToggle('hero-slogan')}>
                <TitleStyleEditor style={draft.heroSloganStyle} onStyleChange={(field, value) => handleTitleStyleChange('heroSloganStyle', field, value)} />
            </AccordionItem>

            <AccordionItem title="Título do Cabeçalho Padrão" isOpen={openAccordion === 'header-title'} onToggle={() => handleAccordionToggle('header-title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">Parte 1: "{draft.salonNameFirstPart}" <HelpTooltip text="Configurações para a primeira parte do nome no cabeçalho fixo (visível em todas as páginas)." /></h4>
                        <TitleStyleEditor style={draft.headerTitleFirstPartStyle} onStyleChange={(field, value) => handleTitleStyleChange('headerTitleFirstPartStyle', field, value)} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">Parte 2: "{draft.salonNameSecondPart}" <HelpTooltip text="Configurações para a segunda parte do nome no cabeçalho fixo." /></h4>
                        <TitleStyleEditor style={draft.headerTitleSecondPartStyle} onStyleChange={(field, value) => handleTitleStyleChange('headerTitleSecondPartStyle', field, value)} />
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem title="Paleta de Cores" isOpen={openAccordion === 'colors'} onToggle={() => handleAccordionToggle('colors')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {colorFields.map(({ key, label, description }) => (
                        <ColorInput 
                            key={key} 
                            label={label} 
                            description={description} 
                            value={draft.colors[key]} 
                            onChange={value => handleColorChange(key, value)}
                            isActive={activeColorKey === key}
                            onActivate={() => setActiveColorKey(key)}
                        />
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                    <button type="button" onClick={() => setPalettesOpen(p => !p)} className="w-full flex justify-between items-center text-left py-2">
                        <h4 className="font-semibold text-gray-800">Paletas pré-definidas</h4>
                        <ChevronDownIcon className={palettesOpen ? 'rotate-180' : ''} />
                    </button>
                    {palettesOpen && (
                        <div className="pt-4 animate-fade-in-down">
                            {activeColorKey && <p className="text-sm text-gray-600 mb-4">Clique em uma cor abaixo para aplicá-la em "<span className="font-bold">{[...colorFields, {key: 'headerBackgroundColor', label: 'Cor de Fundo do Cabeçalho'}].find(f => f.key === activeColorKey)?.label}</span>".</p>}
                            {!activeColorKey && <p className="text-sm text-gray-600 mb-4">Clique em uma paleta para aplicar todas as suas cores de uma vez.</p>}
                            <div className="space-y-4">
                                {PALETTES.map(palette => (
                                    <div 
                                        key={palette.name}
                                        onClick={() => handleApplyPalette(palette.colors)}
                                        className="p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleApplyPalette(palette.colors)}
                                        aria-label={`Aplicar a paleta de cores ${palette.name}`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <h5 className="text-sm font-semibold text-gray-800">{palette.name}</h5>
                                            <span className="text-xs font-bold text-brand-primary">Aplicar</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {palette.colors.map((color, index) => (
                                                <button
                                                    type="button"
                                                    key={`${color}-${index}`}
                                                    className="w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                                    style={{ backgroundColor: color }}
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent applying the whole palette
                                                        if (activeColorKey) {
                                                            if (activeColorKey === 'headerBackgroundColor') {
                                                                handleBrandingChange('headerBackgroundColor', color);
                                                            } else {
                                                                handleColorChange(activeColorKey as keyof Branding['colors'], color);
                                                            }
                                                        }
                                                    }}
                                                    aria-label={`Selecionar a cor ${color} individualmente`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </AccordionItem>

            <AccordionItem title="Fonte Principal do Site" isOpen={openAccordion === 'main-font'} onToggle={() => handleAccordionToggle('main-font')}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            Fonte da Aplicação
                            <HelpTooltip text="Escolha a fonte principal que será usada em textos, descrições e botões por todo o site. A fonte do título do salão é configurada separadamente." />
                        </label>
                        <select
                            value={draft.layout.primaryFontFamily}
                            onChange={e => handleLayoutChange('primaryFontFamily', e.target.value)}
                            className="w-full select-dark"
                        >
                            {FONT_LIST.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            Peso do Texto Base
                            <HelpTooltip text="Define a 'grossura' padrão da fonte para textos normais. 'Normal (400)' é o padrão para leitura. Valores maiores deixam o texto mais pesado (negrito)." />
                        </label>
                        <select
                            value={draft.layout.baseFontWeight}
                            onChange={e => handleLayoutChange('baseFontWeight', e.target.value)}
                            className="w-full select-dark"
                        >
                            {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                            Estilo do Texto Base
                            <HelpTooltip text="Define se o estilo padrão dos textos do site será 'Normal' ou 'Itálico'. Geralmente, 'Normal' é a melhor opção para legibilidade." />
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <button
                                type="button"
                                onClick={() => handleLayoutChange('baseFontStyle', 'normal')}
                                className={`px-3 py-1.5 rounded-md border text-sm font-semibold transition-colors flex-1 ${draft.layout.baseFontStyle === 'normal' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                            >Normal</button>
                            <button
                                type="button"
                                onClick={() => handleLayoutChange('baseFontStyle', 'italic')}
                                className={`px-3 py-1.5 rounded-md border text-sm italic transition-colors flex-1 ${draft.layout.baseFontStyle === 'italic' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                            >Itálico</button>
                        </div>
                    </div>
                </div>
            </AccordionItem>
            
            <AccordionItem title="Layout e Aparência" isOpen={openAccordion === 'layout'} onToggle={() => handleAccordionToggle('layout')}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800">Configurações Globais</h4>
                        <div className="p-4 rounded-lg border bg-gray-50 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Tamanho da Fonte Base
                                    <HelpTooltip text="Este é o tamanho de fonte principal para textos corridos (parágrafos). Todos os outros tamanhos de texto (títulos, botões) são ajustados proporcionalmente a este valor." />
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="12" max="20" value={draft.layout.baseFontSize} onChange={e => handleLayoutChange('baseFontSize', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.layout.baseFontSize}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Arredondamento de Bordas
                                    <HelpTooltip text="Define o quão 'arredondados' serão os cantos de botões, caixas de texto e cards. Um valor maior cria um visual mais suave e moderno." />
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="24" value={draft.layout.borderRadius} onChange={e => handleLayoutChange('borderRadius', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.layout.borderRadius}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Espaçamento Vertical de Seções
                                    <HelpTooltip text="Controla a distância vertical (espaço em branco) entre as grandes seções da sua página inicial, como 'Nossos Serviços' e 'Promoções'." />
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="8" max="32" value={draft.layout.sectionPaddingY} onChange={e => handleLayoutChange('sectionPaddingY', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.layout.sectionPaddingY * 4}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Largura Máxima do Conteúdo
                                    <HelpTooltip text="Em telas de computador grandes, esta configuração limita a largura do conteúdo principal para evitar que o texto se estique demais e fique difícil de ler." />
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="768" max="1536" step="32" value={draft.layout.containerMaxWidth} onChange={e => handleLayoutChange('containerMaxWidth', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.layout.containerMaxWidth}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Espaçamento entre Elementos (Grid)
                                    <HelpTooltip text="Define o espaço entre os itens em uma grade, como a distância entre os cartões de serviço na página inicial." />
                                </label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="4" max="64" step="4" value={draft.layout.elementSpacing} onChange={e => handleLayoutChange('elementSpacing', Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                                    <span className="font-mono text-sm bg-white border rounded-md px-2 py-1 text-gray-800">{draft.layout.elementSpacing}px</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    Sombra dos Cards
                                    <HelpTooltip text="Controla a intensidade da sombra atrás dos 'cards' (como os de serviço), dando uma sensação de profundidade e destaque." />
                                </label>
                                <select value={draft.layout.cardShadow} onChange={e => handleLayoutChange('cardShadow', e.target.value)} className="select-dark w-full mt-1">
                                    {shadowOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800">Tipografia Específica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FontStyleEditor label="Título da Página (Dashboard)" style={draft.layout.pageTitle} onStyleChange={(field, value) => handleFontStyleChange('pageTitle', field, value)} />
                            <FontStyleEditor label="Título de Seção (Homepage)" style={draft.layout.sectionTitle} onStyleChange={(field, value) => handleFontStyleChange('sectionTitle', field, value)} />
                            <FontStyleEditor label="Subtítulo de Seção" style={draft.layout.sectionSubtitle} onStyleChange={(field, value) => handleFontStyleChange('sectionSubtitle', field, value)} />
                            <FontStyleEditor label="Título do Card de Serviço" style={draft.layout.cardTitle} onStyleChange={(field, value) => handleFontStyleChange('cardTitle', field, value)} />
                            <FontStyleEditor label="Descrição do Card" style={draft.layout.cardBody} onStyleChange={(field, value) => handleFontStyleChange('cardBody', field, value)} />
                            <FontStyleEditor label="Preço do Card" style={draft.layout.cardPrice} onStyleChange={(field, value) => handleFontStyleChange('cardPrice', field, value)} />
                            <FontStyleEditor label="Texto de Botão" style={draft.layout.buttonText} onStyleChange={(field, value) => handleFontStyleChange('buttonText', field, value)} />
                            <FontStyleEditor label="Texto da Navegação Inferior" style={draft.layout.bottomNavText} onStyleChange={(field, value) => handleFontStyleChange('bottomNavText', field, value)} />
                            <FontStyleEditor label="Rótulo de Formulário" style={draft.layout.inputLabelText} onStyleChange={(field, value) => handleFontStyleChange('inputLabelText', field, value)} />
                            <FontStyleEditor label="Texto de Formulário (Input)" style={draft.layout.inputText} onStyleChange={(field, value) => handleFontStyleChange('inputText', field, value)} />
                            <FontStyleEditor label="Texto do Rodapé" style={draft.layout.footerText} onStyleChange={(field, value) => handleFontStyleChange('footerText', field, value)} />
                        </div>
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem title="Aparência do Cabeçalho" isOpen={openAccordion === 'header-appearance'} onToggle={() => handleAccordionToggle('header-appearance')}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                        <div>
                            <label className="font-medium text-gray-800 flex items-center gap-2">
                                Cabeçalho Transparente com Desfoque
                                <HelpTooltip text="Quando ativado, o cabeçalho fica fixo no topo da página com um fundo translúcido e efeito de desfoque. Quando desativado, ele terá uma cor de fundo sólida." />
                            </label>
                        </div>
                        <ToggleSwitch
                            enabled={draft.isHeaderTransparent}
                            setEnabled={(value) => handleBrandingChange('isHeaderTransparent', value)}
                        />
                    </div>

                    {!draft.isHeaderTransparent && (
                        <div className="animate-fade-in-down">
                            <ColorInput 
                                label="Cor de Fundo do Cabeçalho" 
                                description="Define a cor de fundo do cabeçalho quando a opção 'Transparente' está desativada." 
                                value={draft.headerBackgroundColor || '#FFFFFF'} 
                                onChange={value => handleBrandingChange('headerBackgroundColor', value)}
                                isActive={activeColorKey === 'headerBackgroundColor'}
                                onActivate={() => setActiveColorKey('headerBackgroundColor')}
                            />
                        </div>
                    )}
                </div>
            </AccordionItem>
            
            {hasChanges && (
                 <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl z-50">
                    <div className="bg-brand-dark text-white rounded-xl shadow-2xl p-4 flex justify-between items-center animate-fade-in-up">
                        <p className="font-semibold">Você tem alterações não salvas!</p>
                        <div className="flex gap-4">
                            <button onClick={handleRevert} className="font-semibold hover:underline">Reverter</button>
                            <button onClick={handleSave} disabled={saveStatus === 'saving'} className="btn-primary flex items-center gap-2 disabled:bg-gray-500">
                                {saveStatus === 'saving' && <SpinnerIcon className="w-5 h-5 -ml-1 mr-1" />}
                                {saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandingScreen;