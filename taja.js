
var httpRequest;

// Long/Short Text Practice

var input;

var ignoreEnter = false;
var pageText, composingText;
var currentLine;

var speeds, accuracies;

var practiceText;

var startTime;

// Layout Practice

var currentChar;
var nextChars;

var currentLayout;
var currentLevel;
var containLowerLevels;

//

const getSpeed = function(start, end, txt, ignoreSpace=false) {
  const time = end - start;
  const normalized = ignoreSpace ? txt.normalize("NFD").replace(/ /g, '') : txt.normalize("NFD");
  const length = normalized.length;
  return (normalized.length * 60000) / time;
}

const getEditDistance = function(a, b) {
  a = a.normalize('NFD');
  b = b.normalize ('NFD');
  var dist = [];
  const max = Math.max(a.length, b.length);
  for(var i = 0 ; i <= max ; i++) {
    dist[i] = [];
    for(var j = 0 ; j <= max ; j++) {
      dist[i][j] = 0;
    }
  }
  for(var i = 1 ; i <= a.length ; i++) {
    dist[i][0] = i;
  }
  for(var j = 1 ; j <= b.length ; j++) {
    dist[0][j] = j;
  }
  for(var i = 1 ; i <= a.length ; i++) {
    for(var j = 1 ; j <= b.length ; j++) {
      if(a.charAt(i-1) == b.charAt(j-1)) dist[i][j] = dist[i-1][j-1];
      else dist[i][j] = Math.min(dist[i-1][j-1]+1, Math.min(dist[i][j-1]+1, dist[i-1][j]+1));
    }
  }
  /*
  for(var j = 0 ; j <= b.length ; j++) {
    var str = '';
    for(var i = 0 ; i <= a.length ; i++) {
      str += dist[i][j] + "\t";
    }
    console.log(str + "\n");
  }
  */
  return dist[a.length][b.length];
}

