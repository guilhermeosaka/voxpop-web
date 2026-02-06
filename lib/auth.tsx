"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { refreshTokens } from "./api";

interface AuthContextType {
    isAuthenticated: boolean;
    phoneNumber: string | null;
    accessToken: string | null;
    login: (phoneNumber: string, accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        setPhoneNumber(null);
        setAccessToken(null);
        setIsAuthenticated(false);
    }, []);

    // Load authentication state from localStorage on mount and refresh token
    useEffect(() => {
        const initAuth = async () => {
            const storedPhone = localStorage.getItem("phoneNumber");
            const storedAccessToken = localStorage.getItem("accessToken");
            const storedRefreshToken = localStorage.getItem("refreshToken");

            if (storedPhone && storedAccessToken && storedRefreshToken) {
                setPhoneNumber(storedPhone);
                setAccessToken(storedAccessToken);
                setIsAuthenticated(true);

                // Attempt to refresh the token to ensure validity
                try {
                    const tokens = await refreshTokens(storedRefreshToken);
                    localStorage.setItem("accessToken", tokens.accessToken);
                    localStorage.setItem("refreshToken", tokens.refreshToken);
                    setAccessToken(tokens.accessToken);
                } catch (err) {
                    console.error("Failed to refresh token on mount:", err);
                    // If refresh fails, log out
                    logout();
                }
            }
            setIsInitialized(true);
        };

        initAuth();
    }, [logout]);

    const login = (phone: string, access: string, refresh: string) => {
        localStorage.setItem("phoneNumber", phone);
        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);

        setPhoneNumber(phone);
        setAccessToken(access);
        setIsAuthenticated(true);
    };

    // Don't render children until auth is initialized to prevent flash of logged-out state
    if (!isInitialized) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, phoneNumber, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
