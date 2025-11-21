import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

export const PersonalInfoCard = () => {
  return (
    <Card className="card-healthcare h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Photo */}
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary-soft">
            <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
              SJ
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Basic Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Sarah Johnson</h3>
          <p className="text-sm text-muted-foreground">32 years old • Female</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">sarah.johnson@email.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">123 Maple St, Boston, MA</span>
          </div>
        </div>

        {/* Medical Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Medical Information</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-destructive-soft text-destructive">
              Blood Group: O+
            </Badge>
            <Badge variant="secondary" className="bg-warning-soft text-warning">
              Allergy: Peanuts
            </Badge>
            <Badge variant="secondary" className="bg-primary-soft text-primary">
              Diabetes Type 2
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};