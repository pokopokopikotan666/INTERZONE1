(() => {

const FADE_DURATION = 20;

// Override menu call
Scene_Map.prototype.callMenu = function() {
    if (this._menuFadeRunning) return;

    SoundManager.playOk();
    this._menuFadeRunning = true;
    this.startMenuFadeOut();
};

// Start fade-out
Scene_Map.prototype.startMenuFadeOut = function() {
    this._menuFadeFrame = 0;
    this._menuFadeState = "out";
    $gameScreen.startFadeOut(FADE_DURATION);
};

// Hook update
const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);

    if (this._menuFadeRunning) {
        this.updateMenuFade();
    }
};

// Handle fade logic
Scene_Map.prototype.updateMenuFade = function() {
    this._menuFadeFrame++;

    if (this._menuFadeState === "out" &&
        this._menuFadeFrame >= FADE_DURATION) {

        this._menuFadeRunning = false;
        this._menuFadeState = null;
        SceneManager.push(Scene_Menu);
    }
};

})();