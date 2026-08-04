/**
 * THE WHITE CREATOR
 * ---------------------------------------------------------------
 * A single canvas-rendered liquid entity. Everything it does is
 * physics-driven: spring position, viscosity, squash & stretch,
 * surface-tension wobble, droplets, splashes, embers and smoke.
 *
 * The engine knows nothing about the page. Chapters simply issue a
 * `Command` every frame (where to be, how big, how urgent) and the
 * creature interprets it with its own body.
 */

export type Command = {
  x: number;
  y: number;
  /** base radius in px */
  r?: number;
  /** 0 = lazy drift, 1 = decisive lunge */
  urgency?: number;
  /** creature dissolves out of sight (still simulated) */
  hidden?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  max: number;
  kind: "ink" | "ember" | "smoke";
  spin: number;
};

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);

export class Creature {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  r = 26;
  opacity = 1;
  t = 0;

  private blinkAt = -1;
  private nextBlink = 2.4;
  private dropAt = 3.4;
  private particles: Particle[] = [];

  place(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /** Thick-liquid spring integration. */
  update(dt: number, cmd: Command) {
    this.t += dt;
    const urgency = cmd.urgency ?? 0.25;

    // heavier body => lower stiffness; urgency tightens the muscle
    const k = 42 + urgency * 340;
    const damping = 2 * Math.sqrt(k) * (0.78 - urgency * 0.1);

    // a touch of organic imperfection so motion is never mathematical
    const noise =
      Math.sin(this.t * 0.7) * 0.6 + Math.sin(this.t * 1.9 + 1.3) * 0.35;

    this.vx += ((cmd.x + noise - this.x) * k - this.vx * damping) * dt;
    this.vy += ((cmd.y - noise - this.y) * k - this.vy * damping) * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.r += ((cmd.r ?? 26) - this.r) * Math.min(1, dt * 5);
    const targetOpacity = cmd.hidden ? 0 : 1;
    this.opacity += (targetOpacity - this.opacity) * Math.min(1, dt * 6);

    // blink
    if (this.blinkAt < 0 && this.t > this.nextBlink) this.blinkAt = this.t;

    // idle droplet that immediately rejoins the body
    const speed = Math.hypot(this.vx, this.vy);
    if (this.t > this.dropAt && speed < 40) {
      this.dropAt = this.t + 4 + Math.random() * 5;
      this.particles.push({
        x: this.x + (Math.random() - 0.5) * this.r,
        y: this.y + this.r * 0.7,
        vx: (Math.random() - 0.5) * 20,
        vy: 30 + Math.random() * 40,
        r: this.r * (0.1 + Math.random() * 0.1),
        life: 0,
        max: 0.85,
        kind: "ink",
        spin: 0,
      });
    }

    // motion sheds droplets naturally (viscous tearing)
    if (speed > 900 && Math.random() < dt * 34) {
      const a = Math.atan2(this.vy, this.vx) + Math.PI + (Math.random() - 0.5);
      this.particles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(a) * speed * 0.22,
        vy: Math.sin(a) * speed * 0.22 - 40,
        r: this.r * (0.08 + Math.random() * 0.16),
        life: 0,
        max: 0.7 + Math.random() * 0.5,
        kind: "ink",
        spin: 0,
      });
    }

