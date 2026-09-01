import { useEffect, useState } from 'react'

const PLACES = [128, 64, 32, 16, 8, 4, 2, 1]
const BEST_KEY = 'binary-game-best-streak'

function randomValue(exclude) {
  let v = Math.floor(Math.random() * 256)
  while (v === exclude) {
    v = Math.floor(Math.random() * 256)
  }
  return v
}

function makeQuestion(lastValue) {
  return {
    type: Math.random() < 0.5 ? 'pick-bits' : 'type-decimal',
    value: randomValue(lastValue),
  }
}

function sumExpression(v) {
  const parts = PLACES.filter((p) => (v & p) !== 0)
  return parts.length > 0 ? parts.join(' + ') : '0'
}

function loadBestStreak() {
  const n = parseInt(localStorage.getItem(BEST_KEY), 10)
  return Number.isNaN(n) ? 0 : n
}

export default function BinaryGame() {
  const [question, setQuestion] = useState(() => makeQuestion(-1))
  const [selected, setSelected] = useState([])
  const [guess, setGuess] = useState('')
  const [status, setStatus] = useState('answering')
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    best: loadBestStreak(),
  })

  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(stats.best))
  }, [stats.best])

  const answered = status !== 'answering'
  const isPickBits = question.type === 'pick-bits'

  const toggleBit = (place) => {
    if (answered) return
    setSelected((sel) =>
      sel.includes(place) ? sel.filter((p) => p !== place) : [...sel, place],
    )
  }

  const check = () => {
    const ok = isPickBits
      ? PLACES.every((p) =>
          selected.includes(p)
            ? (question.value & p) !== 0
            : (question.value & p) === 0,
        )
      : guess !== '' && parseInt(guess, 10) === question.value
    setStatus(ok ? 'correct' : 'incorrect')
    setStats((s) => {
      const streak = ok ? s.streak + 1 : 0
      return {
        correct: s.correct + (ok ? 1 : 0),
        total: s.total + 1,
        streak,
        best: Math.max(s.best, streak),
      }
    })
  }

  const next = () => {
    setQuestion(makeQuestion(question.value))
    setSelected([])
    setGuess('')
    setStatus('answering')
  }

  const reset = () => {
    setQuestion(makeQuestion(-1))
    setSelected([])
    setGuess('')
    setStatus('answering')
    setStats((s) => ({ ...s, correct: 0, total: 0, streak: 0 }))
  }

  const cellClass = (place) => {
    const isSet = (question.value & place) !== 0
    const isSel = selected.includes(place)
    const base =
      'flex aspect-square w-full items-center justify-center rounded-xl border font-mono text-xl font-bold transition-all sm:text-2xl'
    if (!answered) {
      if (isPickBits) {
        return `${base} ${
          isSel
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
            : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600'
        }`
      }
      return `${base} ${
        isSet
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-zinc-200 bg-zinc-50 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-600'
      }`
    }
    if (isSet && isSel) return `${base} border-emerald-500 bg-emerald-500 text-white`
    if (isSet && !isSel) {
      return `${base} border-amber-400 bg-amber-50 text-amber-500 dark:border-amber-500 dark:bg-amber-500/10 dark:text-amber-400`
    }
    if (!isSet && isSel) {
      return `${base} border-red-400 bg-red-50 text-red-500 dark:border-red-500 dark:bg-red-500/10 dark:text-red-400`
    }
    return `${base} border-zinc-200 bg-zinc-50 text-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-600`
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Binary Quiz
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isPickBits
              ? 'Click the bits that add up to the number, then check.'
              : 'Add up the lit bits, type the decimal, then check.'}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Score
          </div>
          <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.correct}
            <span className="text-sm text-zinc-400 dark:text-zinc-500">
              /{stats.total}
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Streak
          </div>
          <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.streak}
          </div>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Best
          </div>
          <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {stats.best}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-base text-zinc-700 dark:text-zinc-200">
        {isPickBits ? (
          <>
            Which bits add up to{' '}
            <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {question.value}
            </span>
            ?
          </>
        ) : (
          <>
            What decimal do these bits make?
          </>
        )}
      </p>

      <div className="mt-4 grid grid-cols-8 gap-2">
        {PLACES.map((place) => {
          const isSet = (question.value & place) !== 0
          const showBit = !isPickBits || answered
          return (
            <div key={place} className="flex flex-col items-center gap-2">
              <span
                className={`font-mono text-xs tabular-nums sm:text-sm ${
                  isSet && (answered || !isPickBits)
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {place}
              </span>
              <button
                type="button"
                onClick={() => toggleBit(place)}
                disabled={!isPickBits || answered}
                aria-pressed={isPickBits ? selected.includes(place) : undefined}
                aria-label={
                  isPickBits
                    ? `Bit worth ${place}, ${selected.includes(place) ? 'selected' : 'not selected'}${
                        answered ? `, correct answer: ${isSet ? 'set' : 'clear'}` : ''
                      }`
                    : `Bit worth ${place} is ${isSet ? 'set' : 'clear'}`
                }
                className={cellClass(place)}
              >
                {showBit ? (isSet ? '1' : '0') : ''}
              </button>
            </div>
          )
        })}
      </div>

      {!isPickBits && (
        <div className="mt-6 flex justify-center">
          <label className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Decimal
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="255"
              value={guess}
              disabled={answered}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !answered && guess !== '') check()
              }}
              placeholder="0-255"
              aria-label="Your decimal answer"
              className="w-28 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-center font-mono text-xl font-semibold text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
            />
          </label>
        </div>
      )}

      {answered && (
        <p
          role="status"
          className={`mt-6 rounded-xl px-4 py-3 text-center font-mono text-sm font-semibold ${
            status === 'correct'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          }`}
        >
          {status === 'correct' ? 'Correct!' : 'Not quite.'} {question.value} ={' '}
          {sumExpression(question.value)}
        </p>
      )}

      <div className="mt-6 flex justify-center">
        {answered ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-colors hover:bg-emerald-600 dark:hover:bg-emerald-400"
          >
            Next question
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={!isPickBits && guess === ''}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/30 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-emerald-400"
          >
            Check answer
          </button>
        )}
      </div>
    </section>
  )
}
