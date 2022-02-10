import { FoundryVTTInterface } from './FoundryVTTInterface.js';
import { ModuleSettings } from '../modules/modulesettings.js';
import { ModuleInfo } from '../core.js';
import { HTMLToSceneHelpers } from '../modules/modulehelpers.js';

/**
 *  HTML To Scene static class
 *
 * @class HTMLToScene
 */

class HTMLToScene {
	/** Global Vars */

	static FoundryVTTAccess;
	static HTMLAccess;

	static _diceSoNiceInstalled = false;
	static _updateInterval;
	static _refreshingInterval;
	static _iFrameNode;
	static _oldBottomStatus = 1;
	static _oldLeftStatus = 6;
	static _lastSceneWasHTML = false;
	static _localJQuery;

	/** @type {String} */
	static get fileLocation() {
		return '';
	}

	static get htmltosceneReadyMacro() {
		return '';
	}

	static get iframeReadyMacro() {
		return '';
	}

	static get iframeUpdatedMacro() {
		return '';
	}

	/** @type {Boolean} */
	static get minimalUI() {
		return true;
	}

	static get forceSceneChanger() {
		return true;
	}

	static get forcePlayerList() {
		return false;
	}

	static get respectRightControls() {
		return true;
	}

	static get disableRightControls() {
		return false;
	}

	static get disableGamePausedStatus() {
		return false;
	}

	static get disableSmallTime() {
		return false;
	}

	static get disableBoard() {
		return false;
	}

	static get assistedBidirectionalAccess() {
		return false;
	}

	static get autoMacros() {
		return false;
	}

	static get showFoundryLogo() {
		return game.settings.get(ModuleInfo.moduleid, 'showFoundryLogo');
	}

	/** @type {Number} */
	static get lowerUISettings() {
		return 0;
	}

	static get allowedRateOfAccess() {
		return 0;
	}

	static get iFrameRefreshingRate() {
		return 0;
	}

	/** @type {Object} */
	static get flags() {
		return canvas.scene.data.flags;
	}

	/** Getters **/

	/* Booleans */
	static get enabled() {
		return Boolean(this.flags.htmltoscene?.enable);
	}

	static get minUI() {
		return Boolean(this.flags.htmltoscene?.minUI ?? this.minimalUI);
	}

	static get keepTop() {
		return Boolean(this.flags.htmltoscene?.keepTop ?? this.forceSceneChanger);
	}

	static get keepPlayerList() {
		return Boolean(
			this.flags.htmltoscene?.keepPlayerList ?? this.forcePlayerList
		);
	}

	static get spaceRight() {
		return Boolean(
			this.flags.htmltoscene?.spaceRight ?? this.respectRightControls
		);
	}

	static get rightDisabled() {
		return Boolean(
			this.flags.htmltoscene?.rightDisabled ?? this.disableRightControls
		);
	}

	static get hidePaused() {
		return Boolean(
			this.flags.htmltoscene?.hidePaused ?? this.disableGamePausedStatus
		);
	}

	static get hideSmallTime() {
		return Boolean(
			this.flags.htmltoscene?.hideSmallTime ?? this.disableSmallTime
		);
	}

	static get hideBoard() {
		return Boolean(this.flags.htmltoscene?.hideBoard ?? this.disableBoard);
	}

	static get passData() {
		return Boolean(
			this.flags.htmltoscene?.passData ?? this.assistedBidirectionalAccess
		);
	}

	static get autoMacrosEnabled() {
		return Boolean(
			this.flags.htmltoscene?.autoMacrosEnabled ?? this.autoMacros
		);
	}

	/* Numbers */

	static get keepBottomControls() {
		return Number(
			this.flags.htmltoscene?.keepBottomControls ?? this.lowerUISettings
		);
	}

	static get dataUpdateRate() {
		return Number(
			this.flags.htmltoscene?.dataUpdateRate ?? this.allowedRateOfAccess
		);
	}

	static get iFrameRefreshRate() {
		return Number(
			this.flags.htmltoscene?.iFrameRefreshRate ?? this.iFrameRefreshingRate
		);
	}

	/* Strings */

	static get fileLoc() {
		return String(this.flags.htmltoscene?.fileLoc ?? this.fileLocation);
	}

	static get selfReadyMacroName() {
		return String(
			this.flags.htmltoscene?.selfReadyMacroName ?? this.htmltosceneReadyMacro
		);
	}

	static get iframeReadyMacroName() {
		return String(
			this.flags.htmltoscene?.iframeReadyMacroName ?? this.iframeReadyMacro
		);
	}

