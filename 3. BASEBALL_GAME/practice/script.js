(function () {
  "use strict";

  // document 선택 함수를 좀 더 편리하게 사용하기 위한 함수
  const get = (target) => {
    return document.querySelector(target);
  };

  // 게임 시작 함수
  const init = () => {
    setPassword();
    get("form").addEventListener("submit", playGame);
  };

  // 야구게임 기본 설정
  const baseball = {
    limit: 10,
    digit: 4,
    trial: 0,
    end: false,
    $question: get(".ball_question"),
    $answer: get(".ball_answer"),
    $input: get(".ball_input"),
  };

  const { limit, digit, $question, $answer, $input } = baseball;
  let { trial, end } = baseball;

  //정답 설정
  const setPassword = () => {
    // 자릿수 만큼의 배열을 만들어 false를 채워준다.
    const gameLimit = Array(limit).fill(false);
    // password 문자열로 초기 선언
    let password = "";
    // 패스워드의 자릿수가 정답의 자릿수와 같을 때까지 반목문 실행
    while (password.length < digit) {
      // 0~9 까지의 무작위 수를 뽑아 10진수로 변형하기
      const random = parseInt(Math.random() * 10, 10);
      // 중복된 숫자가 나왓을 시에는 넘어가기
      if (gameLimit[random]) {
        continue;
      }
      // 중복이 아니면 password에 문자열로 넣어줌
      password += random;
      // 중복 체크를 위해 생성된 숫자를 key로 설정해줌
      gameLimit[random] = true;
    }
    // baseball 객체에 password 속정 추가
    baseball.password = password;
  };

  const onPlayed = (number, hint) => {
    // 시도 했을 때 number : 내가 입력한 숫자 hint : 현재 상황
    return `<em>${trial}차 시도</em>: ${number}, ${hint}`;
  };

  const isCorrect = (number, answer) => {
    // 번호가 같은가?
    return number === answer;
  };

  // 중복번호가 있는가?
  const isDuplicate = (number) => {
    //사용자의 입력값을 인수로 배열 -> map 자료형으로 바꿔 중복을 감지한다.
    // map 자료형은 key - value 형태의 자료형으로 중복된 key값을 가질 수 없다.
    return [...new Set(number.split(""))].length !== digit;
  };

  // 스트라이크 개수 반환
  const getStrikes = (number, answer) => {
    let strike = 0;
    // 입력 값을 배열로 나누기
    const nums = number.split("");

    // 입력값 배열의 값과 값의 위치를 key로 한 정답 배열의 숫자가 같으면 스트라이크
    nums.map((digit, index) => {
      if (digit === answer[index]) {
        strike++;
      }
    });

    return strike;
  };

  // 볼 개수 반환
  const getBalls = (number, answer) => {
    let ball = 0;
    // 입력값 배열로 변환
    const nums = number.split(``);
    // 자리수 만큼 배열로 만들기
    const gameLimit = Array(limit).fill(false);

    //정답 각 숫자들을 배열로 만들고 각 값들을  key로 하여 자리수 배열에 저장
    answer.split("").map((num) => {
      gameLimit[num] = true;
    });

    // 입력값 배열과 정답 배열을 비교하여 볼 개수 설정
    nums.map((num, index) => {
      // 같은 위치에 값이 없으면서 정답 배열에 같은 값이 있으면 증가
      if (answer[index] !== num && answer[num] === true) {
        ball++;
      }
    });

    return ball;
  };

  // 스트라이크 볼 홈런 결과에 관한 출력값 반환
  const getResult = (number, answer) => {
    // 정답과 입력값 비교 후 홈런 처리
    if (isCorrect(number, answer)) {
      end = true;
      $answer.innerHTML = baseball.password;
      return "홈런!!!";
    }
    // 스트라이크 볼 결과 반환
    const strike = getStrikes(number, answer);
    const ball = getBalls(number, answer);

    return `STRIKE: ${strike}, BALL : ${ball}`;
  };

  // 게임 플레이 (사용자 답 입력시 실행되는 함수)
  const playGame = (event) => {
    event.preventDefault();

    // end 가 true 면 함수 중지
    if (!!end) return;

    // 객체에 선언되어 있는 input 선택자의 값과 게임 정답 변수 선언
    const inputNumber = $input.value;
    const { password } = baseball;

    // 사용자의 인풋 예외 처리
    // 인풋 길이가 맞지 않을 때 예외 처리
    if (inputNumber.length !== digit) {
      alert(`${digit}자리 숫자를 입력해주세요.`);
      return;
    }
    // 사용자의 인풋 중 중복된 숫자가 있으면 예외 처리
    else if (isDuplicate(inputNumber)) {
      alert(`중복 숫자가 있습니다.`);
      return;
    }
    // 사용자의 인풋에 잘못된 점이 없다면 문제 풀이 시도 숫자 증가
    trial++;

    // 비교 결과에 따라 출력할 문자열을 반환하는 함수로 값 받아오기
    const result = onPlayed(inputNumber, getResult(inputNumber, password));
    // 화면상에 출력
    $question.innerHTML += `<span>${result}</span>`;

    // 도전 기회를 모두 사용하고 정답을 맞추기 못하였을 때 쓰리아웃을 출력하고 정답 출력
    if (limit <= trial && !isCorrect(inputNumber, password)) {
      alert("쓰리아웃!");
      end = true;
      $answer.innerHTML = password;
    }
    // 게임이 끝났다면 다시 실행
    if (!!end) restart();

    $input.value = "";
    $input.focus();
  };

  const restart = () => {
    //end가 true면 실행
    if (!!end) {
      //결과 출력창을 재도전 버튼으로 만들고 클릭 이벤트 생성
      $question.innerHTML += "재도전?";
      $question.style.cursor = "pointer";
      // 재도전시 초기 설정으로 초기화 해준다.
      $question.addEventListener("click", () => {
        $answer.innerHTML = "정답은?";
        $question.innerHTML = "결과";
        baseball.trial = 0;
        baseball.end = false;
        trial = 0;
        end = false;
        init();
      });
    }
  };

  init();
})();
