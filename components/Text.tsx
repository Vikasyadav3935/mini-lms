import React from "react";
import { Text as RNText, TextProps } from "react-native";

const WEIGHT_MAP: [string, string][] = [
  ["font-black", "Nunito-Black"],
  ["font-extrabold", "Nunito-ExtraBold"],
  ["font-bold", "Nunito-Bold"],
  ["font-semibold", "Nunito-SemiBold"],
  ["font-medium", "Nunito-Medium"],
  ["font-light", "Nunito-Light"],
  ["font-extralight", "Nunito-ExtraLight"],
];

function getFontFamily(className?: string): string {
  if (className) {
    const classes = className.split(" ");
    for (const [cls, family] of WEIGHT_MAP) {
      if (classes.includes(cls)) return family;
    }
  }
  return "Nunito-Regular";
}

export function Text({ className, style, ...props }: TextProps) {
  const fontFamily = getFontFamily(className);
  return (
    <RNText
      className={className}
      style={[style, { fontFamily, fontWeight: "normal" }]}
      {...props}
    />
  );
}
