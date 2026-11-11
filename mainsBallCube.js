import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ==============================
// シーン・カメラ・レンダラー
// ==============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 12, 22);
camera.lookAt(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ==============================
// OrbitControls
// ==============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ==============================
// ライト・座標軸
// ==============================
scene.add(new THREE.AmbientLight(0xffffff, 1.5));

const light = new THREE.PointLight(0xffffff, 80);
light.position.set(4, 6, 5);
scene.add(light);

scene.add(new THREE.AxesHelper(5));


// ==============================
// 車輪クラス
// ==============================
class wheel extends THREE.Object3D {
    constructor(radius, width, segments, color, x, y, z) {
        super();

        // 複製用に設定値を保存
        this.radius = radius;
        this.width = width;
        this.segments = segments;
        this.color = color;

        this.geometry = new THREE.CylinderGeometry(
            radius,
            radius,
            width,
            segments
        );

        this.material = new THREE.MeshStandardMaterial({
            color: color,
            wireframe: true
        });

        this.mesh = new THREE.Mesh(
            this.geometry,
            this.material
        );

        this.position.set(x, y, z);

        this.mesh.rotation.x = Math.PI / 2;

        this.add(this.mesh);
    }

    // 車輪の自転
    rotateWheel(speed) {
        this.rotation.z += speed;
    }

// 複製時の処理
clone() {
    const cloned = new wheel(
        this.radius,
        this.width,
        this.segments,
        this.color,
        this.position.x,
        this.position.y,
        this.position.z
    );

    cloned.rotation.copy(this.rotation);
    cloned.scale.copy(this.scale);

    return cloned;
}
}

// ==============================
// 回転の中心となる親グループ
// ==============================
const pivot = new THREE.Group();
scene.add(pivot);

// ==============================
// Toy Train本体
// ==============================
const train = new THREE.Group();

// 車体
const bodyGeometry = new THREE.BoxGeometry(3, 0.8, 1.2);
const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0x159447
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.set(0, 1, 0);
train.add(body);

// 運転席
const cabinGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.1);
const cabinMaterial = new THREE.MeshPhongMaterial({
    color: 0x2030cc
});
const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
cabin.position.set(-0.65, 2, 0);
train.add(cabin);

// 煙突
const chimneyGeometry = new THREE.CylinderGeometry(
    0.18, 0.25, 0.7, 32
);
const chimneyMaterial = new THREE.MeshPhongMaterial({
    color: 0x493333
});
const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
chimney.position.set(0.9, 1.75, 0);
train.add(chimney);

// ==============================
// 元の大車輪のコード
// wheelクラスに置き換えたためコメントアウト
// ==============================

/*
const wheelBigGeometry = new THREE.CylinderGeometry(
    0.48, 0.48, 0.18, 32
);
const wheelBigMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000
});
const wheelBigMesh = new THREE.Mesh(
    wheelBigGeometry,
    wheelBigMaterial
);
*/

// ==============================
// 大車輪2つ：煙突側
// ==============================
const wheelBig1 = new wheel(
    0.48, 0.18, 32, 0xff0000,
    1.0, 0.48, 0.68
);

const wheelBig2 = new wheel(
    0.48, 0.18, 32, 0xff0000,
    1.0, 0.48, -0.68
);

train.add(wheelBig1);
train.add(wheelBig2);

// ==============================
// 小車輪4つ：後方
// ==============================
const wheelSmall1 = new wheel(
    0.22, 0.14, 32, 0xff0000,
    -1.2, 0.35, 0.68
);

const wheelSmall2 = new wheel(
    0.22, 0.14, 32, 0xff0000,
    -1.2, 0.35, -0.68
);

const wheelSmall3 = new wheel(
    0.22, 0.14, 32, 0xff0000,
    -0.5, 0.35, 0.68
);

const wheelSmall4 = new wheel(
    0.22, 0.14, 32, 0xff0000,
    -0.5, 0.35, -0.68
);

train.add(wheelSmall1);
train.add(wheelSmall2);
train.add(wheelSmall3);
train.add(wheelSmall4);
// ==============================
// グループの中心を原点に移動させる
// ==============================

// グループ全体の大きさと中心点を計算
const box = new THREE.Box3().setFromObject(train);

const center = new THREE.Vector3();
box.getCenter(center);

// 子オブジェクトを中心が原点になるように移動
train.children.forEach((child) => {
    child.position.sub(center);
});
// ==============================
// 前部分を回転の中心にする
// ==============================

// 煙突側のX座標は約1.5
// 回転中心を原点に合わせるため、本体を後方へずらす
// ==============================
// Toy Trainを5つ生成・配置
// ==============================

const trains = [];

// それぞれの配置場所
const positions = [
    [-7, 0, 5],
    [-4, 0, -5],
    [0, 0, 0],
    [4, 0, -5],
    [7, 0, 5]
];

// 5つのToy Trainを生成
for (let i = 0; i < 5; i++) {

    let newTrain;

    if (i === 0) {
        newTrain = train;
    } else {
        newTrain = train.clone(true);
    }

    newTrain.position.set(
        positions[i][0],
        positions[i][1],
        positions[i][2]
    );

    scene.add(newTrain);

    trains.push(newTrain);
}

// ==============================
// アニメーション
// ==============================


function animate() {
    requestAnimationFrame(animate);

    // 5つのToy Trainをそれぞれ自転
    trains.forEach((train) => {

        // Toy Train全体の水平回転
        train.rotation.y -= 0.01;

        // それぞれの車輪を自転
        train.children.forEach((child) => {

            if (child instanceof wheel) {
                child.rotateWheel(0.05);
            }

        });

    });

    controls.update();
    renderer.render(scene, camera);
}




animate();

// ==============================
// ウィンドウサイズ変更
// ==============================
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});