// Handlebars helpers

/**
 * @module html-to-scene.HTMLToSceneHelpers
 */

class HTMLToSceneHelpers {
	static init() {
		this.handlebarsHelpers();
	}

	static handlebarsHelpers() {
		Handlebars.registerHelper('ifEquals', function (v1, v2, options) {
			if (v1 === v2) {
				return options.fn(this);
			}
			return options.inverse(this);
		});
	}

	static runMacroByName(MacroName) {
		if (game.macros.getName(MacroName) != undefined) {
			game.macros.getName(MacroName).execute();
		}
	}
}

/**
 * @module html-to-scene.HTMLToSceneCompat
 */

class HTMLToSceneCompat {
	/**
	 * Detects if a module is installed AND active or not, this is used for compatibility purposes and setting compatible defaults
	 * @param {String} ModuleID
	 * @returns Boolean
	 */
	static checkModule(ModuleID) {
		if (game.modules.has(ModuleID)) {
			if (game.modules.get(ModuleID).active) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/**
	 * Same as checkModule, but this one will check an array of modules. And if turns to have just one installed and active, it will return true
	 * @param {String} ModuleID
	 * @returns Boolean
	 */
	static checkModules(ModuleIDs) {
		let result = false;
		ModuleIDs.array.forEach((ModuleID) => {
			if (game.modules.has(ModuleID)) {
				if (game.modules.get(ModuleID).active) {
					result = true;
				}
			}
		});
		return result;
	}
}

export { HTMLToSceneHelpers, HTMLToSceneCompat };
