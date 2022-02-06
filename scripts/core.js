/** Global Vars */

const moduleprefix = 'HTML to Scene | ';
const moduleid = 'html-to-scene';
const moduleapp = 'html-to-scene';
var FoundryVTTAccess;
var HTMLAccess;
let _diceSoNiceInstalled = false;
let _updateInterval;
let _iFrameNode;

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

	static get forceSceneChanger() {
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

	static get disableSmallTime() {
		return false;
	}

	static get disableBoard() {
		return false;
	}

	static get assistedBidirectionalAccess() {
		return false;
	}

	/** @type {Int} */
	static get allowedRateOfAccess() {
		return 0;
	}

	/** @type {Object} */
	static get flags() {
		return canvas.scene.data.flags;
	}

	/** Getters */
	static get enabled() {
		return Boolean(this.flags.htmltoscene?.enable);
	}

	static get fileLoc() {
		return String(this.flags.htmltoscene?.fileLoc ?? this.fileLocation);
	}

	static get minUI() {
		return Boolean(this.flags.htmltoscene?.minUI ?? this.minimalUI);
	}

	static get keepTop() {
		return Boolean(this.flags.htmltoscene?.keepTop ?? this.forceSceneChanger);
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

	static get dataUpdateRate() {
		return Number(
			this.flags.htmltoscene?.dataUpdateRate ?? this.allowedRateOfAccess
		);
	}

	static init(...args) {
		//CONFIG.debug.hooks = true;
		loadTemplates(['modules/html-to-scene/templates/sceneSettings.html']);
		console.log(moduleprefix + 'Loaded');
	}

	static replace(...args) {
		if (!this.enabled) {
			this.restoreUI();
			return;
		}
		clearInterval(_updateInterval); //Stoping the update interval.
		this.setUI(); //Sets FoundryVTT's UI as needed.

		//Deleting previous iframe
		if (_iFrameNode != null) document.body.removeChild(_iFrameNode);

		var canvasHeight = '100%';
		var canvasWidth;

		if (this.spaceRight == true) {
			canvasWidth = this.calcSpacedWidth() + 'px'; //Non responsive solution, made responsive in the canvasPan hook.
		} else {
			canvasWidth = '100%'; //Responsive
		}

		console.log(
			moduleprefix +
				'Replacing canvas with responsive height and ' +
				(canvasWidth == '100%' ? 'width' : 'non responsive width')
		);

		//Checking for diceSoNice, then putting the iframe before if that is the case.
		if (!_diceSoNiceInstalled) {
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

		if (this.passData) {
			this.passDataToIFrame(); //Adds FoundryVTT variables to the iframe
		}
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
				$('#ui-top').css({ display: 'inline-block', 'margin-left': '130px' }); //Small fix to the top styling to keep it in the same place (As anvil's anvil disappears)
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
			if (game.paused) {
				//To prevent the game paused indicator to reappear on other scene.
				$('#pause').show();
			}
		}

		if (this.keepTop == true)
			$('#ui-top').css({ display: 'inline-block', 'margin-left': '130px' });

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
		console.log(moduleprefix + 'Restoring FoundryVTT features...');

		//Checking if the iframe still exists, and deleting it in that case.
		if (_iFrameNode != null) document.body.removeChild(_iFrameNode);
		_iFrameNode = null; //Deleting iframe reference.
		//Empties references
		FoundryVTTAccess = null;
		HTMLAccess = null;

		//Restoring FoundryVTT's UI, this might not work with UI modifications.
		$('#ui-left').css('display', 'flex');
		$('#ui-bottom').css('display', 'flex');
		$('#ui-top').css({ display: 'inline-block', 'margin-left': '-90px' }); //Default FoundryVTT value
		$('#ui-right').css('display', 'flex');
		if (game.paused) {
			//To prevent the game paused indicator to reappear on other scene.
			$('#pause').show();
		}
		$('#board').show();
		$('#smalltime-app').show();

		clearInterval(_updateInterval); //Stoping the interval
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
	 * Updates iframe's width in the only case where it isn't responsive on the canvasPan hook (Triggered on a window size change).
	 */
	static updateWidth() {
		if (this.enabled && this.spaceRight) {
			$('#htmltoiframe').width(this.calcSpacedWidth());
		}
	}

	/**
	 * Updates paused status after load.
	 */
	static pauseControl() {
		if (this.enabled) {
			if (game.paused) {
				//To prevent the game paused indicator to reappear on other scene.
				$('#pause').show();
			} else {
				$('#pause').hide();
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
		ifrm.setAttribute('id', moduleapp);
		ifrm.setAttribute('frameBorder', '0');
		ifrm.width = width;
		ifrm.height = height;
		ifrm.style.position = 'absolute';
		ifrm.style.left = 0;
		ifrm.style.top = 0;
		ifrm.frameborder = 0;
		_iFrameNode = ifrm;
		return _iFrameNode;
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
			`<a class="item" data-tab="htmltoscene"><i class="fas fa-file-code"></i> ${game.i18n.localize(
				'htmltoscene.title'
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

	/* Module compatibility hooks */

	/**
	 * Changes iframe position to one before the nodeID given.
	 * @param {HTML node ID attribute} nodeID
	 */
	static swapPosition(nodeID) {
		//Checking if the iframe still exists, and deleting it in that case.
		//Doing it visually doesn't cause a iFrame reload.
		var otherNode = document.getElementById(nodeID);
		let otherZIndex = getComputedStyle(otherNode).getPropertyValue('z-index');
		getComputedStyle(_iFrameNode).setProperty('z-index', otherZIndex - 1);
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

	/**
	 * Makes syncing an external HTML file and FoundryVTT somewhat easier.
	 * You could implement this in a cheaper way doing it in a barebones way doing the references yourself.
	 * But in some cases, injecting an object to an iframe could be useful. Ex: https://docs.godotengine.org/en/stable/classes/class_javascriptobject.html#class-javascriptobject
	 *
	 * This essentially uses two global unused objects: FoundryVTTAccess and HTMLAccess
	 * HTMLAccess is intended to for within Foundry, enabling direct modification of the iFrame (using <iframe>.contentWindow)
	 * Similarly, FoundryVTTAccess is intended to use in an HTML file, enabling you to use the full Foundry API, the 'game' variable and some helpers from the HTML file.
	 * FoundryVTTAccess doesn't interface everything, neither tries to. It only interfaces things that aren't canvas related (because that will be replaced).
	 *
	 * Also, it handles the update rate of FoundryVTTAccess. (Doing it in the bare-bones way would be equivalent to using it in real-time, and you wouldn't have to use a promise in your file)
	 *
	 * The main idea behind this is to lower the barrier to entry. Being able to be used with knowledge, and basic html/css/js, but in the right hands it could be very powerful.
	 */
	static passDataToIFrame() {
		//Throwing some foundry variables to the iframe (LONG)
		console.log(moduleprefix + 'Passing FoundryVTT variables...');

		//Setting update rate
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
		console.log(moduleprefix + this.dataUpdateRate + ' ' + updateMs);

		//Copying references
		class FoundryVTT {
			//Update rate (Helper)
			static get updateRate() {
				return updateMs;
			}

			//Default game
			static get game() {
				return game;
			}
			// Document
			static get Document() {
				return Document;
			}
			static get ClientDatabaseBackend() {
				return ClientDatabaseBackend;
			}
			static get DocumentCollection() {
				return DocumentCollection;
			}
			static get WorldCollection() {
				return WorldCollection;
			}
			static get CompendiumCollection() {
				return CompendiumCollection;
			}
			// Actor
			static get Actor() {
				return Actor;
			}
			static get Actors() {
				return Actors;
			}
			static get ActorSheet() {
				return ActorSheet;
			}
			static get ActorDirectory() {
				return ActorDirectory;
			}
			// Chat
			static get ChatMessage() {
				return ChatMessage;
			}
			static get Messages() {
				return Messages;
			}
			static get ChatLog() {
				return ChatLog;
			}
			// Combat Encounter
			static get Combat() {
				return Combat;
			}
			static get CombatEncounters() {
				return CombatEncounters;
			}
			static get CombatTracker() {
				return CombatTracker;
			}
			// Item
			static get Item() {
				return Item;
			}
			static get Items() {
				return Items;
			}
			static get ItemSheet() {
				return ItemSheet;
			}
			static get ItemDirectory() {
				return ItemDirectory;
			}
			// Folder
			static get Folder() {
				return Folder;
			}
			static get Folders() {
				return Folders;
			}
			static get FolderConfig() {
				return FolderConfig;
			}
			// Journal Entry
			static get JournalEntry() {
				return JournalEntry;
			}
			static get Journal() {
				return Journal;
			}
			static get JournalSheet() {
				return JournalSheet;
			}
			static get JournalDirectory() {
				return JournalDirectory;
			}
			// Macro
			static get Macro() {
				return Macro;
			}
			static get Macros() {
				return Macros;
			}
			static get MacroConfig() {
				return MacroConfig;
			}
			static get MacroDirectory() {
				return MacroDirectory;
			}
			// Playlist
			static get Playlist() {
				return ChatLog;
			}
			static get Playlists() {
				return Playlists;
			}
			static get PlaylistConfig() {
				return PlaylistConfig;
			}
			static get PlaylistDirectory() {
				return PlaylistDirectory;
			}
			// RollTable
			static get RollTable() {
				return RollTable;
			}
			static get RollTables() {
				return RollTables;
			}
			static get RollTableConfig() {
				return RollTableConfig;
			}
			static get RollTableDirectory() {
				return RollTableDirectory;
			}
			// Scene
			static get Scene() {
				return Scene;
			}
			static get Scenes() {
				return Scenes;
			}
			static get SceneConfig() {
				return SceneConfig;
			}
			static get SceneDirectory() {
				return SceneDirectory;
			}
			static get SceneNavigation() {
				return SceneNavigation;
			}
			// Setting
			static get ClientSettings() {
				return ClientSettings;
			}
			static get Settings() {
				return Settings;
			}
			// User
			static get User() {
				return User;
			}
			static get Users() {
				return Users;
			}
			static get UserConfig() {
				return UserConfig;
			}
			static get PlayerList() {
				return PlayerList;
			}
			//Application Building Blocks
			static get Application() {
				return Application;
			}
			static get FormApplication() {
				return FormApplication;
			}
			static get DocumentSheet() {
				return DocumentSheet;
			}
			static get Dialog() {
				return Dialog;
			}
			static get ContextMenu() {
				return ContextMenu;
			}
			static get FilePicker() {
				return FilePicker;
			}
			static get Tabs() {
				return Tabs;
			}
			static get TextEditor() {
				return TextEditor;
			}
			static get DragDrop() {
				return DragDrop;
			}
			// Dice Rolling
			static get Roll() {
				return Roll;
			}
			static get RollTerm() {
				return RollTerm;
			}
			static get MersenneTwister() {
				return MersenneTwister;
			}
			static get DiceTerm() {
				return DiceTerm;
			}
			static get MathTerm() {
				return MathTerm;
			}
			static get NumericTerm() {
				return NumericTerm;
			}
			static get OperatorTerm() {
				return OperatorTerm;
			}
			static get PoolTerm() {
				return PoolTerm;
			}
			static get StringTerm() {
				return StringTerm;
			}
			// Dice Types
			static get Die() {
				return Die;
			}
			static get Coin() {
				return Coin;
			}
			static get FateDie() {
				return FateDie;
			}
			//Other Major Components
			static get AudioHelper() {
				return AudioHelper;
			}
			static get ImageHelper() {
				return ImageHelper;
			}
			static get Sound() {
				return Sound;
			}
			static get VideoHelper() {
				return VideoHelper;
			}
			static get Game() {
				return Game;
			}
			static get GameTime() {
				return GameTime;
			}
			static get AVMaster() {
				return AVMaster;
			}
			static get AVClient() {
				return AVClient;
			}
			static get SimplePeerAVClient() {
				return SimplePeerAVClient;
			}
			static get Hooks() {
				return Hooks;
			}
			static get KeyboardManager() {
				return KeyboardManager;
			}
			static get SocketInterface() {
				return SocketInterface;
			}
			//Other
			static get CONFIG() {
				return CONFIG;
			}
		}
		//FoundryVTTAccess = FoundryVTT;
		FoundryVTTAccess = FoundryVTT;
		_iFrameNode.contentWindow.FoundryVTT = FoundryVTTAccess;
		HTMLAccess = _iFrameNode.contentWindow.document;

		//Setting the Updates
		if (updateMs >= 0) {
			_updateInterval = setInterval(() => {
				_iFrameNode.contentWindow.FoundryVTT = FoundryVTTAccess;
			}, updateMs);
		}
	}
}

// Handlebars helpers

Handlebars.registerHelper('ifEquals', function (v1, v2, options) {
	if (v1 === v2) {
		return options.fn(this);
	}
	return options.inverse(this);
});

// Hooks section

Hooks.once('init', (...args) => HTMLToScene.init(...args));

Hooks.on('renderSceneConfig', (...args) =>
	HTMLToScene.renderSceneConfig(...args)
);
Hooks.on('canvasReady', (...args) => HTMLToScene.replace(...args));
Hooks.on('updateScene', (...args) => HTMLToScene.replace(...args));
Hooks.on('canvasPan', () => HTMLToScene.updateWidth());
Hooks.on('collapseSidebar', () => HTMLToScene.updateWidth());
Hooks.on('renderSmallTimeApp', () => HTMLToScene.updateSmallTime());
Hooks.on('pauseGame', () => HTMLToScene.pauseControl());

Hooks.on('diceSoNiceReady', () => {
	HTMLToScene.swapPosition('dice-box-canvas');
	_diceSoNiceInstalled = true;
});
