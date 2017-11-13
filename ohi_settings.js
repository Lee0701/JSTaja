var kbdLayout;
if(typeof(Storage) !== "undefined") {
  kbdLayout = localStorage.getItem("taja_layout");
  if(kbdLayout == "undefined") kbdLayout = "3-90";
}
Ko_type = kbdLayout;  // 한글 자판 (두벌식 표준)
En_type = "QWERTY";  // 영문 자판 (쿼티)
ohi_KBD_type = "QWERTY";  // 기준 자판 (QWERTY, QWERTZ, AZERTY)
ohi_KE = "Ko";  // 시작할 때의 한·영 상태 (한글: Ko, 영문: En)