const spaceBaseSize = 8;

export const getSpace = (size: number) => {
	return spaceBaseSize * size;
};

export const Colors = {
	// question format
	formatDiscussion: "#4097DB", //blue60
	formatNotSet: "#bcbdbd", //gray40
	formatQuestion: "#f7a535", //yellow60
	formatDiscussionText: "#fff", //gray10
	formatNotSetText: "rgba(0, 0, 0, 0.87)", //highEmphasis
	formatQuestionText: "rgba(0, 0, 0, 0.87)", //highEmphasis

	// subscribe action
	subscribeQuestion: "#5D707C",

	// Gray
	gray0: "var(--color-gray0)",
	gray5: "var(--color-gray5)",
	gray10: "var(--color-gray10)",
	gray20: "var(--color-gray20)",
	gray30: "var(--color-gray30)",
	gray40: "var(--color-gray40)",
	gray50: "var(--color-gray50)",
	gray60: "var(--color-gray60)",
	gray70: "var(--color-gray70)",
	gray80: "var(--color-gray80)",
	gray90: "var(--color-gray90)",
	gray100: "var(--color-gray100)",
	gray110: "var(--color-gray110)",

	// Green
	green10: "var(--color-green10)",
	green20: "var(--color-green20)",
	green30: "var(--color-green30)",
	green40: "var(--color-green40)",
	green50: "var(--color-green50)",
	green60: "var(--color-green60)",
	green70: "var(--color-green70)",
	green80: "var(--color-green80)",
	green90: "var(--color-green90)",
	green100: "var(--color-green100)",
	green110: "var(--color-green110)",

	// Yellow
	yellow10: "var(--color-yellow10)",
	yellow20: "var(--color-yellow20)",
	yellow30: "var(--color-yellow30)",
	yellow40: "var(--color-yellow40)",
	yellow50: "var(--color-yellow50)",
	yellow60: "var(--color-yellow60)",
	yellow70: "var(--color-yellow70)",
	yellow80: "var(--color-yellow80)",
	yellow90: "var(--color-yellow90)",
	yellow100: "var(--color-yellow100)",
	yellow110: "var(--color-yellow110)",

	// Red
	red10: "var(--color-red10)",
	red20: "var(--color-red20)",
	red30: "var(--color-red30)",
	red40: "var(--color-red40)",
	red50: "var(--color-red50)",
	red60: "var(--color-red60)",
	red70: "var(--color-red70)",
	red80: "var(--color-red80)",
	red90: "var(--color-red90)",
	red100: "var(--color-red100)",
	red110: "var(--color-red110)",

	// Blue
	blue10: "var(--color-blue10)",
	blue20: "var(--color-blue20)",
	blue30: "var(--color-blue30)",
	blue40: "var(--color-blue40)",
	blue50: "var(--color-blue50)",
	blue60: "var(--color-blue60)",
	blue70: "var(--color-blue70)",
	blue80: "var(--color-blue80)",
	blue90: "var(--color-blue90)",
	blue100: "var(--color-blue100)",
	blue110: "var(--color-blue110)",

	// Base color
	background: "var(--color-background)",
	surface: "var(--color-surface)",
	surfaceVariant: "var(--color-surface-variant)",

	// Divider
	divider: "var(--color-divider)",
	/** @deprecated use divider instead */
	onBackground: "rgba(255, 255, 255, 0.2)",
	/** @deprecated use divider instead */
	onSurface: "rgba(0, 0, 0, 0.12)",

	// Text
	disabled: "var(--color-text-disabled)",
	mediumEmphasis: "var(--color-text-medium-emphasis)",
	highEmphasis: "var(--color-text-high-emphasis)",

	// Scrim
	scrim: "var(--color-scrim)",
	/** @deprecated use scrim instead */
	scrimOnSurface: "rgba(0, 0, 0, 0.32)",

	// Brand
	twitter: "#1d9Bf0",
	facebook: "#1877f2",
} as const;

export const Typography = {
	headline1: "var(--font-size-headline-1)",
	headline2: "var(--font-size-headline-2)",
	subhead1: "var(--font-size-subhead-1)",
	subhead2: "var(--font-size-subhead-2)",
	body1: "var(--font-size-body-1)",
	body2: "var(--font-size-body-2)",
	body3: "var(--font-size-body-3)",
	overline: 10,
} as const;

export const LineHeight = {
	headline: "var(--line-height-headline)",
	subhead: "var(--line-height-subhead)",
	subheadDense: "var(--line-height-subhead-dense)",
	body: "var(--line-height-body)",
	bodyDense: "var(--line-height-body-dense)",
} as const;

export const Weight = {
	normal: 400,
	bold: 600,
} as const;