	static get iframeUpdatedMacroName() {
		return String(
			this.flags.htmltoscene?.iframeUpdatedMacroName ?? this.iframeUpdatedMacro
		);
	}

	static init(...args) {
		loadTemplates(['modules/html-to-scene/templates/sceneSettings.html']);
		ModuleSettings.registerSettings();
		console.log(ModuleInfo.moduleprefix + 'Loaded');
	}

	static replace(...args) {
		if (!this.enabled) {
			this.restoreUI();
			this._lastSceneWasHTML = false;
			//this.saveUIStatus();
			return;
		}
		this._lastSceneWasHTML = true;
		this.stopActiveIntervals();
		this.setUI(); //Sets FoundryVTT's UI as needed.

		//Deleting previous iframe
		if (this._iFrameNode != null) document.body.removeChild(this._iFrameNode);

		var canvasHeight = '100%';
		var canvasWidth = '';

		if (this.spaceRight == true && !this.rightDisabled) {
			canvasWidth = this.calcSpacedWidth() + 'px'; //Non responsive solution, made responsive in the canvasPan hook.
		} else {
			canvasWidth = '100%'; //Responsive
		}

		console.log(
			ModuleInfo.moduleprefix +
				'Replacing canvas with responsive height and ' +
				(canvasWidth == '100%' ? 'width' : 'non responsive width')
		);

		//Checking for diceSoNice, then putting the iframe before if that is the case.
		if (!this._diceSoNiceInstalled) {
			document.body.insertBefore(
				this.createIframe(canvasHeight, canvasWidth),
				document.getElementById('pause')
			);
		} else {
			document.body.insertBefore(
				this.createIframe(canvasHeight, canvasWidth),
				document.getElementById('dice-box-canvas')
			);
		}

		Hooks.call('htmlToSceneReady', this);

		if (this.passData) {
			this.passDataToIFrame(); //Adds FoundryVTT variables to the iframe
		}

		if (this.iFrameRefreshRate > 0) {
			this._refreshingInterval = setInterval(() => {
				this.refreshIFrame();
			}, this.iFrameRefreshRate);
		}
	}

	/**
	 * Hides or shows FoundryVTT UI elements depending on user preferences for the scene.
	 *
	 * @param  {...any} args
	 */
	static setUI(...args) {
		//TODO Test how it works with themes. Might have to store the previous state. (It's supposed to be stored thanks to jQuery)
		if (!this._lastSceneWasHTML) {
			//Stores the bottom UI starting status from a page where the module was inactive.
			this._oldBottomStatus = this.getBottomStatus();
			this._oldLeftStatus = this.getLeftStatus();
		}
		//Here the redundancy is important, in the case of the user changes options in the same scene. Learned the hard way.
		if (this.minUI == true) {
			this.setLeftStatus(0);
			this.setBottomStatus(0);
			if (this.rightDisabled) {
				this.nodeVisibility($('#ui-right')[0], 'hidden');
				this.nodeVisibility($('#ui-top')[0], 'visible');
			} else {
				this.nodeVisibility($('#ui-top')[0], 'hidden');
				this.nodeVisibility($('#ui-right')[0], 'visible');
			}
		} else {
			this.setLeftStatus(this._oldLefttatus);
			this.setBottomStatus(this._oldBottomStatus);
			this.nodeVisibility($('#ui-top')[0], 'visible');
			if (this.rightDisabled) {
				this.nodeVisibility($('#ui-right')[0], 'hidden');
			} else {
				this.nodeVisibility($('#ui-right')[0], 'visible');
			}
		}

		if (this.hidePaused == true) {
			this.nodeVisibility($('#pause')[0], 'hidden');
		} else {
			if (game.paused) {
				//To prevent the game paused indicator to reappear on other scene.
				this.nodeVisibility($('#pause')[0], 'visible');
			}
		}

		if (this.keepTop == true) this.nodeVisibility($('#ui-top')[0], 'visible');

		if (this.keepPlayerList == true) {
			this.nodeVisibility($('#ui-left')[0], 'visible');
			this.setLeftStatus(7);
		}

		this.nodeVisibility($('#ui-bottom')[0], 'visible');
		this.setBottomStatus(this.keepBottomControls);

		//This uses jQuery's .hide() and .show() that work like display:none and display:whateverwasbefore
		if (this.hideBoard == true) {
			$('#board').hide();
		} else {
			$('#board').show();
		}

		this.updateSmallTime();
	}
	/**
	 * Shows back FoundryVTT UI elements.
	 *
	 * @param  {...any} args
	 */
	//TODO Test how it works with themes. Might have to store the previous state.
	static restoreUI(...args) {
		console.log(ModuleInfo.moduleprefix + 'Restoring FoundryVTT features...');

		//Checking if the iframe still exists, and deleting it in that case.
		if (this._iFrameNode != null) document.body.removeChild(this._iFrameNode);
		this._iFrameNode = null; //Deleting iframe reference.
		//Empties references
		this.FoundryVTTAccess = null;
		this.HTMLAccess = null;

		//Restoring FoundryVTT's UI, this might not work with UI modifications.
		this.nodeVisibility($('#ui-left')[0], 'visible');
		this.nodeVisibility($('#ui-bottom')[0], 'visible');
		this.nodeVisibility($('#hotbar')[0], 'visible');
		this.nodeVisibility($('#ui-top')[0], 'visible');
		this.nodeVisibility($('#ui-right')[0], 'visible');
		if (game.paused) {
			//To prevent the game paused indicator to reappear on other scene.
			this.nodeVisibility($('#pause')[0], 'visible');
		}
		$('#board').show();
		$('#smalltime-app').show();

		this.stopActiveIntervals();
		this.setBottomStatus(this._oldBottomStatus);
		this.setLeftStatus(this._oldLeftStatus);
	}

