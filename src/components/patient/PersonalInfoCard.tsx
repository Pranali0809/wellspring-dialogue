import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  avatar?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export const PersonalInfoCard = () => {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // Get first patient for demo (in real app, would use authenticated user)
        const { data: patients } = await (supabase as any)
          .from('patients')
          .select('*')
          .limit(1)
          .single();

        if (patients) {
          setPatient({
            id: patients.id,
            name: patients.name,
            age: patients.age,
            gender: patients.gender,
            phone: patients.phone,
            email: patients.email,
            bloodGroup: patients.blood_group,
            avatar: patients.avatar,
            allergies: patients.allergies,
            chronicConditions: patients.chronic_conditions
          });
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, []);

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
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!patient) {
    return null;
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
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Basic Info */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
          <p className="text-sm text-muted-foreground">{patient.age} years old • {patient.gender}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          {patient.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{patient.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">123 Maple St, Boston, MA</span>
          </div>
        </div>

        {/* Medical Badges */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Medical Information</h4>
          <div className="flex flex-wrap gap-2">
            {patient.bloodGroup && (
              <Badge variant="secondary" className="bg-destructive-soft text-destructive">
                Blood Group: {patient.bloodGroup}
              </Badge>
            )}
            {patient.allergies && patient.allergies.length > 0 && 
              patient.allergies.map((allergy, index) => (
                <Badge key={index} variant="secondary" className="bg-warning-soft text-warning">
                  Allergy: {allergy}
                </Badge>
              ))
            }
            {patient.chronicConditions && patient.chronicConditions.length > 0 &&
              patient.chronicConditions.slice(0, 1).map((condition, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-soft text-primary">
                  {condition}
                </Badge>
              ))
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
};