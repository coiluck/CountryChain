import './modal.js';
import { MAX_MISTAKES, allCountries, cpuMove, filterCountries, isGameOver, playerMove, startGame, suggestCountries } from './game.ts';
import { findCheckmate } from './search.ts';
import { addMap, addMessage, addPlayAgainButton, addReview, bindInputEvents, clearChat, showSuggestions } from './ui.ts';
import { readSettings, setupSettingsStorage } from './settings.ts';

let settings;
let countries;
let state;
let isPlayerTurn = false;

function nameOf(code) {
  return countries[code].jaName;
}

// ゲーム開始時
function startNewGame() {
  clearChat();
  settings = readSettings();
  countries = filterCountries(allCountries, settings);
  state = startGame(countries, settings);
  addMessage(`ゲームを開始します。最初の国は${nameOf(state.current)}です。`, 'system');
  computerTurn();
}

function computerTurn() {
  const next = cpuMove(countries, state, settings.mode);
  if (next === null) {
    addMessage('コンピュータが言える国がなくなりました。プレイヤーの勝利です！', 'system');
    endGame();
    return;
  }
  state = next;
  addMessage(`コンピュータ: ${nameOf(state.current)}`, 'cpu');
  addMap(state.used, state.current);
  isPlayerTurn = true;
}

function playerTurn(answer) {
  if (!isPlayerTurn) return;

  const move = playerMove(countries, state, answer);
  if (move.result === 'ok') {
    state = move.state;
    addMap(state.used, state.current);
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
    endGame();
  } else {
    addMessage(`${reason}もう一度試してください。`, 'system');
  }
}

function endGame() {
  if (settings.mode === 'hard') showReview();
  addPlayAgainButton(startNewGame);
}

// どの時点で詰んでいたかを振り返る
function showReview() {
  // used は言った順に並んでいる
  const history = [...state.used];
  const checkmate = findCheckmate(countries, history);
  if (checkmate === null) {
    addMessage('振り返り：最後まで詰みにはなっていませんでした。', 'system');
    return;
  }
  addReview({
    strategy: checkmate.strategy,
    played: history.slice(checkmate.index + 1),
    answer: checkmate.index === 0 ? null : history[checkmate.index],
    nameOf,
  });
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
