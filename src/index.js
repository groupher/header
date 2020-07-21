/**
 * Build styles
 */
import { initEventBus, EVENTS, make } from "@groupher/editor-utils";

import ToolboxIcon from "./icons/ToolboxIcon.svg";

import H1Icon from "./icons/H1.svg";
import H2Icon from "./icons/H2.svg";
import H3Icon from "./icons/H3.svg";
import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";

import DeleteIcon from "./icons/Delete.svg";

import FooterEditIcon from "./icons/FooterEditIcon.svg";

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

    /**
     * Styles
     * @type {Object}
     */
    this.CSS = {
      block: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: "ce-header-wrapper",
      prefix: "ce-header-prefix",
      subTitleInput: "ce-header-sub-title-input",
      eyebrowTitle: "ce-header-eyebrow-title",
      footerTitle: "ce-header-footer-title",

      eyebrowAdder: "ce-header-eyebrow-adder",
      eyebrowAdderText: "ce-header-eyebrow-adder-text",

      footerAdder: "ce-header-footer-adder",
      footerAdderText: "ce-header-footer-adder-text",

      editIcon: "ce-header-add-icon",
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
    this._data = this.normalizeData(data);

    /**
     * List of settings buttons
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];

    // TODO:  document this
    this.showEyebrowTitle = false;
    this.showFooterTitle = false;

    this.eyebrowElement = null;
    this.footerElement = null;

    /**
     * Main Block wrapper
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
    this.eventBus = initEventBus();
  }

  /**
   * Normalize input data
   * @param {HeaderData} data
   * @return {HeaderData}
   * @private
   */
  normalizeData(data) {
    const newData = {};

    if (typeof data !== "object") {
      data = {};
    }

    newData.text = data.text || "";
    newData.level = parseInt(data.level) || this.defaultLevel.number;

    return newData;
  }

  makeEyebrowAdder() {
    const eyebrowAdder = make("div", this.CSS.eyebrowAdder);
    const eyebrowAdderText = make("div", this.CSS.eyebrowAdderText, {
      innerHTML: "眉标题",
    });

    const eyeBrowIcon = make("div", this.CSS.editIcon, {
      innerHTML: EyeBrowIcon,
    });

    eyebrowAdder.appendChild(eyeBrowIcon);
    eyebrowAdder.appendChild(eyebrowAdderText);

    return eyebrowAdder;
  }

  makeFooterAdder() {
    const footerAdder = make("div", this.CSS.footerAdder);
    const footerAdderText = make("div", this.CSS.footerAdderText, {
      innerHTML: "脚标题",
    });

    const footerEditIcon = make("div", this.CSS.editIcon, {
      innerHTML: FooterEditIcon,
    });

    footerAdder.appendChild(footerEditIcon);
    footerAdder.appendChild(footerAdderText);

    return footerAdder;
  }

  makeTitle(type = "footer") {
    const css =
      type === "footer" ? this.CSS.footerTitle : this.CSS.eyebrowTitle;
    const placeholder = type === "footer" ? "输入脚标题" : "输入眉标题";

    const title = make("div", css);

    const titleInput = make("div", this.CSS.subTitleInput, {
      contentEditable: true,
      innerHTML: placeholder,
      "data-placeholder": placeholder,
    });

    // see https://htmldom.dev/placeholder-for-a-contenteditable-element/
    titleInput.addEventListener("focus", function (e) {
      const value = e.target.innerHTML;
      value === placeholder && (e.target.innerHTML = "");
    });

    titleInput.addEventListener("blur", function (e) {
      const value = e.target.innerHTML;
      value === "" && (e.target.innerHTML = placeholder);
    });

    const deleteBtn = make("div", this.CSS.prefix, {
      innerHTML: DeleteIcon,
    });

    title.appendChild(deleteBtn);
    title.appendChild(titleInput);

    return title;
  }

  /**
   * Return Tool's view
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    const wrapper = make("div", this.CSS.wrapper);
    // this.eyebrowElement = this.makeTitle("eyebrow");
    // this.footerElement = this.makeTitle("footer");
    this.eyebrowElement = this.makeEyebrowAdder();
    this.footerElement = this.makeFooterAdder();

    this.eyebrowElement.addEventListener("click", () => {
      this.eyebrowElement.replaceWith(this.makeTitle("eyebrow"));
    });

    wrapper.appendChild(this.eyebrowElement);
    wrapper.appendChild(this._element);
    wrapper.appendChild(this.footerElement);

    return wrapper;
  }

  /**
   * Create Block's settings block
   *
   * @return {HTMLElement}
   */
  renderSettings() {
    let holder = document.createElement("DIV");

    /** Add type selectors */
    this.levels.forEach((level) => {
      let selectTypeButton = document.createElement("SPAN");

      selectTypeButton.classList.add(this.CSS.settingsButton);

      /**
       * Highlight current level button
       */
      if (this.currentLevel.number === level.number) {
        selectTypeButton.classList.add(this.CSS.settingsButtonActive);
      }

      /**
       * Add SVG icon
       */
      selectTypeButton.innerHTML = level.svg;

      /**
       * Save level to its button
       */
      selectTypeButton.dataset.level = level.number;

      /**
       * Set up click handler
       */
      selectTypeButton.addEventListener("click", () => {
        this.setLevel(level.number);
      });

      this.api.tooltip.onHover(selectTypeButton, `${level.number}级标题`, {
        placement: "top",
      });
      /**
       * Append settings button to holder
       */
      holder.appendChild(selectTypeButton);

      /**
       * Save settings buttons
       */
      this.settingsButtons.push(selectTypeButton);
    });

    // TODO:
    const eyeBrowButton = make("span", this.CSS.settingsButton, {
      innerHTML: EyeBrowIcon,
    });
    this.api.tooltip.onHover(eyeBrowButton, "眉标题", { placement: "top" });

    const footerEditButton = make("span", this.CSS.settingsButton, {
      innerHTML: FooterEditIcon,
    });
    this.api.tooltip.onHover(footerEditButton, "脚标题", { placement: "top" });

    holder.appendChild(eyeBrowButton);
    holder.appendChild(footerEditButton);

    return holder;
  }

  /**
   * Callback for Block's settings buttons
   * @param level
   */
  setLevel(level) {
    this.data = {
      level: level,
      text: this.data.text,
    };

    /**
     * Highlight button by selected level
     */
    this.settingsButtons.forEach((button) => {
      button.classList.toggle(
        this.CSS.settingsButtonActive,
        parseInt(button.dataset.level) === level
      );
    });
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
    return {
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
    };
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
    this._data.text = this._element.innerHTML;
    this._data.level = this.currentLevel.number;

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
    let tag = document.createElement(this.currentLevel.tag);

    /**
     * Add text to block
     */
    tag.innerHTML = this._data.text || "";

    /**
     * Add styles class
     */
    tag.classList.add(this.CSS.tag);

    /**
     * Make tag editable
     */
    tag.contentEditable = "true";

    /**
     * Add Placeholder
     */
    tag.dataset.placeholder = this._settings.placeholder || "";

    return tag;
  }

  /**
   * Get current level
   * @return {level}
   */
  get currentLevel() {
    let level = this.levels.find(
      (levelItem) => levelItem.number === this._data.level
    );

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  /**
   * Return default level
   * @returns {level}
   */
  get defaultLevel() {
    /**
     * Use H2 as default header
     */
    return this.levels[1];
  }

  /**
   * @typedef {object} level
   * @property {number} number - level number
   * @property {string} tag - tag correspondes with level number
   * @property {string} svg - icon
   */

  /**
   * Available header levels
   * @return {level[]}
   */
  get levels() {
    return [
      {
        number: 1,
        tag: "H1",
        svg: H1Icon,
      },
      {
        number: 2,
        tag: "H2",
        svg: H2Icon,
      },
      {
        number: 3,
        tag: "H3",
        svg: H3Icon,
      },
    ];
  }

  /**
   * Handle H1-H6 tags on paste to substitute it with header Tool
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
      case "H1":
        level = 1;
        break;
      /** H2 is a default level */
      case "H3":
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
      tags: ["H1", "H2", "H3"],
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
