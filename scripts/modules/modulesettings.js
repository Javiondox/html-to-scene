import { ModuleInfo } from '../core.js';
import { HTMLToSceneCompat } from './modulehelpers.js';

/**
 * @module html-to-scene.ModuleSettings
 */

class ModuleSettings {
	/**
	 * @module html-to-scene.ModuleSettings.registerSettings
	 *
	 * @description Register ModuleSettings with core Foundry
	 * @static
	 */

	static registerSettings() {
		const WORLD = 'world';

		game.settings.register(ModuleInfo.moduleid, 'showFoundryLogo', {
			name: game.i18n.localize('htmltoscene.worldsettings.showLogo.name'),
			hint: game.i18n.localize('htmltoscene.worldsettings.showLogo.hint'),
			scope: WORLD,
			config: true,
			default: !HTMLToSceneCompat.checkModule('minimal-ui'), //With MinimalUI will be disabled by default, even if now should work correctly
			type: Boolean,
		});
	}
}
export { ModuleSettings };
