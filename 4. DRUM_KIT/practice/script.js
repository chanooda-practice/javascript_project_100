(function () {
  "use strict";

  const get = function (target) {
    return document.querySelector(target);
  };

  const getAll = function (target) {
    return document.querySelectorAll(target);
  };

  // key class를 가지고 있는 모든 요소 배열로 변환
  const keys = Array.from(getAll(".key"));

  // 사운드 파일 루트 위치
  const soundsRoot = "assets/sounds/";
  // 드럼 사운드 세부 주소와 해당 사운드의 keyCode를 가지고 있는 객체
  const drumSounds = [
    { key: 81, sound: "clap.wav" },
    { key: 87, sound: "crash.wav" },
    { key: 69, sound: "hihat.wav" },
    { key: 65, sound: "kick.wav" },
    { key: 83, sound: "openhat.wav" },
    { key: 68, sound: "ride.wav" },
    { key: 90, sound: "shaker.wav" },
    { key: 88, sound: "snare.wav" },
    { key: 67, sound: "tom.wav" },
  ];

  // audio element 생성 함수
  const getAudioElement = (index) => {
    // audio element 생성
    const audio = document.createElement("audio");
    // dataset 속성으로 각 사운드의 정보를 가지고 있는 객체의 keyCode로 설정
    audio.dataset.key = drumSounds[index].key;
    // 사운드 파일 주소 설정
    audio.src = soundsRoot + drumSounds[index].sound;
    // 설정이 완료된 audio element 반환
    return audio;
  };

  // 소리 실행 함수
  const playSound = (keyCode) => {
    // dataset 속성으로 해당 keyCode를 가진 audio 요소와 key class div 가져오기
    const $audio = get(`audio[data-key="${keyCode}"]`);
    const $key = get(`div[data-key="${keyCode}"]`);

    // audio 와 key class div가 모두 있다면
    if ($audio && $key) {
      // 실행 애니메이션을 위한 class 추가
      $key.classList.add("playing");
      // 소리 촐력 종료 전에 또 다시 이벤트가 실행되면 소리 초기화
      $audio.currentTime = 0;
      // 오디오 실행
      $audio.play();
    }
  };

  // 키보드 입력 시 해딩 입력 키보드 keycode와 함께 playSound 함수 실행
  const onkeydown = (e) => {
    playSound(e.keyCode);
  };

  // 마우스 클릭시 클릭 요소의 dataset 속성의 keycode로 playSound 함수 실행
  const onMouseDown = (e) => {
    const keyCode = e.target.getAttribute("data-key");
    playSound(keyCode);
  };

  // 트랜지션 종료 후 이벤트
  const onTransitionEnd = (e) => {
    // 현재 트랜지션 종류가 transform 이라면 class 지우기
    if (e.propertyName === "transform") {
      e.target.classList.remove("playing");
    }
  };

  const init = () => {
    // 키보드 입력 시 이벤트 실행
    window.addEventListener("keydown", onkeydown);
    // key class 배열의 각각의 값에 설정
    keys.forEach((key, index) => {
      // audio element 생성하고 설정해주는 함수
      const audio = getAudioElement(index);
      // key 부모에 넣어주기
      key.appendChild(audio);
      // dataset 속성에 각각의 key code 설정
      key.dataset.key = drumSounds[index].key;
      // 클릭 이벤트, 트랜지션 후 원위치 시킬 이벤트 실행
      key.addEventListener("click", onMouseDown);
      key.addEventListener("transitionend", onTransitionEnd);
    });
  };

  init();
})();
