import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../api';
import type { FullAppointment, Reminder } from '../../types';
import { Button } from '../../components/ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { BellIcon } from '../../components/ui/Icons';

const ReminderModal: React.FC<{
    appointment: FullAppointment;
    onClose: () => void;
    onSetReminder: (minutes: number) => void;
    onRemoveReminder: (appointmentId: string) => void;
    existingReminderTime: number | null;
}> = ({ appointment, onClose, onSetReminder, onRemoveReminder, existingReminderTime }) => {
    const reminderOptions = [5, 15, 30, 60];
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Definir Lembrete</h3>
                    <p className="text-sm text-gray-600">Para o agendamento de <span className="font-semibold">{appointment.client.name}</span></p>
                </div>
                {existingReminderTime ? (
                    <div className="p-5 text-center space-y-3">
                        <p className="font-semibold text-gray-800">Já existe um lembrete agendado para:</p>
                        <p className="text-lg font-bold text-brand-primary my-2">{new Date(existingReminderTime).toLocaleTimeString('pt-BR')}</p>
                        <div className="flex gap-2 justify-center">
                            <Button variant="danger" onClick={() => onRemoveReminder(appointment.id)}>Remover Lembrete</Button>
                            <Button variant="secondary" onClick={onClose}>Fechar</Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 grid grid-cols-2 gap-3">
                        {reminderOptions.map(min => (
                            <Button key={min} variant="secondary" onClick={() => onSetReminder(min)}>
                                Em {min} minuto{min > 1 ? 's' : ''}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PendingActionsScreen: React.FC = () => {
    const [allAppointments, setAllAppointments] = useState<FullAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { reminders, setReminders } = useAppContext();
    const [reminderModal, setReminderModal] = useState<{ isOpen: boolean; appointment: FullAppointment | null }>({ isOpen: false, appointment: null });

    useEffect(() => {
        const fetchAppointments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apptsData = await api.getAppointments();
                setAllAppointments(apptsData);
            } catch (error) {
                console.error('Falha ao carregar agendamentos:', error);
                setError('Ocorreu um erro ao carregar os agendamentos.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const pendingAppointments = useMemo(() => {
        const now = new Date('2025-10-15T12:00:00Z');
        return allAppointments
            .filter(a => a.status === 'scheduled' && a.date.getTime() < now.getTime())
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [allAppointments]);

    const handleUpdateStatus = async (id: string, status: FullAppointment['status']) => {
        const originalAppointments = [...allAppointments];
        const updatedAll = allAppointments.filter(a => a.id !== id);
        setAllAppointments(updatedAll);
        
        try {
            await api.updateAppointmentStatus(id, status);
        } catch (error) {
            console.error('Falha ao atualizar status:', error);
            setAllAppointments(originalAppointments);
        }
    };
    
    const handleSetReminder = async (appointment: FullAppointment, minutes: number) => {
        if (typeof Notification === 'undefined') {
            alert('Este navegador não suporta notificações.');
            setReminderModal({ isOpen: false, appointment: null });
            return;
        }

        if (Notification.permission === 'denied') {
            alert('As notificações estão bloqueadas. Por favor, habilite-as nas configurações do seu navegador.');
            setReminderModal({ isOpen: false, appointment: null });
            return;
        }
    
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('Você precisa permitir as notificações para criar lembretes.');
                setReminderModal({ isOpen: false, appointment: null });
                return;
            }
        }
    
        const remindAt = Date.now() + minutes * 60 * 1000;
        const newReminder: Reminder = {
            id: `${appointment.id}-${remindAt}`,
            appointmentId: appointment.id,
            remindAt,
            title: `Lembrete de Ação Pendente`,
            body: `Atualize o status do agendamento de ${appointment.client.name} para ${appointment.service.name}.`
        };
    
        setReminders(prev => [...prev.filter(r => r.appointmentId !== appointment.id), newReminder]);
        alert(`Lembrete definido para daqui a ${minutes} minuto(s).`);
        setReminderModal({ isOpen: false, appointment: null });
    };
    
    const handleRemoveReminder = (appointmentId: string) => {
        setReminders(prev => prev.filter(r => r.appointmentId !== appointmentId));
        setReminderModal({ isOpen: false, appointment: null });
        alert('Lembrete removido.');
    };

    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <h3 className="font-bold text-yellow-800">Ações Pendentes</h3>
                <p className="text-sm text-yellow-700">
                    Os agendamentos abaixo já passaram do horário, mas o status não foi atualizado.
                    Por favor, confirme se o serviço foi concluído, cancelado ou se o cliente não compareceu.
                </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border">
                 <div className="divide-y divide-gray-200">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Carregando agendamentos...</div>
                    ) : pendingAppointments.length === 0 ? (
                        <div className="p-8 text-center text-green-600 font-semibold">
                            ✓ Nenhuma ação pendente. Todos os agendamentos estão atualizados!
                        </div>
                    ) : (
                        pendingAppointments.map(appt => {
                            const existingReminder = reminders.find(r => r.appointmentId === appt.id);
                            return (
                                <div key={appt.id} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div className="md:col-span-1">
                                        <p className="font-bold text-lg text-brand-dark">
                                            {appt.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {appt.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                                        </p>
                                        <p className="font-semibold text-brand-dark">{appt.client.name}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                         <p className="font-semibold text-brand-dark">{appt.service.name}</p>
                                        <p className="text-sm text-gray-600">com {appt.professional.name}</p>
                                    </div>
                                     <div className="md:col-span-1 flex flex-wrap items-center justify-end gap-2">
                                        <Button variant="success" className="!px-3 !py-1 !text-xs" onClick={() => handleUpdateStatus(appt.id, 'completed')}>Concluir</Button>
                                        <Button variant="warning" className="!px-3 !py-1 !text-xs" onClick={() => handleUpdateStatus(appt.id, 'no-show')}>Faltou</Button>
                                        <Button variant="danger" className="!px-3 !py-1 !text-xs" onClick={() => handleUpdateStatus(appt.id, 'cancelled')}>Cancelar</Button>
                                        <Button variant="ghost" className="!p-2" onClick={() => setReminderModal({ isOpen: true, appointment: appt })} title="Definir Lembrete">
                                            <BellIcon className={`h-5 w-5 ${existingReminder ? 'text-brand-primary' : 'text-gray-500'}`} />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                 </div>
            </div>
            {reminderModal.isOpen && reminderModal.appointment && (
                <ReminderModal
                    appointment={reminderModal.appointment}
                    onClose={() => setReminderModal({ isOpen: false, appointment: null })}
                    onSetReminder={(minutes) => handleSetReminder(reminderModal.appointment!, minutes)}
                    onRemoveReminder={handleRemoveReminder}
                    existingReminderTime={reminders.find(r => r.appointmentId === reminderModal.appointment?.id)?.remindAt || null}
                />
            )}
        </div>
    );
};

export default PendingActionsScreen;