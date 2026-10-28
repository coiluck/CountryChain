import './modal.js';
import { MAX_MISTAKES, allCountries, cpuMove, filterCountries, isGameOver, playerMove, startGame, suggestCountries } from './game.ts';
import { addMessage, addPlayAgainButton, bindInputEvents, clearChat, showSuggestions } from './ui.ts';
import { readSettings, setupSettingsStorage } from './settings.ts';

let countries;
let state;
let isPlayerTurn = false;

function nameOf(code) {
  return countries[code].jaName;
}

// ゲーム開始時
function startNewGame() {
  clearChat();
  countries = filterCountries(allCountries, readSettings());
  state = startGame(countries);
  addMessage(`ゲームを開始します。最初の国は${nameOf(state.current)}です。`, 'system');
  computerTurn();
}

function computerTurn() {
  const next = cpuMove(countries, state);
  if (next === null) {
    addMessage('コンピュータが言える国がなくなりました。プレイヤーの勝利です！', 'system');
    addPlayAgainButton(startNewGame);
    return;
  }
  state = next;
  addMessage(`コンピュータ: ${nameOf(state.current)}`, 'cpu');
  isPlayerTurn = true;
}

function playerTurn(answer) {
  if (!isPlayerTurn) return;

  const move = playerMove(countries, state, answer);
  if (move.result === 'ok') {
    state = move.state;
    isPlayerTurn = false;
    setTimeout(computerTurn, 1000);
    return;
  }

  const reason = move.result === 'not-adjacent'
    ? `${answer}は${nameOf(state.current)}に隣接していません。`
    : `${answer}は既に使用されています。`;
  state = move.state;
  if (isGameOver(state)) {
    addMessage(`${reason}${MAX_MISTAKES}回連続で間違えたためゲームオーバーです！`, 'system');
    addPlayAgainButton(startNewGame);
  } else {
    addMessage(`${reason}もう一度試してください。`, 'system');
  }
}

bindInputEvents({
  onInput: (text) => showSuggestions(suggestCountries(countries, text)),
  onSubmit: (text) => {
    addMessage(text, 'user');
    playerTurn(text);
  },
  // ユーザーターンのときだけ Enter で送信
  canSubmitByEnter: () => isPlayerTurn,
});

// ページ読み込み時に設定を復元してゲーム開始
document.addEventListener('DOMContentLoaded', () => {
  setupSettingsStorage();
  startNewGame();
});
