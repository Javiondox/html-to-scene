import { HTMLToSceneHooks } from './modules/hooks.js';
import { HTMLToSceneHelpers } from './modules/modulehelpers.js';

/**
 * Contains information that is used in various parts of the module.
 * @class ModuleInfo
 */

class ModuleInfo {
	static moduleprefix = 'HTML to Scene | ';
	static moduleid = 'html-to-scene';
	static moduleapp = 'html-to-scene';
}

HTMLToSceneHooks.hook();
HTMLToSceneHelpers.init();

export { ModuleInfo };
