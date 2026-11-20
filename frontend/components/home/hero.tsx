"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { ChevronDown } from "lucide-react";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const seeded = (seed: number) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

const COL = {
  sand: 0xf6c992, deep: 0x30525c, mist: 0xacc0d3,
  rose: 0xd396a6, teal: 0x09a1a1, steel: 0x5484a4,
};

/* ───────── protein: helices around a pocket that opens toward -x ───────── */
function buildProtein() {
  const rand = seeded(7);
  const group = new THREE.Group();
  const OPEN = new THREE.Vector3(-1, 0, 0);
  const spots: { c: THREE.Vector3; d: THREE.Vector3; dir: THREE.Vector3 }[] = [];
  let tries = 0;
  while (spots.length < 9 && tries < 600) {
    tries++;
    const dir = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    if (dir.angleTo(OPEN) < 0.95) continue;
    if (spots.some((s) => s.dir.angleTo(dir) < 0.55)) continue;
    const rnd = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5);
    const d = rnd.sub(dir.clone().multiplyScalar(rnd.dot(dir))).normalize();
    spots.push({ c: dir.clone().multiplyScalar(1.45), d, dir });
  }

  const palette = [COL.steel, COL.mist, COL.deep];
  const L = 2.3, r = 0.24, pitch = 0.34;
  spots.forEach((s, i) => {
    const u = s.dir.clone();
    const v = new THREE.Vector3().crossVectors(s.d, u).normalize();
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 140; k++) {
      const t = (k / 140 - 0.5) * L;
      const a = (t / pitch) * Math.PI * 2;
      pts.push(
        s.c.clone().addScaledVector(s.d, t).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r)
      );
    }
    const color = palette[i % 3];
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 280, 0.065, 8, false),
      new THREE.MeshStandardMaterial({
        color, emissive: color, emissiveIntensity: color === COL.deep ? 0.55 : 0.18,
        roughness: 0.45, metalness: 0.1,
      })
    );
    group.add(mesh);

    const next = spots[(i + 1) % spots.length];
    const a = s.c.clone().addScaledVector(s.d, L / 2);
    const b = next.c.clone().addScaledVector(next.d, -L / 2);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(2.0);
    group.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 40, 0.03, 6, false),
        new THREE.MeshStandardMaterial({ color: COL.mist, emissive: COL.mist, emissiveIntensity: 0.12, roughness: 0.6 })
      )
    );
  });

  // faint surface dust
  const dust: number[] = [];
  while (dust.length < 1500) {
    const p = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    if (p.angleTo(OPEN) < 0.8) continue;
    p.multiplyScalar(1.2 + rand() * 1.1);
    dust.push(p.x, p.y, p.z);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.Float32BufferAttribute(dust, 3));
  group.add(
    new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: COL.mist, size: 0.022, transparent: true, opacity: 0.55, depthWrite: false })
    )
  );

  // pocket residues (light up when the drug binds)
  const residues: THREE.Mesh[] = [];
  for (let i = 0; i < 10; i++) {
    const ang = Math.acos(1 - rand() * (1 - Math.cos(0.7)));
    const phi = rand() * Math.PI * 2;
    const dir = new THREE.Vector3(-Math.cos(ang), Math.sin(ang) * Math.cos(phi), Math.sin(ang) * Math.sin(phi));
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 16, 16),
      new THREE.MeshStandardMaterial({ color: COL.rose, emissive: COL.rose, emissiveIntensity: 0.3, roughness: 0.4 })
    );
    m.position.copy(dir.multiplyScalar(0.78 + rand() * 0.25));
    group.add(m);
    residues.push(m);
  }
  return { group, residues };
}

