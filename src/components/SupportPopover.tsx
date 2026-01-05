import { Headset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SupportPopover() {
  const navigate = useNavigate();

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="glass-button p-2 group"
      onClick={() => navigate('/support')}
    >
      <Headset className="w-4 h-4 text-neon-cyan group-hover:scale-110 transition-transform duration-300" />
    </Button>
  );
}
