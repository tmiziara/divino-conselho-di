import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  text?: string;
  url?: string;
}

const SocialShare = ({ open, onOpenChange, title, text, url }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      const shareText = `${title}\n\n${text}\n\n${url}`;
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    // Só tenta importar se estiver em ambiente Capacitor
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      try {
        const { Share } = await import('@capacitor/share');
        await Share.share({
          title: title || '',
          text: text || '',
          url: url || '',
          dialogTitle: 'Compartilhar com...'
        });
        return;
      } catch (e) {
        // fallback
      }
    }
    // Web Share API
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {}
    }
    // Fallback: copiar
    handleCopy();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Compartilhar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium mb-1">{title}</p>
            <p className="text-xs text-muted-foreground">{text}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleNativeShare} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShare;
