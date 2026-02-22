import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, FolderOpen, Download, Zap, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function FeaturesGrid() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Brain,
      title: t("feature.summarization.title"),
      description: t("feature.summarization.desc"),
    },
    {
      icon: FileText,
      title: t("feature.quiz.title"),
      description: t("feature.quiz.desc"),
    },
    {
      icon: FolderOpen,
      title: t("feature.org.title"),
      description: t("feature.org.desc"),
    },
    {
      icon: Download,
      title: t("feature.export.title"),
      description: t("feature.export.desc"),
    },
    {
      icon: Zap,
      title: t("feature.fast.title"),
      description: t("feature.fast.desc"),
    },
    {
      icon: Shield,
      title: t("feature.pricing.title"),
      description: t("feature.pricing.desc"),
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-semibold">{t("features.title")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
              <CardContent className="p-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
