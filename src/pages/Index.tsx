import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Stethoscope, 
  Users, 
  MessageCircle, 
  Shield, 
  Activity,
  ArrowRight,
  CheckCircle,
  Globe
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "AI-Powered Chat Assistant",
      description: "Multilingual voice-enabled chatbot with medical knowledge",
      color: "text-primary"
    },
    {
      icon: Activity,
      title: "Symptom Timeline Tracking",
      description: "Interactive dot visualization for symptom monitoring",
      color: "text-success"
    },
    {
      icon: Shield,
      title: "Prescription Management",
      description: "Track medications, adherence, and refill schedules",
      color: "text-warning"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Comprehensive patient records and appointment scheduling",
      color: "text-destructive"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div className="healthcare-container pt-16 pb-12">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-primary-soft text-primary px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              Healthcare AI Assistant Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Modern Healthcare
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Streamline patient care with AI-powered insights, comprehensive medical records, 
              and intuitive dashboards designed for both patients and healthcare providers.
            </p>
          </div>

          {/* Dashboard Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Patient Dashboard Card */}
            <Card className="card-healthcare-interactive group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Heart className="h-10 w-10 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl text-foreground">Patient Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Manage your health journey with personalized tracking and insights
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Track symptoms with interactive timeline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Monitor prescriptions and adherence</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">View vaccine schedules and history</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Access AI health assistant</span>
                  </div>
                </div>
                <Link to="/patient/patient_1" className="block">
                  <Button className="w-full btn-healthcare-primary group">
                    Enter Patient Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-success-soft text-success">
                    For Patients
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Doctor Dashboard Card */}
            <Card className="card-healthcare-interactive group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-success rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-10 w-10 text-success-foreground" />
                </div>
                <CardTitle className="text-2xl text-foreground">Doctor Dashboard</CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive patient management with AI-powered clinical insights
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Manage patient records efficiently</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">AI-assisted diagnosis and notes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Prescription management system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm text-foreground">Clinical decision support</span>
                  </div>
                </div>
                <Link to="/doctor/doctor_1" className="block">
                  <Button className="w-full btn-healthcare-success group">
                    Enter Doctor Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-primary-soft text-primary">
                    For Healthcare Providers
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="healthcare-container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Powerful Features for Modern Healthcare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of healthcare management with our comprehensive platform
          </p>
        </div>

        <div className="healthcare-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="card-healthcare text-center">
                <CardHeader>
                  <div className={`w-12 h-12 mx-auto rounded-lg bg-card-soft border border-border flex items-center justify-center mb-4 ${feature.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="healthcare-container py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built with modern healthcare standards and AI-powered insights
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
