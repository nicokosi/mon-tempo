import { MAX_BEATS, clampBpm, clampBeats, parseParams, scannerPosition, tapTempo } from './timing.js';

const $ = (id) => document.getElementById(id);
const SEGMENTS = 9;
const LOOKAHEAD_S = 0.1;
const TICK_MS = 25;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let { bpm, beats } = parseParams(location.search);
let ctx, timer, wakeLock;
let running = false;
let nextTime = 0, count = 0, bar = 0;
let queue = [];
let taps = [];
const levels = new Array(SEGMENTS).fill(0);

const cells = Array.from({ length: SEGMENTS }, () => document.createElement('span'));
$('scanner').append(...cells);
for (let i = 1; i <= MAX_BEATS; i++) $('beats').add(new Option(`${i} temps`, i));

function render() {
  $('bpm').textContent = bpm;
  $('bpm-range').value = bpm;
  $('beats').value = beats;
  $('dots').replaceChildren(...Array.from({ length: beats }, () => document.createElement('span')));
  history.replaceState(null, '', `?bpm=${bpm}&beats=${beats}`);
}

function paint(lit, beatInBar) {
  levels.forEach((level, i) => (levels[i] = i === lit ? 1 : level * 0.8));
  cells.forEach((cell, i) => (cell.style.opacity = 0.1 + 0.9 * levels[i]));
  [...$('dots').children].forEach((dot, i) => dot.classList.toggle('on', i === beatInBar));
}

function click(time, accent) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = accent ? 1760 : 880;
  gain.gain.setValueAtTime(accent ? 1 : 0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + 0.05);
}

// Clicks are scheduled ahead on the audio clock: JS timers alone drift and get throttled.
function schedule() {
  while (nextTime < ctx.currentTime + LOOKAHEAD_S) {
    click(nextTime, bar === 0);
    queue.push({ time: nextTime, count, bar });
    nextTime += 60 / bpm;
    count++;
    bar = (bar + 1) % beats;
  }
}

function draw() {
  if (!running) return;
  const now = ctx.currentTime - (ctx.outputLatency || 0);
  while (queue.length > 1 && queue[1].time <= now) queue.shift();
  const cur = queue[0];
  if (cur && cur.time <= now) {
    const duration = queue[1] ? queue[1].time - cur.time : 60 / bpm;
    const phase = reducedMotion.matches ? 0 : Math.min(1, (now - cur.time) / duration);
    paint(Math.round(scannerPosition(cur.count, phase) * (SEGMENTS - 1)), cur.bar);
  }
  requestAnimationFrame(draw);
}

function start() {
  // 'playback' keeps the clicks audible when the iPhone is in silent mode.
  if (navigator.audioSession) navigator.audioSession.type = 'playback';
  ctx ??= new AudioContext();
  ctx.resume(); // must happen inside the tap, iOS blocks audio otherwise
  navigator.wakeLock?.request('screen').then((lock) => (wakeLock = lock), () => {});
  nextTime = ctx.currentTime + 0.05;
  count = 0;
  bar = 0;
  queue = [];
  running = true;
  schedule();
  timer = setInterval(schedule, TICK_MS);
  requestAnimationFrame(draw);
  $('toggle').textContent = 'Stop';
  $('toggle').setAttribute('aria-pressed', 'true');
}

function stop() {
  running = false;
  clearInterval(timer);
  ctx.suspend();
  wakeLock?.release();
  wakeLock = null;
  levels.fill(0);
  paint(-1, -1);
  $('toggle').textContent = 'Start';
  $('toggle').setAttribute('aria-pressed', 'false');
}

const toggle = () => (running ? stop() : start());
const setBpm = (value) => {
  bpm = clampBpm(value);
  render();
};

$('toggle').addEventListener('click', toggle);
$('minus').addEventListener('click', () => setBpm(bpm - 1));
$('plus').addEventListener('click', () => setBpm(bpm + 1));
$('bpm-range').addEventListener('input', (e) => setBpm(e.target.value));
$('beats').addEventListener('change', (e) => {
  beats = clampBeats(e.target.value);
  bar = 0;
  render();
});
$('tap').addEventListener('click', () => {
  const now = performance.now();
  if (now - taps.at(-1) > 2000) taps = [];
  taps = [...taps, now].slice(-5);
  const tapped = tapTempo(taps);
  if (tapped) setBpm(tapped);
});
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    toggle();
  }
});
// iOS suspends hidden pages: stop cleanly rather than resume out of sync.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) stop();
});

render();
paint(-1, -1);
