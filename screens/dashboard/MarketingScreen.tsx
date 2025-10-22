import React, { useState, useEffect } from 'react';
import type { Campaign, PromoText } from '../../types';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';
import { useAppContext } from '../../contexts/AppContext';

// --- ICONS ---
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const EyeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const ImageUploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const TrashIconForImage: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// --- REUSABLE PREVIEW COMPONENTS ---
const MarketingCardPreview: React.FC<{ campaign: Campaign; isTextOverlayEnabled: boolean; }> = ({ campaign, isTextOverlayEnabled }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full mx-auto max-w-sm">
        <div className="relative w-full h-48"><img src={campaign.imageUrl || 'https://picsum.photos/seed/promo/400/300'} alt={campaign.name} className="w-full h-full object-cover" />
        {isTextOverlayEnabled && (<div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center p-4 text-center"><h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3><p className="text-white text-sm">{campaign.description}</p></div>)}
        </div>
        <div className="p-6 flex flex-col flex-grow">{!isTextOverlayEnabled && (<><h3 className="text-xl font-bold text-brand-primary mb-2">{campaign.name}</h3><p className="text-gray-600 text-sm mb-4 flex-grow">{campaign.description}</p></>)}</div>
    </div>
);

const PreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; campaign: Campaign | null; isTextOverlayEnabled: boolean }> = ({ isOpen, onClose, campaign, isTextOverlayEnabled }) => {
    if (!isOpen || !campaign) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-transparent w-full max-w-md rounded-xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 text-center"><h3 className="font-bold text-lg text-white">Pré-visualização da Campanha</h3></header>
                <MarketingCardPreview campaign={campaign} isTextOverlayEnabled={isTextOverlayEnabled} />
            </div>
        </div>
    );
};

