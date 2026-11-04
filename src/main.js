import { onModalClose } from './modal.js';
import { MAX_MISTAKES, SEARCH_DEPTHS, allCountries, cpuMove, filterCountries, isGameOver, playerMove, startGame, suggestCountries } from './game.ts';
import { findCheckmate } from './search.ts';
import { addMap, addMessage, addPlayAgainButton, addReview, bindInputEvents, clearChat, showSuggestions } from './ui.ts';
import { hasCountrySettingsChanged, readSettings, setupSettingsStorage } from './settings.ts';

let settings;
let countries;
let state;
let isPlayerTurn = false;
let cpuTimer;

function nameOf(code) {
  return countries[code].jaName;
}

// ゲーム開始時
function startNewGame(notice) {
  clearTimeout(cpuTimer);
  clearChat();
  if (notice) addMessage(notice, 'system');
  settings = readSettings();
  countries = filterCountries(allCountries, settings);
  state = startGame(countries, settings);
  addMessage(`ゲームを開始します。最初の国は${nameOf(state.current)}です。`, 'system');
  computerTurn();
}

function computerTurn() {
  // モードは途中で変更されても次の手から反映する
  const next = cpuMove(countries, state, readSettings().mode);
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
    cpuTimer = setTimeout(computerTurn, 1000);
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
  if (readSettings().mode === 'extreme') showReview();
  addPlayAgainButton(startNewGame);
}

// どの時点で詰んでいたかを振り返る
function showReview() {
  // used は言った順に並んでいる
  const history = [...state.used];
  const checkmate = findCheckmate(countries, history, SEARCH_DEPTHS.extreme);
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

// 国の除外に関わる設定はゲーム途中に反映できないので、変更されていたらやり直す
onModalClose(() => {
  if (hasCountrySettingsChanged(settings)) {
    startNewGame('設定を変更したため、新しいゲームを開始します。');
  }
});

// ページ読み込み時に設定を復元してゲーム開始
document.addEventListener('DOMContentLoaded', () => {
  setupSettingsStorage();
  startNewGame();
});
