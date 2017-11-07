
var httpRequest;

var input;

var ignoreEnter = false;
var pageText, composingText;
var currentLine;

var practiceText;

var startTime;

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

const onNextLine = function() {
  const speed = getSpeed(startTime, new Date().getTime(), pageText[currentLine-1]);
  startTime = undefined;
  const distance = getEditDistance(pageText[currentLine-1], practiceText[currentLine-1]);
  const anchr = getEditDistance('', practiceText[currentLine-1]);
  const accuracy = 100 - (distance / anchr * 100);
  console.log("spd " + speed + ", accr " + accuracy);
  
  document.getElementById("practice-info").innerHTML = "이전 줄 속도: " + speed + ", 이전 줄 정확도: " + accuracy;
  
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
  
  focusOut();
  
  practiceText = txt.replace(/\r/g, '').split("\n");
  
  updatePracticeText();
  
}

const textLoad = function() {
  
  loadWebText('texts/aegukga.txt');
  
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
}

const compose = function(composing) {
  composingText = composing;
}

const commit = function(committed) {
  composingText = '';
  pageText[currentLine] += committed;
}

document.addEventListener('keydown', tajaKeydown, false);
document.addEventListener('keyup', tajaKeyup, false);
document.addEventListener('keypress', tajaKeypress, false);

window.addEventListener('load', tajaLoad);
