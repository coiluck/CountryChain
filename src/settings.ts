import type { Mode, Settings } from './game.ts';
import { getElement } from './ui.ts';

// チェックボックスの設定項目（localStorage のキーも兼ねる）
const SETTING_IDS = {
  removeNonmembers: 'remove-nonmembers',
  removeEnclaves: 'remove-enclaves',
  removeEarlyDecided: 'remove-early-decided',
} as const satisfies Record<Exclude<keyof Settings, 'mode'>, string>;

// モードのラジオボタンの name（localStorage のキーも兼ねる）
const MODE_NAME = 'mode';

function isChecked(id: string): boolean {
  return getElement<HTMLInputElement>(id).checked;
}

function modeRadios(): NodeListOf<HTMLInputElement> {
  return document.querySelectorAll<HTMLInputElement>(`input[name="${MODE_NAME}"]`);
}

export function readSettings(): Settings {
  const checked = [...modeRadios()].find((radio) => radio.checked);
  return {
    removeNonmembers: isChecked(SETTING_IDS.removeNonmembers),
    removeEnclaves: isChecked(SETTING_IDS.removeEnclaves),
    removeEarlyDecided: isChecked(SETTING_IDS.removeEarlyDecided),
    mode: (checked?.value ?? 'casual') as Mode,
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

  const savedMode = localStorage.getItem(MODE_NAME);
  for (const radio of modeRadios()) {
    if (radio.value === savedMode) {
      radio.checked = true;
    }
    radio.addEventListener('change', () => localStorage.setItem(MODE_NAME, radio.value));
  }
}