	/**
	 *
	 * @returns Width of the screen in pixels minus the width of the right controls
	 */
	static calcSpacedWidth() {
		let rightControlsElement = document.getElementById('ui-right');
		let widthUImod = '' + rightControlsElement.offsetWidth;
		return (
			(window.innerWidth ||
				document.documentElement.clientWidth ||
				document.body.clientWidth) - widthUImod
		);
	}

	/**
	 * Updates iframe's dimensions in the only case where it isn't responsive on the canvasPan hook (Triggered on a window size change).
	 */
	static updateDimensions() {
		if (this.enabled && this.spaceRight && !this.rightDisabled) {
			$('#' + ModuleInfo.moduleapp).width(this.calcSpacedWidth());
			$('#' + ModuleInfo.moduleapp).height('100%');
		}
	}

	/**
	 * Updates paused status after load.
	 */
	static pauseControl() {
		if (this.enabled) {
			if (game.paused) {
				//To prevent the game paused indicator to reappear on other scene.
				this.nodeVisibility($('#pause')[0], 'visible');
			} else {
				this.nodeVisibility($('#pause')[0], 'hidden');
			}
		}
	}

	/**
	 * Creates and returns a iframe node with a given height and width.
	 *
	 * @param {String} height
	 * @param {String} width
	 * @returns
	 */
	static createIframe(height, width) {
		var ifrm = document.createElement('iframe');
		ifrm.setAttribute('src', this.fileLoc);
		ifrm.setAttribute('id', ModuleInfo.moduleapp);
		ifrm.setAttribute('frameBorder', '0');
		ifrm.width = width;
		ifrm.height = height;
		ifrm.style.position = 'absolute';
		ifrm.style.left = 0;
		ifrm.style.top = 0;
		ifrm.frameborder = 0;
		this._iFrameNode = ifrm;
		return this._iFrameNode;
	}

	/* Scene configuration code */

	/**
	 * Handles the renderSceneConfig Hook
	 *
	 * Injects HTML into the scene config.
	 * @param {SceneConfig} sceneConfig
	 * @param {jQuery} html
	 * @param {Object} data
	 */

	static async renderSceneConfig(sceneConfig, html, data) {
		const ambItem = html.find('.item[data-tab=ambience]');
		const ambTab = html.find('.tab[data-tab=ambience]');

		ambItem.after(
			`<a class="item" data-tab="htmltoscene"><i class="fas fa-file-code"></i> ${game.i18n.localize(
				'htmltoscene.modulename'
			)}</a>`
		);
		let sceneTemplateData = await this.getSceneTemplateData(data);
		ambTab.after(await this.getSceneHtml(sceneTemplateData));

		//Filepicker
		/*$('#html-picker').click(() => {
			const fp = new FilePicker({
				type: 'any',
				button: 'html-picker',
				title: 'Select a HTML file',
				callback: (url) => {
					console.log(url);
				},
			});
			fp.browse();
		});*/
	}

