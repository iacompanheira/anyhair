import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../../contexts/AppContext';
import * as api from '../../api';
import { parseDurationToMinutes } from '../../utils/formatters';

// --- ICONS ---
const BrainIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 01-3.09 3.09L15 18.75l-.813-2.846a4.5 4.5 0 013.09-3.09L18.25 12z" /></svg>;
const SendIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>;
const WarningIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ChevronDownIcon: React.FC<{ open: boolean }> = ({ open }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;


// --- HELPER COMPONENTS ---
const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const formatResponse = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-3 border-b pb-2">$1</h2>')
        .replace(/^\s*-\s(.*)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 my-3">$1</ul>')
        .replace(/<\/ul>\s*<ul>/gs, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
};

interface Message {
    role: 'user' | 'model';
    content: string;
}

const DataContextSummary: React.FC<{ data: any }> = ({ data }) => {
    const { geral, servicos } = data;
    if (!geral) return null;

    return (
        <div className="text-sm text-gray-700 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 p-3 rounded-lg"><p className="font-semibold text-xs text-gray-500">Faturamento Total</p><p className="font-bold text-lg text-brand-dark">{geral.faturamento_total_agendamentos_concluidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="font-semibold text-xs text-gray-500">Agendamentos</p><p className="font-bold text-lg text-brand-dark">{geral.total_agendamentos_no_periodo}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="font-semibold text-xs text-gray-500">Clientes</p><p className="font-bold text-lg text-brand-dark">{geral.total_clientes}</p></div>
                <div className="bg-gray-100 p-3 rounded-lg"><p className="font-semibold text-xs text-gray-500">Ticket Médio</p><p className="font-bold text-lg text-brand-dark">{geral.ticket_medio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>
            </div>
            <div>
                <p className="font-semibold text-gray-600 mb-1">Serviços Disponíveis para Análise: {servicos.length}</p>
            </div>
        </div>
    );
};

export const SmartAnalyticsScreen: React.FC = () => {
    const [isDataSummaryOpen, setIsDataSummaryOpen] = useState(false);
    
    const [chatHistory, setChatHistory] = useState<Message[]>([
        { role: 'model', content: "Olá! Sou a inteligência artificial do Any Hair e tenho acesso aos dados do seu salão. O que você gostaria de analisar hoje para impulsionar seus resultados?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { services, financialSettings } = useAppContext();
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
        const completedAppointments = allAppointments.filter(a => a.status === 'completed');
        const totalRevenue = completedAppointments.reduce((sum, a) => sum + (parseFloat(a.service.price.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0), 0);
        const totalServicesRendered = completedAppointments.length;
        
        context.geral = {
            data_atual: '2025-10-22',
            total_agendamentos_no_periodo: allAppointments.length,
            total_clientes: allClients.length,
            faturamento_total_agendamentos_concluidos: totalRevenue,
            total_servicos_prestados: totalServicesRendered,
            ticket_medio: totalServicesRendered > 0 ? totalRevenue / totalServicesRendered : 0,
        };
        context.servicos = services.map(s => ({id: s.id, nome: s.name, preco: s.price, custo_produto: s.productCost, duracao_minutos: parseDurationToMinutes(s.duration)}));
        context.configuracoes_financeiras = { comissao_padrao_percentual: financialSettings.defaultCommission, custos_fixos_mensais: financialSettings.fixedCosts };
        context.amostra_agendamentos_recentes = allAppointments
            .sort((a,b) => b.date.getTime() - a.date.getTime())
            .slice(0, 30)
            .map(a => ({ data: a.date.toISOString().split('T')[0], servico: a.service.name, profissional: a.professional.name, preco: a.service.price, status: a.status, id_cliente: a.client.id }));
        
        return context;
    }, [allAppointments, allClients, services, financialSettings]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);
    
    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;
        
        const newUserMessage: Message = { role: 'user', content: userInput };
        setChatHistory(prev => [...prev, newUserMessage, { role: 'model', content: '' }]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            if (!process.env.API_KEY) {
                throw new Error("A chave da API não foi configurada.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const systemInstruction = `Você é um analista de negócios especialista em salões de beleza chamado 'Any Hair IA'. Sua personalidade é prestativa, perspicaz e profissional. Responda às perguntas do usuário com base nos dados fornecidos em JSON. Forneça insights claros, concisos e acionáveis. Use formatação Markdown, como negrito (**texto**), listas (- item) e títulos (## Título), para organizar suas respostas e torná-las fáceis de ler. Sempre baseie suas conclusões nos dados fornecidos. Se os dados não forem suficientes para responder, explique o porquê. Hoje é 22 de outubro de 2025.`;
            
            const historyForApi = chatHistory
                .slice(1, -1) // Exclude initial greeting and the new empty model message
                .map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }));

            const fullPrompt = [
                { role: 'user', parts: [{ text: `Aqui estão os dados do salão: ${JSON.stringify(dataContext)}` }] },
                { role: 'model', parts: [{ text: "Ok, entendi. Tenho os dados carregados. O que você gostaria de analisar?" }] },
                ...historyForApi,
                { role: 'user', parts: [{ text: currentInput }] }
            ];

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: fullPrompt as any,
                config: { systemInstruction }
            });
            
            let firstChunk = true;
            for await (const chunk of responseStream) {
                if (firstChunk) {
                    setIsLoading(false);
                    firstChunk = false;
                }
                const chunkText = chunk.text;
                if (chunkText) {
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        const lastMessage = newHistory[newHistory.length - 1];
                        if (lastMessage && lastMessage.role === 'model') {
                            lastMessage.content += chunkText;
                        }
                        return newHistory;
                    });
                }
            }

        } catch (err) {
            console.error("Gemini API error:", err);
            const errorMessage = (err instanceof Error) ? err.message : "Ocorreu um erro desconhecido.";
            setError(`Erro na comunicação com a IA: ${errorMessage}`);
            setChatHistory(prev => [...prev.slice(0, -1), { role: 'model', content: `Desculpe, não consegui processar sua solicitação. Erro: ${errorMessage}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleQuickQuestion = (question: string) => {
        setUserInput(question);
    };

    return (
        <div className="space-y-6 animate-fade-in-down">
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
                 <button onClick={() => setIsDataSummaryOpen(!isDataSummaryOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isDataSummaryOpen}>
                    <h3 className="text-sm font-semibold text-gray-700">Resumo dos Dados para Análise</h3>
                    <ChevronDownIcon open={isDataSummaryOpen} />
                </button>
                {isDataSummaryOpen && (
                    <div className="px-4 pb-4 animate-fade-in-down">
                        <DataContextSummary data={dataContext} />
                    </div>
                )}
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border">
                <div className="p-4 border-b flex items-center gap-4">
                    <BrainIcon className="w-8 h-8 text-brand-primary" />
                    <div>
                        <h3 className="text-xl font-bold text-brand-dark">Converse com seus Dados</h3>
                        <p className="text-sm text-gray-500">Faça perguntas e receba insights sobre o seu negócio.</p>
                    </div>
                </div>
                
                <div ref={chatContainerRef} className="h-[60vh] overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white shrink-0"><BrainIcon className="w-5 h-5"/></div>}
                            <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                                {msg.content ? (
                                    <div className="prose prose-sm max-w-none prose-strong:text-brand-dark whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }} />
                                ) : (
                                    <TypingIndicator />
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && chatHistory[chatHistory.length -1]?.role !== 'model' && (
                        <div className="flex justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white shrink-0"><BrainIcon className="w-5 h-5"/></div>
                            <div className="max-w-xl p-4 rounded-2xl bg-white border rounded-bl-none flex items-center gap-2 shadow-sm">
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-b bg-gray-50/50">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Sugestões de perguntas:</p>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleQuickQuestion('Qual foi o serviço mais popular no último mês?')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Serviço mais popular?</button>
                        <button onClick={() => handleQuickQuestion('Qual profissional teve o maior faturamento?')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Melhor profissional?</button>
                        <button onClick={() => handleQuickQuestion('Quais clientes não retornam há mais de 6 meses? Liste 5.')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Clientes inativos?</button>
                        <button onClick={() => handleQuickQuestion('Qual o dia da semana com mais agendamentos?')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">Dia mais movimentado?</button>
                    </div>
                </div>

                {error && (
                    <div className="p-4 border-t text-sm text-red-600 font-semibold bg-red-50 flex items-center">
                        <WarningIcon />
                        {error}
                    </div>
                )}
                <div className="p-4 bg-white rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Pergunte algo sobre seus dados..."
                            className="w-full input-dark"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !userInput.trim()} className="btn-primary p-3 disabled:bg-gray-400">
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            <style>{`.animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; } @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-15px); } 100% { opacity: 1; transform: translateY(0); } } .prose ul { list-style-type: disc; margin-left: 1rem; } .prose strong { font-weight: 700; }`}</style>
        </div>
    );
};
