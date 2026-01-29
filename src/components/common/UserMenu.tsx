import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { Button } from "../ui/button";

  interface UserMenuProps {
    full_name: string | null;
    onSignOut: () => void;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

export function UserMenu({ full_name, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Link
          to="/perfil"
          className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium"
        >
          {full_name
            ? getInitials(full_name)
            : <User className="w-4 h-4" />}
        </Link>

        <Button variant="ghost" size="icon" onClick={onSignOut}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

