import { HTMLToScene } from '../classes/HTMLToScene.js';

/**
 * @module html-to-scene.HTMLToSceneHooks
 */

class HTMLToSceneHooks {
	static hook() {
		Hooks.once('init', (...args) => HTMLToScene.init(...args));
		Hooks.once('ready', (...args) => HTMLToScene.debugMode());

		Hooks.on('canvasReady', (...args) => HTMLToScene.replace(...args));
		Hooks.on('updateScene', (...args) => HTMLToScene.replace(...args));

		Hooks.on('canvasPan', () => HTMLToScene.updateDimensions());

		Hooks.on('renderSmallTimeApp', () => HTMLToScene.updateSmallTime());
		Hooks.on('diceSoNiceReady', () => {
			HTMLToScene.swapPosition('dice-box-canvas');
			HTMLToScene._diceSoNiceInstalled = true;
		});
		Hooks.on('lightingRefresh', () => HTMLToScene.updateSceneControls()); //renderSceneControls happens before the scene data is loaded

		Hooks.on('renderSceneConfig', (...args) =>
			HTMLToScene.renderSceneConfig(...args)
		);

		Hooks.on('collapseSidebar', () => HTMLToScene.updateDimensions());

		Hooks.on('pauseGame', () => HTMLToScene.pauseControl());

		/**
		 * Own hooks
		 */

		Hooks.on('htmlToSceneReady', () => HTMLToScene.htmlToSceneReadyMacro());

		Hooks.on('htmlToSceneIFrameReady', () => HTMLToScene.htmlAccessSetter());

		Hooks.on('htmlToSceneIFrameReady', () =>
			HTMLToScene.htmlToSceneIFrameReadyMacro()
		);

		Hooks.on('htmlToSceneIFrameUpdated', () =>
			HTMLToScene.htmlToSceneIFrameUpdatedMacro()
		);
	}
}

export { HTMLToSceneHooks };
