// ページが読み込まれたら使う変数作る
const countryData = {
  "Afghanistan": ["Iran", "Pakistan", "Turkmenistan", "Uzbekistan", "Tajikistan", "China"],
  "Albania": ["Montenegro", "Kosovo", "North Macedonia", "Greece"],
  "Algeria": ["Morocco", "Western Sahara", "Mauritania", "Mali", "Niger", "Libya", "Tunisia"],
  "Andorra": ["France", "Spain"],
  "Angola": ["Democratic Republic of the Congo", "Zambia", "Namibia", "Republic of the Congo"],
  "Antigua and Barbuda": [],
  "Argentina": ["Chile", "Bolivia", "Paraguay", "Brazil", "Uruguay"],
  "Armenia": ["Georgia", "Azerbaijan", "Iran", "Turkey"],
  "Australia": [],
  "Austria": ["Germany", "Czech Republic", "Slovakia", "Hungary", "Slovenia", "Italy", "Switzerland", "Liechtenstein"],
  "Azerbaijan": ["Russia", "Georgia", "Armenia", "Iran", "Turkey"],
  "Bahamas": [],
  "Bahrain": [],
  "Bangladesh": ["India", "Myanmar"],
  "Barbados": [],
  "Belarus": ["Russia", "Ukraine", "Poland", "Lithuania", "Latvia"],
  "Belgium": ["France", "Netherlands", "Germany", "Luxembourg"],
  "Belize": ["Mexico", "Guatemala"],
  "Benin": ["Niger", "Burkina Faso", "Togo", "Nigeria"],
  "Bhutan": ["China", "India"],
  "Bolivia": ["Brazil", "Peru", "Chile", "Argentina", "Paraguay"],
  "Bosnia and Herzegovina": ["Croatia", "Serbia", "Montenegro"],
  "Botswana": ["Namibia", "South Africa", "Zimbabwe", "Zambia"],
  "Brazil": ["Uruguay", "Argentina", "Paraguay", "Bolivia", "Peru", "Colombia", "Venezuela", "Guyana", "Suriname", "French Guiana"],
  "Brunei": ["Malaysia"],
  "Bulgaria": ["Romania", "Serbia", "North Macedonia", "Greece", "Turkey"],
  "Burkina Faso": ["Mali", "Niger", "Benin", "Togo", "Ghana", "Ivory Coast"],
  "Burundi": ["Rwanda", "Tanzania", "Democratic Republic of the Congo"],
  "Cambodia": ["Thailand", "Laos", "Vietnam"],
  "Cameroon": ["Nigeria", "Chad", "Central African Republic", "Republic of the Congo", "Gabon", "Equatorial Guinea"],
  "Canada": ["United States"],
  "Cape Verde": [],
  "Central African Republic": ["Chad", "Sudan", "South Sudan", "Democratic Republic of the Congo", "Republic of the Congo", "Cameroon"],
  "Chad": ["Libya", "Sudan", "Central African Republic", "Cameroon", "Nigeria", "Niger"],
  "Chile": ["Peru", "Bolivia", "Argentina"],
  "China": ["North Korea", "Russia", "Mongolia", "Kazakhstan", "Kyrgyzstan", "Tajikistan", "Afghanistan", "Pakistan", "India", "Nepal", "Bhutan", "Myanmar", "Laos", "Vietnam"],
  "Colombia": ["Panama", "Venezuela", "Brazil", "Peru", "Ecuador"],
  "Comoros": [],
  "Republic of the Congo": ["Democratic Republic of the Congo", "Central African Republic", "Cameroon", "Gabon", "Angola"],
  "Democratic Republic of the Congo": ["Republic of the Congo", "Central African Republic", "South Sudan", "Uganda", "Rwanda", "Burundi", "Tanzania", "Zambia", "Angola"],
  "Costa Rica": ["Nicaragua", "Panama"],
  "Croatia": ["Slovenia", "Hungary", "Bosnia and Herzegovina", "Serbia", "Montenegro"],
  "Cuba": [],
  "Cyprus": [],
  "Czech Republic": ["Germany", "Poland", "Slovakia", "Austria"],
  "Denmark": ["Germany"],
  "Djibouti": ["Eritrea", "Ethiopia", "Somalia"],
  "Dominica": [],
  "Dominican Republic": ["Haiti"],
  "Ecuador": ["Colombia", "Peru"],
  "Egypt": ["Libya", "Sudan", "Israel", "Palestine"],
  "El Salvador": ["Guatemala", "Honduras"],
  "Equatorial Guinea": ["Cameroon", "Gabon"],
  "Eritrea": ["Sudan", "Ethiopia", "Djibouti"],
  "Estonia": ["Russia", "Latvia"],
  "Eswatini": ["South Africa", "Mozambique"],
  "Ethiopia": ["Eritrea", "Djibouti", "Somalia", "Kenya", "South Sudan", "Sudan"],
  "Fiji": [],
  "Finland": ["Norway", "Sweden", "Russia"],
  "France": ["Belgium", "Luxembourg", "Germany", "Switzerland", "Italy", "Monaco", "Spain", "Andorra"],
  "French Guiana": ["Brazil", "Suriname"],
  "Gabon": ["Equatorial Guinea", "Cameroon", "Republic of the Congo"],
  "Gambia": ["Senegal"],
  "Georgia": ["Russia", "Azerbaijan", "Armenia", "Turkey"],
  "Germany": ["Denmark", "Netherlands", "Belgium", "Luxembourg", "France", "Switzerland", "Austria", "Czech Republic", "Poland"],
  "Ghana": ["Burkina Faso", "Ivory Coast", "Togo"],
  "Greece": ["Albania", "North Macedonia", "Bulgaria", "Turkey"],
  "Grenada": [],
  "Guatemala": ["Mexico", "Belize", "El Salvador", "Honduras"],
  "Guinea": ["Guinea-Bissau", "Senegal", "Mali", "Ivory Coast", "Liberia", "Sierra Leone"],
  "Guinea-Bissau": ["Senegal", "Guinea"],
  "Guyana": ["Venezuela", "Brazil", "Suriname"],
  "Haiti": ["Dominican Republic"],
  "Honduras": ["Guatemala", "El Salvador", "Nicaragua"],
  "Hungary": ["Slovakia", "Ukraine", "Romania", "Serbia", "Croatia", "Slovenia", "Austria"],
  "Iceland": [],
  "India": ["Pakistan", "China", "Nepal", "Bhutan", "Myanmar", "Bangladesh"],
  "Indonesia": ["Malaysia", "Papua New Guinea", "Timor-Leste"],
  "Iran": ["Turkey", "Iraq", "Pakistan", "Afghanistan", "Turkmenistan", "Azerbaijan", "Armenia"],
  "Iraq": ["Turkey", "Iran", "Kuwait", "Saudi Arabia", "Jordan", "Syria"],
  "Ireland": ["United Kingdom"],
  "Israel": ["Lebanon", "Syria", "Jordan", "Palestine", "Egypt"],
  "Italy": ["France", "Switzerland", "Austria", "Slovenia", "San Marino", "Vatican City"],
  "Ivory Coast": ["Liberia", "Guinea", "Mali", "Burkina Faso", "Ghana"],
  "Jamaica": [],
  "Japan": [],
  "Jordan": ["Syria", "Iraq", "Saudi Arabia", "Israel", "Palestine"],
  "Kazakhstan": ["Russia", "China", "Kyrgyzstan", "Uzbekistan", "Turkmenistan"],
  "Kenya": ["Somalia", "Ethiopia", "South Sudan", "Uganda", "Tanzania"],
  "Kiribati": [],
  "Kosovo": ["Serbia", "Montenegro", "Albania", "North Macedonia"],
  "Kuwait": ["Iraq", "Saudi Arabia"],
  "Kyrgyzstan": ["Kazakhstan", "China", "Tajikistan", "Uzbekistan"],
  "Laos": ["China", "Vietnam", "Cambodia", "Thailand", "Myanmar"],
  "Latvia": ["Estonia", "Russia", "Belarus", "Lithuania"],
  "Lebanon": ["Syria", "Israel"],
  "Lesotho": ["South Africa"],
  "Liberia": ["Sierra Leone", "Guinea", "Ivory Coast"],
  "Libya": ["Tunisia", "Algeria", "Niger", "Chad", "Sudan", "Egypt"],
  "Liechtenstein": ["Switzerland", "Austria"],
  "Lithuania": ["Latvia", "Belarus", "Poland", "Russia"],
  "Luxembourg": ["Belgium", "France", "Germany"],
  "North Macedonia": ["Kosovo", "Serbia", "Bulgaria", "Greece", "Albania"],
  "Madagascar": [],
  "Malawi": ["Tanzania", "Mozambique", "Zambia"],
  "Malaysia": ["Thailand", "Indonesia", "Brunei"],
  "Maldives": [],
  "Mali": ["Algeria", "Niger", "Burkina Faso", "Ivory Coast", "Guinea", "Senegal", "Mauritania"],
  "Malta": [],
  "Marshall Islands": [],
  "Mauritania": ["Western Sahara", "Algeria", "Mali", "Senegal"],
  "Mauritius": [],
  "Mexico": ["United States", "Guatemala", "Belize"],
  "Micronesia": [],
  "Moldova": ["Romania", "Ukraine"],
  "Monaco": ["France"],
  "Mongolia": ["Russia", "China"],
  "Montenegro": ["Croatia", "Bosnia and Herzegovina", "Serbia", "Kosovo", "Albania"],
  "Morocco": ["Algeria", "Western Sahara", "Spain"],
  "Mozambique": ["Tanzania", "Malawi", "Zambia", "Zimbabwe", "South Africa", "Eswatini"],
  "Myanmar": ["China", "Laos", "Thailand", "Bangladesh", "India"],
  "Namibia": ["Angola", "Zambia", "Botswana", "South Africa"],
  "Nauru": [],
  "Nepal": ["China", "India"],
  "Netherlands": ["Belgium", "Germany"],
  "New Zealand": [],
  "Nicaragua": ["Honduras", "Costa Rica"],
  "Niger": ["Algeria", "Libya", "Chad", "Nigeria", "Benin", "Burkina Faso", "Mali"],
  "Nigeria": ["Niger", "Chad", "Cameroon", "Benin"],
  "North Korea": ["China", "South Korea", "Russia"],
  "Norway": ["Sweden", "Finland", "Russia"],
  "Oman": ["Yemen", "Saudi Arabia", "United Arab Emirates"],
  "Pakistan": ["Iran", "Afghanistan", "China", "India"],
  "Palau": [],
  "Palestine": ["Israel", "Egypt", "Jordan"],
  "Panama": ["Costa Rica", "Colombia"],
  "Papua New Guinea": ["Indonesia"],
  "Paraguay": ["Bolivia", "Brazil", "Argentina"],
  "Peru": ["Ecuador", "Colombia", "Brazil", "Bolivia", "Chile"],
  "Philippines": [],
  "Poland": ["Germany", "Czech Republic", "Slovakia", "Ukraine", "Belarus", "Lithuania", "Russia"],
  "Portugal": ["Spain"],
  "Qatar": ["Saudi Arabia"],
  "Romania": ["Ukraine", "Moldova", "Bulgaria", "Serbia", "Hungary"],
  "Russia": ["Norway", "Finland", "Estonia", "Latvia", "Lithuania", "Poland", "Belarus", "Ukraine", "Georgia", "Azerbaijan", "Kazakhstan", "China", "Mongolia", "North Korea"],
  "Rwanda": ["Uganda", "Tanzania", "Burundi", "Democratic Republic of the Congo"],
  "Saint Kitts and Nevis": [],
  "Saint Lucia": [],
  "Saint Vincent and the Grenadines": [],
  "Samoa": [],
  "San Marino": ["Italy"],
  "Sao Tome and Principe": [],
  "Saudi Arabia": ["Jordan", "Iraq", "Kuwait", "Qatar", "United Arab Emirates", "Oman", "Yemen"],
  "Senegal": ["Mauritania", "Mali", "Guinea", "Guinea-Bissau", "Gambia"],
  "Serbia": ["Hungary", "Romania", "Bulgaria", "North Macedonia", "Kosovo", "Montenegro", "Bosnia and Herzegovina", "Croatia"],
  "Seychelles": [],
  "Sierra Leone": ["Guinea", "Liberia"],
  "Singapore": [],
  "Slovakia": ["Poland", "Ukraine", "Hungary", "Austria", "Czech Republic"],
  "Slovenia": ["Italy", "Austria", "Hungary", "Croatia"],
  "Solomon Islands": [],
  "Somalia": ["Ethiopia", "Djibouti", "Kenya"],
  "South Africa": ["Namibia", "Botswana", "Zimbabwe", "Mozambique", "Eswatini", "Lesotho"],
  "South Korea": ["North Korea"],
  "South Sudan": ["Sudan", "Ethiopia", "Kenya", "Uganda", "Democratic Republic of the Congo", "Central African Republic"],
  "Spain": ["France", "Andorra", "Portugal", "Morocco"],
  "Sri Lanka": [],
  "Sudan": ["Egypt", "Libya", "Chad", "Central African Republic", "South Sudan", "Ethiopia", "Eritrea"],
  "Suriname": ["Guyana", "Brazil", "French Guiana"],
  "Sweden": ["Norway", "Finland"],
  "Switzerland": ["France", "Germany", "Austria", "Liechtenstein", "Italy"],
  "Syria": ["Turkey", "Iraq", "Jordan", "Lebanon", "Israel"],
  "Taiwan": [],
  "Tajikistan": ["Kyrgyzstan", "China", "Afghanistan", "Uzbekistan"],
  "Tanzania": ["Kenya", "Uganda", "Rwanda", "Burundi", "Democratic Republic of the Congo", "Zambia", "Malawi", "Mozambique"],
  "Thailand": ["Myanmar", "Laos", "Cambodia", "Malaysia"],
  "Timor-Leste": ["Indonesia"],
  "Togo": ["Ghana", "Burkina Faso", "Benin"],
  "Tonga": [],
  "Trinidad and Tobago": [],
  "Tunisia": ["Algeria", "Libya"],
  "Turkey": ["Greece", "Bulgaria", "Georgia", "Armenia", "Azerbaijan", "Iran", "Iraq", "Syria"],
  "Turkmenistan": ["Kazakhstan", "Uzbekistan", "Afghanistan", "Iran"],
  "Tuvalu": [],
  "Uganda": ["South Sudan", "Kenya", "Tanzania", "Rwanda", "Democratic Republic of the Congo"],
  "Ukraine": ["Belarus", "Russia", "Moldova", "Romania", "Hungary", "Slovakia", "Poland"],
  "United Arab Emirates": ["Saudi Arabia", "Oman"],
  "United Kingdom": ["Ireland"],
  "United States": ["Canada", "Mexico"],
  "Uruguay": ["Brazil", "Argentina"],
  "Uzbekistan": ["Kazakhstan", "Kyrgyzstan", "Tajikistan", "Afghanistan", "Turkmenistan"],
  "Vanuatu": [],
  "Vatican City": ["Italy"],
  "Venezuela": ["Colombia", "Brazil", "Guyana"],
  "Vietnam": ["China", "Laos", "Cambodia"],
  "Western Sahara": ["Morocco", "Algeria", "Mauritania"],
  "Yemen": ["Saudi Arabia", "Oman"],
  "Zambia": ["Democratic Republic of the Congo", "Tanzania", "Malawi", "Mozambique", "Zimbabwe", "Botswana", "Namibia", "Angola"],
  "Zimbabwe": ["Zambia", "Botswana", "South Africa", "Mozambique"]
}
let currentCountry;
let usedCountries = new Set();
let isPlayerTurn = false;
let mistakes = 0;
let countryList = JSON.parse(JSON.stringify(countryData));
let countryNames = [];

