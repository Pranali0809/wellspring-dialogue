import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Pill, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { prescriptionsApi } from "@/lib/api";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: "active" | "upcoming" | "completed";
  refillDate: Date;
  adherence: number;
  pillsRemaining: number;
  totalPills: number;
  dailyDoses: number;
}

interface DoseChecked {
  [prescriptionId: string]: {
    [dateKey: string]: boolean[];
  };
}

export const PrescriptionTracking = () => {
  const patientId = "patient_1";
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await prescriptionsApi.getPrescriptions(patientId);
      setPrescriptions(data.prescriptions.map((p: any) => ({
        ...p,
        refillDate: new Date(p.refillDate)
      })));
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
    }
  };

  const resetPrescriptions = async () => {
    try {
      await prescriptionsApi.resetAdherence(patientId);
      const data = await prescriptionsApi.getPrescriptions(patientId);
      setPrescriptions(data.prescriptions.map((p: any) => ({
        ...p,
        refillDate: new Date(p.refillDate)
      })));
    } catch (error) {
      console.error("Failed to reset prescriptions:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success-soft text-success";
      case "upcoming": return "bg-warning-soft text-warning";
      case "completed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const overallAdherence = prescriptions.reduce((acc, p) => acc + p.adherence, 0) / prescriptions.length;

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          Prescription Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Prescriptions List */}
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="flex items-center justify-between p-3 bg-card-soft rounded-lg border border-border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{prescription.medication}</h4>
                  <Badge variant="secondary" className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {prescription.dosage} • {prescription.frequency}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    Pills: {prescription.pillsRemaining}/{prescription.totalPills}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Refill: {prescription.refillDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prescription.pillsRemaining <= 5 && (
                  <Button size="sm" variant="ghost" className="text-warning hover:text-warning-foreground hover:bg-warning-soft">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Low Stock
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="healthcare-hover-glow">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refill
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Adherence Metrics */}
        <div className="p-4 bg-primary-soft rounded-lg border border-primary-light">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-foreground">Adherence</h4>
            <span className="text-lg font-bold text-foreground">{Math.round(overallAdherence)}%</span>
          </div>
          <Progress value={overallAdherence} className="mb-2" />
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>Great job! You're taking your medications consistently.</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="btn-healthcare-primary flex-1">
                <Pill className="h-4 w-4 mr-2" />
                Dosage Completed
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Prescriptions</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reset your prescriptions? This will reset adherence to 0%.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetPrescriptions}>
                  Confirm Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};