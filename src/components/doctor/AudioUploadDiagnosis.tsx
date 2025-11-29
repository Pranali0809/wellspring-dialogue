import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Mic, ChevronDown, ChevronUp, FileAudio, CheckCircle, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { aiAssessmentApi } from "@/lib/api";

interface AudioUploadDiagnosisProps {
  appointmentId: string;
  hasPreAssessment: boolean;
}

// Hardcoded fallback options
const FALLBACK_DIAGNOSES = [
  "Viral Fever",
  "Gastroenteritis",
  "Migraine"
];

const FALLBACK_PRESCRIPTIONS = [
  { name: "Paracetamol", dosage: "500mg" },
  { name: "ORS Solution", dosage: "As needed" },
  { name: "Omeprazole", dosage: "20mg" }
];

const FALLBACK_TESTS = [
  "CBC",
  "CRP",
  "Urine Routine"
];

export const AudioUploadDiagnosis = ({ appointmentId, hasPreAssessment }: AudioUploadDiagnosisProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [diagnosisData, setDiagnosisData] = useState<any>(null);
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  // Manual additions
  const [manualDiagnoses, setManualDiagnoses] = useState<string[]>([]);
  const [manualPrescriptions, setManualPrescriptions] = useState<any[]>([]);
  const [manualTests, setManualTests] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTest, setNewTest] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const result = await aiAssessmentApi.uploadAudio(appointmentId, formData);
      setTranscript(result.transcript);
      toast.success("Audio uploaded and transcribed successfully");

      // Automatically run diagnosis agent after upload
      await runDiagnosisAgent();
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio");
    } finally {
      setIsUploading(false);
    }
  };

  const runDiagnosisAgent = async () => {
    try {
      const result = await aiAssessmentApi.runDiagnosisAgent(appointmentId);
      setDiagnosisData(result);
      toast.success("Diagnosis suggestions generated");
    } catch (error) {
      console.error("Error running diagnosis agent:", error);
      toast.error("Failed to generate diagnosis suggestions");
    }
  };

  const toggleDiagnosis = (diagnosis: string) => {
    setSelectedDiagnoses(prev =>
      prev.includes(diagnosis)
        ? prev.filter(d => d !== diagnosis)
        : [...prev, diagnosis]
    );
  };

  const togglePrescription = (prescription: any) => {
    setSelectedPrescriptions(prev => {
      const exists = prev.find(p => p.name === prescription.name);
      if (exists) {
        return prev.filter(p => p.name !== prescription.name);
      } else {
        return [...prev, prescription];
      }
    });
  };

  const toggleTest = (test: string) => {
    setSelectedTests(prev =>
      prev.includes(test)
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const addManualDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setManualDiagnoses(prev => [...prev, newDiagnosis.trim()]);
      setSelectedDiagnoses(prev => [...prev, newDiagnosis.trim()]);
      setNewDiagnosis("");
      toast.success("Diagnosis added");
    }
  };

  const addManualPrescription = () => {
    if (newMedication.trim() && newDosage.trim()) {
      const prescription = { name: newMedication.trim(), dosage: newDosage.trim() };
      setManualPrescriptions(prev => [...prev, prescription]);
      setSelectedPrescriptions(prev => [...prev, prescription]);
      setNewMedication("");
      setNewDosage("");
      toast.success("Prescription added");
    }
  };

  const addManualTest = () => {
    if (newTest.trim()) {
      setManualTests(prev => [...prev, newTest.trim()]);
      setSelectedTests(prev => [...prev, newTest.trim()]);
      setNewTest("");
      toast.success("Test added");
    }
  };

  const handleFinalizeVisit = async () => {
    if (selectedDiagnoses.length === 0 && manualDiagnoses.length === 0) {
      toast.error("Please select at least one diagnosis");
      return;
    }

    setIsFinalizing(true);
    try {
      await aiAssessmentApi.finalizeVisit(appointmentId, {
        selected_diagnoses: selectedDiagnoses,
        selected_prescriptions: selectedPrescriptions,
        selected_tests: selectedTests,
        doctor_notes: doctorNotes,
        manual_entries: {
          diagnoses: manualDiagnoses,
          prescriptions: manualPrescriptions,
          tests: manualTests
        }
      });
      toast.success("Visit finalized successfully");
      // Optionally reset state or close panel
    } catch (error) {
      console.error("Error finalizing visit:", error);
      toast.error("Failed to finalize visit");
    } finally {
      setIsFinalizing(false);
    }
  };

  if (!hasPreAssessment) {
    return (
      <Card className="card-healthcare border-warning/50">
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Patient has not completed pre-assessment yet</p>
            <Badge variant="outline" className="bg-warning-soft text-warning">
              Pre-Assessment Required
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-primary/20 hover:border-primary/40"
        >
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            <span className="font-medium">AI Diagnostic Suggestions</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4">
        <Card className="card-healthcare">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-primary" />
              Upload Audio for Diagnosis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".mp3,.wav,.m4a"
                  onChange={handleFileChange}
                  className="hidden"
                  id={`audio-upload-${appointmentId}`}
                />
                <label
                  htmlFor={`audio-upload-${appointmentId}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileAudio className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        {audioFile ? (
                          <p className="text-sm font-medium">{audioFile.name}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Click to select audio file (.mp3, .wav, .m4a)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!audioFile || isUploading}
                className="w-full btn-healthcare-primary"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Transcript:</h4>
                <div className="p-3 bg-card-soft rounded-lg border border-border">
                  <p className="text-sm leading-relaxed">{transcript}</p>
                </div>
              </div>
            )}

            {/* Diagnosis Suggestions or Fallback */}
            {(diagnosisData || transcript) && (
              <div className="space-y-6">
                {/* Possible Diagnoses */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {diagnosisData ? "AI-Suggested Diagnoses" : "Fallback Diagnoses"}
                  </h4>
                  {!diagnosisData && (
                    <Badge variant="outline" className="mb-2">
                      Using fallback options - AI analysis not available
                    </Badge>
                  )}
                  <div className="space-y-2">
                    {(diagnosisData?.possible_diagnoses || FALLBACK_DIAGNOSES.map(d => ({ name: d }))).map((diagnosis: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-card-soft rounded-lg hover:bg-hover transition-colors"
                      >
                        <Checkbox
                          checked={selectedDiagnoses.includes(diagnosis.name)}
                          onCheckedChange={() => toggleDiagnosis(diagnosis.name)}
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {diagnosis.name}
                        </label>
                      </div>
                    ))}
                    {manualDiagnoses.map((diagnosis, idx) => (
                      <div
                        key={`manual-${idx}`}
                        className="flex items-start gap-3 p-3 bg-primary-soft rounded-lg border-l-2 border-primary"
                      >
                        <Checkbox checked={true} disabled />
                        <label className="text-sm flex-1">
                          {diagnosis}
                          <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Custom Diagnosis */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={newDiagnosis}
                        onChange={(e) => setNewDiagnosis(e.target.value)}
                        placeholder="Add custom diagnosis..."
                        onKeyPress={(e) => e.key === 'Enter' && addManualDiagnosis()}
                      />
                      <Button
                        onClick={addManualDiagnosis}
                        variant="outline"
                        size="sm"
                        disabled={!newDiagnosis.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Suggested Prescriptions */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {diagnosisData ? "AI-Suggested Prescriptions" : "Fallback Prescriptions"}
                  </h4>
                  <div className="space-y-2">
                    {(diagnosisData?.suggested_prescriptions || FALLBACK_PRESCRIPTIONS).map((prescription: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-card-soft rounded-lg hover:bg-hover transition-colors"
                      >
                        <Checkbox
                          checked={selectedPrescriptions.some(p => p.name === prescription.name)}
                          onCheckedChange={() => togglePrescription(prescription)}
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          <span className="font-medium">{prescription.name}</span>
                          <span className="text-muted-foreground"> - {prescription.dosage}</span>
                        </label>
                      </div>
                    ))}
                    {manualPrescriptions.map((prescription, idx) => (
                      <div
                        key={`manual-${idx}`}
                        className="flex items-start gap-3 p-3 bg-primary-soft rounded-lg border-l-2 border-primary"
                      >
                        <Checkbox checked={true} disabled />
                        <label className="text-sm flex-1">
                          <span className="font-medium">{prescription.name}</span>
                          <span className="text-muted-foreground"> - {prescription.dosage}</span>
                          <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Custom Prescription */}
                  <div className="pt-2 border-t border-border">
                    <Label className="text-xs text-muted-foreground mb-2 block">Add Custom Prescription</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        placeholder="Medication name..."
                        className="flex-1"
                      />
                      <Input
                        value={newDosage}
                        onChange={(e) => setNewDosage(e.target.value)}
                        placeholder="Dosage..."
                        className="w-32"
                        onKeyPress={(e) => e.key === 'Enter' && addManualPrescription()}
                      />
                      <Button
                        onClick={addManualPrescription}
                        variant="outline"
                        size="sm"
                        disabled={!newMedication.trim() || !newDosage.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recommended Tests */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {diagnosisData ? "AI-Recommended Tests" : "Fallback Tests"}
                  </h4>
                  <div className="space-y-2">
                    {(diagnosisData?.recommended_tests || FALLBACK_TESTS.map(t => ({ name: t }))).map((test: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-card-soft rounded-lg hover:bg-hover transition-colors"
                      >
                        <Checkbox
                          checked={selectedTests.includes(test.name)}
                          onCheckedChange={() => toggleTest(test.name)}
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {test.name}
                        </label>
                      </div>
                    ))}
                    {manualTests.map((test, idx) => (
                      <div
                        key={`manual-${idx}`}
                        className="flex items-start gap-3 p-3 bg-primary-soft rounded-lg border-l-2 border-primary"
                      >
                        <Checkbox checked={true} disabled />
                        <label className="text-sm flex-1">
                          {test}
                          <Badge variant="outline" className="ml-2 text-xs">Custom</Badge>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Custom Test */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        value={newTest}
                        onChange={(e) => setNewTest(e.target.value)}
                        placeholder="Add custom test..."
                        onKeyPress={(e) => e.key === 'Enter' && addManualTest()}
                      />
                      <Button
                        onClick={addManualTest}
                        variant="outline"
                        size="sm"
                        disabled={!newTest.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Doctor Action Items */}
                {diagnosisData?.doctor_action_items && diagnosisData.doctor_action_items.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Action Items:</h4>
                    <div className="p-3 bg-primary-soft rounded-lg space-y-2">
                      {diagnosisData.doctor_action_items.map((item: any, idx: number) => (
                        <p key={idx} className="text-sm">• {item.text}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Free Text Consultation Notes */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Consultation Notes:</h4>
                  <Textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Add consultation notes, observations, and recommendations..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Finalize Button */}
                <Button
                  onClick={handleFinalizeVisit}
                  disabled={isFinalizing || (selectedDiagnoses.length === 0 && manualDiagnoses.length === 0)}
                  className="w-full btn-healthcare-primary"
                  size="lg"
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Finalizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm & Complete Visit
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
