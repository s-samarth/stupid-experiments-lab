import type { Metadata } from "next";
import Link from "next/link";
import { FilterChips, param } from "@/components/lab/FilterChips";
import { LabRecord } from "@/components/lab/LabRecord";
import { Breakdown } from "@/components/stats/Breakdown";
import { DailyChart } from "@/components/stats/DailyChart";
import { StatTiles } from "@/components/stats/StatTiles";
import { formatCount } from "@/lib/format";
import { getLabRecord } from "@/lib/queries/posts";
import { RANGES, findPostForStats, getBreakdown, getDailyReads, getTopPosts, getTotals, type RangeKey } from "@/lib/queries/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Open lab stats",
  description: "Everything this lab counts, in public. Aggregates only: no cookies, no personal data.",
};

const REFERRER_LABEL: Record<string, string> = { whatsapp: "WhatsApp", "linkedin.com": "LinkedIn", "x.com": "X" };
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export default async function StatsPage(props: PageProps<"/stats">) {
  const sp = await props.searchParams;
  const rangeKey = (param(sp.range) ?? "30") as RangeKey;
  const days = rangeKey in RANGES ? RANGES[rangeKey] : 30;
  const postSlug = param(sp.post);
  const post = postSlug ? await findPostForStats(postSlug) : null;
  const scope = { days, postId: post?.id };

  const [totals, daily, top, referrers, countries, record] = await Promise.all([
    getTotals(scope),
    getDailyReads(scope),
    post ? Promise.resolve([]) : getTopPosts(scope),
    getBreakdown(scope, "referrer"),
    getBreakdown(scope, "country"),
    getLabRecord(),
  ]);

  const current = { range: param(sp.range), post: postSlug };

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
      <h1 className="font-serif text-[36px] leading-tight">Open lab stats</h1>
      <p className="mt-2 max-w-xl font-serif text-[18px] text-muted">
        Everything I count, you can see. Aggregates only: no cookies, no names, no tracking across days.
      </p>
      {post && (
        <p className="mt-4 text-[14px]">
          Showing <Link href={`/p/${post.slug}`} className="ink-link font-serif italic">{post.title}</Link> ·{" "}
          <Link href="/stats" className="ink-link text-muted">whole lab</Link>
        </p>
      )}
      <div className="mt-5">
        <FilterChips
          basePath="/stats"
          param="range"
          label="range"
          allLabel="30 days"
          current={current}
          options={[
            { value: "7", label: "7 days" },
            { value: "90", label: "90 days" },
            { value: "all", label: "all time" },
          ]}
        />
      </div>

      <div className="mt-6">
        <StatTiles totals={totals} />
      </div>
      <div className="mt-8">
        <DailyChart data={daily} />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {!post && (
          <Breakdown
            title="Most read"
            rows={top.map((p) => ({ label: p.title, value: p.reads, display: formatCount(p.reads), href: `/p/${p.slug}` }))}
          />
        )}
        <Breakdown
          title="Where readers came from"
          rows={referrers.map((r) => ({ label: r.key ? (REFERRER_LABEL[r.key] ?? r.key) : "direct or apps", value: r.reads, display: r.pct === 0 ? "<1%" : `${r.pct}%` }))}
        />
        <Breakdown
          title="Countries"
          rows={countries.map((c) => ({ label: countryName(c.key), value: c.reads, display: c.pct === 0 ? "<1%" : `${c.pct}%` }))}
        />
        {!post && (
          <div className="max-w-60">
            <LabRecord record={record} />
          </div>
        )}
      </div>
    </div>
  );
}

function countryName(code: string | null): string {
  if (!code) return "unknown";
  if (code === "other") return "other";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}
