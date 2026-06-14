const textareaEL = document.querySelector('.form__textarea');
const counterEL = document.querySelector('.counter');
const formEL = document.querySelector('.form');
const feedbackEl = document.querySelector('.feedbacks')
const submitEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const MaxChars = 150;
const timer = 2000;

const inputHandler = () => {
  const CharsTyped = textareaEL.value.length;

  const charsLeft = MaxChars - CharsTyped;

  // show number of characters left
  counterEL.textContent = charsLeft;
}

textareaEL.addEventListener('input', inputHandler);

// -- Form Component

const submitHandler = event => {
  event.preventDefault();
  const text = textareaEL.value;

  if (text.includes('#') && text.length >= 5) {
    formEL.classList.add('form--valid');
    changeClass('form--valid');
  } else {
    formEL.classList.add('form--invalid');
    changeClass('form--invalid');
    textareaEL.focus();
    return;
  }

  const hashtag = text.split(' ').find(word => word.includes('#'));
  const company = hashtag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  const feedItem = `
    <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${company}</p>
                <p class="feedback__text">${text}</p>
            </div>
            <p class="feedback__date">${daysAgo === 0 ? "NEW" : `${daysAgo}d`}</p>
        </li>
    `;
  feedbackEl.insertAdjacentHTML('beforeend', feedItem);
  textareaEL.value = "";
  submitEl.blur();
  counterEL.textContent = 150;
  spinnerEl.remove()
  fetch("http://127.0.0.1:5000/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      upvoteCount: upvoteCount,
      badgeLetter: badgeLetter,
      company: company,
      text: text,
      createdAt: new Date().toISOString()
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    });
};

function changeClass(className) {
  setTimeout(() => formEL.classList.remove(className), timer);
}

formEL.addEventListener('submit', submitHandler);

fetch('http://127.0.0.1:5000/users')
  .then(response => {
    return response.json()
  }).then(data => {
    data.feedbacks.forEach(feedItem => {
      const created = new Date(feedItem.createdAt);
      const now = new Date();

      const diffDays = Math.max(
        0,
        Math.floor((now - created) / (1000 * 60 * 60 * 24))
      );

      const feedsItem = `
    <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedItem.company}</p>
                <p class="feedback__text">${feedItem.text}</p>
            </div>
            <p class="feedback__date">${diffDays < 1 ? "NEW" : `${diffDays}d`}</p>
        </li>
    `;
      feedbackEl.insertAdjacentHTML('beforeend', feedsItem);
      spinnerEl.remove()

    });
  }).catch(error => {
    feedbackEl.textContent = `Faild to load feedbacks. EROR Message: ${error.message}`
  });


