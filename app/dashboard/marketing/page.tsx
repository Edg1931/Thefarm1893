import Link from "next/link";
import { AdStudio } from "@/components/crm/AdStudio";
import { CouponManager } from "@/components/crm/CouponManager";
import { StatCard } from "@/components/crm/widgets";
import { getCoupons } from "@/lib/crm/data";
import { Eye, MousePointerClick, Users, Share2, BookOpen } from "lucide-react";
import { DemoBanner } from "@/components/crm/DemoBanner";

export const metadata = { title: "Marketing Studio" };

export default async function MarketingPage() {
  const { coupons, live } = await getCoupons();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">AI Ad &amp; Social Studio</h1>
        <p className="mt-1 text-stone">Generate ads for any audience, edit them your way, and run them across every channel — from one place.</p>
      </div>

      <Link href="/journal" target="_blank" className="flex items-center justify-between rounded-2xl border border-sage/30 bg-sage/8 p-4 transition hover:bg-sage/12">
        <span className="flex items-center gap-3 text-sm text-ink-soft">
          <BookOpen size={18} className="text-sage-deep" />
          <span><b className="text-ink">Publish to the Journal</b> — turn any AI-generated blog post into a live, SEO-ranking article on your site.</span>
        </span>
        <span className="text-sm font-medium text-sage-deep">View the Journal →</span>
      </Link>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Website visitors (30d)" value="8,420" delta="+22%" icon={Eye} accent="ink" />
        <StatCard label="Inquiry conversion" value="4.1%" delta="+0.6%" icon={MousePointerClick} accent="sage" />
        <StatCard label="Social reach (30d)" value="46.2k" delta="+31%" icon={Share2} accent="brass" />
        <StatCard label="Email subscribers" value="1,240" delta="+58" icon={Users} accent="terracotta" />
      </div>

      <AdStudio />

      <DemoBanner live={live} empty={coupons.length === 0} what="promo codes" />
      <CouponManager initial={coupons} />
    </div>
  );
}
