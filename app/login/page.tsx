"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { generateCode, generateTokens } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { isValidPhoneNumber } from "react-phone-number-input";
import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput";
import { CodeInput } from "@/components/ui/CodeInput";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const { t } = useTranslation();

    const [step, setStep] = useState<Step>("phone");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    // Timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleResendCode = async () => {
        if (!phoneNumber || resendTimer > 0) return;

        setLoading(true);
        setError("");

        try {
            await generateCode(phoneNumber);
            setResendTimer(60); // 1 minute cooldown
        } catch (err) {
            setError(t("login.errors.sendCodeFailed"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const errorParam = searchParams.get("error");
        const phoneParam = searchParams.get("phone");

        if (errorParam === "user_exists") {
            setError(t("signup.alreadyHaveAccount"));
        }
        if (phoneParam) {
            setPhoneNumber(phoneParam);
        }
    }, [searchParams, t]);

    const handlePhoneSubmit = async () => {
        if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
            setError(t("login.errors.invalidPhone"));
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Generate code (request SMS for existing user)
            await generateCode(phoneNumber);
            setStep("code");
        } catch (err) {
            setError(t("login.errors.sendCodeFailed"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = async (eOrCode?: React.MouseEvent | string) => {
        const actualCode = typeof eOrCode === "string" ? eOrCode : code;

        if (actualCode.length !== 6) {
            setError(t("login.errors.invalidCode"));
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Generate tokens with the code
            const { accessToken, refreshToken } = await generateTokens(phoneNumber, actualCode, 1);

            // Save to auth context and localStorage
            login(phoneNumber, accessToken, refreshToken);

            // Redirect to home page
            router.push("/");
        } catch (err) {
            setError(t("login.errors.verifyFailed"));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 p-8 sm:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {step === "phone" ? t("login.welcome") : t("login.verifyCode")}
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        {step === "phone"
                            ? t("login.phonePrompt")
                            : t("login.codePrompt", { phoneNumber })}
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {step === "phone" ? (
                        <>
                            <PhoneNumberInput
                                value={phoneNumber}
                                onChange={setPhoneNumber}
                                onSubmit={handlePhoneSubmit}
                                disabled={loading}
                                error={error}
                            />
                            <button
                                onClick={handlePhoneSubmit}
                                disabled={loading || !phoneNumber}
                                className="w-full py-3 px-4 bg-voxpop-gold hover:bg-voxpop-gold-dark 
                           disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed
                           text-voxpop-brown disabled:text-zinc-400 dark:disabled:text-zinc-500 font-bold rounded-xl shadow-sm
                           transition-all focus:outline-none focus:ring-2 focus:ring-voxpop-gold 
                           focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transform active:scale-[0.98] duration-200"
                            >
                                {loading ? t("login.sending") : t("login.continue")}
                            </button>
                        </>
                    ) : (
                        <>
                            <CodeInput
                                value={code}
                                onChange={setCode}
                                onSubmit={handleCodeSubmit}
                                disabled={loading}
                                error={error}
                            />
                            <button
                                onClick={handleCodeSubmit}
                                disabled={loading || code.length !== 6}
                                className="w-full py-3 px-4 bg-voxpop-gold hover:bg-voxpop-gold-dark 
                           disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed
                           text-voxpop-brown disabled:text-zinc-400 dark:disabled:text-zinc-500 font-bold rounded-xl shadow-sm
                           transition-all focus:outline-none focus:ring-2 focus:ring-voxpop-gold 
                           focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transform active:scale-[0.98] duration-200"
                            >
                                {loading ? t("login.verifying") : t("login.verify")}
                            </button>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleResendCode}
                                    disabled={loading || resendTimer > 0}
                                    className="w-full py-2 text-sm font-medium text-voxpop-gold hover:text-voxpop-gold-dark 
                                disabled:text-zinc-400 disabled:cursor-not-allowed dark:text-voxpop-gold dark:disabled:text-zinc-600
                                transition-colors"
                                >
                                    {resendTimer > 0
                                        ? t("login.resendTimer", { count: resendTimer })
                                        : t("login.resendCode")}
                                </button>

                                <button
                                    onClick={() => {
                                        setStep("phone");
                                        setCode("");
                                        setError("");
                                    }}
                                    disabled={loading}
                                    className="w-full py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 
                               dark:hover:text-zinc-200 transition-colors"
                                >
                                    {t("login.changePhone")}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {t("login.termsText")}
            </p>
        </div>
    );
}

type Step = "phone" | "code";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-6">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
