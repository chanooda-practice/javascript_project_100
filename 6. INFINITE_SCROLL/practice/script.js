(function () {
  "use strict";

  const get = (target) => {
    return document.querySelector(target);
  };

  let page = 1;
  let total = 10;

  const limit = 10;
  const end = 100;

  const $loader = get(".loader");

  // fetch 메서드 통해 api 데이터 받아오기
  const getPost = async () => {
    const API_URL = `https://jsonplaceholder.typicode.com/posts?_page=${page}?_limit=${limit}`;
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("에러");
    }
    return await response.json();
  };

  const showPosts = (posts) => {
    const $posts = get(".posts");

    posts.forEach((post) => {
      const $post = document.createElement("div");
      $post.classList.add("post");
      $post.innerHTML = `
        <div class="header">
          <div class="id">${post.id}</div>
          <div class="title">${post.title}</div>
        </div>
        <div class="body">
          ${post.body}
        </div>
      `;
      $posts.appendChild($post);
    });
  };

  const showLoader = () => {
    $loader.classList.add("show");
  };
  const hideLoader = () => {
    $loader.classList.remove("show");
  };

  // api 데이터 가져오기
  const loadPost = async () => {
    // 로딩 엘레먼트 보여줌
    showLoader();
    try {
      const response = await getPost();
      // 받아온 데이터를 가지고 화면에 출력한다.
      showPosts(response);
    } catch (error) {
      console.error(error);
    } finally {
      // 로딩 엘레민트 사라짐
      hideLoader();
    }
  };

  const onScroll = () => {
    // documentElement에 있는 객체 속성들을 바로 변수로 지정
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

    if (total === end) {
      window.removeEventListener("scroll", onScroll);
      return;
    }

    // 스크롤을 화면 끝까지 했을 시에 데이터를 받아오는 loadPost() 함수 실행
    if (scrollHeight - scrollTop === clientHeight) {
      page++;
      total += 10;
      loadPost();
    }
  };

  // html 문서를 모두 불러왔을 때 이벤트 실행
  window.addEventListener("DOMContentLoaded", () => {
    // api 데이터를 받아오고 출력하는 함수
    loadPost();
    // scroll 이벤트 리스너
    window.addEventListener("scroll", onScroll);
  });
})();
