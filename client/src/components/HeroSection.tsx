import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleHowItWorksClick = () => {
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5"></div>
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute top-32 left-10 w-40 h-40 bg-primary/15 rounded-full blur-2xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-2xl">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {t("hero.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={user ? "/dashboard" : "/demo"}>
                <a data-testid="button-get-started">
                  <Button size="lg" className="gap-2">
                    {t("hero.cta_primary")}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </a>
              </Link>
              <Button size="lg" variant="outline" onClick={handleHowItWorksClick} data-testid="button-how-it-works">
                {t("hero.cta_secondary")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
