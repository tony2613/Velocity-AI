import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Upload,
      number: "01",
      title: t("how.step1.title"),
      description: t("how.step1.desc"),
    },
    {
      icon: Sparkles,
      number: "02",
      title: t("how.step2.title"),
      description: t("how.step2.desc"),
    },
    {
      icon: CheckCircle,
      number: "03",
      title: t("how.step3.title"),
      description: t("how.step3.desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-semibold">{t("how.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("how.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="hover-elevate" data-testid={`card-step-${index}`}>
              <CardContent className="p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span aria-hidden="true" className="text-4xl font-extrabold text-muted-foreground">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-base font-semibold">New to VelocityAI?</h3>
            <p className="text-sm text-muted-foreground">Follow our step-by-step onboarding walkthrough or watch interactive tutorials.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href="/get-started" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Getting Started Guide &rarr;
            </a>
            <a href="/tutorials" className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
              View Tutorials
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