	/**
	 * Retrieves the current data for the scene being configured.
	 *
	 * @static
	 * @param {object} data - The data being passed to the scene config template
	 * @return {HTMLToSceneSettings}
	 * @memberof HTMLToScene
	 */
	static getSceneTemplateData(hookData) {
		const data = hookData.data?.flags?.htmltoscene || {
			enable: false,
			fileLoc: '',
			minUI: true,
			spaceRight: true,
			rightDisabled: false,
			hidePaused: false,
		};
		return data;
	}

	/**
	 * Fills the template with correct values.
	 *
	 * @param {HTMLToSceneSettings} settings
	 */
	static async getSceneHtml(settings) {
		return await renderTemplate(
			'modules/html-to-scene/templates/sceneSettings.html',
			settings
		);
	}

	/* Scene configuration END */

	/* Module compatibility hooks */

	/**
	 * Changes iframe position to one before the nodeID given.
	 * @param {HTML Node's ID} nodeID
	 */
	static swapPosition(nodeID) {
		//Checking if the iframe still exists, and deleting it in that case.
		//Doing it visually doesn't cause a iFrame reload.
		var otherNode = document.getElementById(nodeID);
		if (otherNode != null && typeof otherNode == 'htmlelement') {
			let otherZIndex = getComputedStyle(otherNode).getPropertyValue('z-index');
			getComputedStyle(this._iFrameNode).setProperty(
				'z-index',
				otherZIndex - 1
			);
		}
	}

	/**
	 * Updates SmallTime with module preferences when loaded
	 */
	static updateSmallTime() {
		if (this.hideSmallTime == true && this.enabled) {
			$('#smalltime-app').hide();
		} else {
			$('#smalltime-app').show();
		}
	}

	/* Module compatibility hooks END */

	/* Control Handling */

	/**
	 * Updates Scene controls (this is needed on a scene change)
	 */
	static updateSceneControls() {
		if (this.enabled) {
			if (this.keepPlayerList == true) {
				this.nodeVisibility($('#ui-left')[0], 'visible');
				this.setLeftStatus(7);
			} else {
				if (this.minUI) {
					this.setLeftStatus(0);
				} else {
					this.setLeftStatus(this._oldLeftStatus);
				}
			}
			if (this.minUI) {
				this.nodeVisibility($('#ui-bottom')[0], 'visible');
				this.setBottomStatus(this.keepBottomControls);
			} else {
				this.setBottomStatus(this._oldBottomStatus);
			}
		}
	}

	/**
	 * Get bottom ui's status and returns it.
	 *
	 * @returns {Number} between 0 and 7.
	 */
	static getBottomStatus() {
		let status = 0;
		let hotbar = this.isDOMNodeShown($('#hotbar')[0]);
		let camera = this.isDOMNodeShown($('#camera-views')[0]);
		let fps = this.isDOMNodeShown($('#fps')[0]);
		status = hotbar + camera * 2 + fps * 3;

		if (hotbar + camera == 0 && status == 3) status = 7; //Special status to show only the FPS
		return status;
	}

	/**
	 * Sets the bottom UI due the variable
	 *
	 * @param {bottomStatus} needs a number between 0 and 7
	 */
	static setBottomStatus(bottomStatus) {
		switch (bottomStatus) {
			case 0:
				this.nodeVisibility($('#hotbar')[0], 'hidden');
				this.nodeVisibility($('#camera-views')[0], 'hidden');
				this.nodeVisibility($('#fps')[0], 'hidden');
				break;
			case 1:
				this.nodeVisibility($('#hotbar')[0], 'visible');
				this.nodeVisibility($('#camera-views')[0], 'hidden');
				this.nodeVisibility($('#fps')[0], 'hidden');
				break;
			case 2:
				this.nodeVisibility($('#hotbar')[0], 'hidden');
				this.nodeVisibility($('#camera-views')[0], 'visible');
				this.nodeVisibility($('#fps')[0], 'hidden');
				break;
			case 3:
				this.nodeVisibility($('#hotbar')[0], 'visible');
				this.nodeVisibility($('#camera-views')[0], 'visible');
				this.nodeVisibility($('#fps')[0], 'hidden');
				break;
			case 4:
				this.nodeVisibility($('#hotbar')[0], 'visible');
				this.nodeVisibility($('#camera-views')[0], 'hidden');
				this.nodeVisibility($('#fps')[0], 'visible');
				break;
			case 5:
				this.nodeVisibility($('#hotbar')[0], 'hidden');
				this.nodeVisibility($('#camera-views')[0], 'visible');
				this.nodeVisibility($('#fps')[0], 'visible');
				break;
			case 6:
				this.nodeVisibility($('#hotbar')[0], 'visible');
				this.nodeVisibility($('#camera-views')[0], 'visible');
				this.nodeVisibility($('#fps')[0], 'visible');
				break;
			case 7:
				this.nodeVisibility($('#hotbar')[0], 'hidden');
				this.nodeVisibility($('#camera-views')[0], 'hidden');
				this.nodeVisibility($('#fps')[0], 'visible');
				break;
		}
	}

