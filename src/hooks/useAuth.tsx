import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "provider" | "client" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  /**
   * true enquanto:
   *   - a sessão ainda não foi lida do storage (primeira carga / F5)
   *   - a role ainda não foi buscada após detectar o usuário
   *
   * Só vira false quando AMBAS as promessas terminaram.
   * Isso garante que nunca haverá redirect prematuro.
   */
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "provider" | "client"
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  // Separamos dois estados de loading:
  // - authLoading: a sessão ainda não foi lida
  // - roleLoading: o usuário foi detectado mas a role ainda não chegou
  const [authLoading, setAuthLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);

  // Ref para evitar setState após unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Referência para cancelar fetch de role anterior se o user mudar rapidamente
  const roleFetchController = useRef<AbortController | null>(null);

  const fetchUserRole = async (userId: string) => {
    // Cancela qualquer fetch de role anterior
    if (roleFetchController.current) {
      roleFetchController.current.abort();
    }
    roleFetchController.current = new AbortController();

    if (!mountedRef.current) return;
    setRoleLoading(true);

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mountedRef.current) return;

      setUserRole(data ? (data.role as UserRole) : null);
    } catch {
      if (mountedRef.current) {
        setUserRole(null);
      }
    } finally {
      if (mountedRef.current) {
        setRoleLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. Ouça mudanças de estado ANTES de ler a sessão atual
    //    (evita race condition onde onAuthStateChange dispara antes de getSession)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Busca role de forma assíncrona — usando setTimeout(0) para não
        // bloquear o callback do Supabase (boa prática recomendada pela Supabase)
        setTimeout(() => {
          fetchUserRole(session.user.id);
        }, 0);
      } else {
        setUserRole(null);
        setRoleLoading(false);
      }

      // Sessão resolvida (pode ser null = não logado, mas foi resolvida)
      setAuthLoading(false);
    });

    // 2. Lê a sessão existente (F5 / tab nova)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setAuthLoading(false);
        setRoleLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // isLoading = true enquanto qualquer parte do fluxo ainda está pendente
  const isLoading = authLoading || roleLoading;

  // ─── Métodos ─────────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, fullName: string, role: 'provider' | 'client', phone?: string, document?: string, amount?: number) => {
    try {
      // 1. Chamar o endpoint da API em C# para realizar o cadastro
      const signupResponse = await fetch('https://angelic-nonfeverish-heather.ngrok-free.dev/v1/Auth/signup', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          fullName: fullName,
          role: role,
          phone: phone ? phone.replace(/\D/g, '') : "",
          document: document ? document.replace(/\D/g, '') : ""
        })
      });

      if (!signupResponse.ok) {
        throw new Error('Erro ao criar conta na API');
      }

      // Tudo dando certo, chamar o segundo endpoint (criar PIX)
      const pixResponse = await fetch('https://angelic-nonfeverish-heather.ngrok-free.dev/v1/abacatePay/criar-pix', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount ? amount * 100 : 0, // Assumi centavos da AbacatePay (* 100). Retire se esperar valor exato em Reais.
          expiresIn: 600, // 10 minutos * 60 segundos
          description: "Cadastro " + role,
          customer: {
            name: fullName,
            email: email,
            taxId: document ? document.replace(/\D/g, '') : "",
            cellphone: phone ? phone.replace(/\D/g, '') : ""
          },
          metadata: "string"
        })
      });

      if (!pixResponse.ok) {
        throw new Error('Conta criada, mas erro ao gerar PIX');
      }

      const pixData = await pixResponse.json();
      console.log('Resposta final (PIX):', pixData);

      // Cadastro bem-sucedido nas duas pontas (ou responsabilidade repassada)
      return { error: null, data: pixData };
    } catch (error: any) {
      console.error('Erro no fluxo de signup:', error);
      return { error, data: undefined };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, userRole, isLoading, signUp, signIn, signOut }}
    >
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