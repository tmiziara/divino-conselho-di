import { 
  Heart, 
  DollarSign, 
  Target, 
  Users, 
  Sparkles, 
  CheckCircle, 
  PlayCircle 
} from 'lucide-react';

export interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
}

export const categories: CategoryConfig[] = [
  {
    id: 'completos',
    name: 'Completos',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Estudos finalizados'
  },
  {
    id: 'em-progresso',
    name: 'Em Progresso',
    icon: PlayCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Estudos em andamento'
  },
  {
    id: 'familia',
    name: 'Família',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Relacionamentos familiares'
  },
  {
    id: 'vida-espiritual',
    name: 'Vida Espiritual',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    description: 'Crescimento espiritual'
  },
  {
    id: 'relacionamentos',
    name: 'Relacionamentos',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 border-pink-200',
    description: 'Relacionamentos interpessoais'
  },
  {
    id: 'financas',
    name: 'Finanças',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    description: 'Mordomia financeira'
  },
  {
    id: 'proposito-carreira',
    name: 'Propósito/Carreira',
    icon: Target,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Vocação e propósito'
  }
];

export const getCategoryConfig = (categoryId: string): CategoryConfig | undefined => {
  return categories.find(cat => cat.id === categoryId);
};

export const getCategoryName = (categoryId: string): string => {
  const config = getCategoryConfig(categoryId);
  return config?.name || categoryId;
}; 