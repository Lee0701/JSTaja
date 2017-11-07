
var input;

var ignoreEnter = false;
var pageText, composingText;

var practiceText;

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

const tajaLoad = function() {
  input = document.getElementById("practice-input");
  input.addEventListener("focusout", focusOut);
  input.addEventListener("click", focusOut);
  input.addEventListener("keypress", textInput);
  input.addEventListener("keydown", textInput);
  input.addEventListener("keyup", textInput);
  
  focusOut();
  
}

const textLoad = function() {
  pageText = composingText = '';
  
  practiceText = "동해물과 백두산이 마르고 닳도록\n하느님이 보우하사 우리나라 만세\n무궁화 삼천리 화려강산\n대한사람 대한으로 길이 보전하세";
  
  updatePracticeText();
  
}

const updatePracticeText = function() {
  var txt = '';
  var stat = 'n';
  var i;
  for(i = 0 ; i < practiceText.length ; i++) {
    var c = practiceText.charAt(i);
    if(i >= pageText.length) break;
    var d = pageText.charAt(i);
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
  if(stat != 'n') txt += '</span>';
  txt += escapeHTML(practiceText.substring(i));
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
  document.getElementById("practice-typing").innerHTML
    = escapeHTML(pageText)
    + ((composingText.length == 0) ? '|'
    : '<span class="composing">' + escapeHTML(composingText) + '</span>');
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
    commit();
    commit("\n");
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
  ignoreEnter = false;
  updateInput();
  updatePracticeText();
}

const backspace = function() {
  pageText = pageText.substring(0, pageText.length - 1);
}

const compose = function(composing) {
  composingText = composing;
}

const commit = function(committed) {
  if(committed == undefined) return commit(composingText);
  composingText = '';
  pageText += committed;
}

document.addEventListener('keydown', tajaKeydown, false);
document.addEventListener('keyup', tajaKeyup, false);
document.addEventListener('keypress', tajaKeypress, false);

window.addEventListener('load', tajaLoad);
