import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'provider' | 'client' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'provider' | 'client', phone?: string, document?: string, amount?: number) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleData) {
      const role = roleData.role as UserRole;
      
      // If provider, check plan status
      if (role === 'provider') {
        const { data: planData } = await supabase
          .from('provider_plan' as any)
          .select('status')
          .eq('provider_id', userId)
          .maybeSingle();

        const plan = planData as any;
        if (plan && plan.status !== 'active') {
          console.warn("Provider identified with inactive plan, signing out...");
          await supabase.auth.signOut();
          setUserRole(null);
          return 'inactive_plan';
        }
      }
      
      setUserRole(role);
      return role;
    }
    return null;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }

        setIsLoading(false);
      });

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) return { error };

    if (authData?.user) {
      const roleOrStatus = await fetchUserRole(authData.user.id);
      if (roleOrStatus === 'inactive_plan') {
        return { error: { message: "Seu plano está inativo. Por favor, regularize seu pagamento para acessar o painel." } };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
