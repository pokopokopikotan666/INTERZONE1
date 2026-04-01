/*:
 * @plugindesc Sprite-based Character Selection before New Game (MV 1.6.3)
 * @author You
 */

(function () {

    //--------------------------------------------------------------------------
    // Intercept New Game (SAFE)
    //--------------------------------------------------------------------------

    const _Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function () {
        this._toCharacterSelect = true;
        this._characterSelectTimer = 0;
        this._characterSelectQueued = false;

        this.startFadeOut(90, false);
    };

    const _Scene_Title_update = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function () {
        _Scene_Title_update.call(this);

        if (this._toCharacterSelect && !this._characterSelectQueued) {
            this._characterSelectTimer++;

            if (this._characterSelectTimer >= 90) {
                this._characterSelectQueued = true;
                SceneManager.push(Scene_CharacterSelect);
            }
        }
    };

    //--------------------------------------------------------------------------
    // Scene_CharacterSelect
    //--------------------------------------------------------------------------

    function Scene_CharacterSelect() {
        this.initialize.apply(this, arguments);
    }

    Scene_CharacterSelect.prototype = Object.create(Scene_Base.prototype);
    Scene_CharacterSelect.prototype.constructor = Scene_CharacterSelect;

    Scene_CharacterSelect.prototype.initialize = function () {
        Scene_Base.prototype.initialize.call(this);

        this._index = 0;
        this._confirming = false;
        this._confirmTimer = 0;
        this._blackHold = 0;
    };

    Scene_CharacterSelect.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this.createBackground();
        this.createCharacters();
        this.createSelector();
    };

    Scene_CharacterSelect.prototype.start = function () {
        Scene_Base.prototype.start.call(this);
        this.startFadeIn(90, false);
    };

    //--------------------------------------------------------------------------
    // Background
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.createBackground = function () {
        this._background = new Sprite(ImageManager.loadSystem("char_select_bg"));
        this._background.anchor.set(0.5, 0.5);
        this._background.x = Graphics.width / 2;
        this._background.y = Graphics.height / 2;
        this.addChild(this._background);
    };

    //--------------------------------------------------------------------------
    // Characters
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.createCharacters = function () {
        this._characters = [];

        const centerX = Graphics.width / 2;
        const y = Graphics.height * 0.72;
        const spacing = 220;

        const data = [
            { img: "char_male", actorId: 1 },
            { img: "char_female", actorId: 2 }
        ];

        data.forEach((d, i) => {
            const s = new Sprite(ImageManager.loadSystem(d.img));
            s.anchor.set(0.5, 1);
            s.scale.set(1.5, 1.5);
            s.x = centerX + (i === 0 ? -spacing : spacing);
            s.y = y;
            s._actorId = d.actorId;
            this.addChild(s);
            this._characters.push(s);
        });
    };

    //--------------------------------------------------------------------------
    // Selector
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.createSelector = function () {
        this._selector = new Sprite(ImageManager.loadSystem("char_selector"));
        this._selector.anchor.set(0.5, 0.5);
        this._selector.scale.set(0.4, 0.4);
        this._selector._vx = 0;
        this.addChild(this._selector);
    };

    //--------------------------------------------------------------------------
    // Update
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.update = function () {
        Scene_Base.prototype.update.call(this);

        if (this._confirming) {
            this.updateConfirmTransition();
            return;
        }

        this.updateInput();
        this.updateCharacters();
        this.updateSelector();
    };

    //--------------------------------------------------------------------------
    // Input
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.updateInput = function () {
        if (Input.isTriggered("left") || Input.isTriggered("up")) {
            this._index = 0;
            SoundManager.playCursor();
        }

        if (Input.isTriggered("right") || Input.isTriggered("down")) {
            this._index = 1;
            SoundManager.playCursor();
        }

        if (Input.isTriggered("ok")) {
            SoundManager.playOk();
            this.confirmSelection();
        }

        if (Input.isTriggered("cancel")) {
            SceneManager.pop();
        }
    };

    //--------------------------------------------------------------------------
    // Visual Feedback
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.updateCharacters = function () {
        const baseScale = 1.6;

        this._characters.forEach((s, i) => {
            const selected = i === this._index;
            const target = selected ? baseScale * 1.08 : baseScale * 0.95;

            s.scale.x += (target - s.scale.x) * (selected ? 0.3 : 0.15);
            s.scale.y = s.scale.x;
            s.opacity += ((selected ? 255 : 160) - s.opacity) * 0.2;
        });
    };

    Scene_CharacterSelect.prototype.updateSelector = function () {
        const t = this._characters[this._index];
        if (!t) return;

        const ax = (t.x - this._selector.x) * 0.25;
        this._selector._vx = (this._selector._vx + ax) * 0.65;
        this._selector.x += this._selector._vx;
        this._selector.y = t.y + 12 + Math.sin(Graphics.frameCount / 12) * 4;
    };

    //--------------------------------------------------------------------------
    // Confirm
    //--------------------------------------------------------------------------

    Scene_CharacterSelect.prototype.confirmSelection = function () {
        this._selectedActorId = this._characters[this._index]._actorId;
        this._confirming = true;
        this._confirmTimer = 0;
        this.startFadeOut(90, false);
    };

    Scene_CharacterSelect.prototype.updateConfirmTransition = function () {
        this._confirmTimer++;

        const s = this._characters[this._index];
        if (s) {
            s.scale.x += 0.002;
            s.scale.y += 0.002;
        }

        if (this._confirmTimer < 90) return;

        this._blackHold++;
        if (this._blackHold < 45) return;

        DataManager.setupNewGame();
        $gameParty._actors = [];
        $gameParty.addActor(this._selectedActorId);

        Scene_StylishName.prepare(this._selectedActorId);
        SceneManager.goto(Scene_StylishName);
    };

    //--------------------------------------------------------------------------
    // Global exposure
    //--------------------------------------------------------------------------

    window.Scene_CharacterSelect = Scene_CharacterSelect;

})();
