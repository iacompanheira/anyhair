import type { AuditLogEntry, UnifiedUser, Client, Service } from './types';

export const generateMockAuditLog = (users: UnifiedUser[], clients: Client[], services: Service[]): AuditLogEntry[] => {
    const logs: AuditLogEntry[] = [];
    const today = new Date('2025-10-15T12:00:00Z');
    let logId = 1;
    const admins = users.filter(u => u.accessLevel === 'admin' || u.accessLevel === 'super_admin');
    
    for (let i = 0; i < 200; i++) {
        const timestamp = new Date(today);
        timestamp.setHours(today.getHours() - i * 2);
        const user = admins[i % admins.length];
        const entityType = (['user', 'client', 'appointment', 'service', 'branding', 'settings', 'security'] as AuditLogEntry['entityType'][])[i % 7];
        
        let description = '';
        let entityId: string | number | undefined;

        switch (entityType) {
            case 'user':
                const targetUser = users[i % users.length];
                entityId = targetUser.id;
                description = `Alterou o nível de acesso do usuário <strong>${targetUser.name}</strong> para <strong>Administrador</strong>.`;
                break;
            case 'client':
                const client = clients[i % clients.length];
                entityId = client.id;
                description = `Excluiu o cliente <strong>${client.name}</strong>.`;
                break;
            case 'appointment':
                entityId = i + 1000;
                description = `Marcou o agendamento de <strong>${clients[i % clients.length].name}</strong> como <strong>Concluído</strong>.`;
                break;
            case 'service':
                const service = services[i % services.length];
                entityId = service.id;
                description = `Atualizou o preço do serviço <strong>'${service.name}'</strong> para <strong>R$ 45,00</strong>.`;
                break;
            case 'branding':
                description = `Alterou a cor primária do salão para <strong>#E11D48</strong>.`;
                break;
            case 'settings':
                description = `Desativou o módulo de <strong>Relatórios</strong>.`;
                break;
            case 'security':
                description = `Alterou a <strong>senha mestra</strong>.`;
                break;
        }

        logs.push({
            id: logId++,
            timestamp,
            userId: user.id,
            userName: user.name,
            actionType: 'update',
            entityType,
            entityId,
            description
        });
    }
    return logs;
};