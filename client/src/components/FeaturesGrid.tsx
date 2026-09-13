import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, FolderOpen, Download, Calendar, Target, TrendingUp } from "lucide-react";
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
      icon: Calendar,
      title: t("feature.calendar.title"),
      description: t("feature.calendar.desc"),
      isNew: true,
    },
    {
      icon: Target,
      title: t("feature.planner.title"),
      description: t("feature.planner.desc"),
      isNew: true,
    },
    {
      icon: TrendingUp,
      title: t("feature.weakness.title"),
      description: t("feature.weakness.desc"),
      isNew: true,
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
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  {feature.isNew && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-primary/20 text-primary border border-primary/30">
                      NEW
                    </span>
                  )}
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
