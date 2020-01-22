// preload rstudio hex logo for cards
// so they are immediately visible when we make them
// https://stackoverflow.com/q/3646036
new Image().src = 'hex/RStudio.png'

// global object to track the game state
const hexGame = {
  picked: [],
  tries: 0,
  matches: 0,
  unflipCards: function() {
    this.picked.forEach(card => card.classList.remove('flipped'))
    this.picked = []
  },
  setMatches: function() {
    this.picked.forEach(card => card.classList.add('match'))
  },
  updateCount: function() {
    let count = document.getElementById('matches')
    count.innerHTML = `<span class="score-number">${this.matches}</span> ` +
      `${this.matches === 1 ? 'match' : 'matches'}`
    count = document.getElementById('tries')
    count.innerHTML = `<span class="score-number">${this.tries}</span> ` +
      `${this.tries === 1 ? 'try' : 'tries'}`
  }
}

const pkgs = [
  "blogdown", "bookdown", "broom", "covr", "dbplot", "devtools", "dplyr",
  "feather", "forcats", "fs", "ggplot2", "glue", "googledrive", "googlesheets",
  "haven", "hms", "knitr", "lobstr", "lubridate", "modeldb", "modelr",
  "parsnip", "pipe", "pkgdown", "plumber", "purrr", "r2d3", "readr", "readxl",
  "recipes", "reprex", "rlang", "rmarkdown", "roxygen2", "rsample", "rvest",
  "scales", "shiny", "sparklyr", "stringr", "testthat", "tibble", "tidymodels",
  "tidyposterior", "tidypredict", "tidyr", "tidyverse", "usethis", "vctrs",
  "withr", "xaringan", "yardstick", "js4shiny"
]

const getLogo = el => {
  return el.querySelector('.hex-back').dataset.logo
}

const randomIndices = (n = 10, nFrom) => {
  nFrom = nFrom || n
  const x = []
  while (x.length !== n) {
    const i = Math.floor(Math.random() * nFrom)
    if (!x.includes(i)) {
      x.push(i)
    }
  }
  return x
}

const shuffleItems = (arr) => {
  const idxShuffled = randomIndices(arr.length)
  return idxShuffled.map(i => arr[i])
}

const pickCards = (pkgs, n = 10) => {
  const pkgIndices = randomIndices(n, pkgs.length)
  // double the chosen pkgs so there are pairs
  let cardIndices = [...pkgIndices, ...pkgIndices]
  cardIndices = shuffleItems(cardIndices)
  return cardIndices.map(i => pkgs[i])
}

const renderCard = (pkg) => {
  return `<div class="hex-card">
    <div class="hex-front"></div>
    <div class="hex-back" data-logo="${pkg}"></div>
  </div>`
}

const renderCards = (pkgsSelected) => {
  const hexArea = document.querySelector('.hex-area')
  // clear out the current game
  while (hexArea.firstChild) hexArea.firstChild.remove()

  pkgsSelected.forEach(pkg => hexArea.innerHTML += renderCard(pkg))
}

const updateCount = (id, n, single, plural) => {
  const count = document.getElementById(id)
  count.innerHTML = `<span class="score-number">${n}</span> ${n === 1 ? single : plural}`
}

const endGame = () => {
  // stop timer
  clearInterval(hexGame.timerId)

  // add winner styles to matches and timer
  document.getElementById('matches').classList.add('winner')
  document.getElementById('timer').classList.add('winner')

  // add winner style to hex game area
  setTimeout(() => {
   document.querySelector('.hex-area').classList.add('winner')
   document.querySelectorAll('.hex-card')
    .forEach(c => c.classList.add('winner'))
  }, 1000)

  // reset play button
  const playBtn = document.getElementById('play-state')
  playBtn.value = 'play'
  playBtn.title = 'Play Again'
  playBtn.textContent = 'Play Again'
}

const addCardEventListeners = (selector = ".hex-card") => {
  const cards = document.querySelectorAll(selector)

    cards.forEach(card => {
    card.addEventListener('click', function() {
      if (this.classList.contains('match')) {
        // clicking on matches does nothing
        return;
      }
      const pickedCard = this
      const pickedLogo = getLogo(pickedCard)

      if (hexGame.picked.length && hexGame.picked.includes(pickedCard)) {
        // clicked on an already picked card
        return;
      }

      if (hexGame.unflipTimer) {
        // user clicked before unflipCards ran
        clearTimeout(hexGame.unflipTimer)
        hexGame.unflipTimer = 0
        hexGame.unflipCards()
      }

      if (hexGame.matchTimer) {
        // user clicked before setMatches ran
        clearTimeout(hexGame.matchTimer)
        hexGame.matchTimer = 0
        hexGame.setMatches()
      }

      if (hexGame.picked.length === 2) {
        // there are two cards "in the queue" so reset
        hexGame.unflipCards()
        hexGame.picked = []
      }

      console.log(`picked ${pickedLogo}`)
      hexGame.picked.push(pickedCard)

      if (hexGame.picked.length === 2) {
        if (pickedLogo === getLogo(hexGame.picked[0])) {
          // match!
          hexGame.matchTimer = setTimeout(() => hexGame.setMatches(), 1000)
          hexGame.matches += 1
          hexGame.tries += 1
          console.log(`match! That's ${hexGame.matches} matches in ${hexGame.tries}`)
        } else {
          // loser!
          hexGame.unflipTimer = setTimeout(() => hexGame.unflipCards(), 2000)
          hexGame.tries += 1
          console.log(`Miss! That's ${hexGame.tries} tries`)
        }
      }
      if (hexGame.matches === 10) {
        // big winner!
        endGame()
      }
      hexGame.updateCount()
      pickedCard.classList.add('flipped')
    })
  })
}

const updateTimer = () => {
  const then = hexGame.startTime
  const now = new Date()
  let seconds = Math.floor((now - then) / 1000)

  let minutes = 0
  if (seconds >= 60) {
    minutes = Math.floor(seconds / 60)
    seconds = seconds - minutes * 60
  }

  minutes = (minutes < 10 ? '0' : '') + minutes
  seconds = (seconds < 10 ? '0' : '') + seconds

  document.getElementById('timer-minutes').textContent = minutes
  document.getElementById('timer-seconds').textContent = seconds
}

const resetGame = (game) => {
  game.picked = []
  game.tries = 0
  game.matches = 0
  game.matchTimer = 0
  game.unflipTimer = 0
  game.updateCount()

  // remove winner style from hex game area (if present)
  document.querySelector('.hex-area').classList.remove('winner')
}

const playGame = (n = 10) => {
  resetGame(hexGame)
  const pkgsSelected = pickCards(pkgs, n)
  renderCards(pkgsSelected)
  addCardEventListeners('.hex-card')
  hexGame.startTime = new Date()
  hexGame.timerId = setInterval(updateTimer, 1000)
}

document.getElementById('play-state').addEventListener('click', ev => {
  const action = ev.currentTarget.value
  if (action === 'restart') {
    playGame()
  } else if (action === 'play') {
    ev.currentTarget.value = 'restart'
    ev.currentTarget.title = 'Start a New Game'
    ev.currentTarget.innerHTML = 'Restart'
    playGame()
  }
})

