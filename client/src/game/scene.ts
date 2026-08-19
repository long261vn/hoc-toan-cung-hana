/**
 * Design philosophy: a calm, toy-like solar-system map. Babylon owns only
 * spatial feedback; the learning rules remain in the renderer-free quiz module.
 */

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Operation } from "./quiz";

export interface GameHandle {
  scene: Scene;
  setActivePlanet: (operation: Operation) => void;
  dispose: () => void;
}

const planetData: Array<{
  operation: Operation;
  position: Vector3;
  color: Color3;
  accent: Color3;
  radius: number;
}> = [
  {
    operation: "add",
    position: new Vector3(-6.2, 1.8, 0.2),
    color: Color3.FromHexString("#FF986E"),
    accent: Color3.FromHexString("#FFD8A7"),
    radius: 1.22,
  },
  {
    operation: "subtract",
    position: new Vector3(-2.4, 3.45, 0.4),
    color: Color3.FromHexString("#B8A7EC"),
    accent: Color3.FromHexString("#E7DDFF"),
    radius: 1.02,
  },
  {
    operation: "multiply",
    position: new Vector3(2.1, 1.15, 0.35),
    color: Color3.FromHexString("#6DDEC5"),
    accent: Color3.FromHexString("#D5FFF0"),
    radius: 1.34,
  },
  {
    operation: "divide",
    position: new Vector3(6.05, 3.25, 0.25),
    color: Color3.FromHexString("#F9D66B"),
    accent: Color3.FromHexString("#FFF0B6"),
    radius: 1.09,
  },
];

class SpaceMapWorld {
  private readonly planets = new Map<Operation, TransformNode>();
  private activeOperation: Operation = "add";

  constructor(private readonly scene: Scene) {
    this.createSpace();
    this.createPlanets();
    this.createShip();
    this.setActivePlanet("add");
  }

  private material(name: string, hex: string, emission = 0.05) {
    const material = new StandardMaterial(name, this.scene);
    material.diffuseColor = Color3.FromHexString(hex);
    material.specularColor = Color3.FromHexString("#FFFFFF").scale(0.22);
    material.emissiveColor = Color3.FromHexString(hex).scale(emission);
    return material;
  }

  private createSpace() {
    const orbitMaterial = this.material("orbitMaterial", "#7687D7", 0.9);
    const route = [
      new Vector3(-7.6, 0.35, 1.3),
      new Vector3(-6.2, 1.7, 0.2),
      new Vector3(-4.4, 3.35, 0.7),
      new Vector3(-2.4, 3.45, 0.4),
      new Vector3(-0.2, 2.15, 1.2),
      new Vector3(2.1, 1.15, 0.35),
      new Vector3(4.2, 2.2, 0.8),
      new Vector3(6.05, 3.25, 0.25),
      new Vector3(7.7, 2.1, 0.9),
    ];
    const orbit = MeshBuilder.CreateDashedLines(
      "learningOrbit",
      { points: route, dashNb: 68, dashSize: 0.22, gapSize: 0.15 },
      this.scene,
    );
    orbit.color = Color3.FromHexString("#8295E3");
    orbit.alpha = 0.72;
    orbit.material = orbitMaterial;

    const starMaterial = this.material("stars", "#FFF6D5", 0.7);
    for (let i = 0; i < 54; i += 1) {
      const x = -10 + ((i * 47) % 200) / 10;
      const y = -3 + ((i * 71) % 105) / 18;
      const z = 2 + ((i * 31) % 40) / 12;
      const star = MeshBuilder.CreateSphere(`star-${i}`, { diameter: i % 9 === 0 ? 0.12 : 0.05 }, this.scene);
      star.position.set(x, y, z);
      star.material = starMaterial;
    }
  }

  private createPlanets() {
    for (const data of planetData) {
      const pivot = new TransformNode(`pivot-${data.operation}`, this.scene);
      pivot.position = data.position.clone();
      const planet = MeshBuilder.CreateSphere(
        `planet-${data.operation}`,
        { diameter: data.radius * 2, segments: 24 },
        this.scene,
      );
      planet.parent = pivot;
      planet.material = this.material(`planet-material-${data.operation}`, data.color.toHexString(), 0.12);

      const crater = MeshBuilder.CreateSphere(
        `crater-${data.operation}`,
        { diameter: data.radius * 0.34, segments: 12 },
        this.scene,
      );
      crater.parent = pivot;
      crater.position = new Vector3(-data.radius * 0.42, data.radius * 0.22, -data.radius * 0.78);
      crater.scaling.y = 0.34;
      crater.material = this.material(`crater-material-${data.operation}`, data.accent.toHexString(), 0.22);

      if (data.operation === "multiply") {
        const ring = MeshBuilder.CreateTorus("multiply-ring", { diameter: data.radius * 2.7, thickness: 0.12, tessellation: 36 }, this.scene);
        ring.parent = pivot;
        ring.rotation.x = Math.PI * 0.36;
        ring.material = this.material("multiply-ring-material", "#FFE798", 0.28);
      }
      if (data.operation === "add") {
        for (const direction of [-1, 1]) {
          const moon = MeshBuilder.CreateSphere(`add-moon-${direction}`, { diameter: 0.28, segments: 12 }, this.scene);
          moon.parent = pivot;
          moon.position = new Vector3(direction * 1.35, 0.45, 0.12);
          moon.material = this.material(`add-moon-material-${direction}`, "#FFD9B6", 0.25);
        }
      }
      if (data.operation === "divide") {
        const band = MeshBuilder.CreateTorus("divide-band", { diameter: data.radius * 2.04, thickness: 0.1, tessellation: 36 }, this.scene);
        band.parent = pivot;
        band.rotation.x = Math.PI / 2;
        band.material = this.material("divide-band-material", "#FFF2BF", 0.2);
      }
      this.planets.set(data.operation, pivot);
    }
  }

