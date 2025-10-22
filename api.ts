import { FullAppointment, Appointment, Client, UnifiedUser, UserRole, AuditLogEntry, Service } from './types';
import { SERVICES_DATA, MOCK_USERS } from './constants';
import { generateComprehensiveClients } from './mockClients';
import { generateComprehensiveAppointments, CachedAppointment } from './mockAppointments';
import { generateMockAuditLog } from './mockAuditLog';


// --- DATA INITIALIZATION & CACHING ---

let allClients: Client[] = [];
let allCachedAppointments: CachedAppointment[] = [];
let allFullAppointments: FullAppointment[] = [];
let allAuditLogs: AuditLogEntry[] = [];

const hydrateAppointment = (
    appt: CachedAppointment,
    clientMap: Map<number, Client>,
    userMap: Map<number, UnifiedUser>,
    // @ts-ignore
    serviceMap: Map<number, Service>
): FullAppointment | null => {
    const client = clientMap.get(appt.cId);
    const professional = userMap.get(appt.pId);
    const service = serviceMap.get(appt.sId);

    if (!client || !professional || !service) {
        console.warn(`Could not find full data for appointment ID: ${appt.id}. Missing: ${!client ? 'client' : ''} ${!professional ? 'pro' : ''} ${!service ? 'service' : ''}`);
        return null;
    }
    
    const [year, month, day] = appt.date.split('-').map(Number);
    const [hour, minute] = appt.time.split(':').map(Number);
    // Use UTC to avoid timezone shifts from mock data
    const appointmentDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

    return {
        id: String(appt.id),
        date: appointmentDate,
        status: appt.status,
        client,
        professional,
        service: {
            ...service,
            color: `border-l-4 ${['border-pink-500', 'border-blue-500', 'border-green-500', 'border-yellow-500'][service.id % 4]}`
        },
        paymentStatus: appt.ps || 'pending',
        paymentMethod: appt.pm,
    };
};

const initializeMockData = () => {
    const cachedClients = sessionStorage.getItem('mockClients');
    const cachedAppointments = sessionStorage.getItem('mockAppointments');
    const cachedAuditLogs = sessionStorage.getItem('mockAuditLogs');

    if (cachedClients && cachedAppointments && cachedAuditLogs) {
        console.log("Loading mock data from sessionStorage cache...");
        try {
            allClients = JSON.parse(cachedClients);
            allCachedAppointments = JSON.parse(cachedAppointments);
            allAuditLogs = JSON.parse(cachedAuditLogs).map((log: any) => ({ ...log, timestamp: new Date(log.timestamp)}));
        } catch (e) {
            console.error("Failed to parse cached data, regenerating...", e);
            sessionStorage.clear(); // Clear potentially corrupted data
            generateAndCacheData();
        }
    } else {
        generateAndCacheData();
    }
    
    // Hydrate the full appointments in memory for the app to use
    console.log("Hydrating full appointment data...");
    const clientMap = new Map(allClients.map(c => [c.id, c]));
    const userMap = new Map(MOCK_USERS.map(u => [u.id, u]));
    const serviceMap = new Map(SERVICES_DATA.map(s => [s.id, s]));

    allFullAppointments = allCachedAppointments
        .map(appt => hydrateAppointment(appt, clientMap, userMap, serviceMap))
        .filter((a): a is FullAppointment => a !== null);
    console.log(`Hydration complete. ${allFullAppointments.length} appointments ready.`);
};

const generateAndCacheData = () => {
    console.log("Generating and caching comprehensive mock data. This will be slow on first load only.");
    const clients = generateComprehensiveClients();
    const appointments = generateComprehensiveAppointments(clients);
    const auditLogs = generateMockAuditLog(MOCK_USERS, clients, SERVICES_DATA);
    
    allClients = clients;
    allCachedAppointments = appointments;
    allAuditLogs = auditLogs;
    
    try {
        sessionStorage.setItem('mockClients', JSON.stringify(allClients));
        sessionStorage.setItem('mockAppointments', JSON.stringify(allCachedAppointments));
        sessionStorage.setItem('mockAuditLogs', JSON.stringify(allAuditLogs));
    } catch (e) {
        console.error("Failed to cache data in sessionStorage. Data might be too large.", e);
        // The app will continue with in-memory data, but subsequent reloads will be slower.
    }
};


// Initialize data once when the module is loaded
initializeMockData();


// --- APPOINTMENT API FUNCTIONS ---

export const getAppointments = (options?: { startDate?: Date; endDate?: Date }): Promise<FullAppointment[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let results = [...allFullAppointments];
            if (options?.startDate && options?.endDate) {
                const start = options.startDate.getTime();
                const end = options.endDate.getTime();
                results = results.filter(appt => {
                    const apptTime = appt.date.getTime();
                    return apptTime >= start && apptTime <= end;
                });
            }
            resolve(results);
        }, 500);
    });
};

