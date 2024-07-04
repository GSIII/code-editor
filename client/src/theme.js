// theme.js
import * as monaco from "monaco-editor";

export const defineCustomTheme = () => {
  monaco.editor.defineTheme("myCustomTheme", {
    base: "vs-dark", // 기본 테마 선택
    inherit: true, // 기본 테마 상속 여부
    rules: [],
    colors: {
      "editor.background": "#2E3036", // 배경색 설정
    },
  });
};
