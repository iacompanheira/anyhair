import React, { useState, useEffect, useMemo } from 'react';
import type { UnifiedUser, Service, AccessLevel } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { ToggleSwitch } from '../../components/ui/ToggleSwitch';

// --- ICONS ---
const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>;
const PencilIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-red-500'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const LinkIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const LockClosedIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const ImageUploadIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const TrashIconForImage: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const EyeIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EyeOffIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${className}`}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243-4.243-4.243" /></svg>;


// --- MODAL COMPONENTS ---
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{title}</h3></header>
                <main className="p-5 text-gray-600">{children}</main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button onClick={onConfirm} className="btn-danger">Excluir Usuário</button>
                </footer>
            </div>
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const UserModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (userData: Omit<UnifiedUser, 'id'>, password?: string) => void; userToEdit: UnifiedUser | null; }> = ({ isOpen, onClose, onSave, userToEdit }) => {
    const { services } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [accessLevel, setAccessLevel] = useState<AccessLevel>('professional');
    const [isEnabled, setIsEnabled] = useState(true);
    const [specialty, setSpecialty] = useState('');
    const [serviceIds, setServiceIds] = useState<number[]>([]);
    const [displayOrder, setDisplayOrder] = useState(99);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(userToEdit?.name || '');
            setEmail(userToEdit?.email || '');
            setImageUrl(userToEdit?.imageUrl || '');
            setAccessLevel(userToEdit?.accessLevel || 'professional');
            setIsEnabled(userToEdit?.isEnabled ?? true);
            setSpecialty(userToEdit?.specialty || '');
            setServiceIds(userToEdit?.serviceIds || []);
            setDisplayOrder(userToEdit?.displayOrder || 99);
            setPassword('');
            setShowPassword(false);
            setImageFile(null);
        }
    }, [userToEdit, isOpen]);
    
    useEffect(() => {
        return () => {
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let finalImageUrl = imageUrl;
        if (imageFile) {
            finalImageUrl = await fileToBase64(imageFile);
        }
        onSave({ name, email, imageUrl: finalImageUrl, accessLevel, specialty, serviceIds, displayOrder, isEnabled }, password || undefined);
    };
    
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (imageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
            setImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imageFile && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(null);
        setImageUrl(e.target.value);
    };

    const handleRemoveImage = () => {
        if (imageFile && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(null);
        setImageUrl('');
    };

    const isSuperAdmin = userToEdit?.accessLevel === 'super_admin';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-xl shadow-xl text-brand-dark flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-5 border-b"><h3 className="font-bold text-lg">{userToEdit ? 'Editar' : 'Adicionar'} Usuário</h3></header>
                <main className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div><label className="block text-sm font-medium mb-1 text-gray-700">Nome Completo *</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full input-dark" /></div>
                    <div><label className="block text-sm font-medium mb-1 text-gray-700">E-mail *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full input-dark" /></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Perfil</label>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
                             {imageUrl && (
                                <div className="relative w-full h-40 rounded-lg overflow-hidden group shadow-sm bg-gray-200">
                                    <img src={imageUrl} alt="Preview do Usuário" className="w-full h-full object-cover" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrashIconForImage />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="user-file-upload" className="flex-1 btn-secondary text-center cursor-pointer flex items-center justify-center">
                                    <ImageUploadIcon /> Carregar Arquivo
                                </label>
                                <input id="user-file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageFileChange} />
                            </div>
                            <div className="relative flex items-center">
                                <LinkIcon />
                                <input type="text" value={imageUrl.startsWith('blob:') ? '' : imageUrl} onChange={handleImageUrlChange} placeholder="Ou cole a URL da imagem aqui" className="w-full pl-8 input-dark" />
                            </div>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1 text-gray-700">Nível de Acesso</label>
                        <select value={accessLevel} onChange={e => setAccessLevel(e.target.value as AccessLevel)} className="w-full select-dark" disabled={isSuperAdmin}>
                            <option value="professional">Profissional</option><option value="admin">Administrador</option><option value="super_admin">Super Administrador</option>
                        </select>
                        {isSuperAdmin && <p className="text-xs text-gray-500 mt-1">O Super Administrador não pode ser rebaixado.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center gap-2">
                             <ToggleSwitch enabled={isEnabled} setEnabled={setIsEnabled} />
                             <span className={`font-semibold ${isEnabled ? 'text-green-600' : 'text-gray-500'}`}>{isEnabled ? 'Ativo' : 'Inativo'}</span>
                        </div>
                    </div>
                    {(accessLevel === 'admin' || accessLevel === 'super_admin' || accessLevel === 'professional') && (
                        <div className="p-4 border-t mt-2 space-y-4 animate-fade-in-down">
                            <h4 className="font-semibold text-gray-700">Credenciais de Acesso</h4>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">Senha</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" className="w-full pl-8 pr-10 input-dark" />
                                     <LockClosedIcon className="h-5 w-5 mr-2 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {accessLevel === 'professional' && (
                        <div className="p-4 border-t mt-4 space-y-4 animate-fade-in-down">
                            <h4 className="font-semibold">Informações do Profissional</h4>
                            <div><label className="block text-sm font-medium mb-1 text-gray-700">Especialidade</label><input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full input-dark" /></div>
                            <div><label className="block text-sm font-medium mb-1 text-gray-700">Ordem de Exibição</label><input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="w-full input-dark" /></div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Serviços Realizados</label>
                                <div className="space-y-1 p-3 bg-gray-50 border rounded-md max-h-32 overflow-y-auto">
                                    {services.map(service => (
                                        <label key={service.id} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary" checked={serviceIds.includes(service.id)} onChange={() => setServiceIds(prev => prev.includes(service.id) ? prev.filter(id => id !== service.id) : [...prev, service.id])} /> {service.name}</label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                <footer className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Salvar</button>
                </footer>
            </form>
        </div>
    );
};

// --- MAIN COMPONENT ---
const UsersScreen: React.FC = () => {
    const { users, setUsers } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UnifiedUser | null>(null);
    const [userToDelete, setUserToDelete] = useState<UnifiedUser | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<AccessLevel | 'all'>('all');
    
    const accessLevelStyles: Record<AccessLevel, string> = {
        super_admin: 'bg-red-100 text-red-800',
        admin: 'bg-pink-100 text-pink-800',
        professional: 'bg-blue-100 text-blue-800'
    };
    const accessLevelLabels: Record<AccessLevel, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        professional: 'Profissional'
    };

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (roleFilter !== 'all' && user.accessLevel !== roleFilter) {
                    return false;
                }
                if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && !user.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
    }, [users, searchTerm, roleFilter]);

    const handleOpenModal = (user: UnifiedUser | null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleOpenConfirmModal = (user: UnifiedUser) => {
        setUserToDelete(user);
        setConfirmModalOpen(true);
    };

    const handleSaveUser = (userData: Omit<UnifiedUser, 'id'>, password?: string) => {
        setUsers(prev => {
            if (userToEdit) {
                if (password) {
                    localStorage.setItem(`user_pass_${userToEdit.id}`, password);
                }
                return prev.map(u => u.id === userToEdit.id ? { ...u, ...userData } : u);
            }
            const newUser = { ...userData, id: Date.now() };
            if (password) {
                localStorage.setItem(`user_pass_${newUser.id}`, password);
            }
            return [...prev, newUser];
        });
        setIsModalOpen(false);
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            localStorage.removeItem(`user_pass_${userToDelete.id}`);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        }
        setConfirmModalOpen(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Gerenciamento de Usuários</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                         <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input-dark w-full sm:w-48"
                        />
                         <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} className="select-dark w-full sm:w-40">
                            <option value="all">Todas as Funções</option>
                            <option value="professional">Profissional</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                        <button onClick={() => handleOpenModal(null)} className="btn-primary flex items-center justify-center gap-2 shrink-0">
                            <PlusCircleIcon className="w-5 h-5 text-white" />
                            Adicionar
                        </button>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredUsers.map(user => {
                        const isSuperAdmin = user.accessLevel === 'super_admin';
                        return (
                            <div key={user.id} className="py-4">
                                <div className="flex items-center gap-4">
                                    <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                                            {user.name}
                                            {!user.isEnabled && <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full">INATIVO</span>}
                                        </p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pl-16">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${accessLevelStyles[user.accessLevel]}`}>
                                        {accessLevelLabels[user.accessLevel]}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenModal(user)} className="p-2 hover:bg-gray-200 rounded-full" aria-label={`Editar ${user.name}`}>
                                            <PencilIcon />
                                        </button>
                                        <button onClick={() => handleOpenConfirmModal(user)} className="p-2 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSuperAdmin} aria-label={`Excluir ${user.name}`}>
                                            {isSuperAdmin ? <LockClosedIcon /> : <TrashIcon />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                     {filteredUsers.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            Nenhum usuário encontrado com os filtros aplicados.
                        </div>
                    )}
                </div>
            </div>

            <UserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} userToEdit={userToEdit} />
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleDeleteUser} title="Confirmar Exclusão">
                <p>Você está prestes a remover o usuário <strong className="font-bold text-gray-800">{userToDelete?.name}</strong>. Esta ação é irreversível. Deseja continuar?</p>
            </ConfirmationModal>
        </div>
    );
};

export default UsersScreen;