const MarketingScreen: React.FC = () => {
    const {
        campaigns, setCampaigns,
        isFloatingWidgetEnabled, setIsFloatingWidgetEnabled,
        floatingWidgetPosition, setFloatingWidgetPosition,
        floatingWidgetSize, setFloatingWidgetSize,
        isTextOverlayEnabled, setIsTextOverlayEnabled,
        promoTexts, setPromoTexts,
        promoTextInterval, setPromoTextInterval,
    } = useAppContext();

    // Create a draft state for each piece of state this component manages
    const [draftCampaigns, setDraftCampaigns] = useState(campaigns);
    const [imageFiles, setImageFiles] = useState<Map<number, File | null>>(new Map());
    const [draftIsFloatingWidgetEnabled, setDraftIsFloatingWidgetEnabled] = useState(isFloatingWidgetEnabled);
    const [draftFloatingWidgetPosition, setDraftFloatingWidgetPosition] = useState(floatingWidgetPosition);
    const [draftFloatingWidgetSize, setDraftFloatingWidgetSize] = useState(floatingWidgetSize);
    const [draftIsTextOverlayEnabled, setDraftIsTextOverlayEnabled] = useState(isTextOverlayEnabled);
    const [draftPromoTexts, setDraftPromoTexts] = useState(promoTexts);
    const [draftPromoTextInterval, setDraftPromoTextInterval] = useState(promoTextInterval);
    
    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [campaignToPreview, setCampaignToPreview] = useState<Campaign | null>(null);

    useEffect(() => {
        const changes =
            JSON.stringify(draftCampaigns) !== JSON.stringify(campaigns) ||
            imageFiles.size > 0 ||
            draftIsFloatingWidgetEnabled !== isFloatingWidgetEnabled ||
            draftFloatingWidgetPosition !== floatingWidgetPosition ||
            draftFloatingWidgetSize !== floatingWidgetSize ||
            draftIsTextOverlayEnabled !== isTextOverlayEnabled ||
            JSON.stringify(draftPromoTexts) !== JSON.stringify(promoTexts) ||
            draftPromoTextInterval !== promoTextInterval;
        setHasChanges(changes);
    }, [
        draftCampaigns, campaigns, imageFiles,
        draftIsFloatingWidgetEnabled, isFloatingWidgetEnabled,
        draftFloatingWidgetPosition, floatingWidgetPosition,
        draftFloatingWidgetSize, floatingWidgetSize,
        draftIsTextOverlayEnabled, isTextOverlayEnabled,
        draftPromoTexts, promoTexts,
        draftPromoTextInterval, promoTextInterval
    ]);
    
    useEffect(() => {
        return () => {
            draftCampaigns.forEach(c => {
                if (c.imageUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(c.imageUrl);
                }
            });
        }
    }, [draftCampaigns]);

    const handleRevert = () => {
        setDraftCampaigns(campaigns);
        setImageFiles(new Map());
        setDraftIsFloatingWidgetEnabled(isFloatingWidgetEnabled);
        setDraftFloatingWidgetPosition(floatingWidgetPosition);
        setDraftFloatingWidgetSize(floatingWidgetSize);
        setDraftIsTextOverlayEnabled(isTextOverlayEnabled);
        setDraftPromoTexts(promoTexts);
        setDraftPromoTextInterval(promoTextInterval);
    };

    const handleSave = async () => {
        setSaveStatus('saving');

        const campaignsToSave = [...draftCampaigns];
        const conversions = Array.from(imageFiles.entries())
            .filter(([, file]) => file !== null)
            .map(async ([id, file]) => {
                if (!file) return;
                const base64 = await fileToBase64(file);
                const index = campaignsToSave.findIndex(c => c.id === id);
                if (index > -1) {
                    if (campaignsToSave[index].imageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(campaignsToSave[index].imageUrl);
                    }
                    campaignsToSave[index] = { ...campaignsToSave[index], imageUrl: base64 };
                }
            });
        
        await Promise.all(conversions);

        setTimeout(() => {
            setCampaigns(campaignsToSave);
            setImageFiles(new Map());
            setIsFloatingWidgetEnabled(draftIsFloatingWidgetEnabled);
            setFloatingWidgetPosition(draftFloatingWidgetPosition);
            setFloatingWidgetSize(draftFloatingWidgetSize);
            setIsTextOverlayEnabled(draftIsTextOverlayEnabled);
            setPromoTexts(draftPromoTexts);
            setPromoTextInterval(draftPromoTextInterval);

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }, 1500);
    };

    const handleCreateCampaign = () => {
        const newCampaign: Campaign = { id: Date.now(), name: 'Nova Campanha', description: 'Descreva sua promoção aqui.', imageUrl: '', isActive: false, displayLocation: 'none' };
        setDraftCampaigns(prev => [...prev, newCampaign]);
    };
    const handleCampaignChange = (id: number, field: keyof Campaign, value: any) => { setDraftCampaigns(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c)); };
    const handleDeleteCampaign = (id: number) => { 
        const campaign = draftCampaigns.find(c => c.id === id);
        if (campaign && campaign.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(campaign.imageUrl);
        }
        setDraftCampaigns(prev => prev.filter(c => c.id !== id)); 
        setImageFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
        });
    };
    const handlePreviewCampaign = (campaign: Campaign) => { setCampaignToPreview(campaign); setIsPreviewModalOpen(true); };

    const handleCampaignImageFileChange = (campaignId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const oldCampaign = draftCampaigns.find(c => c.id === campaignId);
            if (oldCampaign && oldCampaign.imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldCampaign.imageUrl);
            }
            setImageFiles(prev => new Map(prev).set(campaignId, file));
            handleCampaignChange(campaignId, 'imageUrl', URL.createObjectURL(file));
        }
    };
    const handleCampaignImageUrlChange = (campaignId: number, url: string) => {
        const oldCampaign = draftCampaigns.find(c => c.id === campaignId);
        if (oldCampaign && oldCampaign.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldCampaign.imageUrl);
        }
        setImageFiles(prev => new Map(prev).set(campaignId, null));
        handleCampaignChange(campaignId, 'imageUrl', url);
    };
    const handleRemoveCampaignImage = (campaignId: number) => {
        const oldCampaign = draftCampaigns.find(c => c.id === campaignId);
        if (oldCampaign && oldCampaign.imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldCampaign.imageUrl);
        }
        setImageFiles(prev => new Map(prev).set(campaignId, null));
        handleCampaignChange(campaignId, 'imageUrl', '');
    };

    const handleAddPromoText = () => {
        const newPromo: PromoText = { id: Date.now(), text: 'Nova frase promocional', isActive: true };
        setDraftPromoTexts(prev => [...prev, newPromo]);
    };
    const handlePromoTextChange = (id: number, field: keyof PromoText, value: any) => { setDraftPromoTexts(prev => prev.map(pt => pt.id === id ? { ...pt, [field]: value } : pt)); };
    const handleDeletePromoText = (id: number) => { setDraftPromoTexts(prev => prev.filter(p => p.id !== id)); };

    return (
        <div className="space-y-8 max-w-4xl mx-auto text-left">
            <PreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} campaign={campaignToPreview} isTextOverlayEnabled={draftIsTextOverlayEnabled} />

            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-dark">Gerenciamento de Campanhas</h3>
                    <button onClick={handleCreateCampaign} className="btn-primary">Criar Campanha</button>
                </div>
                <div className="space-y-6">
                    {draftCampaigns.map(campaign => (
                        <div key={campaign.id} className="p-4 border rounded-lg bg-gray-50/80 space-y-4">
                            <input type="text" value={campaign.name} onChange={e => handleCampaignChange(campaign.id, 'name', e.target.value)} className="w-full text-lg font-bold bg-transparent focus:bg-white p-2 -m-2 rounded-md outline-none focus:ring-2 focus:ring-brand-primary text-gray-900" />
                            <textarea value={campaign.description} onChange={e => handleCampaignChange(campaign.id, 'description', e.target.value)} rows={2} className="textarea-dark" />
                            
                            <div>
                                <label className="text-sm font-medium text-gray-600">Imagem da Campanha</label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                                    {campaign.imageUrl && (
                                        <div className="relative w-full h-40 rounded-lg overflow-hidden group shadow-sm bg-gray-200">
                                            <img src={campaign.imageUrl} alt="Preview da Campanha" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => handleRemoveCampaignImage(campaign.id)} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIconForImage />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <label htmlFor={`campaign-file-upload-${campaign.id}`} className="flex-1 btn-secondary text-center cursor-pointer flex items-center justify-center">
                                            <ImageUploadIcon /> Carregar Arquivo
                                        </label>
                                        <input id={`campaign-file-upload-${campaign.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleCampaignImageFileChange(campaign.id, e)} />
                                    </div>
                                    <div className="relative flex items-center">
                                        <LinkIcon />
                                        <input type="text" value={campaign.imageUrl.startsWith('blob:') ? '' : campaign.imageUrl} onChange={(e) => handleCampaignImageUrlChange(campaign.id, e.target.value)} placeholder="Ou cole a URL da imagem aqui" className="input-dark pl-8" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600">Local de Exibição</label>
                                    <select value={campaign.displayLocation} onChange={e => handleCampaignChange(campaign.id, 'displayLocation', e.target.value)} className="select-dark mt-1"><option value="none">Nenhum (Rascunho)</option><option value="main">Tela Principal (Grade)</option><option value="carousel">Tela Principal (Carrossel)</option><option value="floating">Aba Flutuante</option></select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <label className="flex items-center space-x-2"><ToggleSwitch enabled={campaign.isActive} setEnabled={value => handleCampaignChange(campaign.id, 'isActive', value)} /><span className={`font-semibold ${campaign.isActive ? 'text-green-600' : 'text-gray-500'}`}>{campaign.isActive ? 'Ativa' : 'Inativa'}</span></label>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handlePreviewCampaign(campaign)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"><EyeIcon /></button>
                                    <button onClick={() => handleDeleteCampaign(campaign.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border"><div><label className="font-medium text-gray-800">Sobrepor texto na imagem</label><p className="text-xs text-gray-500">Exibe o texto sobre a imagem da campanha.</p></div><ToggleSwitch enabled={draftIsTextOverlayEnabled} setEnabled={setDraftIsTextOverlayEnabled} /></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold text-brand-dark mb-4">Widget Flutuante</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border"><div><label className="font-medium text-gray-800">Ativar Widget Flutuante</label><p className="text-xs text-gray-500">Mostra promoções em um pop-up na tela inicial.</p></div><ToggleSwitch enabled={draftIsFloatingWidgetEnabled} setEnabled={setDraftIsFloatingWidgetEnabled} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium text-gray-600">Posição</label><select value={draftFloatingWidgetPosition} onChange={e => setDraftFloatingWidgetPosition(e.target.value as any)} className="select-dark mt-1"><option value="bottom-right">Canto Inferior Direito</option><option value="bottom-left">Canto Inferior Esquerdo</option></select></div>
                        <div><label className="text-sm font-medium text-gray-600">Tamanho</label><select value={draftFloatingWidgetSize} onChange={e => setDraftFloatingWidgetSize(e.target.value as any)} className="select-dark mt-1"><option value="small">Pequeno</option><option value="medium">Médio</option><option value="large">Grande</option></select></div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md border">
                 <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-brand-dark">Barra de Texto Promocional</h3><button onClick={handleAddPromoText} className="btn-secondary text-sm">Adicionar Frase</button></div>
                 <div className="space-y-3 mb-6">
                    {draftPromoTexts.map(pt => (
                        <div key={pt.id} className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between gap-4">
                            <input type="text" value={pt.text} onChange={e => handlePromoTextChange(pt.id, 'text', e.target.value)} className="w-full bg-transparent focus:bg-white p-1 -m-1 rounded-md outline-none focus:ring-1 focus:ring-brand-primary text-gray-800" />
                            <div className="flex items-center space-x-3 shrink-0">
                                <ToggleSwitch enabled={pt.isActive} setEnabled={value => handlePromoTextChange(pt.id, 'isActive', value)} />
                                <button onClick={() => handleDeletePromoText(pt.id)} className="text-gray-400 hover:text-red-600"><TrashIcon/></button>
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="mt-6 pt-4 border-t">
                    <label className="font-medium text-gray-800">Velocidade da transição (segundos)</label>
                    <div className="flex items-center space-x-3 mt-2"><input type="range" min="2" max="15" value={draftPromoTextInterval} onChange={e => setDraftPromoTextInterval(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary" /><span className="font-semibold text-brand-dark w-12 text-center bg-gray-100 p-1 rounded-md">{draftPromoTextInterval}s</span></div>
                 </div>
            </div>

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

export default MarketingScreen;