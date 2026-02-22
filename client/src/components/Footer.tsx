import { Link } from "wouter";
import velocityLogo from "../assets/Velocity-AI-logo.png";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={velocityLogo} alt="VelocityAI Logo" className="h-7 w-7" />
              <span className="text-lg font-semibold">VelocityAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footer.slogan")}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.features")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("feature.summarization.title")}</a></Link></li>
              <li><Link href="/features"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("feature.quiz.title")}</a></Link></li>
              <li><Link href="/features"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("feature.org.title")}</a></Link></li>
              <li><Link href="/features"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("feature.export.title")}</a></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.resources")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("footer.help")}</a></Link></li>
              <li><Link href="/blog"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("nav.blog")}</a></Link></li>
              <li><Link href="/tutorials"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("nav.tutorials")}</a></Link></li>
              <li><Link href="/faq"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("nav.faq")}</a></Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("footer.privacy")}</a></Link></li>
              <li><Link href="/terms"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("footer.terms")}</a></Link></li>
              <li><Link href="/contact"><a className="hover-elevate active-elevate-2 rounded px-1 py-0.5 inline-block">{t("footer.contact")}</a></Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="mt-1 text-xs">{t("footer.operator")}</p>
        </div>
      </div>
    </footer>
  );
}
