"use client";

import { useRef, useEffect, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

interface CodeInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value?: string) => void;
    disabled?: boolean;
    error?: string;
}

export function CodeInput({ value, onChange, onSubmit, disabled = false, error }: CodeInputProps) {
    const { t } = useTranslation();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const CODE_LENGTH = 6;

    useEffect(() => {
        // Auto-focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, digit: string) => {
        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newValue = value.split("");
        newValue[index] = digit;
        const updatedValue = newValue.join("").slice(0, CODE_LENGTH);
        onChange(updatedValue);

        // Auto-advance to next input
        if (digit && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (updatedValue.length === CODE_LENGTH) {
            onSubmit(updatedValue);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!value[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                const newValue = value.split("");
                newValue[index] = "";
                onChange(newValue.join(""));
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
        onChange(pastedData);

        // Focus the next empty input or the last one
        const nextIndex = Math.min(pastedData.length, CODE_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {t("login.codeLabel")}
            </label>
            <div className="flex gap-2 justify-center">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value[index] || ""}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={disabled}
                        className="w-12 h-14 text-center text-2xl font-semibold border border-zinc-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-voxpop-gold focus:border-voxpop-gold
                     disabled:opacity-50 disabled:cursor-not-allowed
                     dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100
                     transition-all"
                    />
                ))}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            )}
        </div>
    );
}