	/**
	 * Get left ui's status and returns it.
	 *
	 * @returns {Number} between 0 and 7.
	 */
	static getLeftStatus() {
		let status = 0;
		let logo = this.isDOMNodeShown($('#logo')[0]);
		let controls = this.isDOMNodeShown($('#controls')[0]);
		let players = this.isDOMNodeShown($('#players')[0]);
		status = logo + controls * 2 + players * 3;

		if (logo + controls == 0 && players == 3) status = 7; //Special status to show only the players
		return status;
	}

	/**
	 * Sets the bottom UI due the variable
	 *
	 * @param {leftStatus} needs a number between 0 and 7
	 */
	static setLeftStatus(leftStatus) {
		switch (leftStatus) {
			case 0:
				this.nodeVisibility($('#logo')[0], 'hidden');
				this.nodeVisibility($('#controls')[0], 'hidden');
				this.nodeVisibility($('#players')[0], 'hidden');
				break;
			case 1:
				this.nodeVisibility($('#logo')[0], 'visible');
				this.nodeVisibility($('#controls')[0], 'hidden');
				this.nodeVisibility($('#players')[0], 'hidden');
				break;
			case 2:
				this.nodeVisibility($('#logo')[0], 'hidden');
				this.nodeVisibility($('#controls')[0], 'visible');
				this.nodeVisibility($('#players')[0], 'hidden');
				break;
			case 3:
				this.nodeVisibility($('#logo')[0], 'visible');
				this.nodeVisibility($('#controls')[0], 'visible');
				this.nodeVisibility($('#players')[0], 'hidden');
				break;
			case 4:
				this.nodeVisibility($('#logo')[0], 'visible');
				this.nodeVisibility($('#controls')[0], 'hidden');
				this.nodeVisibility($('#players')[0], 'visible');
				break;
			case 5:
				this.nodeVisibility($('#logo')[0], 'hidden');
				this.nodeVisibility($('#controls')[0], 'visible');
				this.nodeVisibility($('#players')[0], 'visible');
				break;
			case 6:
				this.nodeVisibility($('#logo')[0], 'visible');
				this.nodeVisibility($('#controls')[0], 'visible');
				this.nodeVisibility($('#players')[0], 'visible');
				break;
			case 7:
				this.nodeVisibility($('#logo')[0], 'hidden');
				this.nodeVisibility($('#controls')[0], 'hidden');
				this.nodeVisibility($('#players')[0], 'visible');
				break;
		}
	}

	/**
	 * Checks element's visibility
	 * @param {HTMLElement} el
	 * @returns Boolean
	 */
	static isDOMNodeShown(el) {
		return el.style.visibility != 'hidden' ? true : false;
	}

	/**
	 * Stores current status as the old (Called in renderSceneControls' hook)
	 */
	static saveUIStatus() {
		this._oldLeftStatus = this.getLeftStatus();
		this._oldBottomStatus = this.getBottomStatus();
	}

	/* Control Handling END */

	/* Data passing */

	/**
	 * Makes syncing an external HTML file and FoundryVTT somewhat easier.
	 * You could implement this in a cheaper way doing it in a barebones way doing the references yourself.
	 * But in some cases, injecting an object to an iframe could be useful. Ex: https://docs.godotengine.org/en/stable/classes/class_javascriptobject.html#class-javascriptobject
	 *
	 * This essentially uses two global unused objects on ../core.js: FoundryVTTAccess and HTMLAccess
	 * HTMLAccess is intended to for within Foundry, enabling direct modification of the iFrame (using <iframe>.contentWindow)
	 * Similarly, FoundryVTTAccess is intended to use in an HTML file, enabling you to use the full Foundry API, the 'game' variable and some helpers from the HTML file.
	 * FoundryVTTAccess doesn't interface everything, neither tries to. It only interfaces things that aren't canvas related (because that will be replaced).
	 *
	 * Also, it handles the update rate of FoundryVTTAccess. (Doing it in the bare-bones way would be equivalent to using it in real-time, and you wouldn't have to use a promise in your file)
	 *
	 * The main idea behind this is to lower the barrier to entry. Being able to be used with knowledge, and basic html/css/js, but in the right hands it could be very powerful.
	 */
	static passDataToIFrame() {
		//Throwing some foundry variables to the iframe
		console.log(ModuleInfo.moduleprefix + 'Passing FoundryVTT variables...');

		let updateMs = this.getUpdateRateInMs();
		this.FoundryVTTAccess = FoundryVTTInterface;
		this._iFrameNode.contentWindow.FoundryVTT = this.FoundryVTTAccess;

		//Setting the Updates
		if (updateMs >= 0 && !this.fileLoc.startsWith('http')) {
			this._updateInterval = setInterval(() => {
				this._iFrameNode.contentWindow.FoundryVTT = this.FoundryVTTAccess;
			}, updateMs);
		}

		if (this.debugMode()) {
			window.FoundryVTTAccess = this.FoundryVTTAccess;
		}
	}

