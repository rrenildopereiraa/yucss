function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function scoreMessage(correct, total) {
	const pct = total > 0 ? correct / total : 0;

	if (correct === total)
		return pick([
			"Flawless. Both Kevin Powell and Adam Wathan are proud.",
			"Basically a Tailwind compiler at this point.",
			"Amazing. Did you have the docs open in another tab?",
			"Adam Wathan wants to hire you.",
			"Perfect score. You don't use autocomplete, do you?",
			"Flawless. The CSS gods bow.",
		]);
	if (pct >= 0.9)
		return pick([
			"One class escaped. It won't next time.",
			"So close. The missing point is haunting you, isn't it.",
			"Nearly perfect. Your muscle memory is almost there.",
			"A rounding error away from greatness.",
			"One away from flawless. Infuriating, isn't it?",
			"Silver medal CSS. Still incredibly impressive.",
		]);
	if (pct >= 0.8)
		return pick([
			"Certified CSS nerd. Wear it with pride.",
			"Excellent recall and blistering speed!",
			"Your brain loads faster than most websites.",
			"Really solid. Your brain is a stylesheet.",
			"Great work. Tailwind would be proud. Probably.",
			"The stylesheet gods nod approvingly.",
		]);
	if (pct >= 0.7)
		return pick([
			"Solid. A few were just `flex` in a trenchcoat.",
			"Your CSS is stronger than your doubt.",
			"Most classes mastered, a few still plotting against you.",
			"You're in the top half. Comfortably.",
			"Not bad at all. Respectable territory.",
			"IntelliSense is starting to feel threatened.",
		]);
	if (pct >= 0.6)
		return pick([
			"Strong score. The utility classes respect you.",
			"Good effort. Still faster than reading the docs.",
			"Solid. A few classes still hiding from you.",
			"Not bad. Your co-workers are impressed (probably).",
			"Decent. You know enough to be dangerous.",
			"More than half right. IntelliSense is nervous.",
		]);
	if (pct >= 0.5)
		return pick([
			"Exactly half. A coin flip with knowledge.",
			"You're at the crossroads of CSS enlightenment.",
			"Middle of the pack. The median is not the destination.",
			"Half right. The others are just waiting to be learned.",
			"Half credit. CSS giveth and CSS taketh away.",
			"The stylesheet is on the fence about you.",
		]);
	if (pct >= 0.4)
		return pick([
			"Getting there. Keep grinding.",
			"Statistically, not terrible.",
			"Keep going. You're in the learning zone.",
			"A work in progress. Like most stylesheets.",
			"The docs are your friend. Use them.",
			"Below half, but the curve is upward.",
		]);
	if (pct >= 0.3)
		return pick([
			"A foundation. A very small one.",
			"A few correct. The rest are just warming up.",
			"The docs miss you. Visit them sometime.",
			"Progress! Probably. Better than zero.",
			"The stylesheet is rooting for you. Quietly.",
			"Room to grow. Lots of it.",
		]);
	if (pct >= 0.2)
		return pick([
			"Some good answers in there somewhere.",
			"You tried. The effort was visible.",
			"Hey, you showed up. That's step one.",
			"Somewhere out there, a CSS class is crying.",
			"Have you tried reading the Tailwind docs? Just once?",
			"We all started somewhere. Keep at it!",
		]);
	if (correct === 1)
		return pick([
			"One correct answer. The only way is up.",
			"Try Googling next time.",
			"Yes, centering a div is hard. Keep at it.",
			"Have you considered a career in backend?",
			"The bravery to even try — noted.",
			"One right. The journey begins.",
		]);
	return pick([
		"Did the cat walk over your keyboard?",
		"Zero correct. The world stares back.",
		"Did you try typing the question as the answer?",
		"CSS is hard. This quiz is hard. Don't give up!",
		"Take up backend development instead.",
		"Better brush up on your CSS and Tailwind basics.",
	]);
}