  private createShip() {
    const ship = new TransformNode("ship", this.scene);
    ship.position = new Vector3(-0.15, -0.42, 0.15);
    const body = MeshBuilder.CreateSphere("ship-body", { diameter: 1.1, segments: 18 }, this.scene);
    body.parent = ship;
    body.scaling.y = 0.78;
    body.material = this.material("ship-body-material", "#FFF3D7", 0.12);

    const window = MeshBuilder.CreateSphere("ship-window", { diameter: 0.55, segments: 18 }, this.scene);
    window.parent = ship;
    window.position.z = -0.42;
    window.material = this.material("ship-window-material", "#22366F", 0.35);

    const antenna = MeshBuilder.CreateCylinder("ship-antenna", { height: 0.58, diameter: 0.08, tessellation: 12 }, this.scene);
    antenna.parent = ship;
    antenna.position.y = 0.73;
    antenna.rotation.z = -0.35;
    antenna.material = this.material("ship-antenna-material", "#65D9C0", 0.35);

    const flame = MeshBuilder.CreateSphere("ship-flame", { diameter: 0.35, segments: 12 }, this.scene);
    flame.parent = ship;
    flame.position = new Vector3(0, -0.56, 0.2);
    flame.scaling.y = 1.8;
    flame.material = this.material("ship-flame-material", "#FF6B4A", 0.7);
  }

  setActivePlanet(operation: Operation) {
    this.activeOperation = operation;
    this.planets.forEach((pivot, name) => {
      const isActive = name === operation;
      pivot.scaling.setAll(isActive ? 1.19 : 1);
      pivot.position.y = planetData.find((planet) => planet.operation === name)?.position.y ?? pivot.position.y;
      if (isActive) pivot.position.y += 0.18;
    });
  }

  update(delta: number, elapsed: number) {
    this.planets.forEach((pivot, operation) => {
      const base = planetData.find((planet) => planet.operation === operation)?.position.y ?? 0;
      const phase = planetData.findIndex((planet) => planet.operation === operation) * 1.2;
      pivot.rotation.y += delta * 0.22;
      pivot.position.y = base + (operation === this.activeOperation ? 0.18 : 0) + Math.sin(elapsed * 0.9 + phase) * 0.05;
    });
  }

  dispose() {
    this.planets.clear();
  }
}

export async function createGameScene(engine: Engine, _canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.051, 0.16, 0);

  const camera = new ArcRotateCamera(
    "spaceCamera",
    -Math.PI / 2,
    Math.PI / 3.05,
    22,
    new Vector3(0, 0.5, 0),
    scene,
  );
  camera.lowerRadiusLimit = 22;
  camera.upperRadiusLimit = 22;
  camera.lowerBetaLimit = Math.PI / 3.05;
  camera.upperBetaLimit = Math.PI / 3.05;

  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 1.15;
  ambient.diffuse = Color3.FromHexString("#D5DCFF");
  ambient.groundColor = Color3.FromHexString("#18245A");

  const coralLight = new PointLight("coralLight", new Vector3(-2, 2.5, -3), scene);
  coralLight.intensity = 26;
  coralLight.diffuse = Color3.FromHexString("#FF8F73");
  const tealLight = new PointLight("tealLight", new Vector3(4, 0.4, -2), scene);
  tealLight.intensity = 18;
  tealLight.diffuse = Color3.FromHexString("#70E2CC");

  const world = new SpaceMapWorld(scene);
  let elapsed = 0;
  scene.onBeforeRenderObservable.add(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    elapsed += delta;
    world.update(delta, elapsed);
  });

  return {
    scene,
    setActivePlanet: (operation) => world.setActivePlanet(operation),
    dispose: () => {
      world.dispose();
      scene.dispose();
    },
  };
}
