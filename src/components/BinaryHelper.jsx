import { useState } from 'react'

const PLACES = [128, 64, 32, 16, 8, 4, 2, 1]

function clampToOctet(n) {
  if (Number.isNaN(n)) return 0
  return Math.min(255, Math.max(0, Math.trunc(n)))
}

export default function BinaryHelper() {
  const [raw, setRaw] = useState('192')
  const value = clampToOctet(parseInt(raw, 10))

  const setBit = (place) => {
    const next = value ^ place
    setRaw(String(next))
  }

  const binary = value.toString(2).padStart(8, '0')
  const setPlaces = PLACES.filter((p) => (value & p) !== 0)

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Decimal to 8-bit binary
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Type a value from 0 to 255, or click any bit to flip it.
          </p>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Decimal
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="255"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-label="Decimal value from 0 to 255"
            className="w-24 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-center font-mono text-xl font-semibold text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
          />
        </label>
      </div>

      <div className="mt-8 grid grid-cols-8 gap-2">
        {PLACES.map((place) => {
          const isSet = (value & place) !== 0
          return (
            <div key={place} className="flex flex-col items-center gap-2">
              <span
                className={`font-mono text-xs tabular-nums sm:text-sm ${
                  isSet
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {place}
              </span>
              <button
                type="button"
                onClick={() => setBit(place)}
                aria-pressed={isSet}
                aria-label={`Bit worth ${place}, currently ${isSet ? 'set' : 'clear'}. Click to flip.`}
                className={`flex aspect-square w-full items-center justify-center rounded-xl border font-mono text-xl font-bold transition-all sm:text-2xl ${
                  isSet
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30 hover:bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-300 hover:border-zinc-300 hover:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-600 dark:hover:border-zinc-600 dark:hover:text-zinc-500'
                }`}
              >
                {isSet ? '1' : '0'}
              </button>
            </div>
          )
        })}
      </div>

      <dl className="mt-8 grid gap-4 rounded-xl bg-zinc-50 p-4 font-mono text-sm sm:grid-cols-2 sm:gap-x-8 dark:bg-zinc-950">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-sans text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Binary
          </dt>
          <dd className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {binary}
          </dd>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <dt className="font-sans text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Sum
          </dt>
          <dd className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
            {setPlaces.length > 0 ? (
              <>
                {setPlaces.join(' + ')}
                <span className="text-zinc-400 dark:text-zinc-500"> = </span>
                {value}
              </>
            ) : (
              0
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        Tip: a subnet mask is just four of these octets — /24 is 255.255.255.0,
        which is 11111111 11111111 11111111 00000000.
      </p>
    </section>
  )
}
