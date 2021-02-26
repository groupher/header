import { make, clazz } from "@groupher/editor-utils";

import { EYEBROW, FOOTER } from "./constant";

import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";
import DeleteIcon from "./icons/Delete.svg";
import FooterEditIcon from "./icons/FooterEditIcon.svg";

import { LEVELS, normalizeData, getCurrentLevel } from "./helper";

export default class UI {
  constructor({ api, config, data, reRender }) {
    this.api = api;
    this.config = config;
    this._data = data;

    this._settings = config;
    this.listeners = api.listeners;

    this.reRender = reRender;

    /**
     * List of settings buttons
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];
    /**
     * Main Block wrapper
     * @type {HTMLElement}
     * @private
     */
    this._element = null; //  this.getTag();
    this.wrapper = null;
  }

  /**
   * CSS classes
   * @constructor
   */
  get CSS() {
    return {
      wrapper: "ce-header-wrapper",
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      tag: "ce-header",
      // baseBlock: this.api.styles.block,
      addIcon: "ce-header-add-icon",
      eyebrowDelete: "ce-header-eyebrow-delete",
      footerDelete: "ce-header-footer-delete",

      // adder
      eyebrowAdder: "ce-header-eyebrow-adder",
      eyebrowAdderText: "ce-header-eyebrow-adder-text",
      // footer
      footerAdder: "ce-header-footer-adder",
      footerAdderText: "ce-header-footer-adder-text",

      // sub title
      eyebrowTitleInput: "ce-header-eyebrow-title-input",
      footerTitleInput: "ce-header-footer-title-input",
      eyebrowTitle: "ce-header-eyebrow-title",
      footerTitle: "ce-header-footer-title",
    };
  }

  /**
   * Return Tool's view
   * @returns {HTMLHeadingElement}
   * @public
   */
  render() {
    const { level, eyebrowTitle, footerTitle, text } = this._data;

    this.wrapper = make("div", this.CSS.wrapper);
    this._element = this.getTag();

    if (level === 1) {
      if (eyebrowTitle !== undefined) this._drawEyebrowEl();
      if (footerTitle !== undefined) this._drawFooterEl();

      if (this.eyebrowElement) {
        this.wrapper.appendChild(this.eyebrowElement);
      }

      this.wrapper.appendChild(this._element);

      if (this.footerElement) {
        this.wrapper.appendChild(this.footerElement);
      }
    } else {
      delete this._data.eyebrowTitle;
      delete this._data.footerTitle;

      this.eyebrowElement = null;
      this.footerElement = null;

      this.wrapper.appendChild(this._element);
    }

    return this.wrapper;
  }

  _reRender() {
    this.render();
    this.api.tooltip.hide();
    this.api.toolbar.close();
    return this.reRender(this.wrapper);
  }

  /**
   * Create Block's settings block
   *
   * @return {HTMLElement}
   */
  renderSettings() {
    let wrapperEl = document.createElement("DIV");

    /** Add type selectors */
    LEVELS.forEach((level) => {
      let selectTypeButtonEl = document.createElement("SPAN");

      clazz.add(selectTypeButtonEl, this.CSS.settingsButton);

      /**
       * Highlight current level button
       */
      if (getCurrentLevel(this._data).number === level.number) {
        clazz.add(selectTypeButtonEl, this.CSS.settingsButtonActive);
      }

      /**
       * Add SVG icon
       */
      selectTypeButtonEl.innerHTML = level.svg;

      /**
       * Save level to its button
       */
      selectTypeButtonEl.dataset.level = level.number;

      /**
       * Set up click handler
       */
      this.listeners.on(selectTypeButtonEl, "click", () => {
        this.setLevel(level.number);
        this.api.tooltip.hide();
        this.api.toolbar.close();

        this._reRender();
      });

      this.api.tooltip.onHover(selectTypeButtonEl, `${level.number}级标题`, {
        placement: "top",
      });
      /**
       * Append settings button to holder
       */
      wrapperEl.appendChild(selectTypeButtonEl);

      /**
       * Save settings buttons
       */
      this.settingsButtons.push(selectTypeButtonEl);
    });

    if (this._data.level === 1) {
      const eyeBrowButton = this._drawSubtitleSetting(EYEBROW);
      const footerEditButton = this._drawSubtitleSetting(FOOTER);

      wrapperEl.appendChild(eyeBrowButton);
      wrapperEl.appendChild(footerEditButton);
    }

    return wrapperEl;
  }

