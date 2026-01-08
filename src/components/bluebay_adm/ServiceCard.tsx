
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  path: string;
}

export const ServiceCard = ({ title, description, icon: Icon, iconColor = "bg-blue-100 text-blue-600", path }: ServiceCardProps) => {
  return (
    <Link to={path} className="block transition-transform duration-200 hover:-translate-y-1">
      <Card className="h-full shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 overflow-hidden bg-white">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center mb-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconColor)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <CardDescription className="text-gray-600">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};
