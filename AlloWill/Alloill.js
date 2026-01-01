console.log("Début");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let WIDTH = Math.min(window.innerWidth - 10, 500);
let HEIGHT = 500;
//Applique la taille interne authentique
canvas.width = WIDTH;
canvas.height = HEIGHT;
console.log("Canvas interne :", canvas.width, canvas.height);
let viewWidth = WIDTH;   // largeur de la fenêtre visible
let gameStarted = false;
// --- GAME STATE ---
let volumeMusic = 0.6; // entre 0/1
let timeLeft = 60;                          //
let gameOver = false;                       //
let tasksDone = 0;                          //
let requiredTasks = 1;
// Gestion du clavier
const keys = { left: false, right: false, up: false, down: false, space: false, b: false };
//////function GestionTactile() {
let touchDir = null; // direction du doigt (angle, distance) 
let touchStartX = null;
let touchStartY = null;
let maxSpeed = 1.5;    // vitesse max du déplacement
// --- CURSOR ---
const cursor = { x: WIDTH / 2, y: HEIGHT / 2, w: 16, h: 16, speed: 1.5 };
let vitesseCourse = 6; // vitesse en courant
let vitesseLampe = 6; // multiplicateur de vitesse lampe de poche
let consoBatterie = 0.1;
let obscurite = 0.7;
//////////// Variables pour le défilement/////////////
let cameraX = 0;        // décalage horizontal de la "vue"
let exCamera = cameraX;                     //
const edgeZone = 30;// distance au bord où le scrolling commence
let lastInputTime = 0;
let inactiveDelay = 200; // ms avant de considérer le joueur inactif
let clavierUse = false;
///////////    Recharge Partie   /////////////
let rafId = null;
//////////////////////////////////////////////*/
let lastTimestamp = performance.now();
let spriteFrame = 0;
const spriteFrameCount = 5;       // ajuster si nécessaire (nombre d'images dans la spritesheet)
let spriteAnimTimer = 0;
const spriteAnimInterval = 200;   // ms par frame
let spriteFrameWidth = 200;       // valeurs par défaut, recalculées après chargement
let spriteFrameHeight = 300;
//Options
let paused = false;
const pourcBord = 10;   // pourcentage de bordure
/////////// Gestion des boutons dans le canvas///////////
const buttons = [];
const couleurBtn = "#f1780eff";
const couleurBtnText = "#005510ff";
const bHeight = 40; // hauteur standard des boutons
// Positions prédéfinies selon un numéro d'emplacement
const buttonPositions = [
  null, // index 0 inutilisé
  { x: WIDTH * 0.25, y: 0, w: WIDTH * 0.25, h: bHeight }, // 1 : haut centre-gauche
  { x: WIDTH * 0.5, y: 0, w: WIDTH * 0.25, h: bHeight }, // 2 : haut centre-droite
  { x: WIDTH * 0.75, y: 0, w: WIDTH * 0.25, h: bHeight }, // 3 : haut droite
  { x: 0, y: HEIGHT - bHeight, w: WIDTH * 0.25, h: bHeight }, // 4 : bas gauche
  { x: WIDTH * 0.25, y: HEIGHT - bHeight, w: WIDTH * 0.25, h: bHeight }, // 5 : bas centre-gauche
  { x: WIDTH * 0.5, y: HEIGHT - bHeight, w: WIDTH * 0.25, h: bHeight }, // 6 : bas centre-droite
  { x: WIDTH * 0.75, y: HEIGHT - bHeight, w: WIDTH * 0.25, h: bHeight } // 7 : bas droite
];
let isImmobile = false;
let audioCtx = null;          // Le vrai moteur audio
const sounds = {};            // Dictionnaire : nom → AudioBuffer
const soundList = [
  { name: "neon", url: "Sons/NeonEntier.wav" },
  { name: "Noel", url: "Sons/NoelOmbres.mp3" },
  { name: "tension1", url: "Sons/tension1.wav" },
  { name: "glitch1", url: "Sons/glitch1.wav" }
];
const images = [];
const srcList = [
  'Images/Asset1-1.bmp',
  'Images/Hum1NB.png',
  'Images/rond1000.png',
  'Images/LogoMattMRKT.png',
  'Images/HommeMattMRKT.png',
  'Images/LogoHommeDetour.png',//images[5]
  "Images/skelx5right.png",
  "Images/skelx5left.png",
  'Images/clef01.png',
  'Images/bonbonItem.png',
  'Images/Asset1-2-703x175.png',  //images[10]
  'Images/cookie.png',
  'Images/porte.png'
];
let loaded = 0;
///////////////  ITEMS  /////////////////////////////
let hoveredItem = null;  // item actuellement sous le curseur
const sceneData = [
  {
    name: "scene01",
    width: 1000, height: 250,
    src: images[0], indexSrc: 0,
    startSc: 0,
    items: [
      {
        name: "clef01", type: "loot", view: false, posseded: false,
        indexSrc: 8,
        x: 355, y: 270, w: 40, h: 40/*,
        amount: 1, interactWith: "player"*/
      },
      {
        name: "bonbon", type: "loot", view: true, posseded: false,
        indexSrc: 9,
        x: 855, y: 270, w: 40, h: 40/*,
        amount: 1, interactWith: "player"*/
      },
      {
        name: "it01U00", type: "use", view: false,
        indexSrc: 8,
        x: 750, y: 100, w: 10, h: 10,
        interactWith: null, action: "unlockSomething"
      },
      {
        name: "placard01", type: "decor", view: true,
        x: 305, y: 316, w: 65, h: 28,
        spawn: "clef01", action: "lootItem", collision: false
      },
      {
        name: "porte00", type: "decor", view: false,
        x: 0, y: 139, w: 80, h: 252,
        goScene: "scene00", verso: "porte0" //action: "lootItem", collision: false
      },
      {
        name: "porte01", type: "decor", view: true,
        x: 1915, y: 143, w: 85, h: 248,
        goScene: "scene02", verso: "porte02", besoin: "clef01" //,action: "lootItem", collision: false
      }
    ]
  },
  {
    name: "scene02",
    width: 703, height: 175,
    src: images[10], indexSrc: 10,
    startSc: (703 / 2) - (175 / 2),
    items: [
      {
        name: "porte02", type: "decor", view: true,
        indexSrc: 12,
        x: ((703 / 2) - (60 / 2)) + 240, y: 430, w: 460, h: 360,
        goScene: "scene01", verso: "porte01" //action: "lootItem", collision: false
      },
      {
        name: "cookie00", type: "loot", view: true, posseded: false,
        indexSrc: 11,
        x: 665, y: 270, w: 40, h: 40/*,
        amount: 1, interactWith: "player"*/
      },
      {
        name: "porte03", type: "decor", view: true,
        x: 703 + 646, y: 110, w: 70, h: 310//,     goScene: "scene04", verso: "porte06" //action: "lootItem", collision: false
      }
    ]
  }
];
let scene = sceneData[0];
//let ratioDecor = scene.width / scene.height;
let viewAssetWidth = scene.height * (viewWidth / HEIGHT);
const NbPlaceLoot = 3;  //Emplacements inventaire
class Inventaire { // On peut imaginer d'autres inventaires (coffre, PNJ, ...)
  constructor(taille) {
    this.slots = Array(taille).fill(null);
  }
  add(item) {
    const i = this.slots.indexOf(null);
    if (i === -1) return false;      // inventaire plein
    this.slots[i] = item;
    return true;
  }
  affInv() {
    //console.log(this.slots.every(x => x !== null));
    //console.log("drawLoot - this.slots : "/*, this.slots*/);
    const pos = drawLoot();
    for (const [i, s] of this.slots.entries()) {
      if (!s) continue;
      //console.log("inventaire occupé. this.slots : ", this.slots);
      //console.log("NumSlot : ", i,/* "longueur this.sl : ", this.slots.lenght,*/ "pos : ", pos);
      ctx.drawImage(images[s.indexSrc], pos.x + 2 + i * pos.w / NbPlaceLoot, pos.y + 2, pos.w / NbPlaceLoot - 4, pos.h - 4);
    }  //pos.x,pos.y- pos.w/Nb,pos.h      pos.x+i*pos.w/Nb,pos.y - pos.w/Nb,pos.h 
  }   // 
}
const inv = new Inventaire(NbPlaceLoot);
class ItemManager {
  constructor(scene, itemsClone = null) {

    this.sceneName = scene.name;
    this.items = {};

    const sourceItems = itemsClone ?? scene.items.map(it => structuredClone(it));

    for (const data of sourceItems) {
      this.items[data.name] = new Item(data.name, data);
    }
  }

