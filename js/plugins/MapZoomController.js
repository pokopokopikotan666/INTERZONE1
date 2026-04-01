(() => {

const DEFAULT_ZOOM = 1.4; // ← adjust this (1.3–1.6 recommended)

/* Apply zoom when map starts */
const _Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
    _Scene_Map_start.call(this);
    this.applyMapZoom(DEFAULT_ZOOM);
};

/* Apply zoom centered on player */
Scene_Map.prototype.applyMapZoom = function(zoom) {
    const x = $gamePlayer.screenX();
    const y = $gamePlayer.screenY();
    $gameScreen.setZoom(x, y, zoom);
};

/* Keep zoom centered while moving */
const _Game_Player_update = Game_Player.prototype.update;
Game_Player.prototype.update = function(sceneActive) {
    _Game_Player_update.call(this, sceneActive);

    if (SceneManager._scene instanceof Scene_Map) {
        const scene = SceneManager._scene;
        if (scene && scene.applyMapZoom) {
            scene.applyMapZoom(DEFAULT_ZOOM);
        }
    }
};

})();