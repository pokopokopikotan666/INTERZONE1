/*:
 * @plugindesc Stylish custom name input scene (Fear & Hunger style)
 * @author You
 */

(function () {

//=============================================================================
// Scene_StylishName
//=============================================================================

function Scene_StylishName() {
    this.initialize.apply(this, arguments);
}

Scene_StylishName.prototype = Object.create(Scene_Base.prototype);
Scene_StylishName.prototype.constructor = Scene_StylishName;

Scene_StylishName.prototype.createNameGlow = function () {
    const w = 520;
    const h = 72;

    const bmp = new Bitmap(w, h);

    // Glow color
    bmp.fillRect(0, 0, w, h, "rgba(80, 160, 255, 0.25)");

    // Soft inner highlight
    bmp.fillRect(6, 6, w - 12, h - 12, "rgba(120, 200, 255, 0.35)");

    this._nameGlow = new Sprite(bmp);
    this._nameGlow.anchor.set(0.5, 0.5);
    this._nameGlow.x = Graphics.width / 2;
    this._nameGlow.y = Graphics.height * 0.45 + 32;

    this._nameGlow.opacity = 160;

    this.addChild(this._nameGlow);
};


//--------------------------------------------------------------------------
// Static prepare
//--------------------------------------------------------------------------
Scene_StylishName.prepare = function (actorId) {
    this._actorId = actorId;
};

Scene_StylishName.prototype.createTitleText = function () {
    const bitmap = new Bitmap(Graphics.width, 96);
    bitmap.fontFace = "STIX Two Text";
    bitmap.fontSize = 54;
    bitmap.textColor = "#ffffff";
    bitmap.outlineColor = "rgba(0, 0, 0, 0.75)";
    bitmap.outlineWidth = 4;

    bitmap.drawText(
        "Please name your vessel",
        0,
        0,
        Graphics.width,
        96,
        "center"
    );

    this._titleText = new Sprite(bitmap);
    this._titleText.y = 14;

    this.addChild(this._titleText);
};

//--------------------------------------------------------------------------
// Initialize
//--------------------------------------------------------------------------
Scene_StylishName.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
    this._name = "";
    this._displayedName = "";
    this._typeTimer = 0;
    this._needsRedraw = true;

    this._cursorTimer = 0;
    this._cursorVisible = true;
};

//--------------------------------------------------------------------------
// Create
//--------------------------------------------------------------------------
Scene_StylishName.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
this.createTitleText();
    this.createCharacter();
this.createNameGlow();
    this.createText();

    this._keyHandler = this.onKeyDown.bind(this);
    window.addEventListener("keydown", this._keyHandler);
};

//--------------------------------------------------------------------------
// Start
//--------------------------------------------------------------------------
Scene_StylishName.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(90, false);
};


//--------------------------------------------------------------------------
// Terminate
//--------------------------------------------------------------------------
Scene_StylishName.prototype.terminate = function () {
    Scene_Base.prototype.terminate.call(this);
    window.removeEventListener("keydown", this._keyHandler);
};

//--------------------------------------------------------------------------
// Background
//--------------------------------------------------------------------------
Scene_StylishName.prototype.createBackground = function () {
    const bg = new Sprite(ImageManager.loadSystem("char_select_bg"));
    bg.anchor.set(0.5, 0.5);
    bg.x = Graphics.width / 2;
    bg.y = Graphics.height / 2;
    this.addChild(bg);
};

//--------------------------------------------------------------------------
// Character sprite
//--------------------------------------------------------------------------
Scene_StylishName.prototype.createCharacter = function () {
    const id = Scene_StylishName._actorId;
    const img = id === 1 ? "char_male" : "char_female";

    this._char = new Sprite(ImageManager.loadSystem(img));
    this._char.anchor.set(0.5, 1);
    this._char.scale.set(2.2, 2.2);
    this._char.x = Graphics.width / 2;
    this._char.y = Graphics.height * 1.00;

    this.addChild(this._char);
};

//--------------------------------------------------------------------------
// Text
//--------------------------------------------------------------------------
Scene_StylishName.prototype.createText = function () {
    this._text = new Window_Base(0, 0, Graphics.width, 160);
    this._text.opacity = 0;
    this._text.y = Graphics.height * 0.45;

    this._text.contents.fontFace = "STIX Two Text";
    this._text.contents.fontSize = 48;
    this._text.contents.fontBold = true;

    this.addChild(this._text);
};

//--------------------------------------------------------------------------
// Update
//--------------------------------------------------------------------------
Scene_StylishName.prototype.update = function () {
    Scene_Base.prototype.update.call(this);
    this.updateTyping();
    this.updateCursor();
   
this.updateGlow();
    this.redrawIfNeeded();
};
Scene_StylishName.prototype.updateGlow = function () {
    const t = Graphics.frameCount;

    // Opacity pulse
    this._nameGlow.opacity = 140 + Math.sin(t / 20) * 60;

    // Subtle scale breathing
    const s = 1.0 + Math.sin(t / 30) * 0.02;
    this._nameGlow.scale.set(s, s);
};


//--------------------------------------------------------------------------
// Typing animation
//--------------------------------------------------------------------------
Scene_StylishName.prototype.updateTyping = function () {
    if (this._displayedName === this._name) return;

    this._typeTimer++;

    if (this._typeTimer >= 4) { // typing speed
        this._typeTimer = 0;
        this._displayedName = this._name.slice(0, this._displayedName.length + 1);
        SoundManager.playCursor();
        this._needsRedraw = true;
    }
};

//--------------------------------------------------------------------------
// Cursor blink
//--------------------------------------------------------------------------
Scene_StylishName.prototype.updateCursor = function () {
    this._cursorTimer++;
    if (this._cursorTimer >= 30) {
        this._cursorTimer = 0;
        this._cursorVisible = !this._cursorVisible;
        this._needsRedraw = true;
    }
};

//--------------------------------------------------------------------------
// Redraw control
//--------------------------------------------------------------------------
Scene_StylishName.prototype.redrawIfNeeded = function () {
    if (!this._needsRedraw) return;

    this._needsRedraw = false;
    this._text.contents.clear();

    const cursor = this._cursorVisible ? "_" : " ";
    this._text.drawText(
        "Name: " + this._displayedName + cursor,
        0, 0, Graphics.width, "center"
    );
};

//--------------------------------------------------------------------------
// Keyboard input
//--------------------------------------------------------------------------
Scene_StylishName.prototype.onKeyDown = function (event) {
    // Prevent browser / engine defaults (important)
    event.preventDefault();

    const key = event.key;

    // Backspace
    if (key === "Backspace") {
        this._name = this._name.slice(0, -1);
        this._displayedName = this._displayedName.slice(0, -1);
        SoundManager.playCancel();
        this._needsRedraw = true;
        return;
    }

    // Confirm with Enter
    if (key === "Enter") {
        if (this._name.length > 0) {
            const actor = $gameActors.actor(Scene_StylishName._actorId);
            actor.setName(this._name);
            SceneManager.goto(Scene_Map);
        }
        return;
    }

    // Allow letters + space
    if (/^[a-zA-Z ]$/.test(key)) {
        if (this._name.length >= 12) return;

        this._name += key;
    }
};



//--------------------------------------------------------------------------
// Expose
//--------------------------------------------------------------------------
window.Scene_StylishName = Scene_StylishName;

})();
