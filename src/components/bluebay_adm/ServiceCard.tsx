
import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  details?: string;
  icon: LucideIcon;
  iconColor?: string;
  path: string;
  badge?: string;
}

export const ServiceCard = ({ 
  title, 
  description, 
  details,
  icon: Icon, 
  iconColor = "bg-blue-100 text-blue-600", 
  path,
  badge 
}: ServiceCardProps) => {
  return (
    <Link to={path} className="block group transition-transform duration-200 hover:-translate-y-1">
      <Card className="h-full shadow-sm hover:shadow-lg transition-all duration-300 border border-border overflow-hidden bg-card hover:border-primary/30">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
            {badge && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-3">
          <CardDescription className="text-muted-foreground font-medium">
            {description}
          </CardDescription>
          {details && (
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              {details}
            </p>
          )}
          <div className="flex items-center text-primary text-sm font-medium pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Acessar
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