// データからユーザー設定で国を消す
function MakeCountryData() {
  // 非国連加盟国を除外
  if (document.getElementById("remove-nonmembers").checked) {
    const nonmembersList = new Set(["Kosovo", "Palestine", "Taiwan", "Vatican City", "Western Sahara"]);
    for (const country of nonmembersList) {
      if (countryList[country]) {
        delete countryList[country];
      }
      for (const key in countryList) {
        const index = countryList[key].indexOf(country);
        if (index !== -1) {
          countryList[key].splice(index, 1);
        }
      }
    }
    console.log("消去しました: 非加盟");
  }
  // 飛び地を除外
  if (document.getElementById("remove-enclaves").checked) {
    const tobitiList = {"Spain":"Morocco", "Morocco":"Spain", "Russia":"Poland", "Poland":"Russia", "Russia": "Lithuania", "Lithuania": "Russia", "Angola": "Republic of the Congo", "Republic of the Congo": "Angola", "Azerbaijan": "Turkey", "Turkey": "Azerbaijan"};
    for (const [country, neighbor] of Object.entries(tobitiList)) {
      if (countryList[country]) {
        // 特定の国の隣接国リストから neighbor を削除
        const index = countryList[country].indexOf(neighbor);
        if (index !== -1) {
          countryList[country].splice(index, 1);
        }
      }
    }
    console.log("消去しました: 飛び地");
  }
  // 島国を除外
  if (document.getElementById("remove-islands").checked) {
    for (const country in countryList) {
      if (countryList[country].length === 0) {
        delete countryList[country];
      }
    }
    console.log("消去しました: 島国");
  }
  // 国名のリストを更新（予測変換用）
  countryNames = Object.keys(countryList);
}

