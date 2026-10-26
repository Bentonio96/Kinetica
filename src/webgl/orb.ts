/**
 * The iridescent orb: a raymarched, gently deforming sphere with a thin-film
 * colour shift, drawn on a single full-canvas triangle with raw WebGL2. No
 * three.js: the whole scene is one shader, so the library would be 150 KB of
 * code for a quad.
 *
 * The orb leans towards the pointer, bulges where the pointer is, gets
 * restless as you scroll away from it and ripples when you click. Its colour
 * film drifts slowly on its own.
 *
 * Cost control: rays that miss a bounding sphere return at once, the march
 * has fewer steps on phones, the canvas renders below device resolution, and
 * the render scale drops further if frames run long. The loop stops when the
 * hero is off screen or the tab is hidden.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uPulse;
uniform vec3 uFrame; // centre x, centre y (in units of height), radius
uniform int uSteps;
out vec4 outColor;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

float map(vec3 p) {
  float t = uTime;
  p.xz *= rot(uMouse.x * 0.7 + t * 0.12);
  p.yz *= rot(-uMouse.y * 0.5 + sin(t * 0.21) * 0.2);
  float d = length(p) - 1.0;
  float amp = 0.09 + uScroll * 0.22 + uPulse * 0.12;
  float w = sin(p.x * 2.3 + t * 0.9) * sin(p.y * 2.6 + t * 1.07) * sin(p.z * 2.1 + t * 0.73);
  float w2 = sin(p.x * 4.7 + p.y * 2.3 - t * 1.4) * sin(p.z * 3.9 + t * 0.6);
  d += amp * (w + 0.35 * w2);
  // A ripple running over the surface after a click.
  d += uPulse * 0.05 * sin(length(p.xy) * 14.0 - t * 9.0);
  return d * 0.72;
}

vec3 normalAt(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.0015;
  return normalize(
    k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) +
    k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));
}

vec3 film(float x) {
  // Thin-film interference, approximated as a phase-shifted cosine palette.
  return 0.5 + 0.5 * cos(6.28318 * (x + vec3(0.0, 0.33, 0.67)));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv = (uv - uFrame.xy) / uFrame.z;

  // The orb also slides a little towards the pointer.
  uv -= uMouse * 0.06;

  vec3 ro = vec3(0.0, 0.0, 3.4);
  vec3 rd = normalize(vec3(uv, -2.0));

  // Bounding sphere: most of the canvas never marches at all.
  float b = dot(ro, rd);
  float c = dot(ro, ro) - 1.7 * 1.7;
  float disc = b * b - c;
  vec4 col = vec4(0.0);
  float minD = 10.0;

  if (disc > 0.0) {
    float t = -b - sqrt(disc);
    bool hit = false;
    vec3 p;
    for (int i = 0; i < 96; i++) {
      if (i >= uSteps) break;
      p = ro + rd * t;
      float d = map(p);
      minD = min(minD, d);
      if (d < 0.0012) { hit = true; break; }
      t += d;
      if (t > 6.0) break;
    }
    if (hit) {
      vec3 n = normalAt(p);
      vec3 v = -rd;
      float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
      vec3 l = normalize(vec3(-0.5 + uMouse.x * 0.6, 0.8 + uMouse.y * 0.4, 0.6));
      float diff = max(dot(n, l), 0.0);
      float spec = pow(max(dot(reflect(-l, n), v), 0.0), 48.0);
      float phase = dot(n, vec3(0.35, 0.6, 0.2)) * 1.3 + fres * 1.6 + uTime * 0.04 + uScroll * 0.5;
      vec3 irid = film(phase);
      // Pearl body: pale in the centre, saturated film at the rim.
      vec3 pearl = vec3(0.95, 0.94, 0.97) * (0.72 + 0.28 * diff);
      vec3 rgb = mix(pearl, irid, 0.38 + 0.55 * fres);
      rgb += spec * 0.9;
      rgb *= 0.86 + 0.14 * diff;
      col = vec4(rgb, 1.0);
    }
  }

  // A soft coloured halo outside the silhouette, which also antialiases it.
  if (col.a < 1.0) {
    float halo = exp(-max(minD, 0.0) * 9.0) * 0.32;
    vec3 hc = film(atan(uv.y, uv.x) * 0.16 + uTime * 0.05);
    col = vec4(hc * halo, halo);
  }

  outColor = col;
}
`

export interface OrbOptions {
  /** Phones: fewer steps, lower resolution. */
  readonly lite: boolean
  /** Draw one frame and stop (reduced motion). */
  readonly still: boolean
}

