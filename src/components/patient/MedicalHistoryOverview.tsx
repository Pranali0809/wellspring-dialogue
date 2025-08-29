import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart, Scissors, AlertTriangle, Users } from "lucide-react";

interface HistoryCategory {
  id: string;
  name: string;
  icon: any;
  count: number;
  color: string;
  items: string[];
}

export const MedicalHistoryOverview = () => {
  const categories: HistoryCategory[] = [
    {
      id: "conditions",
      name: "Conditions",
      icon: Heart,
      count: 3,
      color: "bg-primary",
      items: ["Diabetes Type 2", "Hypertension", "High Cholesterol"]
    },
    {
      id: "surgeries", 
      name: "Surgeries",
      icon: Scissors,
      count: 1,
      color: "bg-success",
      items: ["Appendectomy (2018)"]
    },
    {
      id: "allergies",
      name: "Allergies",
      icon: AlertTriangle,
      count: 2,
      color: "bg-warning",
      items: ["Peanuts", "Penicillin"]
    },
    {
      id: "family",
      name: "Family History",
      icon: Users,
      count: 4,
      color: "bg-muted",
      items: ["Heart Disease (Father)", "Diabetes (Mother)", "Cancer (Grandmother)", "Stroke (Grandfather)"]
    }
  ];

  const totalItems = categories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <Card className="card-healthcare h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Radial Overview */}
        <div className="relative">
          {/* Center Circle */}
          <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-primary-foreground">{totalItems}</div>
              <div className="text-xs text-primary-foreground/80">Records</div>
            </div>
          </div>
          
          {/* Category Segments */}
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              
              return (
                <div 
                  key={category.id}
                  className="p-3 rounded-lg border border-border bg-card-soft hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{category.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {category.count} items
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Preview Items */}
                  <div className="space-y-1">
                    {category.items.slice(0, 2).map((item, index) => (
                      <p key={index} className="text-xs text-muted-foreground truncate">
                        • {item}
                      </p>
                    ))}
                    {category.items.length > 2 && (
                      <p className="text-xs text-primary font-medium">
                        +{category.items.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-3 bg-primary-soft rounded-lg border border-primary-light">
          <h4 className="font-semibold text-primary-foreground text-sm mb-2">Recent Activity</h4>
          <div className="text-xs text-primary-foreground space-y-1">
            <p>• Blood pressure reading added (March 10)</p>
            <p>• Diabetes medication updated (March 8)</p>
            <p>• Lab results reviewed (March 5)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};