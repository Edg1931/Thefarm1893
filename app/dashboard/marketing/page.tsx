import { MarketingStudio } from "@/components/crm/MarketingStudio";
import { StatCard } from "@/components/crm/widgets";
import { Eye, MousePointerClick, Users, Share2 } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">AI Marketing Studio</h1>
        <p className="mt-1 text-stone">Generate on-brand content, schedule across channels, and turn traffic into leads.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Website visitors (30d)" value="8,420" delta="+22%" icon={Eye} accent="ink" />
        <StatCard label="Inquiry conversion" value="4.1%" delta="+0.6%" icon={MousePointerClick} accent="sage" />
        <StatCard label="Social reach (30d)" value="46.2k" delta="+31%" icon={Share2} accent="brass" />
        <StatCard label="Email subscribers" value="1,240" delta="+58" icon={Users} accent="terracotta" />
      </div>

      <MarketingStudio />
    </div>
  );
}