// ゲーム開始時
function startNewGame() {
  // チャットログを消去
  const chatLog = document.getElementById('chatLog');
  chatLog.innerHTML = '';
  // ゲーム変数の初期化
  usedCountries.clear();
  mistakes = 0;
  MakeCountryData();
  currentCountry = getRandomCountry();
  usedCountries.add(currentCountry);
  addMessage(`ゲームを開始します。最初の国は${currentCountry}です。`, 'system');
  computerTurn();
}

function getRandomCountry() {
  const countries = Object.keys(countryList); // 配列として取得
  const randomIndex = Math.floor(Math.random() * countries.length); // ランダム！
  return countries[randomIndex];
}

function computerTurn() {
  // 使用されていない隣国をフィルタリング
  const neighboringCountries = countryList[currentCountry].filter(country => !usedCountries.has(country));
  if (neighboringCountries.length === 0) {
    addMessage('コンピュータが言える国がなくなりました。プレイヤーの勝利です！', 'system');
    addPlayAgainButton();
    return;
  } else {
    // ランダムに1つ選択
    const nextCountry = neighboringCountries[Math.floor(Math.random() * neighboringCountries.length)];
    usedCountries.add(nextCountry);
    currentCountry = nextCountry;
    addMessage(`コンピュータ: ${nextCountry}`, 'cpu');
    isPlayerTurn = true;
  }
}

