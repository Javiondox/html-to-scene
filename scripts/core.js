/**
 *  HTML To Scene static class
 *
 * @class HTMLToScene
 */

class HTMLToScene {
	/** @type {String} */
	static get fileLocation() {
		return '';
	}

	/** @type {Boolean} */
	static get minimalUI() {
		return true;
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

	//static get displayOnTop() { return false }; //REMOVED: Potential for getting stuck. This allowed the iframe to be displayed on top of the hud.
	/** @type {Object} */
	static get flags() {
		return canvas.scene.data.flags;
	}

	static get enabled() {
		return Boolean(this.flags.htmltoscene?.enable);
	}

	static get fileLoc() {
		return String(this.flags.htmltoscene?.fileLoc ?? this.fileLocation);
	}

	static get minUI() {
		return Boolean(this.flags.htmltoscene?.minUI ?? this.minimalUI);
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

	static init(...args) {
		//CONFIG.debug.hooks = true
		loadTemplates(['modules/html-to-scene/templates/sceneSettings.html']);
		console.log('HTML to Scene | Loaded');
	}

	static replace(...args) {
		if (!this.enabled) {
			this.restoreUI();
			return;
		}
		this.setUI(); //Sets FoundryVTT's UI as needed.

		//Deleting previous iframe
		var iframeNode = document.getElementById('htmltoiframe');
		if (iframeNode != null) document.body.removeChild(iframeNode);

		var canvasHeight = '100%';
		var canvasWidth;
		var widthUImod = 0;

		if (this.spaceRight == true) {
			var rightControlsElement = document.getElementById('ui-right');
			console.log('HTML to Scene |' + rightControlsElement.offsetWidth);
			widthUImod = rightControlsElement.offsetWidth;
			canvasWidth =
				(window.innerWidth ||
					document.documentElement.clientWidth ||
					document.body.clientWidth) - widthUImod; //Non responsive solution
		} else {
			canvasWidth = '100%'; //Responsive
		}

		console.log(
			'HTML to Scene | Replacing canvas with responsive height and' +
				(canvasWidth == '100%' ? 'width' : 'non responsive width')
		);

		var pauseNode = document.getElementById('pause');

		document.body.insertBefore(
			this.createIframe(canvasHeight, canvasWidth),
			pauseNode
		);
	}

	static setUI(...args) {
		if (this.minUI == true) {
			document.getElementById('ui-left').style.display = 'none';
			document.getElementById('ui-bottom').style.display = 'none';
			if (this.rightDisabled == false) {
				document.getElementById('ui-top').style.display = 'none';
			} else {
				document.getElementById('ui-right').style.display = 'none';
				document.getElementById('ui-top').style.marginLeft = '130px'; //Small fix to the top styling
			}
		} else {
			if (this.rightDisabled == true) {
				document.getElementById('ui-right').style.display = 'none';
			}
		}
		if (this.hidePaused == true) {
			document.getElementById('pause').style.display = 'none';
		}
	}

	static restoreUI(...args) {
		console.log('HTML to Scene | Restoring FoundryVTT features...');
		var iframeNode = document.getElementById('htmltoiframe');
		if (iframeNode != null) document.body.removeChild(iframeNode);
		iframeNode = null;

		//Restoring FoundryVTT's UI, this might not work with UI modifications.
		document.getElementById('ui-left').style.display = 'flex';
		document.getElementById('ui-bottom').style.display = 'flex';
		document.getElementById('ui-top').style.display = 'inline-block';
		document.getElementById('ui-right').style.display = 'flex';
		document.getElementById('ui-top').style.marginLeft = '-90px'; //Default FoundryVTT value
		document.getElementById('pause').style.display = 'block';
	}

	static createIframe(height, width) {
		var ifrm = document.createElement('iframe');
		ifrm.setAttribute('src', this.fileLoc);
		ifrm.setAttribute('id', 'htmltoiframe');
		ifrm.setAttribute('frameBorder', '0');
		ifrm.width = width;
		ifrm.height = height;
		ifrm.style.position = 'absolute';
		ifrm.style.left = 0;
		ifrm.style.top = 0;
		ifrm.frameborder = 0;

		/**
		*
	   	* See displayOnTop() (Also commented)
		*
		* if (displayOnTop == true) {
		*	ifrm.style.zIndex = 2147483649;
		}**/

		return ifrm;
	}

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
			`<a class="item" data-tab="htmltoscene"><i class="fas fa-html5"></i> ${game.i18n.localize(
				'htmltoscene.title'
			)}</a>`
		);
		ambTab.after(await this.getSceneHtml(this.getSceneTemplateData(data)));
		$('#filepickerinput').val(this.fileLoc);
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
			showPaused: false,
		};
		return data;
	}

	static async getSceneHtml(settings) {
		return await renderTemplate(
			'modules/html-to-scene/templates/sceneSettings.html',
			settings
		);
	}
}

// Hooks section

Hooks.once('init', (...args) => HTMLToScene.init(...args));

Hooks.on('renderSceneConfig', (...args) =>
	HTMLToScene.renderSceneConfig(...args)
);
Hooks.on('canvasReady', (...args) => HTMLToScene.replace(...args));
Hooks.on('updateScene', (...args) => HTMLToScene.replace(...args));
