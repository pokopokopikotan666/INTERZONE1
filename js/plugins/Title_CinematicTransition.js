/*:
 * @plugindesc Cinematic fade-out + pause before character select
 * @author You
 */

(function () {

const FADE_OUT_DURATION = 90;
const BLACK_HOLD_TIME  = 45;

//--------------------------------------------------------------------------
// New Game (FIXED)
//--------------------------------------------------------------------------
Scene_Title.prototype.commandNewGame = function () {

    // ✅ Prevent retrigger (fixes loop)
    if (this._cinematicStarted) return;

    this._cinematicStarted = true;
    this._cinematicWait = FADE_OUT_DURATION + BLACK_HOLD_TIME;

    this.fadeOutAll();
    this.startFadeOut(FADE_OUT_DURATION, false);
};

//--------------------------------------------------------------------------
// Update (FIXED)
//--------------------------------------------------------------------------
const _Scene_Title_update = Scene_Title.prototype.update;
Scene_Title.prototype.update = function () {
    _Scene_Title_update.call(this);

    if (this._cinematicStarted) {

        // ✅ Disable input during transition
        if (this._commandWindow) {
            this._commandWindow.deactivate();
        }

        this._cinematicWait--;

        if (this._cinematicWait <= 0) {
            this._cinematicStarted = false;

            

            SceneManager.push(Scene_CharacterSelect);
        }
    }
};

})();