export interface Theme {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  inputBorder: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  green: string;
  greenSoft: string;
  orange: string;
  orangeSoft: string;
  red: string;
  redSoft: string;
  purple: string;
  purpleSoft: string;
  blue: string;
  blueSoft: string;
  text: string;
  textMuted: string;
  textDim: string;
  gradientHeader: readonly [string, string];
  gradientSplash: readonly [string, string, string];
}

export const DARK: Theme = {
  bg: "#14182E",
  surface: "#1E2340",
  surfaceAlt: "#252A4A",
  border: "rgba(255,255,255,0.09)",
  inputBorder: "rgba(255,255,255,0.22)",
  primary: "#4A6FA5",
  primarySoft: "rgba(74,111,165,0.15)",
  secondary: "#5B8DB8",
  secondarySoft: "rgba(91,141,184,0.15)",
  green: "#2ECC8F",
  greenSoft: "rgba(46,204,143,0.12)",
  orange: "#E8943A",
  orangeSoft: "rgba(232,148,58,0.12)",
  red: "#E05570",
  redSoft: "rgba(224,85,112,0.12)",
  purple: "#9333ea",
  purpleSoft: "rgba(147,51,234,0.12)",
  blue: "#0ea5e9",
  blueSoft: "rgba(14,165,233,0.12)",
  text: "#FFFFFF",
  textMuted: "#8A9BC0",
  textDim: "#3D4F70",
  gradientHeader: ["#14182E", "#1E2340"],
  gradientSplash: ["#14182E", "#1E2340", "#252A4A"],
};

export const LIGHT: Theme = {
  bg: "#EBEBEB",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F5F5",
  border: "rgba(61,90,153,0.12)",
  inputBorder: "rgba(61,90,153,0.25)",
  primary: "#3D5A99",
  primarySoft: "rgba(61,90,153,0.10)",
  secondary: "#4A6FA5",
  secondarySoft: "rgba(74,111,165,0.10)",
  green: "#27A879",
  greenSoft: "rgba(39,168,121,0.10)",
  orange: "#D4863A",
  orangeSoft: "rgba(212,134,58,0.10)",
  red: "#C94B6A",
  redSoft: "rgba(201,75,106,0.10)",
  purple: "#9333ea",
  purpleSoft: "rgba(147,51,234,0.10)",
  blue: "#0ea5e9",
  blueSoft: "rgba(14,165,233,0.10)",
  text: "#1A1F36",
  textMuted: "#5A6480",
  textDim: "#AEBACC",
  gradientHeader: ["#3D5A99", "#4A6FA5"],
  gradientSplash: ["#3D5A99", "#4A6FA5", "#5B8DB8"],
};
export type AccentKey = "primary" | "secondary" | "green" | "orange" | "red";
