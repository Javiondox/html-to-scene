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
			widthUImod = '' + rightControlsElement.offsetWidth;
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

	/**
	 * Hides or shows FoundryVTT UI elements depending on user preferences for the scene.
	 *
	 * @param  {...any} args
	 */
	static setUI(...args) {
		//TODO Test how it works with themes. Might have to store the previous state.
		//Here the redundancy is important, in the case of the user changes options in the same scene. Learned the hard way.
		if (this.minUI == true) {
			$('#ui-left').hide();
			$('#ui-bottom').hide();
			if (this.rightDisabled == false) {
				$('#ui-top').hide();
				$('#ui-right').css('display', 'flex');
			} else {
				$('#ui-right').hide();
				$('#ui-top').css({ display: 'inline-block', 'margin-left': '130px' }); //Small fix to the top styling to keep it in the same place
			}
		} else {
			$('#ui-top').css({ display: 'inline-block', 'margin-left': '-90px' });
			$('#ui-left').css('display', 'flex');
			$('#ui-bottom').css('display', 'flex');
			if (this.rightDisabled == true) {
				$('#ui-right').hide();
			} else {
				$('#ui-right').css('display', 'flex');
			}
		}

		if (this.hidePaused == true) {
			$('#pause').hide();
		} else {
			$('#pause').show();
		}
	}
	/**
	 * Shows back FoundryVTT UI elements.
	 *
	 * @param  {...any} args
	 */
	//TODO Test how it works with themes. Might have to store the previous state.
	static restoreUI(...args) {
		console.log('HTML to Scene | Restoring FoundryVTT features...');

		//Checking if the iframe still exists, and deleting it in that case.
		var iframeNode = document.getElementById('htmltoiframe');
		if (iframeNode != null) document.body.removeChild(iframeNode);
		iframeNode = null; //Deleting iframe reference.

		//Restoring FoundryVTT's UI, this might not work with UI modifications.
		$('#ui-left').css('display', 'flex');
		$('#ui-bottom').css('display', 'flex');
		$('#ui-top').css({ display: 'inline-block', 'margin-left': '-90px' }); //Default FoundryVTT value
		$('#ui-right').css('display', 'flex');
		$('#pause').show();
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
		ifrm.setAttribute('id', 'htmltoiframe');
		ifrm.setAttribute('frameBorder', '0');
		ifrm.width = width;
		ifrm.height = height;
		ifrm.style.position = 'absolute';
		ifrm.style.left = 0;
		ifrm.style.top = 0;
		ifrm.frameborder = 0;

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
		let sceneTemplateData = await this.getSceneTemplateData(data);
		ambTab.after(await this.getSceneHtml(sceneTemplateData));
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

	/**
	 * Fills the template with correct values.
	 *
	 * @param {HTMLToSceneSettings} settings
	 * @returns
	 */
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
