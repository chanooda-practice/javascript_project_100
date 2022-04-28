;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  const API_URL = 'http://localhost:3000/todos'
  const $todos = get('.todos')
  const $form = get('.todo_form')
  const $input = get('.todo_input')

  // todo list 각각의 값들을 div에 설정한다
  const createTodoElement = (item) => {
    const { id, content, completed } = item
    const $todoItem = document.createElement('div')
    const isChecked = completed ? 'checked' : ''
    $todoItem.classList.add('item')
    $todoItem.dataset.id = id
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked}
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `
    return $todoItem
  }
  // todo list 값들을 각각의 todo list div에 담아 부모 div에 자식으로 넣어준다.
  const renderAllTodos = (todos) => {
    $todos.innerHTML = ''
    todos.forEach((item) => {
      const todoElement = createTodoElement(item)
      $todos.appendChild(todoElement)
    })
  }

  // fetch후 data 가공
  const getTodos = () => {
    fetch(API_URL)
      .then((resource) => resource.json())
      .then((todos) => renderAllTodos(todos))
      .catch((e) => console.error(e))
  }

  // input의 값을 입력받아 fetch api로 서버에 업데이트 한다.
  const addTodo = (event) => {
    event.preventDefault()
    const todo = {
      content: $input.value,
      completed: false,
    }
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    })
      .then(getTodos)
      .then(() => {
        $input.value = ''
        $input.focus()
      })
  }

  // 체크박스 토글
  const toggleTodo = (e) => {
    if (e.target.className !== 'todo_checkbox') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const completed = e.target.checked
    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
      .then(getTodos)
      .catch((e) => console.error(e))
  }

  // 버튼 클릭시 todo list 상태 바꾸기
  const changeEditMode = (e) => {
    const $item = e.target.closest('.item')
    const $label = $item.querySelector('label')
    const $editInput = $item.querySelector('input[type="text"]')
    const $contentButton = $item.querySelector('.content_buttons')
    const $editButton = $item.querySelector('.edit_buttons')
    const value = $editInput.value
    if (e.target.className === 'todo_edit_button') {
      // 편집 버튼 누르면 input과 편집 확인 버튼과 편집 취소 버튼 보이기
      // 라벨과 기본 버튼 삭제
      $label.style.display = 'none'
      $editInput.style.display = 'block'
      $contentButton.style.display = 'none'
      $editButton.style.display = 'block'
      // 수정 버튼 클릭 시 커서를
      $editInput.focus()
      $editInput.value = ''
      $editInput.value = value
    }
    if (e.target.className === 'todo_edit_cancel_button') {
      // 취소 버튼을 누르면 input 과 수락 버튼 없애기
      // 라벨 편집 버튼 보이게 하기
      $label.style.display = 'block'
      $editInput.style.display = 'none'
      $contentButton.style.display = 'block'
      $editButton.style.display = 'none'
      // 값을 수정한 뒤에 취소 버튼을 눌렀을 때 원래 값으로 유지
      $editInput.value = $label.innerText
    }
  }

  const editTodo = (e) => {
    // 편집 수락 버튼 눌렀을 때 정보 불러와서 fetch로 업데이트
    if (e.target.className === 'todo_edit_confirm_button') {
      const $item = e.target.closest('.item')
      const id = $item.dataset.id
      const editInput = $item.querySelector('input[type="text"]')
      const content = editInput.value

      fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
        .then(getTodos)
        .catch((e) => console.error(e))
    }
  }

  const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    fetch(API_URL + `/${id}`, {
      method: 'DELETE',
    })
      .then(getTodos)
      .catch((e) => console.error(e))
  }

  const init = () => {
    // 모든 초기 페이지 로딩이 완료되면 이벤트 싫행
    window.addEventListener('DOMContentLoaded', () => {
      getTodos()
    })
    // form 을 입력하여 값을 전송할 때 이벤트
    $form.addEventListener('submit', addTodo)
    // 체크박스 변경을 위한 클릭 이벤트 리스너
    $todos.addEventListener('click', toggleTodo)
    // 투두 리스트 편집을 위한 클릭 이벤트
    $todos.addEventListener('click', changeEditMode)
    // 투두 리스트 수정 버튼 후 fetch 이벤트
    $todos.addEventListener('click', editTodo)
    // 투두 리스트 삭제 버튼 클릭 이벤트
    $todos.addEventListener('click', removeTodo)
  }
  init()
})()
