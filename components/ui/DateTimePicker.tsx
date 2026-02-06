"use client";

import { useState, useRef, useEffect } from "react";

interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    label?: string;
    optional?: boolean;
}

export function DateTimePicker({ value, onChange, disabled = false, label, optional = false }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 500 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Derive state directly from props since this is a controlled component
    const selectedDate = value ? new Date(value) : null;
    // Format time from date or default to 00:00
    const selectedTime = selectedDate
        ? `${selectedDate.getHours().toString().padStart(2, '0')}:${selectedDate.getMinutes().toString().padStart(2, '0')}`
        : "00:00";

    // Calculate dropdown position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updatePosition = () => {
                if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const spaceBelow = viewportHeight - rect.bottom - 16; // 16px for padding
                    const spaceAbove = rect.top - 16;

                    // Calculate max height based on available space
                    const maxHeight = Math.min(500, Math.max(spaceBelow, spaceAbove) - 16);

                    // Determine if dropdown should open upwards
                    const openUpwards = spaceBelow < 300 && spaceAbove > spaceBelow;

                    // Fixed positioning is relative to viewport, so use rect values directly
                    setDropdownPosition({
                        top: openUpwards ? rect.top - maxHeight - 8 : rect.bottom + 8,
                        left: rect.left,
                        width: rect.width,
                        maxHeight: maxHeight
                    });
                }
            };

            updatePosition();

            // Update position on scroll and resize
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleDateSelect = (date: Date) => {
        const [hours, minutes] = selectedTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes));

        // Format as ISO string for datetime-local format
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        onChange(`${year}-${month}-${day}T${selectedTime}`);
    };

    const handleTimeChange = (time: string) => {
        if (selectedDate) {
            const [hours, minutes] = time.split(':');
            const newDate = new Date(selectedDate);
            newDate.setHours(parseInt(hours), parseInt(minutes));

            const year = newDate.getFullYear();
            const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
            const day = newDate.getDate().toString().padStart(2, '0');
            onChange(`${year}-${month}-${day}T${time}`);
        }
    };

    const handleClear = () => {
        onChange("");
        setIsOpen(false);
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatDisplayTime = (time: string) => {
        return time;
    };

    // State for calendar navigation (current month being viewed)
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

    // Sync viewDate when value changes, but only if month/year is different
    useEffect(() => {
        if (value) {
            const newDate = new Date(value);
            if (newDate.getMonth() !== viewDate.getMonth() || newDate.getFullYear() !== viewDate.getFullYear()) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setViewDate(newDate);
            }
        }
    }, [value, viewDate]);

    const changeMonth = (delta: number) => {
        const current = viewDate;
        const newDate = new Date(current.getFullYear(), current.getMonth() + delta, 1);
        setViewDate(newDate);
    };

    const currentMonth = viewDate;
    const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Generate calendar days
    const generateCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const days = generateCalendar();
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                    {label} {optional && <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">(opcional)</span>}
                </label>
            )}

            <button
                ref={buttonRef}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full px-4 py-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900 text-left text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/40 focus:border-voxpop-gold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
            >
                <span className={!selectedDate ? "text-zinc-400 dark:text-zinc-600" : ""}>
                    {selectedDate ? `${formatDisplayDate(selectedDate)} ${formatDisplayTime(selectedTime)}` : "Selecione data e hora"}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 text-zinc-400"
                >
                    <path d="M5.25 12a.75.75 0 01.75-.75h8a.75.75 0 010 1.5h-8a.75.75 0 01-.75-.75zM6 13.25a.75.75 0 000 1.5h8a.75.75 0 000-1.5H6zM5.25 7a.75.75 0 01.75-.75h8a.75.75 0 010 1.5h-8A.75.75 0 015.25 7zM6 8.25a.75.75 0 000 1.5h8a.75.75 0 000-1.5H6z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-y-auto
                    [&::-webkit-scrollbar]:w-2
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-zinc-300
                    [&::-webkit-scrollbar-thumb]:dark:bg-zinc-700
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-thumb]:hover:bg-zinc-400
                    [&::-webkit-scrollbar-thumb]:dark:hover:bg-zinc-600"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${Math.max(dropdownPosition.width, 320)}px`,
                        maxHeight: `${dropdownPosition.maxHeight}px`
                    }}
                >
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                        <button
                            type="button"
                            onClick={() => changeMonth(-1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-semibold capitalize">{monthName}</span>
                        <button
                            type="button"
                            onClick={() => changeMonth(1)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => day && handleDateSelect(day)}
                                    disabled={!day}
                                    className={`aspect-square p-2 text-sm rounded-lg transition-all cursor-pointer ${!day
                                        ? "invisible"
                                        : selectedDate && day.toDateString() === selectedDate.toDateString()
                                            ? "bg-voxpop-gold text-voxpop-brown font-semibold"
                                            : day.toDateString() === new Date().toDateString()
                                                ? "bg-voxpop-gold-light dark:bg-voxpop-gold/10 text-voxpop-brown dark:text-voxpop-gold font-medium"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                        }`}
                                >
                                    {day?.getDate()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Picker */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            Hora
                        </label>
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-voxpop-gold/40 focus:border-voxpop-gold transition-all [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:dark:invert"
                        />
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-2 bg-white dark:bg-zinc-900 sticky bottom-0">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex-1 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                            Limpar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-3 py-2 text-sm font-medium text-voxpop-brown bg-voxpop-gold hover:bg-voxpop-gold-dark rounded-lg transition-colors cursor-pointer"
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