  /**
   * Callback for Block's settings buttons
   * @param level
   */
  setLevel(level) {
    // this._data = {
    //   level: level,
    //   text: this._data.text,
    // };
    this._data.level = level;

    /**
     * Highlight button by selected level
     */
    this.settingsButtons.forEach((button) => {
      clazz.toggle(
        button,
        this.CSS.settingsButtonActive,
        parseInt(button.dataset.level) === level
      );
    });
  }

  _drawSubtitleSetting(type = EYEBROW) {
    const target = type === EYEBROW ? this.eyebrowElement : this.footerElement;
    const icon = type === EYEBROW ? EyeBrowIcon : FooterEditIcon;
    const title = type === EYEBROW ? "眉标题" : "脚标题";

    const buttonEl = make("span", this.CSS.settingsButton, {
      innerHTML: icon,
    });

    const currentState = this.isSubtitleInputActive(type, target);
    /**
     * Highlight current level button
     */
    if (currentState) {
      clazz.add(buttonEl, this.CSS.settingsButtonActive);
    }

    this.api.tooltip.onHover(buttonEl, title, { placement: "top" });
    this.listeners.on(buttonEl, "click", () => {
      this._handleSubtitleSettingClick(type);
      this.api.tooltip.hide();
      this.api.toolbar.close();
    });

    return buttonEl;
  }

  /**
   * handle subtitle click from settings menu
   * @param level
   * @return void
   */
  _handleSubtitleSettingClick(type) {
    const target = type === EYEBROW ? this.eyebrowElement : this.footerElement;
    const isActive = this.isSubtitleInputActive(type, target);

    if (type === EYEBROW) {
      isActive ? this._removeEyebrow() : this._drawEyebrowTitle();
    } else {
      isActive ? this._removeFooter() : this._drawFooterTitle();
    }

    this._reRender();
    return;
  }

  /**
   * rebuild whole block with eyebrow title active
   * @public
   */
  _drawEyebrowEl() {
    const wrapperEl = make("div", this.CSS.wrapper);
    this._drawEyebrowTitle(this._data.eyebrowTitle);
    const EyebrowInputEl = this.eyebrowElement.querySelector(
      `.${this.CSS.eyebrowTitleInput}`
    );

    /**
     * sync current value to _data
     */
    this.listeners.on(EyebrowInputEl, "input", (e) => {
      this._data.eyebrowTitle = EyebrowInputEl.innerHTML;
    });

    /**
     * if deleteBtn icon clicked, then switch to adder
     */
    const DeleteBtnEl = this.eyebrowElement.querySelector(
      `.${this.CSS.eyebrowDelete}`
    );
    this.listeners.on(DeleteBtnEl, "click", () => this._removeEyebrow());

    this._element = this.getTag();

    wrapperEl.appendChild(this.eyebrowElement);
    wrapperEl.appendChild(this._element);

    if (this.footerElement) {
      wrapperEl.appendChild(this.footerElement);
    }

    this.wrapper.replaceWith(wrapperEl);
    this.wrapper = wrapperEl;

    // this.focusInput(EYEBROW, this.eyebrowElement);
  }

