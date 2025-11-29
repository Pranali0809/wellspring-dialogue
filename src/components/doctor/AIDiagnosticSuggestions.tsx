import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Upload, ChevronDown, ChevronUp, Sparkles, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIDiagnosticSuggestionsProps {
  appointmentId: string;
}

export const AIDiagnosticSuggestions = ({ appointmentId }: AIDiagnosticSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["audio/mp3", "audio/wav", "audio/mpeg"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
      toast.error("Please upload an MP3 or WAV file");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Upload file and get transcription
      // For now, call the API with mock data
      const response = await fetch(`http://localhost:8000/api/appointment/${appointmentId}/upload-audio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Failed to process audio");

      const data = await response.json();
      setAiOutput(data);
      toast.success("Audio processed successfully");
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReview = async () => {
    if (!aiOutput) return;

    try {
      const response = await fetch(`http://localhost:8000/api/appointment/${appointmentId}/doctor-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_transcript: aiOutput.transcript,
          ai_output: aiOutput,
          doctor_selected: {
            questions: selectedQuestions,
            diagnosis: selectedDiagnosis,
            medications: selectedMedications
          }
        })
      });

      if (!response.ok) throw new Error("Failed to save review");

      toast.success("Review saved successfully");
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-primary/20 hover:border-primary/40"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">AI Diagnostic Suggestions</span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4">
        <Card className="card-healthcare">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Diagnostic Assistant
              </div>
              {!aiOutput && (
                <Label
                  htmlFor="audio-upload"
                  className="btn-healthcare-primary cursor-pointer flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Audio
                  <input
                    id="audio-upload"
                    type="file"
                    accept=".mp3,.wav,audio/mp3,audio/wav"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Processing audio and generating suggestions...</p>
              </div>
            ) : !aiOutput ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">
                  Upload an appointment audio recording to receive AI-generated diagnostic suggestions.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Transcript */}
                <div>
                  <h4 className="font-semibold mb-2">Transcript</h4>
                  <div className="p-3 bg-card-soft rounded-lg text-sm">
                    {aiOutput.transcript}
                  </div>
                </div>

                {/* Suggested Questions */}
                <div>
                  <h4 className="font-semibold mb-2">Suggested Follow-up Questions</h4>
                  <div className="space-y-2">
                    {aiOutput.suggested_questions?.map((question: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Checkbox
                          id={`question-${index}`}
                          checked={selectedQuestions.includes(question)}
                          onCheckedChange={() => toggleSelection(question, selectedQuestions, setSelectedQuestions)}
                        />
                        <Label htmlFor={`question-${index}`} className="text-sm cursor-pointer">
                          {question}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Possible Diagnosis */}
                <div>
                  <h4 className="font-semibold mb-2">Possible Diagnosis</h4>
                  <div className="space-y-2">
                    {aiOutput.possible_diagnosis?.map((diagnosis: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Checkbox
                          id={`diagnosis-${index}`}
                          checked={selectedDiagnosis.includes(diagnosis)}
                          onCheckedChange={() => toggleSelection(diagnosis, selectedDiagnosis, setSelectedDiagnosis)}
                        />
                        <Label htmlFor={`diagnosis-${index}`} className="text-sm cursor-pointer">
                          {diagnosis}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Possible Medications */}
                <div>
                  <h4 className="font-semibold mb-2">Suggested Medications</h4>
                  <div className="space-y-2">
                    {aiOutput.possible_medications?.map((medication: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Checkbox
                          id={`medication-${index}`}
                          checked={selectedMedications.includes(medication)}
                          onCheckedChange={() => toggleSelection(medication, selectedMedications, setSelectedMedications)}
                        />
                        <Label htmlFor={`medication-${index}`} className="text-sm cursor-pointer">
                          {medication}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes Suggestions */}
                <div>
                  <h4 className="font-semibold mb-2">Suggested Notes</h4>
                  <div className="p-3 bg-card-soft rounded-lg text-sm">
                    {aiOutput.notes_suggestions}
                  </div>
                </div>

                {/* Save Button */}
                <Button onClick={handleSaveReview} className="w-full btn-healthcare-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Save Selected Items to Record
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
