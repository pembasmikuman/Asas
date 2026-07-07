export type Answers = {
  use_year4: "no" | "maybe" | "yes";
  used_90d: boolean;
  passion: boolean;
  for_looks: boolean;
  replaceable: boolean;
  sentimental: boolean;
};
export type Verdict = "keep" | "maybe" | "leave";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function scoreItem(a: Answers): { score: number; verdict: Verdict } {
  const year4 = a.use_year4 === "yes" ? 30 : a.use_year4 === "maybe" ? 15 : 0;
  const raw =
    year4 +
    (a.used_90d ? 20 : 0) +
    (a.passion ? 20 : 0) +
    (a.for_looks ? -15 : 0) +
    (a.replaceable ? -10 : 10);

  const score = clamp(Math.round(((raw + 25) / 105) * 100), 0, 100);

  let verdict: Verdict = score >= 60 ? "keep" : score >= 35 ? "maybe" : "leave";
  if (verdict === "leave" && a.sentimental) verdict = "maybe";
  return { score, verdict };
}
