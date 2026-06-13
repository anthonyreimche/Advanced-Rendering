const n = (e) => `
vec3 agxContrast(vec3 x) {
  vec3 x2 = x * x;
  vec3 x4 = x2 * x2;
  return  15.5    * x4 * x2
        - 40.14   * x4 * x
        + 31.96   * x4
        -  6.868  * x2 * x
        +  0.4298 * x2
        +  0.1191 * x
        -  0.00232;
}
vec3 pipelineToDisplay(vec3 lin) {
  const mat3 agx_mat = mat3(
    0.842479062253094,  0.0423282422610123, 0.0423756549057051,
    0.0784335999999992, 0.878468636469772,  0.0784336,
    0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  const mat3 agx_mat_inv = mat3(
     1.19687900512017,   -0.0528968517574562, -0.0529716355144438,
    -0.0980208811401368,  1.15190312990417,   -0.0980434501171241,
    -0.0990297440797205, -0.0989611768448433,  1.15107367264116);
  const float min_ev = -12.47393;
  const float max_ev = 4.026069;
  vec3 v = agx_mat * max(lin, 0.0);
  v = clamp(log2(max(v, vec3(1e-10))), min_ev, max_ev);
  v = (v - min_ev) / (max_ev - min_ev);
  v = agxContrast(v);
${e}
  v = agx_mat_inv * v;
  return clamp(v, 0.0, 1.0);
}`, i = `  float lw = dot(v, vec3(0.2126, 0.7152, 0.0722));
  v = pow(max(v, 0.0), vec3(1.35));
  v = lw + 1.4 * (v - lw);`, t = `  float lw = dot(v, vec3(0.2126, 0.7152, 0.0722));
  v = pow(max(v * vec3(1.0, 0.9, 0.5), 0.0), vec3(0.8));
  v = lw + 0.8 * (v - lw);`, a = `
vec3 pipelineToDisplay(vec3 lin) {
  vec3 x = max(lin, 0.0) * 0.6;
  return linearToSrgb((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14));
}`, r = `
vec3 hablePartial(vec3 x) {
  const float A = 0.15; const float B = 0.50; const float C = 0.10;
  const float D = 0.20; const float E = 0.02; const float F = 0.30;
  return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;
}
vec3 pipelineToDisplay(vec3 lin) {
  vec3 x = max(lin, 0.0) * 2.0;
  vec3 whiteScale = vec3(1.0) / hablePartial(vec3(11.2));
  return linearToSrgb(hablePartial(x) * whiteScale);
}`, l = `
vec3 pipelineToDisplay(vec3 lin) {
  vec3 x = max(vec3(0.0), lin - 0.004);
  return (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
}`, o = `
vec3 pipelineToDisplay(vec3 lin) {
  vec3 c = max(lin, 0.0);
  const float startCompression = 0.8 - 0.04;
  const float desaturation = 0.15;
  float x = min(c.r, min(c.g, c.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  c -= offset;
  float peak = max(c.r, max(c.g, c.b));
  if (peak < startCompression) return linearToSrgb(c);
  float d = 1.0 - startCompression;
  float newPeak = 1.0 - d * d / (peak + d - startCompression);
  c *= newPeak / peak;
  float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
  return linearToSrgb(mix(c, vec3(newPeak), g));
}`, s = `
vec3 pipelineToDisplay(vec3 lin) {
  vec3 x = max(lin, 0.0);
  return linearToSrgb(x / (1.0 + x));
}`, c = `
vec3 pipelineToDisplay(vec3 lin) {
  vec3 c = max(lin, 0.0);
  float l = max(luma(c), 1e-4);
  float ln = l * (1.0 + l / 16.0) / (1.0 + l);
  return linearToSrgb(c * (ln / l));
}`, v = `
vec3 pipelineToDisplay(vec3 lin) {
  return linearToSrgbU(lin);
}`;
function g(e) {
  e.registerPipeline({
    id: "rendering.agx",
    name: "AgX",
    description: "Blender's default view transform. Very wide dynamic range with smooth, hue-stable highlight rolloff; intentionally low contrast.",
    glsl: n(""),
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.agx-punchy",
    name: "AgX Punchy",
    description: "AgX with the 'punchy' look: extra contrast and saturation.",
    glsl: n(i),
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.agx-golden",
    name: "AgX Golden",
    description: "AgX with the 'golden' look: warm, slightly desaturated film tone.",
    glsl: n(t),
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.aces",
    name: "ACES Filmic",
    description: "Narkowicz ACES fit — strong shoulder, deep contrast, saturated. The common game/film look.",
    glsl: a,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.hable",
    name: "Hable Filmic",
    description: "Uncharted 2 operator: filmic toe and shoulder with a true white point; more neutral mids than ACES.",
    glsl: r,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.hejl",
    name: "Hejl-Dawson Filmic",
    description: "Hejl–Burgess-Dawson curve: crunchy filmic contrast with lifted blacks crushed back; fast and punchy.",
    glsl: l,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.pbr-neutral",
    name: "PBR Neutral",
    description: "Khronos PBR Neutral: hue-preserving, color-faithful below the knee with a gentle desaturating highlight shoulder.",
    glsl: o,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.reinhard",
    name: "Reinhard",
    description: "Classic x/(1+x) per channel. Soft and flat; nothing ever clips.",
    glsl: s,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.reinhard-luma",
    name: "Reinhard (Luminance)",
    description: "Extended Reinhard on luminance with a white point: hue-preserving and reaches true white.",
    glsl: c,
    skipBaseCurve: !0
  }), e.registerPipeline({
    id: "rendering.linear",
    name: "Linear (no tone map)",
    description: "Straight sRGB encode of scene-linear data, base curve off. Highlights clip hard — useful for inspecting raw sensor data.",
    glsl: v,
    skipBaseCurve: !0
  });
}
function d() {
}
export {
  g as activate,
  d as deactivate
};
//# sourceMappingURL=index.js.map
