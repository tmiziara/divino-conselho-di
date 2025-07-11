import { Card, CardContent } from "@/components/ui/card";
import { StudyCategory } from "@/hooks/useStudyCategories";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: StudyCategory;
  hasPremiumAccess: boolean;
  small?: boolean;
}

const CategoryCard = ({ category, hasPremiumAccess, small }: CategoryCardProps) => {
  // Fallback para Sparkles se não houver ícone
  const IconComponent = category.config.icon || require('lucide-react').Sparkles;
  
  
  return (
    <Link to={`/categoria/${category.id}`}>
      <Card className={`spiritual-card group hover:shadow-lg transition-all duration-300 cursor-pointer ${category.config.bgColor} ${small ? 'p-2 h-32' : 'p-6 h-48'} flex items-center justify-center` +
        // Cores customizadas para dark mode por categoria
        (category.id === 'familia' ? ' dark:bg-[#2D2A55]' : '') +
        (category.id === 'relacionamentos' ? ' dark:bg-[#3A3F58]' : '') +
        (category.id === 'proposito-carreira' ? ' dark:bg-[#4A4E69]' : '') +
        (category.id === 'financas' ? ' dark:bg-[#5C677D]' : '') +
        (category.id === 'vida-espiritual' ? ' dark:bg-[#6C7A89]' : '') +
        (category.id === 'completos' ? ' dark:bg-[#3A3F58]' : '')
      }>
        <CardContent className="flex flex-row items-center justify-center h-full w-full p-0">
          {/* Ícone mais à esquerda, centralizado verticalmente, agora menor */}
          <div className="flex-shrink-0 flex items-center justify-center mr-2 ml-0" style={{ minWidth: 28 }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${category.config.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <IconComponent className={`w-4 h-4 ${category.config.color}`} />
            </div>
          </div>
          {/* Conteúdo principal centralizado */}
          <div className="flex flex-col flex-1 items-start justify-center min-w-0">
            <h3 className={`font-semibold ${small ? 'text-base' : 'text-lg'} text-gray-900 group-hover:text-primary transition-colors whitespace-normal break-words leading-tight` +
              // Cores customizadas para dark mode por categoria
              (category.id === 'familia' ? ' dark:text-[#b9aeea]' : '') +
              (category.id === 'relacionamentos' ? ' dark:text-[#e07a7a]' : '') +
              (category.id === 'proposito-carreira' ? ' dark:text-[#e0a97a]' : '') +
              (category.id === 'financas' ? ' dark:text-[#7ae0b2]' : '') +
              (category.id === 'vida-espiritual' ? ' dark:text-[#7ab7e0]' : '') +
              (category.id === 'completos' ? ' dark:text-[#e0d37a]' : '') +
              (category.id === 'em-progresso' ? ' dark:text-[#7a9be0]' : '')
            } style={{wordBreak: 'break-word'}}>
              {category.name}
            </h3>
            <p className={`text-xs ${small ? '' : 'sm:text-sm'} text-gray-600 dark:text-white whitespace-normal break-words leading-tight`} style={{wordBreak: 'break-word'}}>
              {category.config.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`font-bold ${small ? 'text-lg' : 'text-2xl'} text-gray-900`}>
                {category.count}
              </span>
              <span className={`text-xs ${small ? '' : 'sm:text-sm'} text-gray-600 dark:text-white`}>
                {category.count === 1 ? 'estudo' : 'estudos'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard; 