/* ───────── drug: small ball-and-stick molecule ───────── */
function buildDrug() {
  type Atom = [string, number, number, number];
  const atoms: Atom[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    atoms.push(["C", Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0]);
  }
  atoms.push(
    ["N", 0.8, 0.22, 0.1], ["C", 1.15, -0.05, 0], ["O", 1.15, -0.5, 0.1],
    ["C", 1.5, 0.25, -0.1], ["C", 1.9, 0.05, 0.1], ["O", 2.15, 0.45, 0], ["F", -0.8, -0.05, 0]
  );
  const centroid = atoms.reduce((v, a) => v.add(new THREE.Vector3(a[1], a[2], a[3])), new THREE.Vector3()).multiplyScalar(1 / atoms.length);
  const style: Record<string, [number, number]> = {
    C: [COL.sand, 0.13], N: [COL.steel, 0.14], O: [COL.rose, 0.14], F: [COL.mist, 0.11],
  };
  const group = new THREE.Group();
  const pos = atoms.map((a) => new THREE.Vector3(a[1], a[2], a[3]).sub(centroid));
  const meshes = atoms.map((a, i) => {
    const [color, size] = style[a[0]];
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(size, 20, 20),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.22, roughness: 0.35, metalness: 0.1 })
    );
    m.position.copy(pos[i]);
    group.add(m);
    return m;
  });
  const bondMat = new THREE.MeshStandardMaterial({ color: COL.mist, emissive: COL.mist, emissiveIntensity: 0.15, roughness: 0.5 });
  for (let i = 0; i < pos.length; i++)
    for (let j = i + 1; j < pos.length; j++) {
      const dist = pos[i].distanceTo(pos[j]);
      if (dist > 0.62) continue;
      const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, dist, 8), bondMat);
      bond.position.copy(pos[i]).add(pos[j]).multiplyScalar(0.5);
      bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos[j].clone().sub(pos[i]).normalize());
      group.add(bond);
    }
  return { group, atoms: meshes };
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(9,161,161,0.9)");
  grad.addColorStop(0.4, "rgba(9,161,161,0.25)");
  grad.addColorStop(1, "rgba(9,161,161,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ───────── scene: scroll progress (0→1) drives the docking ───────── */
function HeroScene({ progress }: { progress: React.MutableRefObject<number> }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 6.5);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(COL.mist, 2.6);
    key.position.set(3, 4, 5);
    const rim = new THREE.DirectionalLight(COL.teal, 2.2);
    rim.position.set(-4, -2, 3);
    const warm = new THREE.PointLight(COL.sand, 14, 12);
    warm.position.set(0, 2.5, 4);
    scene.add(key, rim, warm);

    const protein = buildProtein();
    const drug = buildDrug();
    scene.add(protein.group, drug.group);

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })
    );
    scene.add(glow);

    const lineCount = protein.residues.length;
    const linePos = new Float32Array(lineCount * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    const lines = new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({ color: COL.teal, transparent: true, opacity: 0, depthWrite: false })
    );
    lines.frustumCulled = false;
    scene.add(lines);

    const startPos = new THREE.Vector3(-3.6, 1.5, 1.2);
    let drugScale = 0.55;
    const resize = () => {
      const w = mount.clientWidth, h = Math.max(mount.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w / h > 1.1;
      protein.group.position.set(wide ? 1.5 : 0.5, wide ? -0.1 : -0.7, 0);
      protein.group.scale.setScalar(wide ? 1 : 0.78);
      startPos.set(wide ? -3.6 : -2.1, wide ? 1.5 : 2.1, 1.2);
      drugScale = wide ? 0.55 : 0.44;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    const target = new THREE.Vector3(), control = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
    const rose = new THREE.Color(COL.rose), teal = new THREE.Color(COL.teal);
    let smoothP = progress.current, raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = reduced ? 0 : now / 1000;
      smoothP += (progress.current - smoothP) * 0.08;
      const p = smoothP;

      protein.group.rotation.set(Math.sin(t * 0.23) * 0.08, -0.25 + Math.sin(t * 0.3) * 0.12, 0);
      protein.group.updateMatrixWorld(true);
      target.set(-0.1, 0, 0);
      protein.group.localToWorld(target);

      const k = smooth(0.04, 0.85, p);
      control.set((startPos.x + target.x) / 2, startPos.y + 1.1, startPos.z + 1.6);
      const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
      drug.group.position.set(
        a * startPos.x + b * control.x + c * target.x,
        a * startPos.y + b * control.y + c * target.y,
        a * startPos.z + b * control.z + c * target.z
      );
      const s = smooth(0.45, 0.9, p), free = 1 - s;
      drug.group.rotation.set(
        (0.7 + t * 0.5) * free + 0.15 * s,
        (1.1 + t * 0.6) * free + 0.35 * s,
        0.3 * free + 0.5 * s
      );
      drug.group.scale.setScalar(drugScale);

      const bind = smooth(0.82, 1, p);
      protein.residues.forEach((m, i) => {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.color.lerpColors(rose, teal, bind);
        mat.emissive.copy(mat.color);
        mat.emissiveIntensity = 0.3 + bind * 1.3;
        m.scale.setScalar(1 + bind * 0.5);
        m.getWorldPosition(tmpA);
        drug.atoms[(i * 3) % drug.atoms.length].getWorldPosition(tmpB);
        linePos.set([tmpA.x, tmpA.y, tmpA.z, tmpB.x, tmpB.y, tmpB.z], i * 6);
      });
      lineGeo.attributes.position.needsUpdate = true;
      (lines.material as THREE.LineBasicMaterial).opacity = bind * 0.85;
      lines.visible = bind > 0.01;

      glow.position.copy(target);
      (glow.material as THREE.SpriteMaterial).opacity = bind * 0.55;
      glow.scale.setScalar(2.4 + Math.sin(t * 2) * 0.1 * bind);

      camera.position.x += (mx * 0.35 - camera.position.x) * 0.05;
      camera.position.y += (-my * 0.25 - camera.position.y) * 0.05;
      camera.lookAt(0.6, 0, 0);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}

/* ───────── hero: title, description, scroll-linked docking ───────── */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(r.height - window.innerHeight, 1));
      progress.current = p;
      if (titleRef.current) {
        titleRef.current.style.opacity = String(1 - smooth(0.12, 0.5, p));
        titleRef.current.style.transform = `translateY(${-p * 40}px)`;
      }
      if (cueRef.current) cueRef.current.style.opacity = String(1 - smooth(0, 0.06, p));
      if (ctaRef.current) {
        const o = smooth(0.8, 0.95, p);
        ctaRef.current.style.opacity = String(o);
        ctaRef.current.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[300vh]" aria-label="DeepDTA +">
      <div className="sticky top-0 h-screen overflow-hidden">
        <HeroScene progress={progress} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6),transparent_65%)]" />

        <div ref={titleRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="font-heading font-extrabold leading-none tracking-tight text-fg"
            style={{ fontSize: "clamp(3.5rem, 12vw, 9.5rem)" }}
          >
            DeepDTA <span className="text-brand-accent">+</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-fg-muted sm:text-lg">
            Predict how strongly a drug binds to its protein target, from a compound name to a clear verdict.
          </p>
        </div>

        <div ref={cueRef} className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 text-xs text-fg-subtle">
          Scroll to dock the drug
          <ChevronDown className="h-4 w-4" />
        </div>

        <div
          ref={ctaRef}
          className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-4 opacity-0"
          style={{ pointerEvents: "none" }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-accent">
            <span className="h-2 w-2 rounded-full bg-brand-accent" /> Bound
          </span>
          <Link
            href="/predict"
            className="inline-flex items-center rounded-md bg-brand-accent px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Predict a binding
          </Link>
        </div>
      </div>
    </section>
  );
}
