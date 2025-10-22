import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../../types';
import * as api from '../../api';

// --- ICONS ---
const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const PencilIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const PlusCircleIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const ViewIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

// --- MODAL COMPONENTS ---
const ClientModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'lastVisit'> & { id?: number }) => void;
  clientToEdit: Client | null;
}> = ({ isOpen, onClose, onSave, clientToEdit }) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', cpf: '', birthdate: '' });

    useEffect(() => {
        if (clientToEdit) {
            setForm({
                name: clientToEdit.name,
                email: clientToEdit.email,
                phone: clientToEdit.phone,
                cpf: clientToEdit.cpf,
                birthdate: clientToEdit.birthdate || ''
            });
        } else {
            setForm({ name: '', email: '', phone: '', cpf: '', birthdate: '' });
        }
    }, [clientToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: clientToEdit?.id, ...form });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{clientToEdit ? 'Editar' : 'Adicionar'} Cliente</h3></header>
                <form onSubmit={handleSubmit}>
                    <main className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                        <div><label className="block text-sm font-medium mb-1">Nome Completo *</label><input type="text" name="name" value={form.name} onChange={handleChange} required className="input-dark" /></div>
                        <div><label className="block text-sm font-medium mb-1">E-mail *</label><input type="email" name="email" value={form.email} onChange={handleChange} required className="input-dark" /></div>
                        <div><label className="block text-sm font-medium mb-1">Telefone *</label><input type="tel" name="phone" value={form.phone} onChange={handleChange} required className="input-dark" /></div>
                        <div><label className="block text-sm font-medium mb-1">CPF *</label><input type="text" name="cpf" value={form.cpf} onChange={handleChange} required className="input-dark" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Data de Nascimento</label><input type="date" name="birthdate" value={form.birthdate} onChange={handleChange} className="input-dark" /></div>
                    </main>
                    <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary">Salvar</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; count: number; }> = ({ isOpen, onClose, onConfirm, count }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="font-bold text-lg">Confirmar Exclusão</h3>
                    <p className="mt-2 text-gray-600">
                        Você tem certeza que deseja excluir <strong>{count} cliente{count > 1 ? 's' : ''}</strong> selecionado{count > 1 ? 's' : ''}? Esta ação é irreversível.
                    </p>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Excluir</button>
                </div>
            </div>
        </div>
    );
};

const ClientDetailModal: React.FC<{ client: Client | null; onClose: () => void }> = ({ client, onClose }) => {
    if (!client) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b flex justify-between items-center">
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 text-2xl leading-none">&times;</button>
                </header>
                <main className="p-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                    <span className="font-semibold text-gray-500">E-mail:</span><span className="text-gray-800 break-all">{client.email}</span>
                    <span className="font-semibold text-gray-500">Telefone:</span><span className="text-gray-800">{client.phone}</span>
                    <span className="font-semibold text-gray-500">CPF:</span><span className="text-gray-800">{client.cpf}</span>
                    <span className="font-semibold text-gray-500">Aniversário:</span><span className="text-gray-800">{client.birthdate ? new Date(client.birthdate + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</span>
                    <span className="font-semibold text-gray-500">Última Visita:</span><span className="text-gray-800">{new Date(client.lastVisit + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                </main>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
export const ClientsScreen: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [totalClients, setTotalClients] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [clientToView, setClientToView] = useState<Client | null>(null);

    const ITEMS_PER_PAGE = 10;
    const totalPages = Math.ceil(totalClients / ITEMS_PER_PAGE);

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { clients: fetchedClients, total } = await api.getClients(currentPage, ITEMS_PER_PAGE, searchTerm);
            setClients(fetchedClients);
            setTotalClients(total);
        } catch (err) {
            setError('Falha ao carregar os clientes. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleSaveClient = async (clientData: Omit<Client, 'id' | 'lastVisit'> & { id?: number }) => {
        await api.saveClient(clientData);
        fetchClients(); // Refresh list
    };
    
    const handleDelete = async () => {
        await api.deleteClients(selectedClients);
        setSelectedClients([]);
        fetchClients(); // Refresh list
        setIsConfirmOpen(false);
    };
    
    const handleSelectClient = (clientId: number) => {
        setSelectedClients(prev => 
            prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedClients(clients.map(c => c.id));
        } else {
            setSelectedClients([]);
        }
    };
    
    const handleOpenEditModal = (client: Client) => {
        setClientToEdit(client);
        setIsModalOpen(true);
    };
    
    const handleOpenAddModal = () => {
        setClientToEdit(null);
        setIsModalOpen(true);
    };

    if (error) {
        return <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start" role="alert"><ErrorIcon />{error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
            <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} clientToEdit={clientToEdit} />
            <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleDelete} count={selectedClients.length} />
            <ClientDetailModal client={clientToView} onClose={() => setClientToView(null)} />
            
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <input 
                    type="text" 
                    placeholder="Buscar por nome, e-mail, telefone ou CPF..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="input-dark w-full md:w-80"
                />
                <div className="flex items-center gap-4">
                    {selectedClients.length > 0 && (
                        <button onClick={() => setIsConfirmOpen(true)} className="btn-danger flex items-center gap-2">
                            <TrashIcon className="w-5 h-5 text-white" />
                            Excluir ({selectedClients.length})
                        </button>
                    )}
                    <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5 text-white" />
                        Adicionar Cliente
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedClients.length === clients.length && clients.length > 0} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" /></th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden lg:table-cell">Contato</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase hidden md:table-cell">Última Visita</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="p-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                                    <td className="px-6 py-4 text-right"><div className="h-6 w-16 bg-gray-200 rounded ml-auto"></div></td>
                                </tr>
                            ))
                        ) : clients.map(client => (
                            <tr key={client.id}>
                                <td className="p-4"><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => handleSelectClient(client.id)} className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" /></td>
                                <td className="px-6 py-4"><p className="font-semibold text-gray-900">{client.name}</p><p className="text-sm text-gray-500 md:hidden">{client.phone}</p></td>
                                <td className="px-6 py-4 hidden lg:table-cell"><p className="text-sm text-gray-800 break-all">{client.email}</p><p className="text-sm text-gray-500">{client.phone}</p></td>
                                <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{new Date(client.lastVisit).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                    <button onClick={() => setClientToView(client)} className="p-2 hover:bg-gray-200 rounded-full" title="Ver Detalhes"><ViewIcon /></button>
                                    <button onClick={() => handleOpenEditModal(client)} className="p-2 hover:bg-gray-200 rounded-full" title="Editar"><PencilIcon /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 { !isLoading && clients.length === 0 && (
                    <div className="text-center p-8 text-gray-500">Nenhum cliente encontrado.</div>
                 )}
            </div>

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                    <span className="text-sm text-gray-600">Mostrando {clients.length} de {totalClients} clientes</span>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="btn-secondary text-sm">Anterior</button>
                        <span className="text-sm font-semibold whitespace-nowrap">Página {currentPage} de {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="btn-secondary text-sm">Próximo</button>
                    </div>
                </div>
            )}
        </div>
    );
};