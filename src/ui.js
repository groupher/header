import { make } from "@groupher/editor-utils";

import { FOOTER } from "./constant";

import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";
import DeleteIcon from "./icons/Delete.svg";
import FooterEditIcon from "./icons/FooterEditIcon.svg";

export default class Ui {
  constructor({ api, config, removeEyebrow, removeFooter }) {
    this.api = api;
    this.config = config;

    this.removeEyebrow = removeEyebrow;
    this.removeFooter = removeFooter;
  }

  /**
   * CSS classes
   * @constructor
   */
  get CSS() {
    return {
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

  makeEyebrowAdder() {
    const eyebrowAdder = make("div", this.CSS.eyebrowAdder);
    const eyebrowAdderText = make("div", this.CSS.eyebrowAdderText, {
      innerHTML: "眉标题",
    });

    const eyeBrowIcon = make("div", this.CSS.addIcon, {
      innerHTML: EyeBrowIcon,
    });

    eyebrowAdder.appendChild(eyeBrowIcon);
    eyebrowAdder.appendChild(eyebrowAdderText);

    return eyebrowAdder;
  }

  /**
   * make footer adder, include icon and hint text
   *
   * @returns {HTMLElement}
   * @public
   */
  makeFooterAdder() {
    const footerAdder = make("div", this.CSS.footerAdder);
    const footerAdderText = make("div", this.CSS.footerAdderText, {
      innerHTML: "脚标题",
    });

    const footerEditIcon = make("div", this.CSS.addIcon, {
      innerHTML: FooterEditIcon,
    });

    footerAdder.appendChild(footerEditIcon);
    footerAdder.appendChild(footerAdderText);

    return footerAdder;
  }

  /**
   * @param {type} string
   * @param {text} string
   * @returns {HTMLElement}
   * @public
   */
  makeEyebrowTitle(text) {
    const css = this.CSS.eyebrowTitle;
    const inputCSS = this.CSS.eyebrowTitleInput;

    const placeholder = "";
    const titleEl = make("div", css);

    const titleInput = make("div", inputCSS, {
      contentEditable: true,
      innerHTML: text || placeholder,
      placeholder: "眉标题",
    });

    // see https://htmldom.dev/placeholder-for-a-contenteditable-element/
    titleInput.addEventListener("focus", (e) => {
      const value = e.target.innerHTML;
      value === "" && (e.target.innerHTML = placeholder);
    });

    titleInput.addEventListener("blur", (e) => {
      const value = e.target.innerHTML;
      // 如果点击了但是没有输入，那么重新恢复成 Adder 的样子
      if (value.trim() === "") {
        this.removeEyebrow();
      } else {
        value === "" && (e.target.innerHTML = placeholder);
      }
    });

    const deleteBtn = make("div", this.CSS.eyebrowDelete, {
      innerHTML: DeleteIcon,
    });

    titleEl.appendChild(deleteBtn);
    titleEl.appendChild(titleInput);

    return titleEl;
  }

  /**
   * @param {type} string
   * @param {text} string
   * @returns {HTMLElement}
   * @public
   */
  makeFooterTitle(text) {
    const css = this.CSS.footerTitle;

    const placeholder = "";
    const title = make("div", css);

    const titleInput = make("div", this.CSS.footerTitleInput, {
      contentEditable: true,
      innerHTML: text || placeholder,
      "data-placeholder": text || placeholder,
    });

    // see https://htmldom.dev/placeholder-for-a-contenteditable-element/
    titleInput.addEventListener("focus", (e) => {
      const value = e.target.innerHTML;
      value === "" && (e.target.innerHTML = placeholder);
    });

    titleInput.addEventListener("blur", (e) => {
      const value = e.target.innerHTML;
      // 如果点击了但是没有输入，那么重新恢复成 Adder 的样子
      if (value.trim() === "") {
        this.removeFooter();
      } else {
        value === "" && (e.target.innerHTML = placeholder);
      }
    });

    const deleteBtn = make("div", this.CSS.footerDelete, {
      innerHTML: DeleteIcon,
    });

    title.appendChild(deleteBtn);
    title.appendChild(titleInput);

    return title;
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

    const footerInput = element.querySelector(`.${css}`);
    footerInput.focus();
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
}
