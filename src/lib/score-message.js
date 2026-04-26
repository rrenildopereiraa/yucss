function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function scoreMessage(correct, total) {
	const pct = total > 0 ? correct / total : 0;

	if (correct === total)
		return pick([
			"Perfeito!",
			"Are you cheating? Because this is suspicious.",
			"Did you swallow the entire Yumma CSS docs?",
			"You don't need IntelliSense. You ARE IntelliSense.",
			"Renildo wants to hire you!",
			"Renildo? Is that you?",
		]);

	if (pct >= 0.9)
		return pick([
			"One slipped. It won't next time.",
			"Almost flawless. The framework respects you.",
			"So close. The missing point is haunting you.",
			"One away from Perfeito. Infuriating, isn't it?",
			"Nearly. Your muscle memory is almost there.",
		]);

	if (pct >= 0.8)
		return pick([
			"Certified Yumma CSS nerd. Wear it.",
			"Renildo Pereira would be very proud of you!",
			"Your brain is basically a compiled stylesheet.",
			"Really solid. The framework nods approvingly.",
			"Great work. The docs are proud of you.",
		]);

	if (pct >= 0.7)
		return pick([
			"You know enough to be dangerous.",
			"Solid. A few abbreviations still hiding from you.",
			"Most of it locked in. Keep grinding.",
			"Not bad at all. Respectable territory.",
			"The framework is warming up to you.",
		]);

	if (pct >= 0.6)
		return pick([
			"Half stylesheet, half guesswork. Respectable.",
			"Good effort. Still faster than reading the docs.",
			"More than half right. IntelliSense is nervous.",
			"Not bad. Your co-workers are impressed. Probably.",
			"Decent. The abbreviations are starting to click.",
		]);

	if (pct >= 0.5)
		return pick([
			"Exactly half. A coin flip with knowledge.",
			"Half right. The other half are just waiting to be learned.",
			"The stylesheet is on the fence about you.",
			"Middle of the pack. Not the destination.",
			"Half credit. CSS giveth and CSS taketh away.",
		]);

	if (pct >= 0.4)
		return pick([
			"The abbreviations are not random, maybe try reading the docs?",
			"Keep going. You're in the learning zone.",
			"A work in progress. Like most stylesheets.",
			"Below half, but the curve is upward.",
			"Getting there. The docs miss you.",
		]);

	if (pct >= 0.3)
		return pick([
			"A foundation. A very small one.",
			"The docs miss you. Visit them sometime.",
			"Room to grow. Lots of it.",
			"Progress! Probably. Better than zero.",
			"A few correct. The rest are just warming up.",
		]);

	if (pct >= 0.2)
		return pick([
			"Have you tried reading the docs? Just once?",
			"Hey, you showed up. That's step one.",
			"We all started somewhere. Keep at it.",
			"The framework is rooting for you. Quietly.",
			"Some good answers in there. Somewhere.",
		]);

	if (correct === 1)
		return pick([
			"One correct answer. The only way is up.",
			"Honestly, just use Yumma CSS at this point.",
			"One right. The journey begins.",
			"The bravery to even try — noted.",
			"Yes, CSS is hard. Keep at it.",
		]);

	return pick([
		"Even `d-none` can't hide this score.",
		"Honestly, just use Yumma CSS at this point.",
		"The abbreviations are not random. They just look like it.",
		"Did you come here from Yumma CSS?",
		"Zero correct. The stylesheet stares back.",
	]);
}