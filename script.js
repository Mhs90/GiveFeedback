const BASE_API_URL = "http://127.0.0.1:5000/";
const textareaEL = document.querySelector('.form__textarea');
const counterEL = document.querySelector('.counter');
const formEL = document.querySelector('.form');
const feedbackEl = document.querySelector('.feedbacks')
const submitEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEL = document.querySelector(".hashtags")
const MaxChars = 150;
const timer = 2000;


const RenderFeedback = (feedsItem) => {
  const feedItem = `
    <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedsItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedsItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedsItem.company}</p>
                <p class="feedback__text">${feedsItem.text}</p>
            </div>
            <p class="feedback__date">${feedsItem.daysAgo === 0 ? "NEW" : `${feedsItem.daysAgo}d`}</p>
        </li>
    `;
  feedbackEl.insertAdjacentHTML('beforeend', feedItem);
}

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

  const feedsItem = {
    upvoteCount: upvoteCount,
    badgeLetter: badgeLetter,
    company: company,
    text: text,
    daysAgo: daysAgo
  }

  RenderFeedback(feedsItem);
  textareaEL.value = "";
  submitEl.blur();
  counterEL.textContent = 150;
  spinnerEl.remove()
  fetch(`${BASE_API_URL}add`, {
    method: "POST",
    headers: {
      Accept: "application/json",
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

fetch(`${BASE_API_URL}users`)
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

      var feedsItem2 = {
        upvoteCount: feedItem.upvoteCount,
        badgeLetter: feedItem.badgeLetter,
        company: feedItem.company,
        text: feedItem.text,
        daysAgo: diffDays
      }

      RenderFeedback(feedsItem2)
      spinnerEl.remove()

    });
  }).catch(error => {
    feedbackEl.textContent = `Faild to load feedbacks. EROR Message: ${error.message}`
  });

const clickHandler = event => {
  const clickedEl = event.target;
  const upvoteEl = clickedEl.className.includes("upvote");
  if (upvoteEl) {
    const upvoteBtnEl = clickedEl.closest(".upvote");
    upvoteBtnEl.disabled = true;
    const upvoteCountEl = upvoteBtnEl.querySelector(".upvote__count");
    let upvoteCount = +upvoteBtnEl.textContent;
    upvoteCountEl.textContent = ++upvoteCount

  }
  else {
    clickedEl.closest('.feedback').classList.toggle('feedback--expand');
  }
}

feedbackEl.addEventListener("click", clickHandler);

const hashtagClickHandler = event => {
  const clickedEl = event.target;

  if (clickedEl.className === "hashtags") return;

  const companyNameFromHashtag = clickedEl.textContent.substring(1).trim();

  feedbackEl.childNodes.forEach(element => {
    if (element.nodeType === 3) return;
    const companyNameFromFeedbackItem = element.querySelector(".feedback__company").textContent.toLowerCase().trim();
    if (companyNameFromFeedbackItem !== companyNameFromHashtag.toLowerCase()) {
      element.remove()
    }
  });


}


hashtagListEL.addEventListener("click", hashtagClickHandler)