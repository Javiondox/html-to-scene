import { HTMLToScene } from './HTMLToScene.js';

/**
 * @module html-to-scene.FoundryVTTInterface
 */

class FoundryVTTInterface {
	/**
	 *  FOUNDRY VTT SPECIFIC
	 */

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

	/**
	 * HTML TO SCENE EXTRAS
	 */

	static get updateRate() {
		return HTMLToScene.getUpdateRateInMs();
	}

	static get iFrameReady() {
		Hooks.call('htmlToSceneIFrameReady', this);
	}

	static get iFrameUpdated() {
		Hooks.call('htmlToSceneIFrameUpdated', this);
	}
}

export { FoundryVTTInterface };
