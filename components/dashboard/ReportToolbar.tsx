import React, { useState, useRef, useEffect } from 'react';
import { PeriodSelector } from './PeriodSelector';
import type { PeriodSelection } from './PeriodSelector';
import type { FullAppointment } from '../../types';

// --- ICONS ---
const PrintIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const FilePdfIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const FileCsvIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const CalendarDateIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 ${className ?? ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChevronDownIcon = ({ open }: { open: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;


interface ReportToolbarProps {
    periodSelection: PeriodSelection;
    onPeriodSelect: (selection: PeriodSelection) => void;
    allAppointments?: FullAppointment[];
    onPrint?: () => void;
    onExportCsv?: () => void;
    children?: React.ReactNode;
}

export const ReportToolbar: React.FC<ReportToolbarProps> = ({ periodSelection, onPeriodSelect, allAppointments, onPrint, onExportCsv, children }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasExportOptions = onPrint || onExportCsv;

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border space-y-4 no-print">
            <div className="flex flex-col items-start gap-4">
                 <div ref={pickerRef} className="relative w-full sm:w-auto">
                    <button onClick={() => setIsPickerOpen(!isPickerOpen)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors w-full justify-between sm:w-auto">
                        <CalendarDateIcon />
                        <span>{periodSelection.label}</span>
                        <ChevronDownIcon open={isPickerOpen} />
                    </button>
                    {isPickerOpen && <PeriodSelector allAppointments={allAppointments} onSelect={(selection) => { onPeriodSelect(selection); setIsPickerOpen(false); }} />}
                </div>
                {hasExportOptions && (
                    <div className="flex items-center gap-2">
                        {onPrint && <button onClick={onPrint} className="btn-secondary p-2" title="Imprimir"><PrintIcon /></button>}
                        {onPrint && <button onClick={onPrint} className="btn-secondary flex items-center gap-2 text-sm"><FilePdfIcon /> PDF</button>}
                        {onExportCsv && <button onClick={onExportCsv} className="btn-secondary flex items-center gap-2 text-sm"><FileCsvIcon /> CSV</button>}
                    </div>
                )}
            </div>
            {children && (
                <div className="border-t pt-4">
                    {children}
                </div>
            )}
        </div>
    );
};
