import type { Country } from './game.ts';

export type Sender = 'system' | 'cpu' | 'user';

export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`#${id} が見つかりません`);
  return element as T;
}

const chatLog = getElement<HTMLDivElement>('chatLog');
const userInput = getElement<HTMLInputElement>('userInput');
const sendButton = getElement<HTMLButtonElement>('sendButton');
const suggestionsContainer = getElement<HTMLDivElement>('suggestionsContainer');

// キーボードで選択中の候補（-1 は未選択）
let activeIndex = -1;

export function clearChat(): void {
  chatLog.replaceChildren();
}

// メッセージ枠を作ってログに追加
function appendMessage(content: string | Node, sender: Sender): HTMLDivElement {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.append(content);

  messageDiv.appendChild(contentDiv);
  chatLog.appendChild(messageDiv);

  // 自動スクロール
  chatLog.scrollTop = chatLog.scrollHeight;
  return messageDiv;
}

export function addMessage(text: string, sender: Sender): void {
  appendMessage(text, sender);
}

export function addPlayAgainButton(onClick: () => void): void {
  const playAgainButton = document.createElement('button');
  playAgainButton.className = 'press cursor-pointer rounded-full bg-ink px-7 py-3 text-white hover:scale-106 active:scale-94';
  playAgainButton.textContent = 'もう一度プレイ';
  const messageDiv = appendMessage(playAgainButton, 'system');
  playAgainButton.onclick = () => {
    // ボタンを含むメッセージを削除
    messageDiv.remove();
    onClick();
    userInput.focus();
  };
  // Enter ですぐ再プレイできるように
  playAgainButton.focus();
}

// 変換候補を表示（候補がなければ非表示）
export function showSuggestions(countries: readonly Country[]): void {
  if (countries.length === 0) {
    hideSuggestions();
    return;
  }
  suggestionsContainer.replaceChildren(
    ...countries.map((country) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.dataset.value = country.jaName;
      item.textContent = country.jaName;
      const en = document.createElement('span');
      en.className = 'en';
      en.textContent = country.enName;
      item.append(en);
      // クリックされたら入力して候補を非表示
      item.onclick = () => selectSuggestion(item);
      return item;
    }),
  );
  activeIndex = -1;
  suggestionsContainer.classList.add('is-open');
}

export function hideSuggestions(): void {
  suggestionsContainer.classList.remove('is-open');
  activeIndex = -1;
}

function isSuggestionsOpen(): boolean {
  return suggestionsContainer.classList.contains('is-open');
}

function selectSuggestion(item: HTMLElement): void {
  userInput.value = item.dataset.value ?? '';
  hideSuggestions();
  userInput.focus();
}

// 選択中の候補を delta だけ移動（端までいったら反対側へ）
function moveActive(delta: 1 | -1): void {
  const items = [...suggestionsContainer.children] as HTMLElement[];
  items[activeIndex]?.classList.remove('active');
  activeIndex = activeIndex === -1 && delta === -1
    ? items.length - 1
    : (activeIndex + delta + items.length) % items.length;
  const item = items[activeIndex];
  item?.classList.add('active');
  item?.scrollIntoView({ block: 'nearest' });
}

// 入力欄と送信ボタンのイベントを登録する
export function bindInputEvents(handlers: {
  onInput: (text: string) => void;
  onSubmit: (text: string) => void;
  // Enter キーでの送信を受け付けるか
  canSubmitByEnter: () => boolean;
}): void {
  function submit() {
    const text = userInput.value.trim();
    if (text === '') return;
    handlers.onSubmit(text);
    userInput.value = '';
    hideSuggestions();
    userInput.focus();
  }

  userInput.addEventListener('input', () => handlers.onInput(userInput.value));
  userInput.addEventListener('keydown', (e) => {
    // 日本語変換中のキー操作は IME に任せる
    if (e.isComposing || e.keyCode === 229) return;

    if (isSuggestionsOpen()) {
      // Tab / ↓ で次の候補、Shift+Tab / ↑ で前の候補
      if (e.key === 'Tab' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        moveActive(e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey) ? -1 : 1);
        return;
      }
      if (e.key === 'Escape') {
        hideSuggestions();
        return;
      }
      // 候補を選択中なら Enter で入力欄に確定
      const activeItem = suggestionsContainer.children[activeIndex];
      if (e.key === 'Enter' && activeItem instanceof HTMLElement) {
        e.preventDefault();
        selectSuggestion(activeItem);
        return;
      }
    }

    if (e.key === 'Enter' && handlers.canSubmitByEnter()) {
      e.preventDefault();
      submit();
    }
  });
  sendButton.addEventListener('click', submit);
}
