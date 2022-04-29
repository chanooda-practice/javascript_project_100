;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  const $todos = get('.todos')
  const $form = get('.todo_form')
  const $todoInput = get('.todo_input')
  // 페이지 네비 부모
  const $pagination = get(`.pagination`)
  // todo list를 불러올 api 주소
  const API_URL = `http://localhost:3000/todos`

  // 한 페이지 당 todo의 개수
  const limit = 5
  // 현재 페에지 (초기 상태 1)
  let currentPage = 1
  // 모든 todo list의 개수 (json-server에서 데이터의 총 개수를 반환하지 않아 임의로 설정)
  const totalCount = 53
  // 페이지 그룹 당 페이지의 개수
  const pageCount = 5

  // page 네비바를 그려주고 네비 버튼 클릭시 이벤트 발생
  const pagination = () => {
    // 총 페이지의 개수
    let totalPage = Math.ceil(totalCount / limit)
    // 총 페이지 그룹의 수
    let pageGroup = Math.ceil(currentPage / pageCount)
    // 페이지 그룹의 마지막 숫자
    let lastNumber = pageGroup * pageCount
    if (lastNumber > totalPage) {
      lastNumber = totalPage
    }
    // 페이지 그룹의 첫번째 숫자 (마지막 숫자를 이용해 처리)
    let firstNumber = lastNumber - (pageCount - 1)

    // 버튼 클릭시 넘어갈 페이지 번호
    const next = lastNumber + 1
    const prev = firstNumber - 1

    // 페이지 네비 바 그리기
    let html = ''
    // 이전 숫자가 0보다 크다면 이전 내용이 있다는 사실이므로 이전 버튼 생성
    if (prev > 0) {
      html = `<button class="prev" data-fn="prev">이전</button>`
    }
    // 첫 번호부터 마지막 번호까지 페이지 버튼 생성
    for (let i = firstNumber; i <= lastNumber; i++) {
      html += `<button class="pageNumber" id="page_${i}">${i}</button>`
    }
    // 마지막 번호가 총 페이지 수보다 작다면 다음 번호가 있으므로 다음 버튼 생성
    if (lastNumber < totalPage) {
      html += `<button class="next" data-fn="next">다음</button>`
    }
    // html 코드 생성
    $pagination.innerHTML = html

    // 현재 페이지 번호의 표시를 위해 선택 및 스타일 변경
    const $currentPageNumber = get(`.pageNumber#page_${currentPage}`)
    $currentPageNumber.style.color = '#91bff6'

    // 페이지 네비바에 있는 모든 버튼들에 클릭 이벤트 설정
    const $currentPageNumbers = document.querySelectorAll(`.pagination button`)
    $currentPageNumbers.forEach((el) => {
      // 클릭 시 각 버튼에 있는 dataset 속성에 따라 현재 페이지 값 변경
      el.addEventListener('click', () => {
        if (el.dataset.fn === 'prev') {
          currentPage = prev
        } else if (el.dataset.fn === 'next') {
          currentPage = next
        } else {
          currentPage = el.innerText
        }
        // 페이지 바 다시 설정하기
        pagination()
        // 바뀐 번호에 맞게 데이터 다시 불러오기
        getTodos()
      })
    })
  }

  const createTodoElement = (item) => {
    const { id, content, completed } = item
    const isChecked = completed ? 'checked' : ''
    const $todoItem = document.createElement('div')
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

  const renderAllTodos = (todos) => {
    $todos.innerHTML = ''
    todos.forEach((item) => {
      const todoElement = createTodoElement(item)
      $todos.appendChild(todoElement)
    })
  }

  const getTodos = () => {
    fetch(`${API_URL}?_page=${currentPage}&_limit=${limit}`)
      .then((response) => response.json())
      .then((todos) => {
        renderAllTodos(todos)
      })
      .catch((error) => console.error(error.message))
  }

  const addTodo = (e) => {
    e.preventDefault()
    const content = $todoInput.value
    if (!content) return
    const todo = {
      content,
      completed: false,
    }
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(todo),
    })
      .then((response) => response.json())
      .then(getTodos)
      .then(() => {
        $todoInput.value = ''
        $todoInput.focus()
      })
      .catch((error) => console.error(error.message))
  }

  const toggleTodo = (e) => {
    if (e.target.className !== 'todo_checkbox') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const completed = e.target.checked
    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ completed }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const changeEditMode = (e) => {
    const $item = e.target.closest('.item')
    const $label = $item.querySelector('label')
    const $editInput = $item.querySelector('input[type="text"]')
    const $contentButtons = $item.querySelector('.content_buttons')
    const $editButtons = $item.querySelector('.edit_buttons')
    const value = $editInput.value

    if (e.target.className === 'todo_edit_button') {
      $label.style.display = 'none'
      $editInput.style.display = 'block'
      $contentButtons.style.display = 'none'
      $editButtons.style.display = 'block'
      $editInput.focus()
      $editInput.value = ''
      $editInput.value = value
    }

    if (e.target.className === 'todo_edit_cancel_button') {
      $label.style.display = 'block'
      $editInput.style.display = 'none'
      $contentButtons.style.display = 'block'
      $editButtons.style.display = 'none'
      $editInput.value = $label.innerText
    }
  }

  const editTodo = (e) => {
    if (e.target.className !== 'todo_edit_confirm_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const $editInput = $item.querySelector('input[type="text"]')
    const content = $editInput.value

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
      .then((response) => response.json())
      .then(getTodos)
      .catch((error) => console.error(error.message))
  }

  const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
      getTodos()
      pagination()
    })

    $form.addEventListener('submit', addTodo)
    $todos.addEventListener('click', toggleTodo)
    $todos.addEventListener('click', changeEditMode)
    $todos.addEventListener('click', editTodo)
    $todos.addEventListener('click', removeTodo)
  }

  init()
})()
