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
  gray0: "var(--color-gray-0)",
  gray5: "var(--color-gray-5)",
  gray10: "var(--color-gray-10)",
  gray20: "var(--color-gray-20)",
  gray30: "var(--color-gray-30)",
  gray40: "var(--color-gray-40)",
  gray50: "var(--color-gray-50)",
  gray60: "var(--color-gray-60)",
  gray70: "var(--color-gray-70)",
  gray80: "var(--color-gray-80)",
  gray90: "var(--color-gray-90)",
  gray100: "var(--color-gray-100)",
  gray110: "var(--color-gray-110)",

  // Green
  green10: "var(--color-green-10)",
  green20: "var(--color-green-20)",
  green30: "var(--color-green-30)",
  green40: "var(--color-green-40)",
  green50: "var(--color-green-50)",
  green60: "var(--color-green-60)",
  green70: "var(--color-green-70)",
  green80: "var(--color-green-80)",
  green90: "var(--color-green-90)",
  green100: "var(--color-green-100)",
  green110: "var(--color-green-110)",

  // Yellow
  yellow10: "var(--color-yellow-10)",
  yellow20: "var(--color-yellow-20)",
  yellow30: "var(--color-yellow-30)",
  yellow40: "var(--color-yellow-40)",
  yellow50: "var(--color-yellow-50)",
  yellow60: "var(--color-yellow-60)",
  yellow70: "var(--color-yellow-70)",
  yellow80: "var(--color-yellow-80)",
  yellow90: "var(--color-yellow-90)",
  yellow100: "var(--color-yellow-100)",
  yellow110: "var(--color-yellow-110)",

  // Red
  red10: "var(--color-red-10)",
  red20: "var(--color-red-20)",
  red30: "var(--color-red-30)",
  red40: "var(--color-red-40)",
  red50: "var(--color-red-50)",
  red60: "var(--color-red-60)",
  red70: "var(--color-red-70)",
  red80: "var(--color-red-80)",
  red90: "var(--color-red-90)",
  red100: "var(--color-red-100)",
  red110: "var(--color-red-110)",

  // Blue
  blue10: "var(--color-blue-10)",
  blue20: "var(--color-blue-20)",
  blue30: "var(--color-blue-30)",
  blue40: "var(--color-blue-40)",
  blue50: "var(--color-blue-50)",
  blue60: "var(--color-blue-60)",
  blue70: "var(--color-blue-70)",
  blue80: "var(--color-blue-80)",
  blue90: "var(--color-blue-90)",
  blue100: "var(--color-blue-100)",
  blue110: "var(--color-blue-110)",

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
