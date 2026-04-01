/*:
 * @plugindesc Safely replace MV font with STIX Two Text (no boot freeze)
 */

(function () {

    const _Scene_Boot_loadGameFonts = Scene_Boot.prototype.loadGameFonts;
    Scene_Boot.prototype.loadGameFonts = function () {
        _Scene_Boot_loadGameFonts.call(this);
        Graphics.loadFont("GameFont", "STIXTwoText.ttf");
    };

})();
