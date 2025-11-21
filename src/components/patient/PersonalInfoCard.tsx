import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { personalInfoApi } from "@/lib/api";

export const PersonalInfoCard = () => {
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const patientId = "patient_1"; // In a real app, this would come from auth/context

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await personalInfoApi.getInfo(patientId);
        setPersonalInfo(data);
      } catch (error) {
        console.error("Failed to fetch personal info:", error);
      }
    };
    fetchData();
  }, []);

  if (!personalInfo) {
    return <div>Loading...</div>;
  }

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
            <AvatarImage src={personalInfo.avatar} alt={personalInfo.name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
              {personalInfo.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Basic Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{personalInfo.name}</h3>
          <p className="text-sm text-muted-foreground">{personalInfo.age} years old • {personalInfo.gender}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{personalInfo.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{personalInfo.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{personalInfo.address}</span>
          </div>
        </div>

        {/* Medical Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Medical Information</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-destructive-soft text-destructive">
              Blood Group: {personalInfo.bloodGroup}
            </Badge>
            {personalInfo.allergies.map((allergy: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="bg-warning-soft text-warning">
                Allergy: {allergy}
              </Badge>
            ))}
            {personalInfo.conditions.map((condition: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="bg-primary-soft text-primary">
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};