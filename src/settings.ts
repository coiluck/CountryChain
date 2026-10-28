import type { Settings } from './game.ts';
import { getElement } from './ui.ts';

// 設定項目（localStorage のキーも兼ねる）
const SETTING_IDS = {
  removeNonmembers: 'remove-nonmembers',
  removeEnclaves: 'remove-enclaves',
  removeIslands: 'remove-islands',
} as const satisfies Record<keyof Settings, string>;

function isChecked(id: string): boolean {
  return getElement<HTMLInputElement>(id).checked;
}

export function readSettings(): Settings {
  return {
    removeNonmembers: isChecked(SETTING_IDS.removeNonmembers),
    removeEnclaves: isChecked(SETTING_IDS.removeEnclaves),
    removeIslands: isChecked(SETTING_IDS.removeIslands),
  };
}

// localStorage から設定を復元、変更時に保存
export function setupSettingsStorage(): void {
  for (const id of Object.values(SETTING_IDS)) {
    const checkbox = getElement<HTMLInputElement>(id);
    if (localStorage.getItem(id) === 'true') {
      checkbox.checked = true;
    }
    checkbox.addEventListener('change', () => localStorage.setItem(id, String(checkbox.checked)));
  }
}
