import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../../contexts/AppContext';
import * as api from '../../api';

// --- ICONS ---
const BrainIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 01-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12z" /></svg>;
const Spinner: React.FC<{className?: string}> = ({className}) => <svg className={`animate-spin ${className ?? ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const SendIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const WarningIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;


// --- HELPER COMPONENTS ---
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative group flex items-center">
        {children}
        <div className="absolute bottom-full mb-2 w-max max-w-xs bg-brand-dark text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {text}
        </div>
    </div>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, children, isOpen, onToggle }) => (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <button onClick={onToggle} className="w-full flex justify-between items-center p-6 text-left">
            <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
            <ChevronDownIcon open={isOpen} />
        </button>
        <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="px-6 pb-6 pt-0">
                {children}
            </div>
        </div>
    </div>
);


const dataSourceOptions = [
    { id: 'appointments', label: 'Agendamentos', description: 'Dados de agendamentos, incluindo serviços, horários e profissionais. Essencial para análises de popularidade e horários de pico.' },
    { id: 'clients', label: 'Clientes', description: 'Lista de todos os clientes, com informações de contato, aniversário e data da última visita.' },
    { id: 'financial', label: 'Financeiro', description: 'Informações sobre o faturamento gerado pelos serviços. Permite análises de rentabilidade.' },
    { id: 'commissions', label: 'Comissões', description: 'Dados de desempenho por profissional. Útil para análises de equipe e motivação.' },
    { id: 'services', label: 'Serviços', description: 'Catálogo de todos os serviços, seus preços e durações. Ajuda a IA a entender seu portfólio.' },
    { id: 'birthdays', label: 'Aniversários', description: 'Datas de aniversário dos clientes para identificar oportunidades de campanhas sazonais.' },
    { id: 'salonHours', label: 'Horários do Salão', description: 'Horário de funcionamento padrão e feriados. Permite à IA sugerir otimizações de agenda.' },
];

const formatResponse = (text: string) => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    html = html.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
               .replace(/<\/ul>\n<ul>/gm, '');

    return html;
};

interface Message {
    role: 'user' | 'model' | 'system';
    content: string;
}

export const SmartAnalyticsScreen: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<'config' | 'data' | null>('data');
    
    const [aiProvider, setAiProvider] = useState('gemini');
    const [modelName, setModelName] = useState('gemini-2.5-flash');
    
    const [selectedSources, setSelectedSources] = useState<string[]>(['appointments', 'clients', 'financial']);
    const [isDataSummaryOpen, setIsDataSummaryOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { users, services } = useAppContext();
    const [allAppointments, setAllAppointments] = useState<any[]>([]);
    const [allClients, setAllClients] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appts, clientsData] = await Promise.all([
                    api.getAppointments(),
                    api.getClients(1, 10000)
                ]);
                setAllAppointments(appts);
                setAllClients(clientsData.clients);
            } catch (err) {
                console.error("Failed to load data for AI context:", err);
                setError("Falha ao carregar dados para a análise. Tente novamente.");
            }
        };
        fetchData();
    }, []);

    const dataContext = useMemo(() => {
        const context: any = {};
        if (selectedSources.includes('appointments')) context.appointments = allAppointments.slice(0, 500);
        if (selectedSources.includes('clients')) context.clients = allClients.slice(0, 500);
        if (selectedSources.includes('services')) context.services = services;
        // Add other data sources if needed
        return JSON.stringify(context, null, 2);
    }, [selectedSources, allAppointments, allClients, services]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);
    
    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;
        
        const newHistory: Message[] = [...chatHistory, { role: 'user', content: userInput }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `Você é um analista de negócios especialista em salões de beleza. Analise os dados fornecidos em JSON e responda às perguntas do usuário de forma clara, concisa e com insights acionáveis. Os dados incluem: ${selectedSources.join(', ')}.`;
            
            const fullHistory = [
                { role: 'user', parts: [{ text: `Aqui estão os dados: ${dataContext}` }] },
                { role: 'model', parts: [{ text: "Ok, entendi. Tenho os dados carregados. O que você gostaria de analisar?" }] },
                ...newHistory
                    .filter(msg => msg.role !== 'system') // Filter out system messages
                    .map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }))
            ];

            const response = await ai.models.generateContent({
                model: modelName,
                contents: fullHistory as any, // Cast to any to match SDK expectation
                config: {
                  systemInstruction
                }
            });
            
            const modelResponse = response.text;
            
            if (modelResponse) {
                setChatHistory(prev => [...prev, { role: 'model', content: modelResponse }]);
            } else {
                throw new Error("Resposta da IA está vazia.");
            }

        } catch (err) {
            console.error("Gemini API error:", err);
            const errorMessage = (err instanceof Error) ? err.message : "Ocorreu um erro desconhecido.";
            setError(`Erro na comunicação com a IA: ${errorMessage}`);
            setChatHistory(prev => [...prev, { role: 'system', content: `Erro: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSourceToggle = (sourceId: string) => {
        setSelectedSources(prev => 
            prev.includes(sourceId) 
                ? prev.filter(s => s !== sourceId) 
                : [...prev, sourceId]
        );
    };

    return (
        <div className="space-y-6">
            <AccordionItem title="Configurações da IA" isOpen={openAccordion === 'config'} onToggle={() => setOpenAccordion(p => p === 'config' ? null : 'config')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-700 mb-1">Provedor de IA</label>
                        <select id="ai-provider" value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="select-dark w-full">
                            <option value="gemini">Google Gemini</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="model-name" className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                        <select id="model-name" value={modelName} onChange={e => setModelName(e.target.value)} className="select-dark w-full">
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Rápido e Eficiente)</option>
                        </select>
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem title="Fontes de Dados para Análise" isOpen={openAccordion === 'data'} onToggle={() => setOpenAccordion(p => p === 'data' ? null : 'data')}>
                <p className="text-sm text-gray-600 mb-4">Selecione quais dados a IA deve considerar em suas análises. Menos dados podem resultar em respostas mais rápidas, mas menos completas.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dataSourceOptions.map(opt => (
                        <label key={opt.id} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${selectedSources.includes(opt.id) ? 'bg-pink-50 border-brand-primary ring-2 ring-brand-primary' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={selectedSources.includes(opt.id)} onChange={() => handleSourceToggle(opt.id)} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"/>
                            <Tooltip text={opt.description}>
                                <span className="font-medium text-gray-800 text-sm">{opt.label}</span>
                            </Tooltip>
                        </label>
                    ))}
                </div>
                 <div className="mt-4 border-t pt-4">
                    <button onClick={() => setIsDataSummaryOpen(!isDataSummaryOpen)} className="text-sm font-semibold text-brand-primary hover:underline">
                        {isDataSummaryOpen ? 'Ocultar Resumo dos Dados' : 'Ver Resumo dos Dados Enviados'}
                    </button>
                    {isDataSummaryOpen && (
                        <pre className="mt-2 bg-gray-900 text-white p-4 rounded-lg text-xs max-h-64 overflow-auto">
                            <code>{dataContext}</code>
                        </pre>
                    )}
                </div>
            </AccordionItem>
            
            {/* Chat Interface */}
            <div className="bg-white rounded-xl shadow-lg border">
                <div className="p-4 border-b flex items-center gap-3">
                    <BrainIcon className="w-6 h-6 text-brand-primary" />
                    <h3 className="text-xl font-bold text-brand-dark">Converse com seus Dados</h3>
                </div>
                <div ref={chatContainerRef} className="h-[50vh] overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-xl ${msg.role === 'user' ? 'bg-brand-primary text-white' : msg.role === 'model' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                                {msg.role === 'system' && <p className="font-bold mb-1">Erro do Sistema:</p>}
                                <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl p-3 rounded-xl bg-gray-200 text-gray-800 flex items-center gap-2">
                                <Spinner className="w-5 h-5 text-brand-primary" />
                                <span>Analisando...</span>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="p-4 border-t text-sm text-red-600 font-semibold bg-red-50 flex items-center">
                        <WarningIcon />
                        {error}
                    </div>
                )}
                <div className="p-4 border-t bg-white rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte algo sobre seus dados... Ex: 'qual o serviço mais rentável?'"
                            className="w-full input-dark"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="btn-primary p-3 disabled:bg-gray-400">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};