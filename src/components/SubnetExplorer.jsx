import { useMemo, useState } from 'react'

const DEFAULT_IP = ['192', '168', '1', '10']
const DEFAULT_MASK = ['255', '255', '255', '0']

function parseOctets(parts) {
  const nums = parts.map((p) => (p.trim() === '' ? NaN : Number(p)))
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return nums
}

function to32(o) {
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0
}

function from32(v) {
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]
}

function toIp(v) {
  return from32(v).join('.')
}

function bits32(v) {
  let s = ''
  for (let i = 31; i >= 0; i--) s += ((v >>> i) & 1).toString()
  return s
}

function bitsGrouped(v) {
  return from32(v)
    .map((o) => o.toString(2).padStart(8, '0'))
    .join(' ')
}

function analyze(ipParts, maskParts) {
  const ip = parseOctets(ipParts)
  if (!ip) {
    return { error: 'Enter an address with four octets from 0 to 255.' }
  }
  const mask = parseOctets(maskParts)
  if (!mask) {
    return { error: 'Enter a mask with four octets from 0 to 255.' }
  }
  const ip32 = to32(ip)
  const mask32 = to32(mask)
  const bits = bits32(mask32)
  if (!/^1*0*$/.test(bits)) {
    return {
      error:
        'A subnet mask must be contiguous ones followed by zeros, e.g. 255.255.254.0.',
    }
  }
  const zeroAt = bits.indexOf('0')
  const cidr = zeroAt === -1 ? 32 : zeroAt
  const wildcard = (~mask32) >>> 0
  const network = (ip32 & mask32) >>> 0
  const broadcast = (ip32 | wildcard) >>> 0
  const total = 2 ** (32 - cidr)
  let usable
  let first
  let last
  let note
  if (cidr === 32) {
    usable = 1
    first = network
    last = broadcast
    note = '/32 is a single host — no broadcast address.'
  } else if (cidr === 31) {
    usable = 2
    first = network
    last = broadcast
    note = '/31 point-to-point (RFC 3021) — both addresses are usable.'
  } else {
    usable = total - 2
    first = (network + 1) >>> 0
    last = (broadcast - 1) >>> 0
  }
  return {
    ip32,
    mask32,
    cidr,
    wildcard,
    network,
    broadcast,
    total,
    usable,
    first,
    last,
    note,
  }
}

function OctetInput({ label, value, onChange, onReset }) {
  const digitsOnly = (e) => e.target.value.replace(/\D/g, '').slice(0, 3)
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-12 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        {label}
      </span>
      <div className="flex flex-1 items-center gap-1 sm:gap-1.5">
        {value.map((v, i) => (
          <div key={i} className="flex flex-1 items-center">
            {i > 0 && (
              <span className="mb-2 text-zinc-400 dark:text-zinc-600">.</span>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={v}
              onChange={(e) =>
                onChange(
                  value.map((old, j) =>
                    j === i ? digitsOnly(e) : old,
                  ),
                )
              }
              onBlur={onReset(i)}
              aria-label={`${label} octet ${i + 1}`}
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-center font-mono text-base font-semibold text-zinc-900 outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:border-emerald-500"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function BitRow({ value, cidr }) {
  return (
    <div className="overflow-x-auto font-mono text-base tracking-widest">
      {from32(value).map((o, oi) => {
        const octetBits = o.toString(2).padStart(8, '0')
        const start = oi * 8
        return (
          <span key={oi}>
            {octetBits.split('').map((b, bi) => (
              <span
                key={bi}
                className={
                  start + bi < cidr
                    ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-400 dark:text-zinc-600'
                }
              >
                {b}
              </span>
            ))}
            {oi < 3 && (
              <span className="text-zinc-300 dark:text-zinc-700">.</span>
            )}
          </span>
        )
      })}
    </div>
  )
}

function ResultRow({ label, value, bits }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="font-mono text-sm leading-relaxed">
        <span className="font-semibold tabular-nums text-zinc-900 dark:text-white">
          {value}
        </span>
        {bits && (
          <span className="ml-3 break-all text-zinc-400 dark:text-zinc-500">
            {bits}
          </span>
        )}
      </dd>
    </div>
  )
}

export default function SubnetExplorer() {
  const [ip, setIp] = useState(DEFAULT_IP)
  const [mask, setMask] = useState(DEFAULT_MASK)

  const result = useMemo(() => analyze(ip, mask), [ip, mask])

  const fixOctet = (setter) => (idx) => () => {
    setter((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v
        const n = Number(v)
        if (v.trim() === '' || !Number.isInteger(n) || n < 0 || n > 255) {
          return '0'
        }
        return String(n)
      }),
    )
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            IPv4 Subnet
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter an address and mask to expand the full subnet in binary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIp(DEFAULT_IP)
            setMask(DEFAULT_MASK)
          }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 space-y-3">
        <OctetInput label="Address" value={ip} onChange={setIp} onReset={fixOctet(setIp)} />
        <OctetInput label="Mask" value={mask} onChange={setMask} onReset={fixOctet(setMask)} />
      </div>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400"
        >
          {result.error}
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-mono text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              /{result.cidr}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-sm tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {toIp(result.mask32)}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 font-mono text-sm tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {result.usable} usable hosts
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
              <span className="text-zinc-500 dark:text-zinc-400">
                Address and mask bits
              </span>
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  network
                </span>
                <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  host
                </span>
              </span>
            </div>
            <div className="mt-2 space-y-2">
              <div>
                <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Address
                </div>
                <BitRow value={result.ip32} cidr={result.cidr} />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Mask
                </div>
                <BitRow value={result.mask32} cidr={result.cidr} />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {from32(result.ip32).map((o, oi) => (
              <div
                key={oi}
                className="rounded-xl border border-zinc-200 p-3 text-center dark:border-zinc-800"
              >
                <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Octet {oi + 1}
                </div>
                <div className="mt-1 font-mono text-lg font-semibold tabular-nums text-zinc-900 dark:text-white">
                  {o}
                </div>
                <div className="mt-1 font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
                  {o.toString(2).padStart(8, '0')}
                </div>
                <div className="mt-0.5 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {from32(result.mask32)[oi].toString(2).padStart(8, '0')}
                </div>
              </div>
            ))}
          </div>

          <dl className="mt-4 space-y-2">
            <ResultRow
              label="Network"
              value={toIp(result.network)}
              bits={bitsGrouped(result.network)}
            />
            <ResultRow
              label="Broadcast"
              value={toIp(result.broadcast)}
              bits={bitsGrouped(result.broadcast)}
            />
            <ResultRow
              label="Wildcard"
              value={toIp(result.wildcard)}
              bits={bitsGrouped(result.wildcard)}
            />
            <ResultRow
              label="First usable"
              value={toIp(result.first)}
              bits={bitsGrouped(result.first)}
            />
            <ResultRow
              label="Last usable"
              value={toIp(result.last)}
              bits={bitsGrouped(result.last)}
            />
            <ResultRow
              label="Hosts"
              value={`${result.total} total · ${result.usable} usable`}
            />
          </dl>

          {result.note && (
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              {result.note}
            </p>
          )}
        </>
      )}
    </section>
  )
}
