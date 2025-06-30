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
    <Link to={`/estudos/categoria/${category.id}`}>
      <Card className={`spiritual-card group hover:shadow-lg transition-all duration-300 cursor-pointer ${category.config.bgColor} ${small ? 'p-2 h-32' : 'p-6 h-48'} flex items-center justify-center`}>
        <CardContent className="flex flex-row items-center justify-center h-full w-full p-0">
          {/* Ícone mais à esquerda, centralizado verticalmente, agora menor */}
          <div className="flex-shrink-0 flex items-center justify-center mr-2 ml-1" style={{ minWidth: 36 }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.config.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              <IconComponent className={`w-4 h-4 ${category.config.color}`} />
            </div>
          </div>
          {/* Conteúdo principal centralizado */}
          <div className="flex flex-col flex-1 items-start justify-center min-w-0">
            <h3 className={`font-semibold ${small ? 'text-base' : 'text-lg'} text-gray-900 group-hover:text-primary transition-colors whitespace-normal break-words leading-tight`} style={{wordBreak: 'break-word'}}>
              {category.name}
            </h3>
            <p className={`text-xs ${small ? '' : 'sm:text-sm'} text-gray-600 whitespace-normal break-words leading-tight`} style={{wordBreak: 'break-word'}}>
              {category.config.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`font-bold ${small ? 'text-lg' : 'text-2xl'} text-gray-900`}>
                {category.count}
              </span>
              <span className={`text-xs ${small ? '' : 'sm:text-sm'} text-gray-600`}>
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