export interface Orb {
  setScroll(progress: number): void
  setFrame(x: number, y: number, radius: number): void
  pulse(): void
  setVisible(visible: boolean): void
  destroy(): void
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('shader')
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader')
  return shader
}

export function createOrb(
  canvas: HTMLCanvasElement,
  { lite, still }: OrbOptions,
): Orb | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    powerPreference: lite ? 'low-power' : 'high-performance',
  })
  if (!gl) return null

  let program: WebGLProgram
  try {
    program = gl.createProgram()
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  } catch {
    return null
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  )
  const loc = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  const u = {
    res: gl.getUniformLocation(program, 'uRes'),
    time: gl.getUniformLocation(program, 'uTime'),
    mouse: gl.getUniformLocation(program, 'uMouse'),
    scroll: gl.getUniformLocation(program, 'uScroll'),
    pulse: gl.getUniformLocation(program, 'uPulse'),
    frame: gl.getUniformLocation(program, 'uFrame'),
    steps: gl.getUniformLocation(program, 'uSteps'),
  }
  gl.uniform1i(u.steps, lite ? 44 : 72)

  const maxScale = lite ? 0.75 : 1
  let scale = maxScale
  const frame = { x: 0.35, y: 0, r: 0.42 }
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
  let scroll = 0
  let pulse = 0
  let raf = 0
  let visible = true
  let running = false
  let last = performance.now()
  let elapsed = 7 // start mid-motion, not from a symmetric pose
  let slow = 0
  let frames = 0

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * scale
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl!.viewport(0, 0, w, h)
    }
  }

  function draw() {
    resize()
    gl!.uniform2f(u.res, canvas.width, canvas.height)
    gl!.uniform1f(u.time, elapsed)
    gl!.uniform2f(u.mouse, mouse.x, mouse.y)
    gl!.uniform1f(u.scroll, scroll)
    gl!.uniform1f(u.pulse, pulse)
    gl!.uniform3f(u.frame, frame.x, frame.y, frame.r)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }

  function tick(now: number) {
    raf = 0
    const dt = Math.min((now - last) / 1000, 0.1)
    last = now
    elapsed += dt
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3)
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3)
    pulse = Math.max(0, pulse - dt * 0.9)

    // Adaptive quality: after the first second, sustained long frames step
    // the render scale down, never below half.
    frames++
    if (frames > 60) {
      slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 1)
      if (slow > 30 && scale > 0.5) {
        scale = Math.max(0.5, scale * 0.8)
        slow = 0
      }
    }

    draw()
    if (running) raf = requestAnimationFrame(tick)
  }

  function start() {
    if (still || running || !visible || document.hidden) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  const onPointer = (event: PointerEvent) => {
    mouse.tx = (event.clientX / window.innerWidth) * 2 - 1
    mouse.ty = -((event.clientY / window.innerHeight) * 2 - 1)
  }
  const onVisibility = () => (document.hidden ? stop() : start())
  const onResize = () => {
    if (!running) draw()
  }

  if (!still) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
  }
  window.addEventListener('resize', onResize)

  draw()
  start()

  return {
    setScroll(progress) {
      scroll = progress
    },
    setFrame(x, y, r) {
      frame.x = x
      frame.y = y
      frame.r = r
      if (!running) draw()
    },
    pulse() {
      pulse = 1
    },
    setVisible(next) {
      visible = next
      if (next) start()
      else stop()
    },
    destroy() {
      stop()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    },
  }
}
