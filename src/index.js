/**
 * Build styles
 */
import { initEventBus, EVENTS, clazz } from "@groupher/editor-utils";

import { H1, H2, H3, EYEBROW, FOOTER } from "./constant";
import { LEVELS, normalizeData, getCurrentLevel } from "./helper";

import ToolboxIcon from "./icons/ToolboxIcon.svg";

import H1Icon from "./icons/H1.svg";
import H2Icon from "./icons/H2.svg";
import H3Icon from "./icons/H3.svg";

import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";
import FooterEditIcon from "./icons/FooterEditIcon.svg";

import UI from "./ui";
import "./index.css";

/**
 * @typedef {Object} HeaderData
 * @description Tool's input and output data format
 * @property {String} text — Header's content
 * @property {number} level - Header's level from 1 to 3
 */

/**
 * @typedef {Object} HeaderConfig
 * @description Tool's config from Editor
 * @property {string} placeholder — Block's placeholder
 */

/**
 * Header block for the Editor.js.
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license The MIT License (MIT)
 * @version 2.0.0
 */
export default class Header {
  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {{data: HeaderData, config: HeaderConfig, api: object}}
   *   data — previously saved data
   *   config - user config for Tool
   *   api - Editor.js API
   */
  constructor({ data, config, api }) {
    this.api = api;
    this.listeners = this.api.listeners;

    /**
     * Styles
     * @type {Object}
     */
    this.CSS = {
      block: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: "ce-header-wrapper",

      eyebrowDelete: "ce-header-eyebrow-delete",
      footerDelete: "ce-header-footer-delete",

      tag: "ce-header",
    };

    /**
     * Tool's settings passed from Editor
     * @type {HeaderConfig}
     * @private
     */
    this._settings = config;

    /**
     * Block's data
     * @type {HeaderData}
     * @private
     */
    this._data = normalizeData(data);

    /**
     * Main Block wrapper
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
    this.wrapper = null;
    this.eventBus = initEventBus();

    this.ui = new UI({
      api,
      config,
      data: this._data,
      reRender: this.reRender.bind(this),
      // data: this._data,
    });
  }

  /**
   * Allow to press Enter inside the Header input
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return false;
  }

  /**
   * Return Tool's view
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    this.wrapper = this.ui.render();
    return this.wrapper;
  }

  /**
   * replace element wrapper with new html element
   * @param {HTMLElement} node
   */
  reRender(node) {
    this.wrapper.replaceWith(node);
    this.wrapper = node;
  }

  /**
   * Create Block's settings block
   *
   * @return {HTMLElement}
   */
  renderSettings() {
    return this.ui.renderSettings();
  }

  /**
   * Method that specified how to merge two Text blocks.
   * Called by Editor.js by backspace at the beginning of the Block
   * @param {HeaderData} data
   * @public
   */
  merge(data) {
    let newData = {
      text: this.data.text + data.text,
      level: this.data.level,
    };

    this.data = newData;
  }

  /**
   * Validate Text block data:
   * - check for emptiness
   *
   * @param {HeaderData} blockData — data received after saving
   * @returns {boolean} false if saved data is not correct, otherwise true
   * @public
   */
  validate(blockData) {
    return blockData.text.trim() !== "";
  }

  /**
   * Extract Tool's data from the view
   * @param {HTMLHeadingElement} toolsContent - Text tools rendered view
   * @returns {HeaderData} - saved data
   * @public
   */
  save(toolsContent) {
    return this._data;
  }

  /**
   * Allow Header to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: "text", // use 'text' property for other blocks
      import: "text", // fill 'text' property from other block's export string
    };
  }

  /**
   * Sanitizer Rules
   */
  static get sanitize() {
    return {
      level: {},
    };
  }

  /**
   * Get current Tools`s data
   * @returns {HeaderData} Current data
   * @private
   */
  get data() {
    console.log("# get data: ", this._data);

    this._data.text = this._element.innerHTML;
    this._data.level = getCurrentLevel(this._data).number;

    return this._data;
  }

  /**
   * Store data in plugin:
   * - at the this._data property
   * - at the HTML
   *
   * @param {HeaderData} data — data to set
   * @private
   */
  set data(data) {
    console.log("header set data: ", data);
    this._data = this.normalizeData(data);

    /**
     * If level is set and block in DOM
     * then replace it to a new block
     */
    if (data.level !== undefined && this._element.parentNode) {
      /**
       * Create a new tag
       * @type {HTMLHeadingElement}
       */
      let newHeader = this.getTag();

      /**
       * Save Block's content
       */
      newHeader.innerHTML = this._element.innerHTML;

      /**
       * Replace blocks
       */
      this._element.parentNode.replaceChild(newHeader, this._element);

      /**
       * Save new block to private variable
       * @type {HTMLHeadingElement}
       * @private
       */
      this._element = newHeader;
    }

    /**
     * If data.text was passed then update block's content
     */
    if (data.text !== undefined) {
      this._element.innerHTML = this._data.text || "";
    }
  }

  /**
   * Get tag for target level
   * By default returns second-leveled header
   * @return {HTMLElement}
   */
  getTag() {
    /**
     * Create element for current Block's level
     */
    let tag = document.createElement(getCurrentLevel(this._data).tag);

    /**
     * Add text to block
     */
    tag.innerHTML = this._data.text || "";

    /**
     * Add styles class
     */
    clazz.add(tag, this.CSS.tag);

    /**
     * Make tag editable
     */
    tag.contentEditable = "true";

    /**
     * Add Placeholder
     */
    tag.dataset.placeholder = this._settings.placeholder || "";

    this.listeners.on(tag, "input", (ev) => {
      this._data.text = ev.target.innerText;
    });

    return tag;
  }

  /**
   * Handle H1-H3 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const content = event.detail.data;

    /**
     * Define default level value
     * @type {number}
     */
    let level = 2;

    switch (content.tagName) {
      case H1:
        level = 1;
        break;
      /** H2 is a default level */
      case H3:
        level = 3;
        break;
    }

    this.data = {
      level,
      text: content.innerHTML,
    };
  }

  /**
   * Used by Editor.js paste handling API.
   * Provides configuration to handle H1-H6 tags.
   *
   * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: [H1, H2, H3],
    };
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @return {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: ToolboxIcon,
      title: "标题",
    };
  }

  removed() {
    const curBlockIndex = this.api.blocks.getCurrentBlockIndex();

    this.eventBus.publish(EVENTS.KEEP_PARAGRAPH_AFTER_REMOVED, curBlockIndex);
  }
}