function playerTurn(answer) {
  if (!isPlayerTurn) return;

  if (!countryList[currentCountry].includes(answer)) {
    mistakes++;
    if (mistakes >= 2) {
      addMessage(`${answer}は${currentCountry}に隣接していません。2回連続で間違えたためゲームオーバーです！`, 'system');
      addPlayAgainButton();
    } else {
      addMessage(`${answer}は${currentCountry}に隣接していません。もう一度試してください。`, 'system');
    }
    return;
  }

  if (usedCountries.has(answer)) {
    mistakes++;
    if (mistakes >= 2) {
      addMessage(`${answer}は既に使用されています。2回連続で間違えたためゲームオーバーです！`, 'system');
      addPlayAgainButton();
    } else {
      addMessage(`${answer}は既に使用されています。もう一度試してください。`, 'system');
    }
    return;
  }

  mistakes = 0;
  usedCountries.add(answer);
  currentCountry = answer;
  isPlayerTurn = false;
  setTimeout(computerTurn, 1000);
}

// メッセージをログに追加
function addMessage(text, sender) {
  const chatLog = document.getElementById('chatLog');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
        
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = text;
        
  messageDiv.appendChild(contentDiv);
  chatLog.appendChild(messageDiv);
        
  // 自動スクロール
  chatLog.scrollTop = chatLog.scrollHeight;
}

