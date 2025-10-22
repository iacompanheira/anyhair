import type { Appointment, Client } from './types';
import { SERVICES_DATA, MOCK_USERS } from './constants';
import { getMockNow } from './utils/dateUtils';

// This interface is an internal optimization for this module.
export interface CachedAppointment {
  id: number;
  cId: number; // clientId
  sId: number; // serviceId
  pId: number; // professionalId
  date: string;
  time: string;
  status: Appointment['status'];
  ps?: 'paid' | 'pending'; // paymentStatus
  pm?: string; // paymentMethod
}

export const generateComprehensiveAppointments = (clients: Client[]): CachedAppointment[] => {
    const appointments: CachedAppointment[] = [];
    const fixedToday = getMockNow();
    const startDate = new Date(fixedToday);
    startDate.setMonth(fixedToday.getMonth() - 10); // 10 months in the past to include Jan-Mar 2025
    const endDate = new Date(fixedToday);
    endDate.setMonth(fixedToday.getMonth() + 6); // 6 months in the future

    let appointmentId = 1;
    const currentDate = new Date(startDate);

    const availableProfessionals = MOCK_USERS.filter(p => p.accessLevel === 'professional');
    const paymentMethods = ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

    let monthlyAppointmentCounts: number[] = [];
    let currentMonth = -1;

    // Helper to shuffle an array
    const shuffleArray = (array: number[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };


    while (currentDate.getTime() <= endDate.getTime()) {
        // If month has changed, generate a new set of unique appointment counts
        if (currentDate.getUTCMonth() !== currentMonth) {
            currentMonth = currentDate.getUTCMonth();
            const year = currentDate.getUTCFullYear();
            const daysInMonth = new Date(Date.UTC(year, currentMonth + 1, 0)).getUTCDate();
            
            // Create a pool of possible appointment counts (10-30) and shuffle it
            const countPool = Array.from({ length: 30 - 10 + 1 }, (_, i) => i + 10);
            const shuffledPool = shuffleArray(countPool);

            // Take a unique count for each day of the month, ensuring variety
            monthlyAppointmentCounts = shuffledPool.slice(0, daysInMonth);
        }
        
        const dayOfMonth = currentDate.getUTCDate() - 1; // 0-indexed
        const numAppointments = monthlyAppointmentCounts[dayOfMonth] || (Math.floor(Math.random() * 21) + 10); // Fallback

        const dayOfWeek = currentDate.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        let startHour: number, endHour: number;

        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
            startHour = 7;
            endHour = 20;
        } else if (dayOfWeek === 6) { // Saturday
            startHour = 7;
            endHour = 18;
        } else { // Sunday
            startHour = 7;
            endHour = 16;
        }

        for (let i = 0; i < numAppointments; i++) {
            // Generate a random time within operating hours, in 15-minute intervals
            const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
            const randomMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
            const time = `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}`;
            
            // Select random client, service, and professional
            const client = clients[Math.floor(Math.random() * clients.length)];
            const service = SERVICES_DATA[Math.floor(Math.random() * SERVICES_DATA.length)];
            const professional = availableProfessionals[Math.floor(Math.random() * availableProfessionals.length)];

            // Determine status based on the fixed 'today'
            let status: Appointment['status'];
            let paymentStatus: 'paid' | 'pending' | undefined;
            let paymentMethod: string | undefined;

            if (currentDate.getTime() < fixedToday.getTime()) {
                const rand = Math.random();
                if (rand < 0.85) {
                    status = 'completed';
                    paymentStatus = 'paid';
                    paymentMethod = paymentMethods[i % paymentMethods.length];
                }
                else if (rand < 0.95) status = 'cancelled';
                else status = 'no-show';
            } else {
                status = 'scheduled';
            }

            appointments.push({
                id: appointmentId++,
                cId: client.id,
                sId: service.id,
                pId: professional.id,
                date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
                time: time,
                status: status,
                ps: paymentStatus,
                pm: paymentMethod,
            });
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return appointments;
};