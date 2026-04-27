import { useState, useEffect, useRef } from "react";
import "./App.css";
import { POOL } from "./lib/pool.js";
import { scoreMessage } from "./lib/score-message.js";

function timeForRound(n) {
	if (n === 10) return 120;
	if (n === 15) return 180;
	return 300; // 20
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

function shuffle(arr) {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

// Forgiving: ignores case, spaces around :, and trailing semicolons
function normalize(s) {
	return s
		.toLowerCase()
		.trim()
		.replace(/\s*:\s*/g, ": ")
		.replace(/\s*\/\s*/g, " / ")
		.replace(/;+$/, "")
		.replace(/\s+/g, " ");
}

function checkAnswer(input, expected) {
	const n = normalize(input);
	const e = normalize(expected);
	if (n === e) return true;
	return n === e.replace(/\b0px\b/g, "0") || e === n.replace(/\b0px\b/g, "0");
}

function formatTime(seconds) {
	const m = String(Math.floor(seconds / 60)).padStart(2, "0");
	const s = String(seconds % 60).padStart(2, "0");
	return `${m}:${s}`;
}

// ─── AD BANNER ────────────────────────────────────────────────────────────────

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT;
const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT;

function AdBanner() {
	const ref = useRef(null);

	useEffect(() => {
		if (!ADSENSE_CLIENT || !ADSENSE_SLOT || !ref.current) return;
		try {
			(window.adsbygoogle = window.adsbygoogle || []).push({});
		} catch (_) {}
	}, []);

	if (!ADSENSE_CLIENT || !ADSENSE_SLOT) return null;

	return (
		<section className="ad-banner">
			<ins
				ref={ref}
				className="adsbygoogle"
				style={{ display: "block" }}
				data-ad-client={ADSENSE_CLIENT}
				data-ad-slot={ADSENSE_SLOT}
				data-ad-format="auto"
				data-full-width-responsive="true"
				data-color-scheme="dark"
			/>
		</section>
	);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function YuCSS() {
	const [phase, setPhase] = useState("home"); // "home" | "quiz" | "results"
	const [difficulty, setDifficulty] = useState("easy");
	const [roundSize, setRoundSize] = useState(10);
	const [direction, setDirection] = useState("mixed"); // "mixed" | "yu2css" | "css2yu"
	const [questions, setQuestions] = useState([]);
	const [currIndex, setCurrIndex] = useState(0);
	const [input, setInput] = useState("");
	const [inputState, setInputState] = useState("idle"); // "idle" | "correct" | "wrong"
	const [hint, setHint] = useState("");
	const [totalTime, setTotalTime] = useState(timeForRound(10));
	const [timeLeft, setTimeLeft] = useState(timeForRound(10));
	const totalTimeRef = useRef(timeForRound(10));
	const [results, setResults] = useState([]);
	const [timeTaken, setTimeTaken] = useState(0);

	const inputRef = useRef(null);
	const timerRef = useRef(null);

	const currentQuestion = questions[currIndex];
	const isYU = currentQuestion?.dir === "yu2css";
	const correctAnswer = currentQuestion
		? isYU
			? currentQuestion.css
			: currentQuestion.yu
		: "";

	useEffect(() => {
		if (phase === "quiz" && inputRef.current) {
			inputRef.current.focus();
		}
	}, [phase, currIndex]);

	useEffect(() => {
		if (phase !== "quiz") return;

		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(timerRef.current);
					handleTimeUp();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timerRef.current);
	}, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

	// ── Game flow ──────────────────────────────────────────────────────────────

	function buildPool() {
		if (difficulty === "easy") {
			const mediumCount = Math.max(1, Math.round(roundSize * 0.1));
			const mediumPool = shuffle(POOL.filter((q) => q.level === "medium"));
			const easyPool = shuffle(POOL.filter((q) => q.level === "easy"));
			return shuffle([
				...mediumPool.slice(0, mediumCount),
				...easyPool.slice(0, roundSize - mediumCount),
			]);
		}
		if (difficulty === "medium") {
			const mediumCount = Math.round(roundSize * 0.8);
			const mediumPool = shuffle(POOL.filter((q) => q.level === "medium"));
			const easyPool = shuffle(POOL.filter((q) => q.level === "easy"));
			return shuffle([
				...mediumPool.slice(0, mediumCount),
				...easyPool.slice(0, roundSize - mediumCount),
			]);
		}
		// expert: half expert, half from any level
		const expertCount = Math.round(roundSize * 0.5);
		const expertPool = shuffle(POOL.filter((q) => q.level === "expert"));
		const otherPool = shuffle(POOL.filter((q) => q.level !== "expert"));
		return shuffle([
			...expertPool.slice(0, expertCount),
			...otherPool.slice(0, roundSize - expertCount),
		]);
	}

	function startGame() {
		const pool = buildPool();
		const picked = shuffle(pool)
			.slice(0, roundSize)
			.map((q) => ({
				...q,
				dir:
					direction === "mixed"
						? Math.random() < 0.5
							? "yu2css"
							: "css2yu"
						: direction,
			}));
		clearInterval(timerRef.current);
		setQuestions(picked);
		setCurrIndex(0);
		setInput("");
		setInputState("idle");
		setHint("");
		const t = timeForRound(roundSize);
		totalTimeRef.current = t;
		setTotalTime(t);
		setTimeLeft(t);
		setResults([]);
		setTimeTaken(0);
		setPhase("quiz");
	}

	function handleTimeUp() {
		setResults((prev) => {
			const skipped = questions
				.slice(prev.length)
				.map((q) => ({ ...q, status: "skipped", chosen: "" }));
			const final = [...prev, ...skipped];
			endGame(final, totalTimeRef.current);
			return final;
		});
	}

	function endGame(final, elapsed = totalTimeRef.current - timeLeft) {
		clearInterval(timerRef.current);
		setTimeTaken(elapsed);
		setResults(final);
		setPhase("results");
	}

	function goHome() {
		clearInterval(timerRef.current);
		setPhase("home");
	}

	function recordAndAdvance(status) {
		const newResults = [
			...results,
			{ ...currentQuestion, status, chosen: input },
		];
		setResults(newResults);

		if (currIndex + 1 >= roundSize) {
			endGame(newResults);
		} else {
			setCurrIndex(currIndex + 1);
			setInput("");
			setInputState("idle");
			setHint("");
		}
	}

	// ── Input handlers ─────────────────────────────────────────────────────────

	function handleSubmit() {
		if (inputState === "correct" || !input.trim()) return;

		if (checkAnswer(input, correctAnswer)) {
			setInputState("correct");
			setHint("✓ Correct!");
			setTimeout(() => recordAndAdvance("correct"), 700);
		} else {
			setInputState("wrong");
			setHint("✗ Not quite, try again");
			setTimeout(() => {
				setInputState("idle");
				setHint("");
			}, 1000);
		}
	}

	function handlePass() {
		if (inputState === "correct") return;
		setHint(`Answer: ${correctAnswer}`);
		setTimeout(() => recordAndAdvance("passed"), 1400);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") handleSubmit();
		if (e.key === "Escape") handlePass();
	}

	function handleInputChange(e) {
		setInput(e.target.value);
		if (inputState === "wrong") setInputState("idle");
	}

	// ── Derived values ─────────────────────────────────────────────────────────

	const timerPercent = (timeLeft / totalTime) * 100;
	const timerMod =
		timerPercent <= 25 ? "danger" : timerPercent <= 50 ? "warn" : "";
	const correctCount = results.filter((r) => r.status === "correct").length;
	const wrongCount = results.filter(
		(r) => r.status === "passed" || r.status === "wrong",
	).length;
	const finalScore = correctCount * 50 + Math.max(0, totalTime - timeTaken);
	const hintClass = `hint${inputState === "correct" ? " ok" : inputState === "wrong" ? " bad" : hint ? " pass" : ""}`;

	const shareUrl = encodeURIComponent("https://www.yucss.com");
	const homeShareText = encodeURIComponent(
		`yucss — the Yumma CSS quiz. Test your CSS knowledge!`,
	);
	const homeEmailSubject = encodeURIComponent(`yucss — the Yumma CSS quiz`);
	const homeEmailBody = encodeURIComponent(
		`Hey, check out yucss — a quiz that tests your Yumma CSS and CSS knowledge!\n\nhttps://www.yucss.com`,
	);
	const homeShareLinks = {
		x: `https://twitter.com/intent/tweet?text=${homeShareText}&url=${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
		email: `mailto:?subject=${homeEmailSubject}&body=${homeEmailBody}`,
	};
	const shareText = encodeURIComponent(
		`I scored ${finalScore} on yucss (${difficulty} mode) in ${timeTaken}s — the Yumma CSS quiz. Can you beat me?`,
	);
	const emailSubject = encodeURIComponent(
		`I scored ${finalScore} on yucss — can you beat me?`,
	);
	const emailBody = encodeURIComponent(
		`I just scored ${finalScore} on yucss (${difficulty} mode) in ${timeTaken} seconds — the Yumma CSS quiz. Can you beat me?\n\nhttps://www.yucss.com`,
	);
	const shareLinks = {
		x: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
		email: `mailto:?subject=${emailSubject}&body=${emailBody}`,
	};

	// ── Render ─────────────────────────────────────────────────────────────────

	return (
		<>
			<div className="page">
				<div className="wrap">
					<header className="hdr">
						<span className="logo" onClick={goHome}>
							<img src="/logo.svg" alt="" className="logo-img" />
							<span className="logo-accent">yu</span>css
						</span>
					</header>

					<main>
						{/* HOME */}
						{phase === "home" && (
							<>
								<section className="home-section">
									<div className="hero">
										<h1>
											Know your <em>Yumma CSS</em>?
										</h1>
										<p>
											Each question shows either a Yumma CSS class or a CSS
											property — you type the other side from memory.
										</p>
									</div>

									<button
										className="btn btn-primary btn-play"
										onClick={startGame}
									>
										Play →
									</button>

									<div className="level-picker">
										{["easy", "medium", "expert"].map((lvl) => (
											<button
												key={lvl}
												className={`btn btn-level${difficulty === lvl ? " active" : ""}`}
												onClick={() => setDifficulty(lvl)}
											>
												{lvl}
											</button>
										))}
									</div>

									<div className="question-picker">
										{[10, 15, 20].map((n) => (
											<button
												key={n}
												className={`btn btn-level${roundSize === n ? " active" : ""}`}
												onClick={() => setRoundSize(n)}
											>
												{n} questions
											</button>
										))}
									</div>

									<div className="mode-picker">
										{[
											{ value: "mixed", label: "Mixed" },
											{ value: "yu2css", label: "Yumma CSS → CSS" },
											{ value: "css2yu", label: "CSS → Yumma CSS" },
										].map(({ value, label }) => (
											<button
												key={value}
												className={`btn btn-level${direction === value ? " active" : ""}`}
												onClick={() => setDirection(value)}
											>
												{label}
											</button>
										))}
									</div>

									<div className="examples">
										<div className="example-row">
											<span className="example-dir">Yumma CSS → CSS</span>
											<span className="example-prompt">d-f</span>
											<span className="example-arrow">→</span>
											<span className="example-answer">display: flex</span>
										</div>
										<div className="example-row">
											<span className="example-dir">CSS → Yumma CSS</span>
											<span className="example-prompt">width: 100%</span>
											<span className="example-arrow">→</span>
											<span className="example-answer">w-full</span>
										</div>
									</div>

									<div className="card instr-card">
										<div className="instr-title">How it works</div>
										<ul className="instr-list">
											{[
												[
													"Choose your options",
													"pick a difficulty, how many questions, and whether to go mixed, Yumma CSS → CSS, or CSS → Yumma CSS.",
												],
												[
													"Submit with Enter",
													"if you're right, you move on. If wrong, try again as many times as you like.",
												],
												[
													"Pass with Esc",
													"skip the question, the correct answer is shown before moving on.",
												],
												[
													"Forgiving checking",
													"capitalisation, spaces around : and trailing semicolons are all ignored.",
												],
												[
													"Yumma CSS abbreviations",
													"classes use short prefixes like d- for display, p- for padding, ai- for align-items.",
												],
											].map(([bold, rest]) => (
												<li key={bold} className="instr-item">
													<span className="instr-dot">//</span>
													<div>
														<strong>{bold}</strong>: {rest}
													</div>
												</li>
											))}
										</ul>
									</div>

									<div className="share-row">
										<span className="share-label">Share</span>
										<a
											className="share-btn"
											href={homeShareLinks.facebook}
											target="_blank"
											rel="noreferrer"
											aria-label="Share on Facebook"
										>
											<i className="fa-brands fa-facebook-f" />
										</a>
										<a
											className="share-btn"
											href={homeShareLinks.x}
											target="_blank"
											rel="noreferrer"
											aria-label="Share on X"
										>
											<i className="fa-brands fa-x-twitter" />
										</a>
										<a
											className="share-btn"
											href={homeShareLinks.linkedin}
											target="_blank"
											rel="noreferrer"
											aria-label="Share on LinkedIn"
										>
											<i className="fa-brands fa-linkedin-in" />
										</a>
										<a
											className="share-btn"
											href={homeShareLinks.email}
											aria-label="Share via Email"
										>
											<i className="fa-solid fa-envelope" />
										</a>
									</div>

									<div className="book-promo">
										<span className="book-promo-label">
											Learn Yumma CSS
										</span>
										<a
											className="book-promo-link"
											href="https://yummacss.com/docs"
											target="_blank"
											rel="noreferrer"
										>
											<span className="book-title">
												Yumma CSS Docs
											</span>
											<span className="book-author">yummacss.com</span>
										</a>
									</div>
								</section>

								<AdBanner />
							</>
						)}

						{/* QUIZ */}
						{phase === "quiz" && currentQuestion && (
							<>
								<div className="quiz-top">
									<div className="timer">
										<div className="timer-row">
											<span className="timer-label">Time</span>
											<span className={`timer-digits ${timerMod}`}>
												{formatTime(timeLeft)}
											</span>
										</div>
										<div className="timer-track">
											<div
												className={`timer-fill ${timerMod}`}
												style={{ width: `${timerPercent}%` }}
											/>
										</div>
									</div>

									<div className="dots">
										{questions.map((_, i) => {
											const result = results[i];
											const dotClass = result
												? result.status
												: i === currIndex
													? "active"
													: "";
											return <div key={i} className={`dot ${dotClass}`} />;
										})}
									</div>
								</div>

								<div className="quiz-card-wrap">
									<div className="card">
										<div className="q-meta">
											<span className="q-count">
												<strong>{currIndex + 1}</strong> / {roundSize}
											</span>
											<span className="q-badge">
												{isYU ? "yu → css" : "css → yu"}
											</span>
										</div>

										<div className="q-label">
											{isYU ? "Yumma CSS class" : "CSS property"}
										</div>
										<div className="q-prompt">
											{isYU ? currentQuestion.yu : currentQuestion.css}
										</div>

										<div className="a-label">
											{isYU
												? "Type the CSS property"
												: "Type the Yumma CSS class"}
										</div>
										<input
											ref={inputRef}
											className={`answer ${inputState}`}
											value={input}
											onChange={handleInputChange}
											onKeyDown={handleKeyDown}
											placeholder={isYU ? "e.g. display: flex" : "e.g. d-f"}
											disabled={inputState === "correct"}
											spellCheck={false}
											autoComplete="off"
											autoCorrect="off"
											autoCapitalize="off"
										/>

										<div className={hintClass}>
											{hint || "Enter to submit · Esc to pass"}
										</div>

										<div className="btn-row">
											<button
												className="btn btn-primary"
												onClick={handleSubmit}
												disabled={inputState === "correct" || !input.trim()}
											>
												Submit ↵
											</button>
											<button
												className="btn btn-secondary"
												onClick={handlePass}
												disabled={inputState === "correct"}
											>
												Pass
											</button>
										</div>
									</div>
								</div>
							</>
						)}

						{/* RESULTS */}
						{phase === "results" && (
							<>
								<section className="results-section">
									<div className="card">
										<div className="r-header">
											<div className="r-score">
												<div className="r-score-label">Score</div>
												<span className="r-num">{finalScore}</span>
											</div>
											<div className="r-msg">
												{scoreMessage(correctCount, roundSize)}
											</div>
											<div className="r-level">Level: {difficulty}</div>
										</div>

										<div className="stats">
											<div className="stat">
												<div className="stat-n green">{correctCount}</div>
												<div className="stat-l">Correct</div>
											</div>
											<div className="stat">
												<div className="stat-n red">{wrongCount}</div>
												<div className="stat-l">Passed</div>
											</div>
											<div className="stat">
												<div className="stat-n muted">
													{formatTime(timeTaken)}
												</div>
												<div className="stat-l">Time</div>
											</div>
										</div>

										<div className="share-row">
											<span className="share-label">Share Score</span>
											<a
												className="share-btn"
												href={shareLinks.facebook}
												target="_blank"
												rel="noreferrer"
												aria-label="Share on Facebook"
											>
												<i className="fa-brands fa-facebook-f" />
											</a>
											<a
												className="share-btn"
												href={shareLinks.x}
												target="_blank"
												rel="noreferrer"
												aria-label="Share on X"
											>
												<i className="fa-brands fa-x-twitter" />
											</a>
											<a
												className="share-btn"
												href={shareLinks.linkedin}
												target="_blank"
												rel="noreferrer"
												aria-label="Share on LinkedIn"
											>
												<i className="fa-brands fa-linkedin-in" />
											</a>
											<a
												className="share-btn"
												href={shareLinks.email}
												aria-label="Share via Email"
											>
												<i className="fa-solid fa-envelope" />
											</a>
										</div>

										<div className="book-promo">
											<span className="book-promo-label">
												Learn Yumma CSS
											</span>
											<a
												className="book-promo-link"
												href="https://yummacss.com/docs"
												target="_blank"
												rel="noreferrer"
											>
												<span className="book-title">
													Yumma CSS Docs
												</span>
												<span className="book-author">yummacss.com</span>
											</a>
										</div>

										<div className="btn-row">
											<button className="btn btn-ghost" onClick={goHome}>
												← Home
											</button>
											<button className="btn btn-primary" onClick={startGame}>
												Play again →
											</button>
										</div>
									</div>
								</section>
								<AdBanner />
							</>
						)}
					</main>
					<footer className="footer">
						<p>Built with and for <a href="https://yummacss.com" target="_blank" rel="noreferrer">Yumma CSS</a>.</p>
						<p>
							Forked from{" "}
							<a href="https://www.yucss.csswind.com" target="_blank" rel="noreferrer">
								csswind
							</a>{" "}
							by Paul Wright &amp; Theo Soti.
						</p>
					</footer>
				</div>
			</div>
		</>
	);
}