// 変換候補を表示
function showSuggestions() {
  const userInput = document.getElementById('userInput');
  const suggestionsContainer = document.getElementById('suggestionsContainer');
  // 入力値の前後の空白を削除して小文字に
  const input = userInput.value.trim().toLowerCase();
  if (input.length > 0) {
    // 入力値で始まるか、入力値が含まれている国名を抽出
    const suggestions = countryNames.filter(country => 
      country.toLowerCase().startsWith(input) || country.toLowerCase().includes(input)
    );

    if (suggestions.length > 0) {
      // 既存の候補をクリア
      suggestionsContainer.innerHTML = '';
      // 候補を1件ずつ表示
      suggestions.forEach(suggestion => {
        const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.textContent = suggestion;
          // クリックされたら入力して候補を非表示
          item.onclick = function() {
            userInput.value = suggestion;
            suggestionsContainer.style.display = 'none';
          };
          suggestionsContainer.appendChild(item);
        });
        suggestionsContainer.style.display = 'block';
      } else {
        // 候補がないときは変換を非表示
        suggestionsContainer.style.display = 'none';
      }
    } else {
        // 入力がないときは変換を非表示
      suggestionsContainer.style.display = 'none';
  }
}
// ユーザーターンかつEnterキーで送信
document.getElementById('userInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && isPlayerTurn === true ) {
    sendMessage();
  }
});
// 送信ボタンクリック時の処理
function sendMessage() {
  const userInput = document.getElementById('userInput');
  const message = userInput.value.trim();
  if (message !== '') {
    addMessage(message, 'user');
    playerTurn(message);
    userInput.value = '';   
    // 変換候補を閉じる
    document.getElementById('suggestionsContainer').style.display = 'none';
  }
}