function escapeHTML(s) { 
  return s.replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

const tajaKeydown = function(e) {
  
}

const tajaKeyup = function(e) {
  
}

const tajaKeypress = function(e) {
  
}

const layoutKeyPress = function(e) {
  const keyChar = currentLayout.layout[e.keyCode - 0x21];
  if(keyChar == currentLayout.layout[currentChar - 0x21]) {
    nextChar();
  }
}

const nextChar = function() {
  if(currentChar != undefined) {
    console.log(currentChar)
    const names = getCharName(currentChar).split(' ');
    for(var i in names) {
        var key = document.getElementById(names[i]);
        if(key == undefined) continue;
        key.classList.remove('next');
    }
  }
  currentChar = nextChars.shift();
  nextChars.push(getNextChar());
  const hangulChar = currentLayout.layout[currentChar - 0x21];
  document.getElementById("current-char").innerHTML = String.fromCharCode(hangulChar) + ((hangulChar >= 0x1100 && hangulChar <= 0x1112) ? "(초)" : (hangulChar >= 0x1161 && hangulChar <= 0x1175) ? "(중)" : (hangulChar >= 0x11a8 && hangulChar <= 0x11c2) ? "(종)" : "");
  var txt = '';
  for(var i in nextChars) {
    txt += ' ' + String.fromCharCode(currentLayout.layout[nextChars[i] - 0x21]);
  }
  document.getElementById("next-chars").innerHTML = txt;
  const names = getCharName(currentChar).split(' ');
  for(var i in names) {
    var key = document.getElementById(names[i]);
    if(key == undefined) continue;
    key.classList.add('next');
  }
}

const getNextChar = function() {
  var items;
  if(containLowerLevels) {
    items = [].concat.apply([], layoutLevels.slice(0, currentLevel));
  } else {
    items = layoutLevels[currentLevel-1];
  }
  return items[Math.floor(Math.random()*items.length)];
}

const onNextLine = function() {
  const beforeLine = currentLine-1;
  const speed = getSpeed(startTime, new Date().getTime(), pageText[beforeLine]);
  startTime = longText ? new Date().getTime() : undefined;
  const distance = getEditDistance(pageText[beforeLine], practiceText[beforeLine]);
  const anchr = getEditDistance('', practiceText[beforeLine]);
  const accuracy = 100 - (distance / anchr * 100);
  
  speeds[beforeLine] = speed;
  accuracies[beforeLine] = accuracy;
  
  const add = function(a, b) {return a + b;};
  const speedAvg = speeds.reduce(add, 0) / speeds.length;
  const accuracyAvg = accuracies.reduce(add, 0) / accuracies.length;
  
  document.getElementById("practice-info").innerHTML = longText
    ? "평균 속도: " + speedAvg.toFixed(2) + ", 평균 정확도: " + accuracyAvg.toFixed(2)
    : "이전 줄 속도: " + speed.toFixed(2) + ", 이전 줄 정확도: " + accuracy.toFixed(2);
  
  if(!practiceText[currentLine]) {
    alert("평균 속도: " + speedAvg.toFixed(2) + ", 평균 정확도: " + accuracyAvg.toFixed(2));
    location.href = "index.html";
  }
}

const tajaLoad = function() {
  input = document.getElementById("practice-input");
  input.addEventListener("focusout", focusOut);
  input.addEventListener("click", focusOut);
  input.addEventListener("keypress", textInput);
  input.addEventListener("keydown", textInput);
  input.addEventListener("keyup", textInput);
  
  httpRequest = new XMLHttpRequest();
  
}

const loadWebText = function(url) {
  
  httpRequest.onreadystatechange = function() {
    if(httpRequest.readyState == 4) {
      if(httpRequest.status == 200) {
        loadText(httpRequest.responseText);
      } else {
        alert("연습글을 가져오는데 문제가 발생했습니다.");
      }
    }
  }
  httpRequest.open('GET', url, true);
  httpRequest.send(null);
}

const loadText = function(txt) {
  pageText = [];
  composingText = '';
  currentLine = 0;
  pageText[currentLine] = '';
  
  speeds = [];
  accuracies = [];
  
  focusOut();
  
  practiceText = [];
  txt = txt.replace(/\r/g, '').split("\n");
  for(var i in txt) {
    const lines = txt[i].match(/.{1,20}/g);
    for(var j in lines) {
      practiceText.push(lines[j].trim());
    }
  }
  
  updatePracticeText();
  
}

const textLoad = function() {
  
  loadWebText('texts/aegukga.txt');
  
}

const layoutLoad = function() {
  
  window.addEventListener('keypress', layoutKeyPress, true);
  currentLayout = basic_layouts.find(o => o.type_name == kbdLayout);
  
  for(var i in currentLayout.layout) {
    const keyCode = parseInt(i) + 0x21;
    const keyName = 'kc_' + ((keyCode >= 0x41 && keyCode <= 0x5a || keyCode >= 0x61 && keyCode <= 0x7a) ? String.fromCharCode(keyCode) : keyCode.toString(16));
    const key = document.getElementById(keyName);
    if(key == undefined) continue;
    key.innerHTML = String.fromCharCode(currentLayout.layout[i]);
  }
  
  currentLevel = 1;
  containLowerLevels = false;
  
  nextChars = [];
  for(var i = 0 ; i < 4 ; i++) nextChars[i] = getNextChar();
  
  nextChar();
  
}

const updatePracticeText = function() {
  var txt = '';
  var stat = 'n';
  var i, j;
  var lines = 0;
  for(j = 0 ; j < practiceText.length ; j++) {
    if(j < currentLine-5) continue;
    if(lines > 12) break;
    for(i = 0 ; i < practiceText[j].length ; i++) {
      var c = practiceText[j].charAt(i);
      if(j > currentLine) break;
      if(i >= pageText[j].length) break;
      var d = pageText[j].charAt(i);
      if(c == d) {
        if(stat == 'x') txt += '</span><span class="correct">';
        if(stat == 'n') txt += '<span class="correct">';
        stat = 'o';
        txt += escapeHTML(c);
      } else {
        if(stat == 'o') txt += '</span><span class="incorrect">';
        if(stat == 'n') txt += '<span class="incorrect">';
        stat = 'x';
        txt += escapeHTML(c);
      }
    }
    if(stat != 'n') {
      txt += '</span>';
      stat = 'n';
    }
    txt += escapeHTML(practiceText[j].substring(i));
    txt += "<br>";
    lines++;
  }
  document.getElementById("practice-preview").innerHTML = txt;
}

const focusOut = function() {
  input.focus();
  resetInput();
  commit(composingText);
  updateInput();
}

const resetInput = function() {
  input.value = "\t";
  input.selectionStart = 1;
  input.selectionEnd = 1;
}

const updateInput = function() {
  const typing = document.getElementById("practice-typing");
  typing.innerHTML = '';
  var lines = 0;
  for(var j = 0 ; j < pageText.length ; j++) {
    if(j < currentLine-5) continue;
    if(lines > 12) break;
    typing.innerHTML += escapeHTML(pageText[j]);
    if(j == currentLine) typing.innerHTML += ((composingText.length == 0) ? '|' : '<span class="composing">' + escapeHTML(composingText) + '</span>');
    typing.innerHTML += '<br>';
    lines++;
  }
}

const textInput = function(e) {
  switch(e.keyCode) {
  case 16:
    return;
  }
  if(input.value.length == 0) {
    backspace();
    resetInput();
    updateInput();
    return;
  }
  const overflow = spacedEnd && pageText[currentLine].length > practiceText[currentLine].length || !spacedEnd && pageText[currentLine].length >= practiceText[currentLine].length;
  if(overflow) {
    currentLine++;
    pageText[currentLine] = '';
    onNextLine();
  }
  if(input.value.substring(input.value.length-1) == "\n" && !ignoreEnter) {
    commit(composingText);
    currentLine++;
    pageText[currentLine] = '';
    onNextLine();
    resetInput();
    updateInput();
    updatePracticeText();
    ignoreEnter = true;
    return;
  }
  if(ignoreEnter) {
    ignoreEnter = false;
    resetInput();
    updateInput();
    return;
  }
  if(input.selectionStart != input.selectionEnd) { // 선택 영역이 존재할 때 (조합중일 때)
    if(input.value.length > 2) { // 조합이 다음 글자로 넘어가면
      commit(input.value.substring(1, 2)); // 이전 글자를 확정짓고
      input.value = "\t" + input.value.substring(2);
      input.selectionStart = 1;
      input.selectionEnd = 2;
      compose(input.value.substring(1)); // 다음 글자를 조합 상태로 넣는다.
    } else { // 현재 글자를 조합중일 때
      compose(input.value.substring(1)); // 조합 중인 글자를 반영한다.
    }
  } else {
    if(input.value.length >= 1) { // 선택 영역이 없을 때 (조합이 없을 때)
      commit(input.value.substring(1)); // 입력된 글자를 확정 반영한다.
      resetInput();
    }
  }
  if(startTime == undefined) startTime = new Date().getTime();
  ignoreEnter = false;
  updateInput();
  updatePracticeText();
}

const backspace = function() {
  pageText[currentLine] = pageText[currentLine].substring(0, pageText[currentLine].length - 1);
  if(!longText && pageText[currentLine] == '') startTime = undefined;
}

const compose = function(composing) {
  composingText = composing;
}

const commit = function(committed) {
  composingText = '';
  pageText[currentLine] += committed;
}

const settingsLoad = function() {
  const layoutSelect = document.getElementById("layout-select");
  for(var i in basic_layouts) {
    const layout = basic_layouts[i];
    if(layout.KE != "Ko") continue;
    const item = document.createElement("option");
    item.value = layout.type_name;
    item.innerText = layout.full_name;
    layoutSelect.appendChild(item);
  }
  if(typeof(Storage) !== "undefined") {
    layoutSelect.value = localStorage.getItem("taja_layout");
  }
}

const changeLayout = function() {
  if(typeof(Storage) !== "undefined") {
    localStorage.setItem("taja_layout", document.getElementById("layout-select").value);
  }
}

document.addEventListener('keydown', tajaKeydown, false);
document.addEventListener('keyup', tajaKeyup, false);
document.addEventListener('keypress', tajaKeypress, false);

const getCharName = function(keyChar) {
  if(keyChar >= 65 && keyChar <= 90) return 'k_lshift k_rshift k_' + String.fromCharCode(keyChar + 0x20);
  if(keyChar >= 97 && keyChar <= 122) return 'k_' + String.fromCharCode(keyChar);
  if(keyChar >= 48 && keyChar <= 57) return 'k_' + String.fromCharCode(keyChar);
  switch(keyChar) {
    case 0x21:
      return 'k_lshift k_rshift k_1';
    case 0x40:
      return 'k_lshift k_rshift k_2';
    case 0x23:
      return 'k_lshift k_rshift k_3';
    case 0x24:
      return 'k_lshift k_rshift k_4';
    case 0x25:
      return 'k_lshift k_rshift k_5';
    case 0x5e:
      return 'k_lshift k_rshift k_6';
    case 0x26:
      return 'k_lshift k_rshift k_7';
    case 0x28:
      return 'k_lshift k_rshift k_8';
    case 0x29:
      return 'k_lshift k_rshift k_9';
    case 59:
      return 'k_semicolon';
    case 61:
      return 'k_equals';
    case 44:
      return 'k_comma';
    case 45:
      return 'k_minus';
    case 46:
      return 'k_period';
    case 47:
      return 'k_slash';
    case 96:
      return 'k_grave';
    case 91:
      return 'k_lbracket';
    case 92:
      return 'k_backslash';
    case 93:
      return 'k_rbracket';
    case 39:
      return 'k_quote';
  }
}

const getKeyName = function(keyCode) {
  if(keyCode >= 65 && keyCode <= 90) return 'k_' + String.fromCharCode(keyCode + 0x20);
  if(keyCode >= 97 && keyCode <= 122) return 'k_' + String.fromCharCode(keyCode);
  if(keyCode >= 48 && keyCode <= 57) return 'k_' + String.fromCharCode(keyCode);
  name = 'k_';
  switch(keyCode) {
  case 8:
    name += 'backspace';
    break;
  case 9:
    name += 'tab';
    break;
  case 13:
    name += 'return';
    break;
  case 16:
    name += 'lshift k_rshift';
    break;
  case 17:
    name += 'lcontrol k_rcontrol';
    break;
  case 18:
    name += 'lalt k_ralt';
    break;
  case 20:
    name += 'capslock';
    break;
  case 27:
    name += 'esc';
    break;
  case 32:
    name += 'space';
    break;
    
  case 186:
    name += 'semicolon';
    break;
  case 187:
    name += 'equals';
    break;
  case 188:
    name += 'comma';
    break;
  case 189:
    name += 'minus';
    break;
  case 190:
    name += 'period';
    break;
  case 191:
    name += 'slash';
    break;
  case 192:
    name += 'grave';
    break;
  case 219:
    name += 'lbracket';
    break;
  case 220:
    name += 'backslash';
    break;
  case 221:
    name += 'rbracket';
    break;
  case 222:
    name += 'quote';
    break;
  }
  return name;
};
  window.addEventListener('keydown', function(e) {
    var names = getKeyName(e.keyCode).split(' ');
    for(var i in names) {
      var key = document.getElementById(names[i]);
      if(key == undefined) continue;
      key.classList.add('hover');
    }
  });
  window.addEventListener('keyup', function(e) {
    var names = getKeyName(e.keyCode).split(' ');
    for(var i in names) {
      var key = document.getElementById(names[i]);
      if(key == undefined) continue;
      key.classList.remove('hover');
    }
  });

const layoutLevels = [
  [97, 115, 100, 102, 106, 107, 108, 59],
  [113, 119, 101, 114, 116],
  [121, 117, 105, 111, 112],
  [122, 120, 99, 118, 98, 103, 71],
  [104, 110, 109, 47, 39],
  [49, 50, 51, 52, 53, 54],
  [55, 56, 57, 48]
];

const changeLevel = function() {
  currentLevel = document.getElementById("level-select").value;
  containLowerLevels = document.getElementById("contain-lower-levels").checked;
}
