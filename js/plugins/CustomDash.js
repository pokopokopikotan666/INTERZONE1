/*:
 * @plugindesc Stable dash sprite swap system. Example: $Male -> $Male_dash
 * @author You
 */

(function() {

var _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    _Game_Player_update.call(this, sceneActive);
    this.updateDashSprite();
};

Game_Player.prototype.updateDashSprite = function() {

    if (!this._baseCharacterName) {
        this._baseCharacterName = this._characterName.replace("_dash", "");
    }

    var base = this._baseCharacterName;
    var dash = base + "_dash";

    if (this.isDashing()) {

        if (this._characterName !== dash &&
            ImageManager.loadCharacter(dash)) {

            this.setImage(dash, this._characterIndex);
        }

    } else {

        if (this._characterName !== base) {
            this.setImage(base, this._characterIndex);
        }

    }

};

var _Game_Player_setImage = Game_Player.prototype.setImage;
Game_Player.prototype.setImage = function(characterName, characterIndex) {

    _Game_Player_setImage.call(this, characterName, characterIndex);

    if (!characterName.includes("_dash")) {
        this._baseCharacterName = characterName;
    }

};

})();