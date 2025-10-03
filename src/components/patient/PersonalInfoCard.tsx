import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { usePatientData } from "@/hooks/usePatientData";
import { Skeleton } from "@/components/ui/skeleton";

export const PersonalInfoCard = () => {
  const { patientData, loading } = usePatientData();

  if (loading) {
    return (
      <Card className="card-healthcare h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!patientData) {
    return (
      <Card className="card-healthcare h-fit">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No patient data available</p>
        </CardContent>
      </Card>
    );
  }

  const initials = patientData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

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
            <AvatarImage src={patientData.avatar || "/placeholder.svg"} alt={patientData.name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Basic Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{patientData.name}</h3>
          <p className="text-sm text-muted-foreground">
            {patientData.age} years old • {patientData.gender}
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          {patientData.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{patientData.phone}</span>
            </div>
          )}
          {patientData.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{patientData.email}</span>
            </div>
          )}
        </div>

        {/* Medical Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Medical Information</h4>
          <div className="flex flex-wrap gap-2">
            {patientData.blood_group && (
              <Badge variant="secondary" className="bg-destructive-soft text-destructive">
                Blood Group: {patientData.blood_group}
              </Badge>
            )}
            {patientData.allergies.map((allergy, index) => (
              <Badge key={index} variant="secondary" className="bg-warning-soft text-warning">
                Allergy: {allergy}
              </Badge>
            ))}
            {patientData.chronic_conditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="bg-primary-soft text-primary">
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};