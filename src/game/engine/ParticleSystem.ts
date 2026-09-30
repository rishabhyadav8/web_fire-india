import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

interface Tracer {
  line: THREE.Line;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public group: THREE.Group;
  private particles: Particle[] = [];
  private tracers: Tracer[] = [];

  // Geometry pools
  private sparkGeo: THREE.BufferGeometry;
  private sparkMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.sparkGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  }

  public update(delta: number) {
    // 1. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.mesh.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 9.8 * delta; // gravity

      const progress = 1 - p.life / p.maxLife;
      const s = p.size * progress;
      p.mesh.scale.set(s, s, s);
    }

    // 2. Update bullet tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life += delta;
      if (t.life >= t.maxLife) {
        this.group.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      } else {
        const mat = t.line.material as THREE.LineBasicMaterial;
        mat.opacity = 1 - t.life / t.maxLife;
      }
    }
  }

  // Bullet tracer line from muzzle to hit position
  public addTracer(start: THREE.Vector3, end: THREE.Vector3, color: number = 0xffe066) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });
    const line = new THREE.Line(geo, mat);
    this.group.add(line);
    this.tracers.push({ line, life: 0, maxLife: 0.08 });
  }

  // Muzzle flash at weapon barrel
  public addMuzzleFlash(position: THREE.Vector3, color: number = 0xffaa00) {
    const flashGeo = new THREE.SphereGeometry(0.35, 6, 6);
    const flashMat = new THREE.MeshBasicMaterial({ color, wireframe: true });
    const mesh = new THREE.Mesh(flashGeo, flashMat);
    mesh.position.copy(position);
    this.group.add(mesh);

    const p: Particle = {
      mesh,
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0,
      maxLife: 0.05,
      color: new THREE.Color(color),
      size: 1,
    };
    this.particles.push(p);
  }

  // Hit impact sparks/blood
  public addImpact(position: THREE.Vector3, normal: THREE.Vector3, type: 'flesh' | 'metal' | 'dirt' = 'dirt') {
    const count = type === 'flesh' ? 8 : 6;
    const colorHex = type === 'flesh' ? 0xef4444 : type === 'metal' ? 0x38bdf8 : 0xd97706;

    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(this.sparkGeo.clone(), mat);
      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        normal.x + (Math.random() - 0.5) * 2,
        Math.max(normal.y, 0.4) + Math.random() * 2,
        normal.z + (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(4 + Math.random() * 5);

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.15,
        color: new THREE.Color(colorHex),
        size: 1.2,
      });
    }
  }

  // Elimination explosion
  public addEliminationBurst(position: THREE.Vector3) {
    for (let i = 0; i < 20; i++) {
      const colorHex = Math.random() > 0.5 ? 0xef4444 : 0xf59e0b;
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), mat);
      mesh.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        3 + Math.random() * 7,
        (Math.random() - 0.5) * 8
      );

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
        color: new THREE.Color(colorHex),
        size: 1.5,
      });
    }
  }

  public clear() {
    for (const p of this.particles) {
      this.group.remove(p.mesh);
    }
    for (const t of this.tracers) {
      this.group.remove(t.line);
    }
    this.particles = [];
    this.tracers = [];
  }
}
