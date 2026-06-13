# safelight-advanced-rendering

A [SafeLight](https://github.com/your-org/safelight) extension that adds selectable display transforms (tone mappers) to **Preferences ▸ Rendering**.

## Transforms

| Name | Description |
|---|---|
| **AgX** | Blender's default view transform. Wide dynamic range, smooth hue-stable highlight rolloff, low contrast. |
| **AgX Punchy** | AgX + extra contrast and saturation. |
| **AgX Golden** | AgX + warm, slightly desaturated film tone. |
| **ACES Filmic** | Narkowicz ACES fit. Strong shoulder, deep contrast, saturated — the common game/film look. |
| **Hable Filmic** | Uncharted 2 operator. Filmic toe and shoulder with a true white point; more neutral mids than ACES. |
| **Hejl-Dawson Filmic** | Hejl–Burgess-Dawson curve. Crunchy contrast with lifted blacks; fast and punchy. |
| **PBR Neutral** | Khronos PBR Neutral. Hue-preserving, color-faithful below the knee with a gentle desaturating highlight shoulder. |
| **Reinhard** | Classic x/(1+x) per channel. Soft and flat; nothing ever clips. |
| **Reinhard (Luminance)** | Extended Reinhard on luminance with a white point. Hue-preserving and reaches true white. |
| **Linear (no tone map)** | Straight sRGB encode, base curve off. Highlights clip hard — useful for inspecting raw sensor data. |

All replacement transforms disable SafeLight's default RAW base curve and interpret tone sliders through their own response. The same edit will read differently between transforms by design.

## Installation

Search for **Advanced Rendering** in SafeLight's Extensions panel, or install manually by pasting the repo URL into the Extensions panel.

## Development

```bash
npm install
npm run build      # → dist/index.js
npm run dev        # watch mode
npm run typecheck  # tsc --noEmit
```

To test locally, symlink or copy the folder into SafeLight's plugin directory:

```
<userData>/plugins/advanced-rendering/
```

The folder must contain `safelight.json` and the built `dist/index.js`.

## How it works

SafeLight's WebGL renderer accepts a pluggable GLSL snippet defining:

```glsl
vec3 pipelineToDisplay(vec3 lin)
```

where `lin` is scene-linear sRGB (HDR, may exceed 1.0) and the return value is the display-encoded output. The following helpers from the develop shader are in scope: `luma(vec3)`, `linearToSrgb(vec3)`, `linearToSrgbU(vec3)`.

Each pipeline is registered via `api.registerPipeline()` in `activate()`. SafeLight compiles and caches a WebGL program per unique GLSL signature — switching transforms is an O(1) program swap with no recompile.

## License

MIT
