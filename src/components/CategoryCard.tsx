import { Card, CardContent } from "@/components/ui/card";
import { StudyCategory } from "@/hooks/useStudyCategories";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  category: StudyCategory;
  hasPremiumAccess: boolean;
}

const CategoryCard = ({ category, hasPremiumAccess }: CategoryCardProps) => {
  const IconComponent = category.config.icon;
  
  return (
    <Link to={`/estudos/categoria/${category.id}`}>
      <Card className={`spiritual-card group hover:shadow-lg transition-all duration-300 cursor-pointer ${category.config.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.config.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                <IconComponent className={`w-6 h-6 ${category.config.color}`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.config.description}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 ${category.config.color} group-hover:translate-x-1 transition-transform`} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {category.count}
              </span>
              <span className="text-sm text-gray-600">
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