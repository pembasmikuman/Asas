import { expect, test } from "bun:test";
import { scoreItem } from "./score";

const base = {
  use_year4: "no", used_90d: false, passion: false,
  for_looks: false, replaceable: false, sentimental: false,
} as const;

test("all-negative item is the floor", () => {
  const r = scoreItem({ ...base, for_looks: true, replaceable: true });
  expect(r.score).toBe(0);
  expect(r.verdict).toBe("leave");
});

test("all-positive item is the ceiling and Keep", () => {
  const r = scoreItem({
    ...base, use_year4: "yes", used_90d: true, passion: true,
  });
  expect(r.score).toBe(100);
  expect(r.verdict).toBe("keep");
});

test("maybe bucket sits between thresholds", () => {
  const r = scoreItem({ ...base, use_year4: "maybe", replaceable: false });
  expect(r.score).toBe(48);
  expect(r.verdict).toBe("maybe");
});

test("sentimental veto lifts a Leave to Maybe", () => {
  const leave = scoreItem({ ...base, for_looks: true });
  expect(leave.verdict).toBe("leave");
  const vetoed = scoreItem({ ...base, for_looks: true, sentimental: true });
  expect(vetoed.verdict).toBe("maybe");
  expect(vetoed.score).toBe(leave.score);
});
