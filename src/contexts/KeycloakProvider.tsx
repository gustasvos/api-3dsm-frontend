// src/contexts/KeycloakProvider.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../config/keycloakConfig';

export interface UsuarioPerfil {
  nome: string;
  email: string;
  id?: string;
}

interface KeycloakContextType {
  autenticado: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | undefined;
  temPermissao: (role: string | string[], requireAll?: boolean) => boolean;
  getUsuario: () => UsuarioPerfil | null;
}

export const KeycloakContext = createContext<KeycloakContextType>({} as KeycloakContextType);

interface KeycloakProviderProps {
  children: ReactNode;
}

export const KeycloakProvider = ({ children }: KeycloakProviderProps) => {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);

  useEffect(() => {
    keycloak.init({ onLoad: 'check-sso', checkLoginIframe: false, pkceMethod: undefined })
      .then((auth: boolean) => {
        setAutenticado(auth);
        setCarregando(false);
      })
      .catch((err) => {
        console.error("Falha ao inicializar o Keycloak", err);
        setCarregando(false);
      });

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => keycloak.logout());
    };
  }, []);

  const login = () => { keycloak.login(); };
  
  const logout = () => { keycloak.logout(); };
  
  const getToken = (): string | undefined => keycloak.token;
  
  const temPermissao = (role: string | string[], requireAll = false): boolean => {
    if (!keycloak.tokenParsed) return false;

    const roles = Array.isArray(role) ? role : [role];

    const checkRole = (r: string) => keycloak.hasRealmRole(r) || keycloak.hasResourceRole(r);

    if (requireAll) {
      return roles.every(r => checkRole(r));
    }
    return roles.some(r => checkRole(r));
  };
  
  const getUsuario = (): UsuarioPerfil | null => {
    if (!autenticado || !keycloak.tokenParsed) return null;
    
    return {
      nome: (keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username) as string,
      email: keycloak.tokenParsed.email as string,
      id: keycloak.tokenParsed.sub as string
    };
  };

  if (carregando) return <div>Conectando ao servidor de segurança...</div>;

  return (
    <KeycloakContext.Provider value={{ 
      autenticado, login, logout, getToken, temPermissao, getUsuario 
    }}>
      {children}
    </KeycloakContext.Provider>
  );
};