  /**
   * rebuild whole block with footer title active
   * @public
   */
  _drawFooterEl() {
    const wrapperEl = make("div", this.CSS.wrapper);
    this._drawFooterTitle(this._data.footerTitle);
    const FooterInputEl = this.footerElement.querySelector(
      `.${this.CSS.footerTitleInput}`
    );

    /**
     * sync current value to _data
     */
    this.listeners.on(FooterInputEl, "input", (e) => {
      this._data.footerTitle = FooterInputEl.innerHTML;
    });

    /**
     * if deleteBtn icon clicked, then switch to adder
     */
    const DeleteBtnEl = this.footerElement.querySelector(
      `.${this.CSS.footerDelete}`
    );

    this.listeners.on(DeleteBtnEl, "click", () => this._removeFooter());

    this._element = this.getTag();

    if (this.eyebrowElement) {
      wrapperEl.appendChild(this.eyebrowElement);
    }
    wrapperEl.appendChild(this._element);
    wrapperEl.appendChild(this.footerElement);

    this.wrapper.replaceWith(wrapperEl);
    this.wrapper = wrapperEl;

    // this.focusInput(FOOTER, this.footerElement);
  }

  /**
   * @param {type} string
   * @param {text} string
   * @returns {HTMLElement}
   * @public
   */
  _drawEyebrowTitle(text = "") {
    const css = this.CSS.eyebrowTitle;
    const inputCSS = this.CSS.eyebrowTitleInput;

    // set eyebrowTitle to '', otherwise reRender will skip to draw in next render
    this._data.eyebrowTitle = text;

    this.eyebrowElement = make("div", css);

    const titleInputEl = make("div", inputCSS, {
      contentEditable: true,
      innerHTML: text,
      placeholder: "眉标题",
    });

    titleInputEl.addEventListener("blur", (e) => {
      const value = e.target.innerHTML;
      // 如果点击了但是没有输入，那么重新恢复成 Adder 的样子
      if (value.trim() === "") {
        this._removeEyebrow();
      }
    });

    const deleteBtn = make("div", this.CSS.eyebrowDelete, {
      innerHTML: DeleteIcon,
    });

    this.eyebrowElement.appendChild(deleteBtn);
    this.eyebrowElement.appendChild(titleInputEl);

    return this.eyebrowElement;
  }

  /**
   * @param {type} string
   * @param {text} string
   * @returns {HTMLElement}
   * @public
   */
  _drawFooterTitle(text = "") {
    const css = this.CSS.footerTitle;

    // set footerTitle to '', otherwise reRender will skip to draw in next render
    this._data.footerTitle = text;

    this.footerElement = make("div", css);

    const titleInputEl = make("div", this.CSS.footerTitleInput, {
      contentEditable: true,
      innerHTML: text,
      placeholder: "脚标题",
    });

    titleInputEl.addEventListener("blur", (e) => {
      const value = e.target.innerHTML;
      // 如果点击了但是没有输入，那么重新恢复成 Adder 的样子
      if (value.trim() === "") {
        this._removeFooter();
      }
    });

    const deleteBtn = make("div", this.CSS.footerDelete, {
      innerHTML: DeleteIcon,
    });

    this.footerElement.appendChild(deleteBtn);
    this.footerElement.appendChild(titleInputEl);

    // set footerTitle to '', otherwise reRender will skip to draw
    // this._data.footerTitle = "";

    return this.footerElement;
  }

  /**
   * focus input inside of subtitle
   *
   * @param {HTMLElement} element
   * @returns {void}
   * @public
   */
  focusInput(type, element) {
    const css =
      type === FOOTER ? this.CSS.footerTitleInput : this.CSS.eyebrowTitleInput;

    const InputEl = element.querySelector(`.${css}`);
    InputEl.focus();
  }

  isSubtitleInputActive(type, element) {
    // element null means there is no subtitle now
    if (!element) return false;

    const css =
      type === FOOTER ? this.CSS.footerTitleInput : this.CSS.eyebrowTitleInput;

    return !!element.querySelector(`.${css}`);
  }

  // get data() {
  //   const data = this.exportData();

  //   this.setData(data);
  //   return data;
  // }
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
   * remove eyebrow element
   *
   * @memberof Header
   * @private
   */
  _removeEyebrow() {
    this.eyebrowElement.remove();
    this.eyebrowElement = null;
    delete this._data.eyebrowTitle;
  }

  /**
   * remove eyebrow element
   *
   * @memberof Header
   * @private
   */
  _removeFooter() {
    this.footerElement.remove();
    this.footerElement = null;
    delete this._data.footerTitle;
  }
}
