
import React, { useState } from "react";
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  title: string;
  content: string;
  reference?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, content, reference }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const formatShareText = (platform: string) => {
    const baseText = `"${content}"`;
    const refText = reference ? ` - ${reference}` : "";
    const appText = "\n\n🙏 Compartilhado via App Bíblico";
    
    switch (platform) {
      case "whatsapp":
        return `${baseText}${refText}${appText}`;
      case "twitter":
        return `${baseText}${refText} #Biblia #Fe${appText}`;
      case "facebook":
        return `${baseText}${refText}${appText}`;
      case "instagram":
        return `${baseText}${refText} #Biblia #Fe #Deus #Versiculos${appText}`;
      default:
        return `${baseText}${refText}${appText}`;
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(formatShareText("whatsapp"));
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
    
    toast({
      title: "Compartilhado no WhatsApp",
      description: "O versículo foi compartilhado com sucesso!"
    });
  };

  const shareOnFacebook = () => {
    const text = encodeURIComponent(formatShareText("facebook"));
    const url = `https://www.facebook.com/sharer/sharer.php?quote=${text}`;
    window.open(url, "_blank");
    
    toast({
      title: "Compartilhado no Facebook",
      description: "O versículo foi compartilhado com sucesso!"
    });
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(formatShareText("twitter"));
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, "_blank");
    
    toast({
      title: "Compartilhado no Twitter",
      description: "O versículo foi compartilhado com sucesso!"
    });
  };

  const shareOnInstagram = () => {
    const text = formatShareText("instagram");
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Texto copiado para Instagram",
      description: "Cole o texto na sua postagem do Instagram!"
    });
  };

  const copyToClipboard = async () => {
    try {
      const text = formatShareText("copy");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      toast({
        title: "Copiado para área de transferência",
        description: "O versículo foi copiado com sucesso!"
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o versículo.",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Share2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareOnWhatsApp} className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook} className="flex items-center gap-2">
          <Facebook className="w-4 h-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnTwitter} className="flex items-center gap-2">
          <Twitter className="w-4 h-4 text-blue-400" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnInstagram} className="flex items-center gap-2">
          <Instagram className="w-4 h-4 text-pink-600" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2">
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copiado!" : "Copiar texto"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;
