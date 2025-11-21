import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Heart, Scissors, AlertTriangle, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { medicalHistoryApi } from "@/lib/api";

interface HistoryCategory {
  id: string;
  name: string;
  icon: any;
  count: number;
  color: string;
  items: string[];
}

export const MedicalHistoryOverview = () => {
  const patientId = "patient_1";
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await medicalHistoryApi.getHistory(patientId);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch medical history:", error);
      }
    };
    fetchData();
  }, []);

  if (!history) {
    return <div>Loading...</div>;
  }

  const categories: HistoryCategory[] = [
    {
      id: "conditions",
      name: "Conditions",
      icon: Heart,
      count: history.conditions.length,
      color: "bg-primary",
      items: history.conditions.map((c: any) => c.name)
    },
    {
      id: "surgeries", 
      name: "Surgeries",
      icon: Scissors,
      count: history.surgeries.length,
      color: "bg-success",
      items: history.surgeries.map((s: any) => `${s.name} (${new Date(s.date).getFullYear()})`)
    },
    {
      id: "allergies",
      name: "Allergies",
      icon: AlertTriangle,
      count: history.allergies.length,
      color: "bg-warning",
      items: history.allergies.map((a: any) => a.name)
    },
    {
      id: "family",
      name: "Family History",
      icon: Users,
      count: history.familyHistory.length,
      color: "bg-muted",
      items: history.familyHistory.map((f: any) => `${f.condition} (${f.relative})`)
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
              const singularName = category.name.endsWith('ies') 
                ? category.name.slice(0, -3) + 'y'
                : category.name.slice(0, -1);
              
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
                        {category.count} {category.count === 1 ? singularName.toLowerCase() : category.name.toLowerCase()}
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
        <div className="p-3 bg-primary-soft rounded-lg border border-border">
          <h4 className="font-semibold text-primary text-sm mb-2">Recent Activity</h4>
          <div className="text-xs text-primary space-y-1">
            {history.recentActivity.slice(0, 3).map((activity: any, idx: number) => (
              <p key={idx}>• {activity.description} ({new Date(activity.date).toLocaleDateString()})</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
