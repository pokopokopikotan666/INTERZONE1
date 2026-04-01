/*:
 * @plugindesc Custom Persona-style Title Screen UI (MV Safe, Fixed Render Order)
 * @author POKOPOKOPIKOTAN
 */

(function () {

    //--------------------------------------------------------------------------
    // Scene_Title Overrides
    //--------------------------------------------------------------------------

    var _Scene_Title_create = Scene_Title.prototype.create;
    Scene_Title.prototype.create = function () {
    _Scene_Title_create.call(this);

    this._customIndex = 0;
    this._customButtons = [];

    // --- NEW: containers ---
    this._selectorLayer = new Sprite();
    this._buttonLayer   = new Sprite();

    this.addChild(this._selectorLayer); // BEHIND
    this.addChild(this._buttonLayer);   // IN FRONT

    this.createCustomButtons();
};


    // Remove default command window
    Scene_Title.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_TitleCommand();
        this._commandWindow.hide();
        this._commandWindow.deactivate();
        this.removeChild(this._commandWindow);
    };

    //--------------------------------------------------------------------------
    // Create Buttons (NO selector yet)
    //--------------------------------------------------------------------------

    Scene_Title.prototype.createCustomButtons = function () {
    var centerX = Graphics.width * 0.80;
    var startY  = Graphics.height * -0.17;
    var spacing = 88;

    var buttonData = [
        { img: "btn_newgame",  handler: this.commandNewGame.bind(this) },
        { img: "btn_continue", handler: this.commandContinue.bind(this) },
        { img: "btn_options",  handler: this.commandOptions.bind(this) },
        { img: "btn_quit",     handler: this.commandQuit.bind(this) }
    ];

    for (var i = 0; i < buttonData.length; i++) {
        var sprite = new Sprite(ImageManager.loadTitle1(buttonData[i].img));
        sprite.anchor.set(0.5, 0.5);
        sprite.x = centerX;
        sprite.y = startY + i * spacing;

        sprite._baseX = sprite.x;
        sprite._baseY = sprite.y;
        sprite._handler = buttonData[i].handler;

        // ❗ ONLY add to buttonLayer
        this._buttonLayer.addChild(sprite);

        this._customButtons.push(sprite);
    }
};


Scene_Title.prototype.commandQuit = function () {
    SoundManager.playOk();
    SceneManager.exit();
};

    //--------------------------------------------------------------------------
    // ADD SELECTOR AFTER FOREGROUND (THIS IS THE KEY)
    //--------------------------------------------------------------------------

    var _Scene_Title_start = Scene_Title.prototype.start;
Scene_Title.prototype.start = function () {
    _Scene_Title_start.call(this);

    // Create selector (layered correctly by containers)
    this.createSelector();
};


    


    Scene_Title.prototype.createSelector = function () {
    this._selector = new Sprite(ImageManager.loadTitle1("selector"));
    this._selector.anchor.set(0.5, 0.5);
    this._selector.opacity = 255;

    this._selectorLayer.addChild(this._selector);

    // Snap animation state
    this._selector._y = this._selector.y;
    this._selector._vy = 0;
};







    //--------------------------------------------------------------------------
    // Update Loop
    //--------------------------------------------------------------------------

    Scene_Title.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        this.updateCustomInput();
        this.updateButtonEffects();
        this.updateSelector();
    };

    //--------------------------------------------------------------------------
    // Input
    //--------------------------------------------------------------------------

    Scene_Title.prototype.updateCustomInput = function () {
        if (Input.isTriggered("down")) {
            this._customIndex =
                (this._customIndex + 1) % this._customButtons.length;
            SoundManager.playCursor();
        }

        if (Input.isTriggered("up")) {
            this._customIndex =
                (this._customIndex + this._customButtons.length - 1) %
                this._customButtons.length;
            SoundManager.playCursor();
        }

        if (Input.isTriggered("ok")) {
            SoundManager.playOk();
            var btn = this._customButtons[this._customIndex];
            if (btn && btn._handler) {
                btn._handler();
            }
        }
    };

    //--------------------------------------------------------------------------
    // Button Effects
    //--------------------------------------------------------------------------

    Scene_Title.prototype.updateButtonEffects = function () {
        for (var i = 0; i < this._customButtons.length; i++) {
            var sprite = this._customButtons[i];
            var selected = (i === this._customIndex);

            var targetScale = selected ? 1.05 : 1.0;
            sprite.scale.x += (targetScale - sprite.scale.x) * 0.2;
            sprite.scale.y = sprite.scale.x;

            var targetOpacity = selected ? 255 : 170;
            sprite.opacity += (targetOpacity - sprite.opacity) * 0.2;

            var targetX = selected ? sprite._baseX + 12 : sprite._baseX;
            sprite.x += (targetX - sprite.x) * 0.2;
        }
    };

    //--------------------------------------------------------------------------
    // Selector Update (NOW VISIBLE)
    //--------------------------------------------------------------------------

    Scene_Title.prototype.updateSelector = function () {
    if (!this._selector) return;

    var btn = this._customButtons[this._customIndex];
    if (!btn) return;

    // Target position (your tuned offsets)
    var targetY = btn.y + 20;
    var targetX = btn.x + 20;

    // Physics values (tweakable)
    var stiffness = 0.45; // how hard it pulls toward target
    var damping   = 0.65; // how fast it settles

    // Vertical snap with overshoot
    var dy = targetY - this._selector._y;
    this._selector._vy += dy * stiffness;
    this._selector._vy *= damping;
    this._selector._y += this._selector._vy;

    // Apply position
    this._selector.y = Math.round(this._selector._y);
    this._selector.x = targetX;
};





})();
