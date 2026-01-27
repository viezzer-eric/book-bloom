import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-semibold">Bookly</span>
            </Link>
            <p className="text-background/60 text-sm leading-relaxed">
              A plataforma intuitiva de agendamento para profissionais de serviços.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              {['Funcionalidades', 'Preços', 'Integrações', 'API'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-background/60 hover:text-background transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2">
              {['Sobre', 'Blog', 'Carreiras', 'Contato'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-background/60 hover:text-background transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacidade', 'Termos', 'Segurança', 'Cookies'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-background/60 hover:text-background transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            © 2024 Bookly. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
              <Link key={social} to="/" className="text-sm text-background/60 hover:text-background transition-colors">
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
