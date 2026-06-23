export default function RecruitmentModal() {
  const GROUPS = ["A", "B", "C"] as const;
  type Group = (typeof GROUPS)[number];
  const STORAGE_KEY = (g: Group) => `job_urls_group_${g}`;

  function saveGroup(group: Group, urls: string[]) {
    localStorage.setItem(STORAGE_KEY(group), JSON.stringify(urls));
  }

  function loadGroup(group: Group): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(group));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