    this.stepParticles(dt);
  }

  private stepParticles(dt: number) {
    const list = this.particles;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.life += dt;
      if (p.life >= p.max) {
        list.splice(i, 1);
        continue;
      }
      if (p.kind === "ink") {
        p.vy += 620 * dt;
        // surface tension: droplets are drawn back to the body
        const dx = this.x - p.x;
        const dy = this.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < this.r * 6) {
          p.vx += (dx / d) * 420 * dt;
          p.vy += (dy / d) * 420 * dt;
        }
      } else if (p.kind === "ember") {
        p.vy -= 340 * dt;
        p.vx += Math.sin(p.life * 14 + p.spin) * 90 * dt;
      } else {
        p.vy -= 90 * dt;
        p.vx += Math.sin(p.life * 2 + p.spin) * 26 * dt;
        p.r += 46 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    if (list.length > 320) list.splice(0, list.length - 320);
  }

  splash(x: number, y: number, power = 1, dir = -1) {
    const n = Math.round(10 * power);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const s = (180 + Math.random() * 520) * power;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y,
        vx: Math.cos(a) * s * 0.6 * -dir,
        vy: Math.sin(a) * s,
        r: 2 + Math.random() * 9 * power,
        life: 0,
        max: 0.6 + Math.random() * 0.7,
        kind: "ink",
        spin: 0,
      });
    }
  }

  fire(x: number, y: number, power = 1) {
    for (let i = 0; i < Math.round(6 * power); i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60 * power,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 130,
        vy: -60 - Math.random() * 200,
        r: 1.2 + Math.random() * 3.4,
        life: 0,
        max: 0.35 + Math.random() * 0.5,
        kind: "ember",
        spin: Math.random() * 6,
      });
    }
    if (Math.random() < 0.5 * power) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 70,
        y: y - 10,
        vx: (Math.random() - 0.5) * 60,
        vy: -50 - Math.random() * 60,
        r: 14 + Math.random() * 22,
        life: 0,
        max: 1.3 + Math.random(),
        kind: "smoke",
        spin: Math.random() * 6,
      });
    }
  }

  /** current blink amount, 0..1 */
  private blinkAmount() {
    if (this.blinkAt < 0) return 0;
    const p = (this.t - this.blinkAt) / 0.4;
    if (p >= 1) {
      this.blinkAt = -1;
      this.nextBlink = this.t + 3 + Math.random() * 4;
      return 0;
    }
    const e = p < 0.45 ? p / 0.45 : 1 - (p - 0.45) / 0.55;
    return e * e * (3 - 2 * e);
  }

  render(ctx: CanvasRenderingContext2D) {
    // particles first, body on top
    for (const p of this.particles) {
      const life = 1 - p.life / p.max;
      if (p.kind === "smoke") {
        ctx.globalAlpha = life * 0.1;
        ctx.fillStyle = "#ffffff";
      } else if (p.kind === "ember") {
        ctx.globalAlpha = life;
        ctx.fillStyle = life > 0.55 ? "#dff1ff" : "#ffffff";
      } else {
        ctx.globalAlpha = Math.min(1, life * 1.6) * this.opacity;
        ctx.fillStyle = "#ffffff";
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.4, p.r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (this.opacity < 0.01) return;

    const speed = Math.hypot(this.vx, this.vy);
    const stretch = Math.min(speed / 2600, 0.46);
    const angle = Math.atan2(this.vy, this.vx);
    const breathe = 1 + Math.sin(this.t * 1.15) * 0.04;
    const lid = this.blinkAmount();

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.scale(
      breathe * (1 + stretch),
      breathe * (1 - stretch * 0.7) * (1 - lid * 0.84),
    );
    ctx.rotate(-angle);

    // viscous silhouette: low-frequency harmonics, never a perfect circle
    ctx.beginPath();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const wob =
        1 +
        Math.sin(a * 3 + this.t * 1.1) * 0.045 +
        Math.sin(a * 2 - this.t * 0.8) * 0.035 +
        Math.sin(a * 5 + this.t * 1.7) * 0.018;
      const rr = this.r * wob;
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * Chapter 1's ink surf: a dense wave of white paint sweeping in from the
   * right. `p` runs 0..1; the crest position is returned so the creature can
   * ride it.
   */
  drawWave(
    ctx: CanvasRenderingContext2D,
    p: number,
    w: number,
    h: number,
  ): { x: number; y: number } {
    const e = clamp(p);
    const ease = 1 - Math.pow(1 - e, 2.2);
    const crestX = w * 1.25 - ease * (w * 0.95);
    const baseY = h * 0.62;
    const settle = clamp((e - 0.62) / 0.38);
    const crestY = baseY - (1 - settle) * h * 0.16;

    if (e <= 0 || e >= 1) return { x: crestX, y: crestY };

    ctx.save();
    ctx.globalAlpha = 1 - settle * 0.15;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(w + 200, h + 200);
    ctx.lineTo(w + 200, crestY - 40);

    // curling crest -> flowing tail
    const curl = (1 - settle) * 110;
    ctx.bezierCurveTo(
      crestX + 260,
      crestY - 30,
      crestX + 90,
      crestY - curl - 60,
      crestX,
      crestY - curl * 0.4,
    );
    ctx.bezierCurveTo(
      crestX - 70,
      crestY + curl * 0.5,
      crestX - 150,
      crestY + 70 + settle * 40,
      crestX - 240 - settle * w * 0.4,
      h + 200,
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    return { x: crestX, y: crestY - curl * 0.5 - 14 };
  }
}