export const updateAppointmentStatus = (id: string, status: Appointment['status'], paymentMethod?: string): Promise<void> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            let found = false;
            // Update in-memory full appointments for the UI
            allFullAppointments = allFullAppointments.map(a => {
                if (a.id === id) {
                    found = true;
                    const updatedAppt: FullAppointment = { ...a, status };

                    if (status === 'completed') {
                        if (paymentMethod) {
                            updatedAppt.paymentStatus = 'paid';
                            updatedAppt.paymentMethod = paymentMethod;
                        } else if (a.paymentStatus !== 'paid') {
                             updatedAppt.paymentStatus = 'pending';
                             updatedAppt.paymentMethod = undefined;
                        }
                    } else if (status === 'scheduled') { // Reverting status
                        updatedAppt.paymentStatus = 'pending';
                        updatedAppt.paymentMethod = undefined;
                    }
                    
                    return updatedAppt;
                }
                return a;
            });
            
            if (found) {
                // Also update the cached appointment data
                const numericId = parseInt(id, 10);
                const cachedApptIndex = allCachedAppointments.findIndex(a => a.id === numericId);
                if (cachedApptIndex !== -1) {
                    allCachedAppointments[cachedApptIndex].status = status;
                     if (status === 'completed') {
                        if (paymentMethod) {
                            allCachedAppointments[cachedApptIndex].ps = 'paid';
                            allCachedAppointments[cachedApptIndex].pm = paymentMethod;
                        } else {
                             allCachedAppointments[cachedApptIndex].ps = 'pending';
                             delete allCachedAppointments[cachedApptIndex].pm;
                        }
                    } else if (status === 'scheduled') {
                        allCachedAppointments[cachedApptIndex].ps = 'pending';
                        delete allCachedAppointments[cachedApptIndex].pm;
                    }
                }
                
                // Re-cache the updated optimized data
                 try {
                    sessionStorage.setItem('mockAppointments', JSON.stringify(allCachedAppointments));
                } catch(e) {
                     console.error("Failed to re-cache appointment data", e);
                }
                resolve();
            } else {
                reject(new Error("Appointment not found"));
            }
        }, 300);
    });
};

// --- CLIENT API FUNCTIONS ---
export const getClients = (page: number, limit: number, searchTerm: string = ''): Promise<{ clients: Client[], total: number }> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let filtered = [...allClients];
      if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(lowercasedTerm) ||
            c.email.toLowerCase().includes(lowercasedTerm) ||
            c.phone.includes(searchTerm) ||
            c.cpf.includes(searchTerm)
        );
      }
      
      const total = filtered.length;
      const startIndex = (page - 1) * limit;
      const paginatedClients = filtered.slice(startIndex, startIndex + limit);
      
      resolve({ clients: paginatedClients, total });
    }, 500);
  });
};

export const saveClient = (clientData: Omit<Client, 'id' | 'lastVisit'> & { id?: number }): Promise<Client> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (clientData.id) { // Update existing client
                let updatedClient: Client | null = null;
                allClients = allClients.map(c => {
                    if (c.id === clientData.id) {
                        updatedClient = { ...c, ...clientData };
                        return updatedClient;
                    }
                    return c;
                });
                if(updatedClient) resolve(updatedClient);
            } else { // Create new client
                const newId = allClients.reduce((maxId, client) => Math.max(client.id, maxId), 0) + 1;
                const newClient: Client = {
                    ...clientData,
                    id: newId,
                    lastVisit: new Date('2025-10-15T12:00:00Z').toISOString().split('T')[0],
                };
                allClients.unshift(newClient);
                resolve(newClient);
            }
            // Re-cache client data after modification
            sessionStorage.setItem('mockClients', JSON.stringify(allClients));
        }, 300);
    });
};

export const deleteClients = (clientIds: number[]): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            allClients = allClients.filter(c => !clientIds.includes(c.id));
            // Re-cache client data after modification
            sessionStorage.setItem('mockClients', JSON.stringify(allClients));
            resolve();
        }, 500);
    });
};

// --- AUDIT LOG API FUNCTIONS ---
export const getAuditLog = (filters: { start: Date; end: Date; userId: string; searchTerm: string; page: number; limit: number; }): Promise<{ logs: AuditLogEntry[], total: number }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let filtered = [...allAuditLogs];

            // Date Range Filter
            filtered = filtered.filter(log => {
                const logDate = new Date(log.timestamp);
                // Adjust start and end times for full-day coverage
                const startOfDay = new Date(filters.start);
                startOfDay.setUTCHours(0,0,0,0);
                const endOfDay = new Date(filters.end);
                endOfDay.setUTCHours(23,59,59,999);
                return logDate.getTime() >= startOfDay.getTime() && logDate.getTime() <= endOfDay.getTime();
            });

            // User Filter
            if (filters.userId !== 'all') {
                const userId = parseInt(filters.userId, 10);
                filtered = filtered.filter(log => log.userId === userId);
            }

            // Search Term Filter
            if (filters.searchTerm) {
                const lowercasedTerm = filters.searchTerm.toLowerCase();
                filtered = filtered.filter(log => log.description.toLowerCase().includes(lowercasedTerm));
            }

            const total = filtered.length;
            const startIndex = (filters.page - 1) * filters.limit;
            const paginatedLogs = filtered.slice(startIndex, startIndex + filters.limit);
            
            resolve({ logs: paginatedLogs, total });
        }, 500);
    });
};