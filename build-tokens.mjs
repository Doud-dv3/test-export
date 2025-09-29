import StyleDictionary from 'style-dictionary';
import { register as registerTs } from '@tokens-studio/sd-transforms';
import Color from 'color';

// 1) Tokens Studio 변환 등록 (참조/수식/단위 등 처리)
registerTs(StyleDictionary);

// 2) RGBA를 항상 'rgba(r,g,b,a)' 문자열로 강제하는 커스텀 트랜스폼
StyleDictionary.registerTransform({
  name: 'color/rgba-string-always',
  type: 'value',
  transitive: true,
  filter: (token) => token.type === 'color' || token.$type === 'color',
  transform: (token) => {
    const c = Color(token.value || token.$value);
    const [r, g, b] = c.rgb().array();
    const a = c.alpha();
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
  }
});

const sd = new StyleDictionary({
  // Tokens Studio가 푸시한 원본 JSON
  source: ['tokens/**/*.json'],
  // Tokens Studio용 전처리기: 부모키 제거/수식/참조 해석 등
  preprocessors: ['tokens-studio'],
  platforms: {
    // --- JSON: HEX ---
    jsonHex: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/hex'],
      buildPath: 'build/json-hex/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }]
    },
    // --- JSON: HSL/HSLA ---
    jsonHsl: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/hsl'],
      buildPath: 'build/json-hsl/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }]
    },
    // --- JSON: RGBA(항상 rgba() 포맷) ---
    jsonRgba: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/rgba-string-always'],
      buildPath: 'build/json-rgba/',
      files: [{ destination: 'tokens.json', format: 'json/nested' }]
    },
    // (선택) CSS 변수로도 내보내기
    cssHex: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/hex'],
      buildPath: 'build/css/',
      files: [{ destination: 'variables-hex.css', format: 'css/variables' }]
    },
    cssHsl: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/hsl'],
      buildPath: 'build/css/',
      files: [{ destination: 'variables-hsl.css', format: 'css/variables' }]
    },
    cssRgba: {
      transformGroup: 'tokens-studio',
      transforms: ['name/kebab', 'color/rgba-string-always'],
      buildPath: 'build/css/',
      files: [{ destination: 'variables-rgba.css', format: 'css/variables' }]
    }
  }
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
