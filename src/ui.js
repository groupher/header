import { make } from "@groupher/editor-utils";

import EyeBrowIcon from "./icons/EyeBrowPlusIcon.svg";
import DeleteIcon from "./icons/Delete.svg";
import FooterEditIcon from "./icons/FooterEditIcon.svg";

export default class Ui {
  constructor({ api, config }) {
    this.api = api;
    this.config = config;
  }

  /**
   * CSS classes
   * @constructor
   */
  get CSS() {
    return {
      // baseBlock: this.api.styles.block,
      addIcon: "ce-header-add-icon",
      prefix: "ce-header-prefix",

      // adder
      eyebrowAdder: "ce-header-eyebrow-adder",
      eyebrowAdderText: "ce-header-eyebrow-adder-text",
      // footer
      footerAdder: "ce-header-footer-adder",
      footerAdderText: "ce-header-footer-adder-text",

      // sub title
      subTitleInput: "ce-header-sub-title-input",
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
   *
   * @returns {String}
   * @private
   */
  _getDefaultTitle(type, text) {
    if (type === 'footer') {
      return text || '输入脚标题'
    }

    return text || '输入眉标题'
  }

  makeTitle(type = "footer", text) {
    const css =
      type === "footer" ? this.CSS.footerTitle : this.CSS.eyebrowTitle;

    const placeholder = this._getDefaultTitle(type, text)

    const title = make("div", css);

    const titleInput = make("div", this.CSS.subTitleInput, {
      contentEditable: true,
      innerHTML: placeholder,
      "data-placeholder": placeholder,
    });

    // see https://htmldom.dev/placeholder-for-a-contenteditable-element/
    titleInput.addEventListener("focus", (e) => {
      const value = e.target.innerHTML;
      value === placeholder && (e.target.innerHTML = "");
    });

    titleInput.addEventListener("blur", (e) => {
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
   * focus input inside of subtitle
   *
   * @param {HTMLElement} element
   * @returns {void}
   * @public
   */
  focusInput(element) {
    const footerInput = element.querySelector(`.${this.CSS.subTitleInput}`);
    footerInput.focus();
  }

  isSubtitleInputActive(element) {
    return !!element.querySelector(`.${this.CSS.subTitleInput}`);
  }

  // get data() {
  //   const data = this.exportData();

  //   this.setData(data);
  //   return data;
  // }
}
