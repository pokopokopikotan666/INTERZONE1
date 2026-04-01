/*:
 * @plugindesc Metaphor-style paint pause menu (MV 1.6.3, 1920x1080)
 * @author You
 */

(function() {
/* ===============================
 * SCENE-LEVEL MENU FADES (MV SAFE)
 * =============================== */

(() => {

const FADE_DURATION = 20;

/* MAP → MENU */
const _Map_callMenu = Scene_Map.prototype.callMenu;
Scene_Map.prototype.callMenu = function() {
    if (this._menuCalling) return;
    this._menuCalling = true;
    SoundManager.playOk();
    SceneManager.push(Scene_Menu);
};

/* MENU START */
const _Menu_start = Scene_Menu.prototype.start;
Scene_Menu.prototype.start = function() {
    _Menu_start.call(this);
    this.startFadeIn(FADE_DURATION);
};

/* MENU EXIT */
const _Menu_pop = Scene_Menu.prototype.popScene;
Scene_Menu.prototype.popScene = function() {
    this._closing = true;
    this.startFadeOut(FADE_DURATION);
};

/* MENU UPDATE */
const _Menu_update = Scene_Menu.prototype.update;
Scene_Menu.prototype.update = function() {
    _Menu_update.call(this);

    if (this._closing && this._fadeDuration <= 0) {
        this._closing = false;
        SceneManager.pop();
    }
};

const _Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
    _Map_createDisplayObjects.call(this);
    this.startFadeIn(FADE_DURATION);
};

})();
// =====================================================================
// CONFIG
// =====================================================================

const PAINT_MENU_COMMANDS = [
    { symbol: "item",    label: "ITEM",     enabled: () => $gameSystem.isMenuEnabled() },
    { symbol: "skill",   label: "SKILL",    enabled: () => $gameSystem.isMenuEnabled() },
    { symbol: "equip",   label: "EQUIP",    enabled: () => $gameSystem.isMenuEnabled() },
    { symbol: "status",  label: "STATUS",   enabled: () => true },
    { symbol: "options", label: "SETTINGS", enabled: () => true },
    { symbol: "gameEnd", label: "QUIT",     enabled: () => true }
];

window.PAINT_MENU_COMMANDS = PAINT_MENU_COMMANDS;

// =====================================================================
// SELECTOR ARC
// =====================================================================

const SELECTOR_ARC = {
    pivotXRatio: 0.25,
    pivotY: 540,
    radius: 600,
    arcSpread: 0.6,
    yOffset: -50
};

// =====================================================================
// FORCE REAL MENU COMMAND LIST
// =====================================================================

Window_MenuCommand.prototype.makeCommandList = function() {
    PAINT_MENU_COMMANDS.forEach(cmd => {
        this.addCommand(cmd.label, cmd.symbol, cmd.enabled());
    });
};

// =====================================================================
// SCENE MENU
// =====================================================================

const _Scene_Menu_create = Scene_Menu.prototype.create;
Scene_Menu.prototype.create = function() {
    _Scene_Menu_create.call(this);
    this.createProtagonist();
    this.createPaintSelector();
    this.createCommandLabels();
};

const _Scene_Menu_update = Scene_Menu.prototype.update;
Scene_Menu.prototype.update = function() {
    _Scene_Menu_update.call(this);
    if (!this._paintSprite || !this._commandLabelSprites) return;
    this.updatePaintPosition();
    this.updatePaintAnimation();
    this.updateCommandLabels();
if (Input.isTriggered("ok")) console.log("OK pressed");
};


// =====================================================================
// CUSTOM BACKGROUND (OVERRIDES DEFAULT)
// =====================================================================

Scene_Menu.prototype.createBackground = function() {
    const bitmap = ImageManager.loadPicture("menu_background");
    this._backgroundSprite = new Sprite(bitmap);
    this._backgroundSprite.x = 0;
    this._backgroundSprite.y = 0;

    bitmap.addLoadListener(() => {
        this._backgroundSprite.scale.x = Graphics.width / bitmap.width;
        this._backgroundSprite.scale.y = Graphics.height / bitmap.height;
    });

    this.addChild(this._backgroundSprite);
};

// =====================================================================
// PROTAGONIST
// =====================================================================

Scene_Menu.prototype.createProtagonist = function() {
    const BASE_X = 100;
    const BASE_Y = -370;

    this._actorSprite = new Sprite(
        ImageManager.loadPicture("protagonist_bust")
    );
    this._actorSprite.x = BASE_X;
    this._actorSprite.y = BASE_Y;
    this.addChild(this._actorSprite);

    this._headAnchor = {
        x: BASE_X - 130,
        y: BASE_Y - 20
    };
};

// =====================================================================
// PAINT SELECTOR
// =====================================================================

Scene_Menu.prototype.createPaintSelector = function() {
    this._paintFrames = [
        ImageManager.loadPicture("stroke_1"),
        ImageManager.loadPicture("stroke_2"),
        ImageManager.loadPicture("stroke_3"),
        ImageManager.loadPicture("stroke_4"),
        ImageManager.loadPicture("stroke_5")
    ];

    this._paintSprite = new Sprite(this._paintFrames[0]);
    this._paintSprite.opacity = 220;
    this.addChild(this._paintSprite);

    this._paintAnimTick = 0;
    this._paintRotation = 0;
    this._lastPaintY = this._paintSprite.y;
};

Scene_Menu.prototype.updatePaintPosition = function() {
    const index  = this._commandWindow.index();
    const total  = PAINT_MENU_COMMANDS.length;
    const center = (total - 1) / 2;
    const d      = index - center;

    const pivotX = Graphics.width * SELECTOR_ARC.pivotXRatio;
    const pivotY = SELECTOR_ARC.pivotY;

    const stepAngle = SELECTOR_ARC.arcSpread / center;
    const angle = Math.PI - d * stepAngle;

    const targetX = pivotX + Math.cos(angle) * SELECTOR_ARC.radius;
    const targetY = pivotY + Math.sin(angle) * SELECTOR_ARC.radius
        + SELECTOR_ARC.yOffset - this._paintSprite.height * 0.5;

    this._paintSprite.x += (targetX - this._paintSprite.x) * 0.3;
    this._paintSprite.y += (targetY - this._paintSprite.y) * 0.3;

    const deltaY = this._paintSprite.y - this._lastPaintY;
    this._paintRotation += deltaY * 0.0025;
    this._paintRotation *= 0.85;
    this._paintRotation = Math.max(-0.35, Math.min(0.35, this._paintRotation));

    this._paintSprite.rotation = this._paintRotation;
    this._lastPaintY = this._paintSprite.y;
};

Scene_Menu.prototype.updatePaintAnimation = function() {
    this._paintAnimTick++;
    if (this._paintAnimTick % 6 === 0) {
        const f = Math.floor(
            (this._paintAnimTick / 6) % this._paintFrames.length
        );
        this._paintSprite.bitmap = this._paintFrames[f];
    }
};

// =====================================================================
// COMMAND LABELS
// =====================================================================

Scene_Menu.prototype.createCommandLabels = function() {
    this._commandLabelSprites = [];

    this._menuCurve = {
        spacing: 120,
        curvature: 14,
        centerOffsetY: this._headAnchor.y + 750,
        baseX: this._headAnchor.x + 100
    };

    PAINT_MENU_COMMANDS.forEach(cmd => {
        const bitmap = new Bitmap(800, 120);
        bitmap.fontFace = "GameFont";
        bitmap.fontSize = 72;
        bitmap.outlineWidth = 6;

        const sprite = new Sprite(bitmap);
        sprite._cmd = cmd;
        sprite.opacity = 150;

        this.addChild(sprite);
        this._commandLabelSprites.push(sprite);
    });
};

Scene_Menu.prototype.updateCommandLabels = function() {
    const index  = this._commandWindow.index();
    const total  = this._commandLabelSprites.length;
    const center = (total - 1) / 2;

    this._commandLabelSprites.forEach((sprite, i) => {
        const d = i - center;
        const curveX = Math.pow(d, 2) * this._menuCurve.curvature;

        const targetX = this._menuCurve.baseX + curveX + (i === index ? 40 : 0);
        const targetY = this._menuCurve.centerOffsetY + d * this._menuCurve.spacing;

        sprite.x += (targetX - sprite.x) * 0.25;
        sprite.y += (targetY - sprite.y) * 0.25;

        const enabled = sprite._cmd.enabled();
        const targetOpacity = !enabled ? 80 : (i === index ? 255 : 150);
        sprite.opacity += (targetOpacity - sprite.opacity) * 0.25;

        sprite.bitmap.clear();
        sprite.bitmap.textColor = enabled ? "#ffffff" : "#888888";
        sprite.bitmap.outlineColor = "rgba(0,0,0,0.7)";
        sprite.bitmap.drawText(sprite._cmd.label, 0, 0, 800, 120, "left");
    });
};

// =====================================================================
// SUPPRESS DEFAULT WINDOWS
// =====================================================================

function hideWindow(w) {
    w.opacity = 0;
    w.backOpacity = 0;
    w.contentsOpacity = 0;
    w.refresh = function() {};
}

const _CmdInit = Window_MenuCommand.prototype.initialize;
Window_MenuCommand.prototype.initialize = function(x, y) {
    _CmdInit.call(this, x, y);
    hideWindow(this);
    this.cursorVisible = false;
};

const _StatInit = Window_MenuStatus.prototype.initialize;
Window_MenuStatus.prototype.initialize = function(x, y, w, h) {
    _StatInit.call(this, x, y, w, h);
    hideWindow(this);
};

const _GoldInit = Window_Gold.prototype.initialize;
Window_Gold.prototype.initialize = function(x, y) {
    _GoldInit.call(this, x, y);
    hideWindow(this);
};

// =====================================================================
// MOVE WINDOWS OFFSCREEN
// =====================================================================

const off = w => { w.x = -9999; w.y = -9999; };

const _c = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
    _c.call(this);
    off(this._commandWindow);
};

const _s = Scene_Menu.prototype.createStatusWindow;
Scene_Menu.prototype.createStatusWindow = function() {
    _s.call(this);
    off(this._statusWindow);
};

const _g = Scene_Menu.prototype.createGoldWindow;
Scene_Menu.prototype.createGoldWindow = function() {
    _g.call(this);
    off(this._goldWindow);
};

})();