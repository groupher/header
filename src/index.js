/**
 * Build styles
 */
import { initEventBus, EVENTS, make } from "@groupher/editor-utils";

import ToolboxIcon from "./icons/ToolboxIcon.svg";

import H1Icon from "./icons/H1.svg";
import H2Icon from "./icons/H2.svg";
import H3Icon from "./icons/H3.svg";

import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";
import FooterEditIcon from "./icons/FooterEditIcon.svg";

import Ui from "./ui";
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
    // demo: "data": {
    //   text: "this is a title",
    //   level: 1,
    //   eyebrowTitle: 'eyebrow title',
    //   footerTitle: 'footer title',
    // }

    this._data = this.normalizeData(data);

    /**
     * List of settings buttons
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];

    // TODO:  document this
    this.eyebrowElement = null;
    this.footerElement = null;

    /**
     * Main Block wrapper
     * @type {HTMLElement}
     * @private
     */
    this._element = this.getTag();
    this.wrapper = null;
    this.eventBus = initEventBus();

    this.ui = new Ui({
      api,
      config,
      // data: this._data,
      // setTune: this.setTune.bind(this),
      // setData: this.setData.bind(this),
    });
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

    // newData.eyebrowTitle = data.eyebrowTitle || null;
    // newData.footerTitle = data.footerTitle || null;
    newData.eyebrowTitle = data.eyebrowTitle || 'eyebrowTitle';
    newData.footerTitle = data.footerTitle || 'footerTitle';

    return newData;
  }

  /**
   * rebuild whole block with eyebrow adder active
   * @public
   */
  buildEyebrowAdder() {
    const wrapper = make("div", this.CSS.wrapper);
    this.eyebrowElement = this.ui.makeEyebrowAdder();

    this.eyebrowElement.addEventListener("click", () => {
      this.buildEyebrowTitle();
    });

    this._element = this.getTag();
    wrapper.appendChild(this.eyebrowElement);
    wrapper.appendChild(this._element);
    wrapper.appendChild(this.footerElement);

    this.wrapper.replaceWith(wrapper);
    this.wrapper = wrapper;
  }

  /**
   * rebuild whole block with footer adder active
   * @public
   */
  buildFooterAdder() {
    const wrapper = make("div", this.CSS.wrapper);
    this.footerElement = this.ui.makeFooterAdder();

    this.footerElement.addEventListener("click", () => {
      this.buildFooterTitle();
    });

    this._element = this.getTag();
    wrapper.appendChild(this.eyebrowElement);
    wrapper.appendChild(this._element);
    wrapper.appendChild(this.footerElement);

    this.wrapper.replaceWith(wrapper);
    this.wrapper = wrapper;
  }

  /**
   * rebuild whole block with eyebrow title active
   * @public
   */
  buildEyebrowTitle() {
    const wrapper = make("div", this.CSS.wrapper);
    this.eyebrowElement = this.ui.makeTitle("eyebrow");

    const deleteBtn = this.eyebrowElement.querySelector(`.${this.CSS.prefix}`);
    deleteBtn.addEventListener("click", () => {
      this.buildEyebrowAdder();
    });

    this._element = this.getTag();
    wrapper.appendChild(this.eyebrowElement);
    wrapper.appendChild(this._element);
    wrapper.appendChild(this.footerElement);

    // console.log("this.eyebrowElement.parentNode -> ", this.eyebrowElement.parentNode)
    // this.eyebrowElement.parentNode.innerHTML = wrapper
    // this.eyebrowElement.parentNode.replaceChild(wrapper, this.eyebrowElement);

    // old
    this.wrapper.replaceWith(wrapper);
    this.wrapper = wrapper;

    this.ui.focusInput(this.eyebrowElement);
  }

  /**
   * rebuild whole block with footer title active
   * @public
   */
  buildFooterTitle() {
    const wrapper = make("div", this.CSS.wrapper);
    this.footerElement = this.ui.makeTitle("footer");

    const deleteBtn = this.footerElement.querySelector(`.${this.CSS.prefix}`);
    deleteBtn.addEventListener("click", () => {
      this.buildFooterAdder();
    });

    this._element = this.getTag();
    wrapper.appendChild(this.eyebrowElement);
    wrapper.appendChild(this._element);
    wrapper.appendChild(this.footerElement);

    this.wrapper.replaceWith(wrapper);
    this.wrapper = wrapper;

    this.ui.focusInput(this.footerElement);
  }

  /**
   * Return Tool's view
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    const { level, eyebrowTitle, footerTitle } = this._data
    this.wrapper = make("div", this.CSS.wrapper);
    if (level === 1) {
      this.eyebrowElement = eyebrowTitle ? this.ui.makeTitle("eyebrow", eyebrowTitle) : this.ui.makeEyebrowAdder()
      this.footerElement = footerTitle ? this.ui.makeTitle("footer", footerTitle) : this.ui.makeFooterAdder()
    }

    this.api.listeners.on(this.eyebrowElement, "click", () => {
      this.buildEyebrowTitle();
    }, false);

    this.api.listeners.on(this.footerElement, "click", () => {
      this.buildFooterTitle();
    }, false);

    this.wrapper.appendChild(this.eyebrowElement);
    this.wrapper.appendChild(this._element);
    this.wrapper.appendChild(this.footerElement);

    return this.wrapper;
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
      this.api.listeners.on(
        selectTypeButton,
        "click",
        () => {
          this.setLevel(level.number);
          this.api.tooltip.hide();
          this.api.toolbar.close();
        },
        false
      );

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

    if (this.data.level === 1) {
      const eyeBrowButton = this.makeSubtitleSetting("eyebrow");
      const footerEditButton = this.makeSubtitleSetting("footer");

      holder.appendChild(eyeBrowButton);
      holder.appendChild(footerEditButton);
    }

    return holder;
  }

  makeSubtitleSetting(type = "eyebrow") {
    const target =
      type === "eyebrow" ? this.eyebrowElement : this.footerElement;
    const icon = type === "eyebrow" ? EyeBrowIcon : FooterEditIcon;
    const title = type === "eyebrow" ? "眉标题" : "脚标题";

    const element = make("span", this.CSS.settingsButton, {
      innerHTML: icon,
    });

    const currentState = this.ui.isSubtitleInputActive(target)
    // console.log("check eyebrowElement --> ", this.eyebrowElement);
    /**
     * Highlight current level button
     */
    if (currentState) {
      element.classList.add(this.CSS.settingsButtonActive);
    }

    this.api.tooltip.onHover(element, title, { placement: "top" });
    this.api.listeners.on(
      element,
      "click",
      () => {
        this.handleSubtitleSettingClick(type)
        this.api.tooltip.hide();
        this.api.toolbar.close();
      },
      false
    );

    return element;
  }

  /**
   * handle subtitle click from settings menu
   * @param level
   * @return void
   */
  handleSubtitleSettingClick(type) {
    const target =
      type === "eyebrow" ? this.eyebrowElement : this.footerElement;

    const currentState = this.ui.isSubtitleInputActive(target)

    if (type === 'eyebrow') {
      currentState ? this.buildEyebrowAdder() : this.buildEyebrowTitle()
      return
    }

    currentState ? this.buildFooterAdder() : this.buildFooterTitle()
    return
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
    // console.log("## save: ", this.wrapper);
    // console.log("## toolsContent: ", toolsContent)
    // console.log("this.eyebrowElement: ", this.eyebrowElement)
    // console.log("this.footerElement: ", this.footerElement)

    const data = {
      text: toolsContent.querySelector(`.${this.CSS.tag}`).innerHTML,
      level: this.currentLevel.number,
    }

    data.eyebrowTitle = this.eyebrowElement.querySelector(`.${this.ui.CSS.subTitleInput}`).innerHTML
    data.footerTitle = this.footerElement.querySelector(`.${this.ui.CSS.subTitleInput}`).innerHTML

    console.log("data -> : ", data)

    return data;
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
   * restore eyebrow & footer title
   * @private
   */
  restoreSubTitles() {
    this.eyebrowElement.style.display = "flex";
    this.footerElement.style.display = "flex";
  }

  /**
   * show eyebrow & footer title
   * @private
   */
  removeSubTitles() {
    this.eyebrowElement.style.display = "none";
    this.footerElement.style.display = "none";
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

    if (data.level !== 1) {
      this.removeSubTitles();
    } else {
      this.restoreSubTitles();
    }

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