	static htmlAccessSetter() {
		this.HTMLAccess = this._iFrameNode.contentWindow.document;
		window.HTMLAccess = this.HTMLAccess; //Injecting it for macro usage
	}

	/**
	 * @returns The time in Ms that was selected in the dataUpdateRate setting
	 */
	static getUpdateRateInMs() {
		let updateMs;
		switch (this.dataUpdateRate) {
			case 1:
				updateMs = 5000;
				break;
			case 2:
				updateMs = 1000;
				break;
			case 3:
				updateMs = 500;
				break;
			case 4:
				updateMs = 250;
				break;
			case 5:
				updateMs = 10; //All web browsers have a capped minimum to not overload people's computers. Just in case, I left it at 10ms. No so much real-time for you!
				break;
			default:
				updateMs = -1;
				break;
		}
		return updateMs;
	}

	/* Data passing END */

	/* AutoMacros */

	static htmlToSceneReadyMacro() {
		if (this.enabled && this.autoMacrosEnabled) {
			(async () => {
				while (!window.hasOwnProperty('HTMLAccess'))
					await new Promise((resolve) => setTimeout(resolve, 10));
				HTMLToSceneHelpers.runMacroByName(this.selfReadyMacroName);
			})();
		}
	}

	static htmlToSceneIFrameReadyMacro() {
		if (this.enabled && this.autoMacrosEnabled)
			(async () => {
				while (!window.hasOwnProperty('HTMLAccess'))
					await new Promise((resolve) => setTimeout(resolve, 10));
				HTMLToSceneHelpers.runMacroByName(this.iframeReadyMacroName);
			})();
	}

	static htmlToSceneIFrameUpdatedMacro() {
		if (this.enabled && this.autoMacrosEnabled)
			(async () => {
				while (!window.hasOwnProperty('HTMLAccess'))
					await new Promise((resolve) => setTimeout(resolve, 10));
				HTMLToSceneHelpers.runMacroByName(this.iframeUpdatedMacroName);
			})();
	}

	/* AutoMacros END */

	/* Misc */

	/**
	 * Stops active intervals used by the module
	 */
	static stopActiveIntervals() {
		clearInterval(this._updateInterval);
		clearInterval(this._refreshingInterval);
	}

	/**
	 * Forces a IFrame refresh
	 */
	static refreshIFrame() {
		console.log(ModuleInfo.moduleprefix + 'Refreshing IFrame...');
		let iframe = document.getElementById(ModuleInfo.moduleapp);
		iframe.src = iframe.src;
	}

	/**
	 * Visibility Helper
	 * @param {HTMLElement} DOMNode
	 * @param {String} visibility
	 */
	static nodeVisibility(DOMNode, visibility) {
		if (
			DOMNode === '#logo' &&
			visibility === 'visible' &&
			!this.showFoundryLogo()
		)
			return; //showFoundryLogo setting
		if (visibility == 'visible' || visibility == 'hidden') {
			DOMNode.style.visibility = visibility;
		} else if (visibility == 'toggle') {
			DOMNode.visibility = () => {
				return DOMNode.style.visibility == 'visible' ? 'hidden' : 'visible';
			};
		}
	}

	// Debug mode, returns true if active
	static debugMode() {
		if (game.user.name == 'debug' || CONFIG.debug.moduleDebug) {
			CONFIG.debug.hooks = true;
			window.HTMLToScene = this; //Exposes class to the javascript console on the browser
			return true;
		} else {
			return false;
		}
	}

	/* Misc END */
}

export { HTMLToScene };
