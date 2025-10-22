import type { Client } from './types';
import { getMockNow } from './utils/dateUtils';

export const generateComprehensiveClients = (): Client[] => {
    const clients: Client[] = [];
    const firstNames = ["Miguel", "Arthur", "Gael", "Heitor", "Theo", "Davi", "Gabriel", "Bernardo", "Samuel", "João", "Helena", "Alice", "Laura", "Maria", "Sophia", "Isabella", "Luísa", "Júlia", "Heloísa", "Lívia", "Pedro", "Lucas", "Mateus", "Enzo", "Guilherme", "Rafael", "Felipe", "Gustavo", "Nicolas", "Daniel", "Beatriz", "Manuela", "Mariana", "Ana", "Clara", "Giovanna", "Valentina", "Cecília", "Elisa", "Catarina"];
    const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Dias", "Miranda", "Nunes", "Mendes", "Araújo", "Barbosa", "Cardoso", "Teixeira", "Correia", "Fernandes", "Freitas", "Gonçalves", "Moura", "Pinto"];

    const usedNames = new Set<string>();

    for (let i = 1; i <= 1096; i++) {
        let name, email;
        let attempts = 0;
        // Ensure name uniqueness to avoid duplicate emails
        do {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            name = `${firstName} ${lastName}`;
            attempts++;
        } while (usedNames.has(name) && attempts < 100);
        usedNames.add(name);

        const emailName = name.toLowerCase().replace(' ', '.');
        email = `${emailName}${attempts > 1 ? i : ''}@example.com`;

        const phone = `(${Math.floor(Math.random() * 80) + 11}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
        const cpf = `${String(Math.floor(Math.random() * 900)).padStart(3, '0')}.${String(Math.floor(Math.random() * 900)).padStart(3, '0')}.${String(Math.floor(Math.random() * 900)).padStart(3, '0')}-${String(Math.floor(Math.random() * 90)).padStart(2, '0')}`;
        
        const birthYear = Math.floor(Math.random() * (2005 - 1960 + 1)) + 1960;
        const birthMonth = Math.floor(Math.random() * 12) + 1;
        const birthDay = Math.floor(Math.random() * 28) + 1;
        const birthdate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

        const lastVisitDate = getMockNow();
        lastVisitDate.setDate(lastVisitDate.getDate() - Math.floor(Math.random() * 365));
        const lastVisit = lastVisitDate.toISOString().split('T')[0];

        clients.push({
            id: i,
            name,
            email,
            phone,
            cpf,
            birthdate,
            lastVisit
        });
    }

    return clients.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
};