function addPlayAgainButton() {
  const chatLog = document.getElementById('chatLog');
  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'message system-message';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const playAgainButton = document.createElement('button');
  playAgainButton.className = 'play-again-button';
  playAgainButton.textContent = 'もう一度プレイ';
  playAgainButton.onclick = function() {
    // ボタンを含むメッセージを削除
    chatLog.removeChild(buttonDiv);
    // 新しいゲームを開始
    startNewGame();
  };
  
  contentDiv.appendChild(playAgainButton);
  buttonDiv.appendChild(contentDiv);
  chatLog.appendChild(buttonDiv);
  
  // 自動スクロール
  chatLog.scrollTop = chatLog.scrollHeight;
}

// 設定の保存と読み込み
function setupSettingsStorage() {
  const removeNonmembers = document.getElementById("remove-nonmembers");
  const removeEnclaves = document.getElementById("remove-enclaves");
  const removeIslands = document.getElementById("remove-islands");
  
  // 設定を読み込む
  function loadSettings() {
    // ローカルストレージから取得
    if(localStorage.getItem("remove-nonmembers") === "true") {
      removeNonmembers.checked = true;
    }
    if(localStorage.getItem("remove-enclaves") === "true") {
      removeEnclaves.checked = true;
    }
    if(localStorage.getItem("remove-islands") === "true") {
      removeIslands.checked = true;
    }
  }
  
  // 設定変更時に保存
  function saveSettings() {
    localStorage.setItem("remove-nonmembers", removeNonmembers.checked);
    localStorage.setItem("remove-enclaves", removeEnclaves.checked);
    localStorage.setItem("remove-islands", removeIslands.checked);
  }
  removeNonmembers.addEventListener('change', saveSettings);
  removeEnclaves.addEventListener('change', saveSettings);
  removeIslands.addEventListener('change', saveSettings);
  
  loadSettings();
  startNewGame();
}

// ページ読み込み時に設定のセットアップを実行
document.addEventListener('DOMContentLoaded', setupSettingsStorage);