  exportState() {
    return Object.values(this.items).map(it => structuredClone(it));
  }
  draw(ctx) {
    for (const item of Object.values(this.items)) {
      item.draw(ctx);
      if (item === hoveredItem) { // AFFICHER LE CADRE si le curseur est dessus
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 2;
        ctx.strokeRect(item.x - cameraX * 2, item.y, item.w, item.h);
      }
    }
  }
  trigger(item) {
    if (!item) return;
    if (item.type === "loot") { //Loot = Récup
      console.log("Loot :", item.id);
      item.view = false;
      item.posseded = true;
      console.log("itemAdd : ", item, "possseded : ", item.posseded);
      inv.add(item);
      console.log("inv = ", inv);
    }
    if (item.type === "use") {
      console.log("Use :", item.id);
      if (item.interactWith && this.items[item.interactWith]) {
        this.items[item.interactWith].view = true;
      }
      if (item.action) this.doAction(item.action);
    }
    if (item.type === "decor") {
      console.log("Decor :", item.id);
      if (item.spawn) {
        this.items[item.spawn].view = true;
        item.view = false;
      }
      if (item.goScene) {
        //this.items[item.spawn].view = true;
        //item.view = false;
        changeScene(item.goScene);
        incTaskOrWin();
      }
      if (item.action) this.doAction(item.action);
    }
  }
  doAction(name) {
    switch (name) {
      case "unlockSomething":
        console.log("ACTION → Déverrouillage !");
        break;
      case "lootItem":
        console.log("Objet ", this.items.spawn, " trouvé dans ", this.items.name, " !");
        //        item.interactWith: "clef01"
        break;
      default:
        console.warn("Action inconnue :", name);
    }
  }
}
class Item {
  constructor(id, data) {
    this.id = id;
    Object.assign(this, data);
  }
  draw(ctx) {
    //let img = new Image();//[this.srcIt];
    //img.src = this.srcIt;
    if (!this.view) return;
    if (images[this.indexSrc])/*instanceof HTMLImageElement) { != "" /*&& this.type !== "decor")*/ {
      //console.log("Source de l'item imag8: ", images[this.indexSrc]/*, ". tab : ", img[0], ". img : ", img, ". src: ", this.srcIt*/);
      ctx.drawImage(images[this.indexSrc]/*images[8]*/, this.x - cameraX * 2, this.y, this.w, this.h);
    } else {
      // console.log("Pas de src");
      ctx.fillStyle = "#d2ed0a23";
      ctx.fillRect(this.x - cameraX * 2, this.y, this.w, this.h);
    }
  }
  contains(px, py) {
    return px >= this.x - cameraX * 2 && px <= this.x - cameraX * 2 + this.w &&
      py >= this.y && py <= this.y + this.h;
  }
}
let itemManager = new ItemManager(scene);
const sceneItemManagers = {};
const sceneStates = {};
let decorHeight = HEIGHT * scene.width / scene.height;
console.log("Variables déclarées !")
showStartScreen();
chargMedia();
skinPlayer = images[6];
//PlayerImg = images[1];
console.log("Validation...");
Run(sceneData);
function breakRun(projet) { return new Promise(License => setTimeout(License, projet)); }
function loop(timestamp) {
  //if (isLoopRunning) return;  // Évite doublons
  //isLoopRunning = true;
  // ... code ...
  const now = timestamp || performance.now();
  const delta = now - lastTimestamp;
  lastTimestamp = now;
  // userInactif();
  if (!paused) {
    // si clavier et tactile inactifs, isImmobile = true
    if (!isImmobile) {
      update();
      // mise à jour de l'animation de la sprite selon le déplacement de la caméra
      updateSpriteAnimation(delta);
      draw();
    }
    defileTimerOrDie();
    //console.log("Aff. Loop/Timer.");
    Timer();
  } else {
    console.log("En pause : ", paused);
    drawPauseOverlay();
    affOptions();
  }
  rafId = requestAnimationFrame(loop);
  //requestAnimationFrame(loop);
}
function update() {
  if (gameOver) return;
  moveClavier();
  moveTactile();  // tactile orienté
  antiDefilPerm();
  screenWall();

  updateHover(cursor.x, cursor.y);
  actionClavier(keys.b);
  // Check "tâches"
  incTaskOrWin(); //cursor{}, tasksDone, requiredTasks, endGame()   
  //Demi-tour perso
  if (cursor.x >= WIDTH / 2 && skinPlayer == images[7]) skinPlayer = images[6];
  if (cursor.x < WIDTH / 2 && skinPlayer == images[6]) skinPlayer = images[7];
  /*  function FlipH(img) {
      ctx.save();
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }*/
}
function draw() {
  // Calcul centrage et échelle

  // let ratioH = HEIGHT / scene.height;
  //let ratioX = 500 / (scene.height * 2);
  const scaleDraw = 1;//Math.min(WIDTH / PlayerImg.width, HEIGHT / PlayerImg.height);
  const drawW = skinPlayer.width * scaleDraw;
  const drawH = skinPlayer.height * scaleDraw;
  const offsetX = (WIDTH - drawW) / 2;
  const offsetY = (HEIGHT - drawH) / 2;
  ctx.fillStyle = "#1a1a1a";
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  //  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // 1️⃣ Affiche l’image
  ctx.drawImage(
    images[scene.indexSrc],
    cameraX, 0,          // zone du décor à afficher
    viewAssetWidth, scene.height,   // portion du décor
    0, 0, viewWidth, HEIGHT//(15625000 * scene.width) / (scene.height * scene.height * scene.height) // position sur le canvas
    //               37/   1458          15 625 000 000/7 812 500 000             421 875 000 / 5 359 375     
  );// Dessiner uniquement la portion visible du décor*/
  ctx.globalCompositeOperation = "source-over"; // par défaut 
  //ctx.globalAlpha = 0.25;//opacité pour ombre personnage
  //ctx.globalAlpha = 1;
  // LightTarget
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(cursor.x, cursor.y, cursor.w - 8, cursor.h - 8);
  //Dessin effet lampe de poche
  const radius = 120;
  //ctx.save();//sauvegarde état
  //ctx.fillStyle = "rgba(4, 0, 60, 0.7)"; 
  ctx.fillStyle = `rgba(4,0,60,${obscurite})`; // obscurité
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  itemManager.draw(ctx); // dessin décor + items
  ctx.fillStyle = `rgba(242,254,8,${consoBatterie})`; // zone éclairée`// 'rgba(242, 254, 8, ${etatBatterie})';
  ctx.beginPath();
  ctx.arc(cursor.x + cursor.w / 2, cursor.y + cursor.h / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.7;
  ctx.drawImage(
    images[2], 500 - (cursor.x + cursor.w / 2), 500 - (cursor.y + cursor.h / 2),          // zone du décor à afficher
    WIDTH, HEIGHT,   // portion du décor
    0, 0, viewWidth, HEIGHT  // position sur le canvas
  );// Dessiner uniquement la portion visible du décor*/
  ctx.globalAlpha = 1;
  ctx.save();
  // Animation sprite sheet (images[6])
  // sourceX, sourceY, sourceW, sourceH, dx, dy, dw, dh
  const srcX = spriteFrame * spriteFrameWidth;
  ctx.drawImage(
    skinPlayer,
    srcX, 0, spriteFrameWidth, spriteFrameHeight,
    offsetX + 275, offsetY, drawW - 570, drawH + 100
  );
  //ctx.fillStyle = "rgba(4, 0, 60, 0.3)"; // obscurité
  //ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();
  inv.affInv();
}
//////////////////////////////////////////////////////////////////////
////////////////      But du jeu         ////////////////////////////
///////////////////////////////////////////////////////////////////
function incTaskOrWin() {
  //console.log("taskdone: ", tasksDone, " hoveredItem : ", hoveredItem, " key.b: ", keys.b);
  if (inv.slots[2] != null && hoveredItem && hoveredItem.id === "porte03" && keys.b === true) { // ||  voir handlePointer ?
    tasksDone++;
  }
  //cursor.x = 70; cursor.y = 100; // Retour position
  if (tasksDone >= requiredTasks) {
    endGame(true);
  }
}
//**JEU***********************************
/*       ***affichage décor
***Le joueur est au centre
  /*    ***DEPLACEMENTJOUEUR
       ****Assets
       ****AffBMP*/
// --- DESSIN ---
/****Effet lampe de poche
 ****Adrénaline et Endurance influt la vitesse    
 ***COLLISION
 ***ANIMATION
 ****Le décor change dans le noir
 ***INTERACTIIONS
 ****OBJETS DE DECOR
 ****TÂCHES
 ***MENU PAUSE*/
// **OPTIONS /*
//*** Vitesse Lampe de poche
//*** Vitesse Déplacement */
/* **EXIT 
 ***CREDITS
.        /////////////////////////////////////// */
async function loadSound(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}
async function chargMedia() {
  srcList.forEach((src, i) => {
    const img = new Image();
    img.onload = () => {
      loaded++;
      if (loaded === srcList.length) {
        console.log("Toutes les images sont chargées !");
        // Si skinPlayer est une spritesheet, recalculer la taille d'une frame
        if (skinPlayer && skinPlayer.width && spriteFrameCount > 0) {
          spriteFrameWidth = Math.floor(skinPlayer.width / spriteFrameCount);
          spriteFrameHeight = skinPlayer.height;
          console.log("spriteFrameWidth =", spriteFrameWidth, "spriteFrameHeight =", spriteFrameHeight);
        }
      }
    };
    img.src = src;
    images[i] = img;
  });
  // ⚠️ Création du contexte audio seulement APRÈS interaction utilisateur
  if (!audioCtx)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // Chargement des sons WebAudio (async + await)
  for (let s of soundList) {
    sounds[s.name] = await loadSound(s.url);
    //console.log("Son chargé :", s.name);
  }
  console.log("Tous les médias (images + sons) sont prêts !");
}
function drawZoomOscill(img, zoomOscill, angle = 0) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(zoomOscill, zoomOscill);
  ctx.drawImage(img, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
  ctx.restore();
}
function showStartScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Pour plus d'immersion :", canvas.width / 2, canvas.height / 2 - 100);
  ctx.fillText("F11 + Lumières éteintes", canvas.width / 2, canvas.height / 2 - 60);
  ctx.fillText("Appuyez sur ESPACE ou", canvas.width / 2, canvas.height / 2 + 60);
  ctx.fillText("Touchez pour COMMENCER", canvas.width / 2, canvas.height / 2 + 100);
  ctx.fillText("F1 pour Aide lors du jeu", canvas.width / 2, canvas.height / 2 + 140);
}
/*function newGame() {
  continue debutPartie;
}*/
function fadeOutLogo(duration = 1500) {
  return new Promise(resolve => {
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // dessine le logo
      drawZoomOscill(images[3], 1); //ctx.drawImage(images[3], 0, 0);
      // couche noire qui augmente
      ctx.fillStyle = `rgba(0,0,0,${progress})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(step);
  });
}
async function Run(sceneData) {
  console.log(sceneData[0], scene); // OK
  waitForUserStart();
  console.log("logo :");
  await breakRun(457);
  async function realStartSequence() {
    console.log("Démarrage réel du jeu...");
    ///////////////////////////////////////////////////////////////////////
    playSound("neon", { fadeIn: 1, /*fadeOut: 1,*/ finSon: 3.7 });
    // Fade-out progressif
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    await breakRun(500); ///////Puis CLIc
    drawZoomOscill(images[3], 1);//ctx.drawImage(images[3], -WIDTH / 2, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    //ctx.fillRect(0, 203, WIDTH, HEIGHT);
    await fadeOutLogo(50);
    drawZoomOscill(images[3], 1);// ctx.drawImage(images[3], -WIDTH / 2, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    //  ctx.fillRect(0, 203, WIDTH, HEIGHT);
    await fadeOutLogo(50);
    drawZoomOscill(images[3], 1);//ctx.drawImage(images[3], -WIDTH / 2, 0);
    // Joue un premier son si tu veux :
    await breakRun(1000);
    playSound("tension1", { volume: 0.8, fadeIn: 2, fadeOut: 4 });
    await breakRun(500);
    // Appel : cycle complet (aller-retour)
    animatePingPong(images[3], 15, 6000);  // 2 secondes total
    await breakRun(400);
    await fadeOutLogo(50);
    drawZoomOscill(images[3], 1);
    await fadeOutLogo(50);
    drawZoomOscill(images[3], 1);
    await breakRun(500);
    await fadeOutLogo(100);
    drawZoomOscill(images[3], 1);
    await fadeOutLogo(100);
    drawZoomOscill(images[3], 1);
    await fadeOutLogo(100);
    drawZoomOscill(images[3], 1);
    await breakRun(3300);
    playSound("glitch1", { volume: 1, fadeOut: 1 });
    await breakRun(100);
    drawZoomOscill(images[4], 1);
    await fadeOutLogo(12);
    drawZoomOscill(images[4], 1);
    await fadeOutLogo(13);
    await breakRun(100);
    await fadeOutLogo(25);
    drawZoomOscill(images[4], 1);
    await fadeOutLogo(25);
    drawZoomOscill(images[4], 1.1);
    await fadeOutLogo(25);
    drawZoomOscill(images[4], 1.2);
    await fadeOutLogo(25);
    drawZoomOscill(images[4], 1.3);
    await fadeOutLogo(25);
    drawZoomOscill(images[4], 1.4);
    await breakRun(1000);
    await breakRun(2457);
    /////////////////////////////////////////////////////////////
    /*Algo - A PLACER
            ///////////////////////////////////////
            - // Créer un objet Image
            -
            ----------------------------------------
            ALGO
            ----------------------------------------
            *-ECRAN DE DEMARRAGE (LOGO breakRunDIGITALS)*/
    //        **fondu⁰⁰
    //*-MENU *******************************
    // --- INPUT ---
    GestionClavier();
    GestionTactile();

    ecouteTouchePause();
    createButton("F1-P:Pause", 7, () => {
      paused = !paused;   // ou paused = !paused pour toggle
      console.log("Toggle pause !");
    });
    createButton("Esp:Courir", 4, () => { keys.space = true; })
    //userInactif();
    function userInactif() {
      // Aucune activité utilisateur (clavier et tactile) donne true dans isImmobile
      if (!keys.left && !keys.right && !keys.up && !keys.down && !touchDir) {
        isImmobile = true;
      }
      else { isImmobile = false; }
      //setTimeout(userInactif, 1000); // vérifie toutes les secondes  
    }
    // --- GAME LOOP ---
    // debutPartie:
    playSound("Noel", { volume: volumeMusic, fadeIn: 100 });
    loop();
    //// ///////////////////////////////////////////////////////
    ///           fadeOutLogo           ///////////////////////
    // ///////////////////////////////////////////////////////
    function animatePingPong(img, angleMax, duration) {
      const start = performance.now();
      requestAnimationFrame(loop);
      function loop(now) {
        let t = (now - start) / duration;
        if (t > 1) t = 1;
        // t = 0→1 puis retour 1→0 → sinus
        const pingpong = Math.sin(t * Math.PI);
        const angle = pingpong * (angleMax * Math.PI / 180);
        drawZoomOscill(img, 1.15, angle);
        if (t < 1) requestAnimationFrame(loop);  // arrêt automatique
      }
    }

  }
  function waitForUserStart() {
    document.addEventListener("keydown", keyStart);
    canvas.addEventListener("touchstart", touchStart);
    function keyStart(e) {
      if (e.code === "Space") { clavierUse = true; startGame(); }
    }
    function touchStart() {
      startGame();
    }
    function startGame() {
      if (gameStarted) return;
      gameStarted = true;
      console.log("Clavier (!=Tactile) : ", clavierUse);
      // Débloque le contexte audio (= indispensable sur mobile)
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      document.removeEventListener("keydown", keyStart);
      canvas.removeEventListener("touchstart", touchStart);
      realStartSequence(); // On lance vraiment ton jeu
    }
  }
}
function playSound(name, options = {}) {
  const {
    volume = 1,
    fadeIn = 0,
    fadeOut = 0,
    debutSon = 0,
    playbackRate = 1,
    finSon = null
  } = options;

  if (!sounds[name]) {
    console.warn("Son inconnu :", name);
    return;
  }
  const src = audioCtx.createBufferSource();
  src.buffer = sounds[name];
  src.playbackRate.value = playbackRate;
  const gain = audioCtx.createGain();
  src.connect(gain).connect(audioCtx.destination);
  const nowAudio = audioCtx.currentTime;
  // ---------- DUREE ----------
  let duration = (finSon !== null)
    ? Math.max(0, finSon - debutSon)
    : Math.max(0, src.buffer.duration - debutSon);
  // empêcher les valeurs invalides
  if (duration <= 0) {
    duration = 0.001; // 1 ms, évite erreur stop-before-start
  }
  // empêcher fadeOut > durée
  const realFadeOut = Math.min(fadeOut, duration - 0.001);
  // ---------- FADE-IN ----------
  if (fadeIn > 0) {
    gain.gain.setValueAtTime(0, nowAudio);
    gain.gain.linearRampToValueAtTime(volume, nowAudio + fadeIn);
  } else {
    gain.gain.setValueAtTime(volume, nowAudio);
  }
  // ---------- LECTURE ----------
  src.start(nowAudio, debutSon, duration);
  // ---------- FADE-OUT ----------
  if (realFadeOut > 0) {
    const fadeStart = nowAudio + duration - realFadeOut;
    gain.gain.setValueAtTime(volume, fadeStart);
    gain.gain.linearRampToValueAtTime(0, fadeStart + realFadeOut);
    src.stop(fadeStart + realFadeOut);
  } else {
    src.stop(nowAudio + duration);
  }
  return { src, gain };
}
/*document.addEventListener("keydown", e => {
  if (e.key === "b" || e.key === "B") {
    if (hoveredItem) {
      itemManager.trigger(hoveredItem);
    }
    itemManager.doAction();
  }
});*/
function actionClavier(key = false) {
  if (key) {
    if (hoveredItem) {
      itemManager.trigger(hoveredItem);
    }
    itemManager.doAction();
    console.log("ActionClavier OK. key: ", key);
    return key;
  }
}
function GestionClavier() {  // const keys = { left: false, right: false, up: false, down: false, param: false };
  window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") keys.left = true;
    if (e.key === "ArrowRight") keys.right = true;
    if (e.key === "ArrowUp") keys.up = true;
    if (e.key === "ArrowDown") keys.down = true;
    if (e.key === " " || e.key === "Space") keys.space = true;
    if (e.key === "b" || e.key === "B") keys.b = true;
  });
  window.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") keys.left = false;
    if (e.key === "ArrowRight") keys.right = false;
    if (e.key === "ArrowUp") keys.up = false;
    if (e.key === "ArrowDown") keys.down = false;
    if (e.key === " " || e.key === "Space") keys.space = false;
    if (e.key === "b" || e.key === "B") keys.b = false;
  });
}
function GestionTactile() {
  canvas.addEventListener("touchstart", handleTouch, { passive: false });
  canvas.addEventListener("touchmove", handleTouch, { passive: false });
  canvas.addEventListener("touchend", () => {
    touchDir = null;
    touchStartX = null;
    touchStartY = null;
  });
  console.log("tactile ok");
}
function ecouteTouchePause() {
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" || e.key === "F1" || e.key.toLowerCase() === "p" || e.key === "h" || e.key === "H") {
      e.preventDefault(); // empêche F1 d’ouvrir l’aide navigateur
      paused = !paused;
      if (!paused) loop(); // reprise
    }
  });
}
function handleTouch(e) {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  handlePointer(x, y); //Pointage Buttons

  //si 1er contact -> fixer le centre
  if (touchStartX === null) {
    touchStartX = x;
    touchStartY = y;
  }

  const dx = x - touchStartX; //cursor.x;
  const dy = y - touchStartY; //cursor.y;

  const dist = Math.hypot(dx, dy);
  const angleTouch = Math.atan2(dy, dx);

  const maxDist = WIDTH / 2;
  const intensity = Math.min(dist / maxDist + 0.5, 1);

  touchDir = { angleTouch, intensity };

  lastInputTime = performance.now();
  // 1. Détecter si on est sur un item
  hoveredItem = null;
  for (const item of Object.values(itemManager.items)) {
    if (item.view && item.contains(x, y)) {
      hoveredItem = item;
      break;
    }
  }
  // 2. Si un item est touché → effectuer l’action
  if (hoveredItem) {
    itemManager.trigger(hoveredItem);
    //A régler : il doit avoir également Touchend sur cette hoveredItem !!
  }
}
function moveClavier() {
  if (keys.left || keys.right || keys.up || keys.down || keys.space) {
    lastInputTime = performance.now();
  }

  cursor.speed = keys.space ? vitesseCourse : maxSpeed;

  if (keys.left) cursor.x -= vitesseLampe * cursor.speed;
  if (keys.right) cursor.x += vitesseLampe * cursor.speed;
  if (keys.up) cursor.y -= vitesseLampe * cursor.speed;
  if (keys.down) cursor.y += vitesseLampe * cursor.speed;
}
function moveTactile() {
  if (!touchDir) return;

  lastInputTime = performance.now();

  const speed = maxSpeed * vitesseLampe * touchDir.intensity;
  cursor.x += Math.cos(touchDir.angleTouch) * speed;
  cursor.y += Math.sin(touchDir.angleTouch) * speed;
}
function screenWall() { //cursor{},viewWidth,HEIGHT
  cursor.x = Math.max(0, Math.min(viewWidth - cursor.w, cursor.x));
  cursor.y = Math.max(0, Math.min(HEIGHT - cursor.h, cursor.y));
}
function antiDefilPerm() {

  const now = performance.now();
  const isInactive = (now - lastInputTime) > inactiveDelay;
  //console.log("vitLmp : ", vitesseLampe, " c.speed : ", cursor.speed, "framMS : ", spriteAnimTimer);
  // Si inactif → repousser le curseur hors des edgeZones
  if (isInactive) {
    if (cursor.x < edgeZone) cursor.x = edgeZone + 1;
    if (cursor.x > viewWidth - edgeZone) cursor.x = viewWidth - edgeZone - 1;
    return; // aucune tentative de scroll
  }

  // ----- ACTIVITÉ : SCROLL NORMAL -----

  // 1. Garder le curseur visible dans l'écran
  if (cursor.x < 0) cursor.x = 0;
  if (cursor.x > viewWidth - cursor.w) cursor.x = viewWidth - cursor.w;

  // 2. SCROLL GAUCHE
  if (cursor.x < edgeZone && cameraX > 0) {
    cameraX -= cursor.speed;
    if (cameraX < 0) cameraX = 0;
  }

  // 3. SCROLL DROITE
  if (cursor.x > viewWidth - edgeZone &&
    cameraX < scene.width - viewWidth / 2) {
    cameraX += cursor.speed;
    if (cameraX > scene.width - viewWidth / 2)
      cameraX = scene.width - viewWidth / 2;
  }
}
function Timer() {
  ctx.font = "20px Georgia";
  ctx.fillStyle = "#f33";
  ctx.fillText(`Temps: ${Math.ceil(timeLeft)}`, 5, 20);//augmenté taille texte
  ctx.fillText(`Tâches: ${tasksDone}/${requiredTasks}`, 5, 40);
  drawButtons(buttons);
}
function defileTimerOrDie() {
  if (gameOver) return;
  timeLeft -= 1 / 60;
  if (timeLeft <= 0) endGame(false);
}
function drawPauseOverlay() {
  ctx.fillStyle = "#6d6d6d7b";
  ctx.fillRect(WIDTH * pourcBord / 100, HEIGHT * pourcBord / 100, WIDTH - (WIDTH * 2 * pourcBord / 100), HEIGHT - (HEIGHT * 2 * pourcBord / 100));
  ctx.fillStyle = "#015e0fff";
  ctx.font = "65px Georgia";
  ctx.fillText("⏸ Pause ", WIDTH / 2 - 140, (HEIGHT / 2) - 100);
  ctx.fillStyle = "#ff8400ff";
  ctx.font = "60px Georgia";
  ctx.fillText("⏸ Pause ", WIDTH / 2 - 130, (HEIGHT / 2) - 95);
}
function writeLine(numLigne, text) {
  //const totalLignes = 10; // nombre total de lignes
  const marginTop = 20;     // marge avant la 1re ligne
  const lineHeight = 40;    // espacement vertical entre lignes
  const hautLigne = 200; // haut du contenneur de texte

  ctx.font = "20px Arial"; ctx.fillStyle = "white"; ctx.textAlign = "left"; ctx.textBaseline = "top";
  /*/ Sécurité : éviter les lignes hors limite ; if (numLigne < 1) numLigne = 1; if (numLigne > totalLignes) numLigne = totalLignes;*/
  // Calcul de la position verticale
  const y = marginTop + (numLigne - 1) * lineHeight;

  ctx.fillText(text, 2 * WIDTH * pourcBord / 100, y + hautLigne);
}
function affOptions() {
  writeLine(2, "B ou Tactile : Action");
  writeLine(1, "Flèches directionnelles");
  writeLine(3, "Echap/P/F1 : Pause");
  writeLine(4, "Espace : Courir");
}
function createButton(text, emplacement, action) {
  const pos = buttonPositions[emplacement];
  if (!pos) {
    console.warn("Emplacement inconnu :", emplacement);
    return;
  }
  const { x, y, w, h } = pos;
  // Stocker le bouton
  buttons.push({ text, x, y, w, h, action });
}
function drawButtons(buttons) {
  // Redessine tous les boutons
  for (const b of buttons) {
    ctx.fillStyle = couleurBtn;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = couleurBtnText;
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(b.text, b.x + 8, b.y + 12);
  };
}
// Détection clic/touch
function handlePointer(x, y) {
  for (const b of buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
      if (b.action) b.action();
      return;
    }
  }
}
function updateSpriteAnimation(deltaMs) {
  // si la caméra a bougé, faire avancer l'animation
  if (cameraX !== exCamera) {
    spriteAnimTimer += deltaMs;
    if (spriteAnimTimer >= spriteAnimInterval / (cursor.speed * cursor.speed)) {
      const step = Math.floor(spriteAnimTimer / spriteAnimInterval);
      spriteFrame = (spriteFrame + step) % spriteFrameCount;
      spriteAnimTimer %= spriteAnimInterval;
    }
  } else {
    // caméra immobile → frame de repos (0)
    //spriteFrame = 0;
    spriteAnimTimer = 0;
  }
  exCamera = cameraX;
}
function changeScene(sceneName) {
  // Sauvegarde AVANT de quitter
  if (scene && itemManager) {
    sceneStates[scene.name] = itemManager.exportState();
  }
  // Trouver la scène
  scene = sceneData.find(s => s.name === sceneName);
  if (!scene) return;
  // Restaurer ou créer
  const saved = sceneStates[scene.name] ?? null;
  itemManager = new ItemManager(scene, saved);
  viewAssetWidth = scene.height * (viewWidth / HEIGHT);
  decorHeight = HEIGHT * scene.width / scene.height;
  console.log("viewAssetWidth: ", viewAssetWidth, "decorHeight: ", decorHeight);
  hoveredItem = null;
  cameraX = scene.startSc ?? 0;
  console.log(
    "Scene chargée :",
    scene.name,
    saved ? "(état restauré)" : "(état neuf)"
  );
  console.log("ScenPrec: ", itemManager);
}
function drawLoot() {
  const pos = buttonPositions[6];
  ctx.strokeStyle = couleurBtn;
  ctx.lineWidth = 2;
  ctx.strokeRect(pos.x, pos.y, pos.w, pos.h);
  //DESSINER LIGNES 
  ctx.beginPath();
  for (idNbPlb = 1; idNbPlb < NbPlaceLoot; idNbPlb++) {     //0 no
    ctx.moveTo(pos.x + idNbPlb * pos.w / NbPlaceLoot, pos.y); //3,1 -> 3,1->x+id*w/Nb
    ctx.lineTo(pos.x + idNbPlb * pos.w / NbPlaceLoot, pos.y + pos.h);
  }
  ctx.stroke();
  return pos;
}
function updateHover(cursorX, cursorY) {
  hoveredItem = null;
  for (const item of Object.values(itemManager.items)) {
    if (item.view && item.contains(cursorX, cursorY)) {
      hoveredItem = item;
      break;
    }
  }
}
function endGame(success) {
  if (gameOver) return;   // <-- stoppe les appels multiples
  gameOver = true;
  setTimeout(() => {
    alert(success ? "Tu as survécu!" : "Le monstre t’a attrapé!");
    alert("Merci d'avoir participé !\n\nRevenez dans 24h. ;-)");//

    changeGame();
    timeLeft = 60; gameOver = false; tasksDone = 0; cameraX = 0;
    /*  scene=sceneData[0];
      changeScene(scene); saved=null;*/
    //    cursor = { x: WIDTH / 2, y: HEIGHT / 2, w: 16, h: 16, speed: 1.5 };
    cursor.x = WIDTH / 2; cursor.y = HEIGHT / 2; cursor.speed = 1.5;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    // Relance une seule boucle propre
    lastTimestamp = performance.now();  // très important !
    rafId = requestAnimationFrame(loop);  // ← uniquement ici
  }, 500);
}
function changeGame() { //  marche pas !!
  // éclair
  console.log("Eclair !");
  ctx.fillStyle = "#ffffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 10000; i += 1) { }
  //console.log("vitLmp : ", vitesseLampe, " c.speed : ", cursor.speed, "framMS : ", spriteAnimTimer);
}

//  function enleveCouleur() {
// 1️⃣ Affiche l’image
//ctx.drawImage(images[1], offsetX, offsetY, drawW, drawH);
/* // 2️⃣ Lit ses pixels
 const imageData = ctx.getImageData(offsetX, offsetY, drawW, drawH);
 const data = imageData.data;
 // 3️⃣ Modifie chaque pixel
 for (let i = 0; i <
   data.length; i += 4) {
   console.log("data[i] r=", data[i]);
   const r = data[i];
   if (r > 200) {
     data[i + 3] = 0; // transparent
   } else {
    data[i] = 0; data[i + 1] = 0; data[i + 2] = 0;
     data[i + 3] = 64; // noir à 25%
   }
 }
 // 4️⃣ Réécrit les pixels modifiés
 ctx.putImageData(imageData, offsetX, offsetY);
}*/
/*function drawLampEffect() {
  const radius = 120;
  const innerRadius = 40; // rayon du cercle jaune central
  // 2️⃣ Découpe un cercle pour la lampe (optionnel, pour un trou clair)
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cursor.x + cursor.w / 2, cursor.y + cursor.h / 2, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 4️⃣ Dégradé bleu autour du jaune
  const grad = ctx.createRadialGradient(
    cursor.x + cursor.w / 2, cursor.y + cursor.h / 2, innerRadius,
    cursor.x + cursor.w / 2, cursor.y + cursor.h / 2, radius
  );
  grad.addColorStop(0, "rgba(242, 254, 8, 0.0)"); // transition douce
  grad.addColorStop(1, "rgba(22, 6, 249, 0.4)"); // bleu nuit
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cursor.x + cursor.w / 2, cursor.y + cursor.h / 2, radius, 0, Math.PI * 2);
  ctx.fill();
}*/
