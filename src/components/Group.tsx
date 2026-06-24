//로컬스토리지 저장/불러오기

export const GROUPS = ["A", "B", "C"] as const;
export type Group = (typeof GROUPS)[number];
export const STORAGE_KEY = (g: Group) => `job_urls_group_${g}`;

export function saveGroup(group: Group, urls: string[]) {
  localStorage.setItem(STORAGE_KEY(group), JSON.stringify(urls));
}

export function loadGroup(group: Group): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(group));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function myGroup(group: Group, urls: string[]) {
  localStorage.setItem(STORAGE_KEY(group), JSON.stringify(urls));
}
//그룹 이름 수정

export const GROUP_NAME_KEY = (g: Group) => `job_group_name_${g}`;

export function saveGroupName(group: Group, name: string) {
  localStorage.setItem(GROUP_NAME_KEY(group), name);
}

export function loadGroupName(group: Group): string {
  return localStorage.getItem(GROUP_NAME_KEY(group)) ?? `그룹 ${group}`;
}

// ── 그룹 선택 UI (저장/불러오기 공통) ────────────────────────────────────
export function GroupSelector({
  selected,
  onChange,
}: {
  selected: Group;
  onChange: (g: Group) => void;
}) {
  return (
    <div className="flex gap-2 mb-5">
      {GROUPS.map((g) => {
        const saved = loadGroup(g);
        return (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all"
            style={{
              background:
                selected === g
                  ? "linear-gradient(135deg, #16A34A, #22C55E)"
                  : "#fafafa",
              color: selected === g ? "white" : "#555",
              borderColor: selected === g ? "transparent" : "#eaeaea",
            }}
          >
            그룹 {g}
            <span className="block text-[9px] mt-0.5 opacity-70">
              {saved.length > 0 ? `${saved.length}개` : "비어있음"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
