// src/components/RichTextEditor.tsx
import { useRef as useRef5, useEffect as useEffect5, useState as useState6, useCallback } from "react";

// src/components/Toolbar.tsx
import { useState as useState5, useEffect as useEffect4 } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Undo,
  Redo,
  Eraser
} from "lucide-react";

// src/components/ToolbarButton.tsx
import { jsx } from "react/jsx-runtime";
var ToolbarButton = ({
  command,
  icon,
  title,
  isActive = false,
  onClick,
  disabled = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      document.execCommand(command, false);
    }
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: handleClick,
      disabled,
      className: `
        flex items-center justify-center w-8 h-8 rounded transition-colors
        ${isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `,
      title,
      children: icon
    }
  );
};

// src/components/ColorPicker.tsx
import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var PRESET_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#CCCCCC",
  "#FFFFFF",
  "#FF0000",
  "#FF6600",
  "#FFCC00",
  "#FFFF00",
  "#CCFF00",
  "#66FF00",
  "#00FF00",
  "#00FF66",
  "#00FFCC",
  "#00FFFF",
  "#00CCFF",
  "#0066FF",
  "#0000FF",
  "#6600FF",
  "#CC00FF",
  "#FF00FF",
  "#FF00CC",
  "#FF0066"
];
var ColorPicker = ({ color, onChange, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(color);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleColorSelect = (selectedColor) => {
    onChange(selectedColor);
    setCustomColor(selectedColor);
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref: dropdownRef, children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
        title: `${type === "text" ? "Text" : "Background"} Color`,
        children: [
          /* @__PURE__ */ jsx2(Palette, { size: 16 }),
          /* @__PURE__ */ jsx2("div", { className: "w-4 h-4 border border-gray-300 rounded", style: { backgroundColor: color } })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxs("div", { className: "absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]", children: [
      /* @__PURE__ */ jsx2("div", { className: "grid grid-cols-6 gap-1 mb-3", children: PRESET_COLORS.map((presetColor) => /* @__PURE__ */ jsx2(
        "button",
        {
          type: "button",
          onClick: () => handleColorSelect(presetColor),
          className: "w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform",
          style: { backgroundColor: presetColor },
          title: presetColor
        },
        presetColor
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "color",
            value: customColor,
            onChange: (e) => setCustomColor(e.target.value),
            className: "w-8 h-8 rounded border border-gray-300"
          }
        ),
        /* @__PURE__ */ jsx2(
          "input",
          {
            type: "text",
            value: customColor,
            onChange: (e) => setCustomColor(e.target.value),
            className: "flex-1 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600",
            placeholder: "#000000"
          }
        ),
        /* @__PURE__ */ jsx2(
          "button",
          {
            type: "button",
            onClick: () => handleColorSelect(customColor),
            className: "px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600",
            children: "Apply"
          }
        )
      ] })
    ] })
  ] });
};

// src/components/ImageHandler.tsx
import { useRef as useRef2, useState as useState2 } from "react";
import { ImageIcon, Upload } from "lucide-react";

// src/utils/commands.ts
var EditorCommands = class {
  static execCommand(command, value) {
    try {
      return document.execCommand(command, false, value);
    } catch (error) {
      console.warn("Command execution failed:", command, error);
      return false;
    }
  }
  static queryCommandState(command) {
    try {
      return document.queryCommandState(command);
    } catch (error) {
      return false;
    }
  }
  static queryCommandValue(command) {
    try {
      return document.queryCommandValue(command);
    } catch (error) {
      return "";
    }
  }
  static insertHTML(html) {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const div = document.createElement("div");
    div.innerHTML = html;
    const fragment = document.createDocumentFragment();
    let node;
    while (node = div.firstChild) {
      fragment.appendChild(node);
    }
    range.insertNode(fragment);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  static insertImage(src, alt) {
    const img = `<img src="${src}" alt="${alt || ""}" style="max-width: 100%; height: auto;" />`;
    this.insertHTML(img);
  }
  static insertTable(rows, cols) {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;">';
    for (let i = 0; i < rows; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</table><p>&nbsp;</p>";
    this.insertHTML(tableHTML);
  }
  static createLink(url, text) {
    const selection = window.getSelection();
    if (!selection?.toString() && !text) {
      text = url;
    }
    if (text) {
      this.insertHTML(`<a href="${url}" target="_blank">${text}</a>`);
    } else {
      this.execCommand("createLink", url);
    }
  }
  static setFontSize(size) {
    this.execCommand("fontSize", size);
  }
  static setForeColor(color) {
    this.execCommand("foreColor", color);
  }
  static setBackColor(color) {
    this.execCommand("backColor", color);
  }
};

// src/components/ImageHandler.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var ImageHandler = () => {
  const fileInputRef = useRef2(null);
  const [isUploading, setIsUploading] = useState2(false);
  const handleImageUpload = async (file) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result;
        EditorCommands.insertImage(src, file.name);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image upload failed:", error);
      setIsUploading(false);
    }
  };
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      EditorCommands.insertImage(url);
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: "relative", children: [
    /* @__PURE__ */ jsx3(
      "button",
      {
        type: "button",
        onClick: () => fileInputRef.current?.click(),
        disabled: isUploading,
        className: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50",
        title: "Insert Image",
        children: isUploading ? /* @__PURE__ */ jsx3(Upload, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx3(ImageIcon, { size: 16 })
      }
    ),
    /* @__PURE__ */ jsx3("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileSelect, className: "hidden" })
  ] });
};

// src/components/TableManager.tsx
import { useState as useState3, useRef as useRef3, useEffect as useEffect2 } from "react";
import { Table } from "lucide-react";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var TableManager = () => {
  const [isOpen, setIsOpen] = useState3(false);
  const [rows, setRows] = useState3(3);
  const [cols, setCols] = useState3(3);
  const dropdownRef = useRef3(null);
  useEffect2(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleInsertTable = () => {
    EditorCommands.insertTable(rows, cols);
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxs3("div", { className: "relative", ref: dropdownRef, children: [
    /* @__PURE__ */ jsx4(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
        title: "Insert Table",
        children: /* @__PURE__ */ jsx4(Table, { size: 16 })
      }
    ),
    isOpen && /* @__PURE__ */ jsx4("div", { className: "absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50", children: /* @__PURE__ */ jsxs3("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx4("label", { className: "block text-sm font-medium mb-1", children: "Rows:" }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "number",
            min: "1",
            max: "20",
            value: rows,
            onChange: (e) => setRows(Number.parseInt(e.target.value) || 1),
            className: "w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs3("div", { children: [
        /* @__PURE__ */ jsx4("label", { className: "block text-sm font-medium mb-1", children: "Columns:" }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: "number",
            min: "1",
            max: "10",
            value: cols,
            onChange: (e) => setCols(Number.parseInt(e.target.value) || 1),
            className: "w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsx4(
        "button",
        {
          onClick: handleInsertTable,
          className: "w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
          children: "Insert Table"
        }
      )
    ] }) })
  ] });
};

// src/components/LinkManager.tsx
import { useState as useState4, useRef as useRef4, useEffect as useEffect3 } from "react";
import { Link, Unlink } from "lucide-react";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var LinkManager = () => {
  const [isOpen, setIsOpen] = useState4(false);
  const [url, setUrl] = useState4("");
  const [text, setText] = useState4("");
  const dropdownRef = useRef4(null);
  useEffect3(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleInsertLink = () => {
    if (url) {
      EditorCommands.createLink(url, text);
      setUrl("");
      setText("");
      setIsOpen(false);
    }
  };
  const handleRemoveLink = () => {
    EditorCommands.execCommand("unlink");
  };
  return /* @__PURE__ */ jsxs4("div", { className: "relative flex", ref: dropdownRef, children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
        title: "Insert Link",
        children: /* @__PURE__ */ jsx5(Link, { size: 16 })
      }
    ),
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        onClick: handleRemoveLink,
        className: "flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
        title: "Remove Link",
        children: /* @__PURE__ */ jsx5(Unlink, { size: 16 })
      }
    ),
    isOpen && /* @__PURE__ */ jsx5("div", { className: "absolute top-full left-0 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[250px]", children: /* @__PURE__ */ jsxs4("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx5("label", { className: "block text-sm font-medium mb-1", children: "URL:" }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            type: "url",
            value: url,
            onChange: (e) => setUrl(e.target.value),
            placeholder: "https://example.com",
            className: "w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs4("div", { children: [
        /* @__PURE__ */ jsx5("label", { className: "block text-sm font-medium mb-1", children: "Text (optional):" }),
        /* @__PURE__ */ jsx5(
          "input",
          {
            type: "text",
            value: text,
            onChange: (e) => setText(e.target.value),
            placeholder: "Link text",
            className: "w-full px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          }
        )
      ] }),
      /* @__PURE__ */ jsx5(
        "button",
        {
          onClick: handleInsertLink,
          disabled: !url,
          className: "w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
          children: "Insert Link"
        }
      )
    ] }) })
  ] });
};

// src/components/Toolbar.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
var Toolbar = ({ onSelectionChange }) => {
  const [activeStates, setActiveStates] = useState5({});
  const [textColor, setTextColor] = useState5("#000000");
  const [backgroundColor, setBackgroundColor] = useState5("#ffffff");
  useEffect4(() => {
    const updateActiveStates = () => {
      const states = {
        bold: EditorCommands.queryCommandState("bold"),
        italic: EditorCommands.queryCommandState("italic"),
        underline: EditorCommands.queryCommandState("underline"),
        strikeThrough: EditorCommands.queryCommandState("strikeThrough"),
        justifyLeft: EditorCommands.queryCommandState("justifyLeft"),
        justifyCenter: EditorCommands.queryCommandState("justifyCenter"),
        justifyRight: EditorCommands.queryCommandState("justifyRight"),
        justifyFull: EditorCommands.queryCommandState("justifyFull"),
        insertUnorderedList: EditorCommands.queryCommandState("insertUnorderedList"),
        insertOrderedList: EditorCommands.queryCommandState("insertOrderedList")
      };
      setActiveStates(states);
      onSelectionChange?.();
    };
    document.addEventListener("selectionchange", updateActiveStates);
    return () => document.removeEventListener("selectionchange", updateActiveStates);
  }, [onSelectionChange]);
  const handleHeadingChange = (event) => {
    const value = event.target.value;
    if (value) {
      EditorCommands.execCommand("formatBlock", value);
    }
  };
  const handleTextColorChange = (color) => {
    setTextColor(color);
    EditorCommands.setForeColor(color);
  };
  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
    EditorCommands.setBackColor(color);
  };
  return /* @__PURE__ */ jsxs5("div", { className: "flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800", children: [
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(ToolbarButton, { command: "undo", icon: /* @__PURE__ */ jsx6(Undo, { size: 16 }), title: "Undo" }),
      /* @__PURE__ */ jsx6(ToolbarButton, { command: "redo", icon: /* @__PURE__ */ jsx6(Redo, { size: 16 }), title: "Redo" })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5(
      "select",
      {
        onChange: handleHeadingChange,
        className: "px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 mr-2",
        defaultValue: "",
        children: [
          /* @__PURE__ */ jsx6("option", { value: "", children: "Format" }),
          /* @__PURE__ */ jsx6("option", { value: "h1", children: "Heading 1" }),
          /* @__PURE__ */ jsx6("option", { value: "h2", children: "Heading 2" }),
          /* @__PURE__ */ jsx6("option", { value: "h3", children: "Heading 3" }),
          /* @__PURE__ */ jsx6("option", { value: "h4", children: "Heading 4" }),
          /* @__PURE__ */ jsx6("option", { value: "h5", children: "Heading 5" }),
          /* @__PURE__ */ jsx6("option", { value: "h6", children: "Heading 6" }),
          /* @__PURE__ */ jsx6("option", { value: "p", children: "Paragraph" })
        ]
      }
    ),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(ToolbarButton, { command: "bold", icon: /* @__PURE__ */ jsx6(Bold, { size: 16 }), title: "Bold", isActive: activeStates.bold }),
      /* @__PURE__ */ jsx6(ToolbarButton, { command: "italic", icon: /* @__PURE__ */ jsx6(Italic, { size: 16 }), title: "Italic", isActive: activeStates.italic }),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "underline",
          icon: /* @__PURE__ */ jsx6(Underline, { size: 16 }),
          title: "Underline",
          isActive: activeStates.underline
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "strikeThrough",
          icon: /* @__PURE__ */ jsx6(Strikethrough, { size: 16 }),
          title: "Strikethrough",
          isActive: activeStates.strikeThrough
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(ColorPicker, { color: textColor, onChange: handleTextColorChange, type: "text" }),
      /* @__PURE__ */ jsx6(ColorPicker, { color: backgroundColor, onChange: handleBackgroundColorChange, type: "background" })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "justifyLeft",
          icon: /* @__PURE__ */ jsx6(AlignLeft, { size: 16 }),
          title: "Align Left",
          isActive: activeStates.justifyLeft
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "justifyCenter",
          icon: /* @__PURE__ */ jsx6(AlignCenter, { size: 16 }),
          title: "Align Center",
          isActive: activeStates.justifyCenter
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "justifyRight",
          icon: /* @__PURE__ */ jsx6(AlignRight, { size: 16 }),
          title: "Align Right",
          isActive: activeStates.justifyRight
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "justifyFull",
          icon: /* @__PURE__ */ jsx6(AlignJustify, { size: 16 }),
          title: "Justify",
          isActive: activeStates.justifyFull
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "insertUnorderedList",
          icon: /* @__PURE__ */ jsx6(List, { size: 16 }),
          title: "Bullet List",
          isActive: activeStates.insertUnorderedList
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "insertOrderedList",
          icon: /* @__PURE__ */ jsx6(ListOrdered, { size: 16 }),
          title: "Numbered List",
          isActive: activeStates.insertOrderedList
        }
      )
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "formatBlock",
          icon: /* @__PURE__ */ jsx6(Quote, { size: 16 }),
          title: "Blockquote",
          onClick: () => EditorCommands.execCommand("formatBlock", "blockquote")
        }
      ),
      /* @__PURE__ */ jsx6(
        ToolbarButton,
        {
          command: "formatBlock",
          icon: /* @__PURE__ */ jsx6(Code, { size: 16 }),
          title: "Code Block",
          onClick: () => EditorCommands.execCommand("formatBlock", "pre")
        }
      ),
      /* @__PURE__ */ jsx6(ToolbarButton, { command: "insertHorizontalRule", icon: /* @__PURE__ */ jsx6(Minus, { size: 16 }), title: "Horizontal Line" })
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsxs5("div", { className: "flex items-center gap-1 mr-2", children: [
      /* @__PURE__ */ jsx6(LinkManager, {}),
      /* @__PURE__ */ jsx6(ImageHandler, {}),
      /* @__PURE__ */ jsx6(TableManager, {})
    ] }),
    /* @__PURE__ */ jsx6("div", { className: "w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" }),
    /* @__PURE__ */ jsx6(ToolbarButton, { command: "removeFormat", icon: /* @__PURE__ */ jsx6(Eraser, { size: 16 }), title: "Clear Formatting" })
  ] });
};

// src/utils/sanitizer.ts
var HTMLSanitizer = class {
  static allowedTags = [
    "p",
    "div",
    "span",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "code",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "hr"
  ];
  static allowedAttributes = [
    "href",
    "src",
    "alt",
    "title",
    "target",
    "style",
    "class",
    "colspan",
    "rowspan",
    "border",
    "cellpadding",
    "cellspacing"
  ];
  static sanitize(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    this.cleanNode(div);
    return div.innerHTML;
  }
  static cleanNode(node) {
    const children = Array.from(node.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child;
        if (!this.allowedTags.includes(element.tagName.toLowerCase())) {
          const span = document.createElement("span");
          span.innerHTML = element.innerHTML;
          element.parentNode?.replaceChild(span, element);
          this.cleanNode(span);
        } else {
          const attributes = Array.from(element.attributes);
          attributes.forEach((attr) => {
            if (!this.allowedAttributes.includes(attr.name.toLowerCase())) {
              element.removeAttribute(attr.name);
            }
          });
          this.cleanNode(element);
        }
      }
    });
  }
  static extractText(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
};

// src/components/RichTextEditor.tsx
import { jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
var RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  disabled = false,
  theme = "auto"
}) => {
  const editorRef = useRef5(null);
  const [isHtmlMode, setIsHtmlMode] = useState6(false);
  const [htmlContent, setHtmlContent] = useState6(value);
  const [isTyping, setIsTyping] = useState6(false);
  const lastValueRef = useRef5(value);
  const saveCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!range) return null;
    return {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };
  }, []);
  const restoreCursorPosition = useCallback((position) => {
    if (!position || !editorRef.current) return;
    try {
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      if (editorRef.current.contains(position.startContainer) && editorRef.current.contains(position.endContainer)) {
        range.setStart(position.startContainer, position.startOffset);
        range.setEnd(position.endContainer, position.endOffset);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      const selection = window.getSelection();
      if (selection && editorRef.current) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);
  useEffect5(() => {
    if (editorRef.current && !isHtmlMode && !isTyping && value !== lastValueRef.current) {
      const cursorPosition = saveCursorPosition();
      editorRef.current.innerHTML = value;
      lastValueRef.current = value;
      setTimeout(() => {
        if (cursorPosition) {
          restoreCursorPosition(cursorPosition);
        }
      }, 0);
    }
  }, [value, isHtmlMode, isTyping, saveCursorPosition, restoreCursorPosition]);
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange && !isHtmlMode) {
      setIsTyping(true);
      const content = editorRef.current.innerHTML;
      const sanitized = HTMLSanitizer.sanitize(content);
      lastValueRef.current = sanitized;
      onChange(sanitized);
      setTimeout(() => setIsTyping(false), 100);
    }
  }, [onChange, isHtmlMode]);
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = `<img src="${event.target?.result}" style="max-width: 100%; height: auto;" />`;
            document.execCommand("insertHTML", false, img);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
    const text = clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);
  const handleKeyDown = useCallback((e) => {
    setIsTyping(true);
  }, []);
  const handleKeyUp = useCallback((e) => {
    setTimeout(() => setIsTyping(false), 50);
  }, []);
  useEffect5(() => {
    const handleImageClick = (e) => {
      const target = e.target;
      if (target.tagName === "IMG") {
        target.style.resize = "both";
        target.style.overflow = "auto";
        target.contentEditable = "false";
      }
    };
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("click", handleImageClick);
      return () => editor.removeEventListener("click", handleImageClick);
    }
  }, []);
  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
        lastValueRef.current = htmlContent;
      }
    } else {
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
    }
    setIsHtmlMode(!isHtmlMode);
    setIsTyping(false);
  };
  const handleHtmlChange = (e) => {
    const content = e.target.value;
    setHtmlContent(content);
    lastValueRef.current = content;
    if (onChange) {
      onChange(content);
    }
  };
  return /* @__PURE__ */ jsxs6(
    "div",
    {
      className: `rich-text-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`,
      children: [
        /* @__PURE__ */ jsx7(Toolbar, { onSelectionChange: handleInput }),
        /* @__PURE__ */ jsxs6("div", { className: "flex items-center justify-between px-3 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600", children: [
          /* @__PURE__ */ jsx7("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: isHtmlMode ? "HTML Source" : "Visual Editor" }),
          /* @__PURE__ */ jsx7(
            "button",
            {
              onClick: toggleHtmlMode,
              className: "text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600",
              children: isHtmlMode ? "Visual" : "HTML"
            }
          )
        ] }),
        isHtmlMode ? /* @__PURE__ */ jsx7(
          "textarea",
          {
            value: htmlContent,
            onChange: handleHtmlChange,
            className: "w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 resize-none focus:outline-none",
            disabled
          }
        ) : /* @__PURE__ */ jsx7(
          "div",
          {
            ref: editorRef,
            contentEditable: !disabled,
            onInput: handleInput,
            onPaste: handlePaste,
            onKeyDown: handleKeyDown,
            onKeyUp: handleKeyUp,
            className: `
            min-h-[300px] p-4 bg-white dark:bg-gray-900 focus:outline-none
            prose prose-sm max-w-none
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `,
            style: {
              lineHeight: "1.6"
            },
            "data-placeholder": placeholder,
            suppressContentEditableWarning: true
          }
        ),
        /* @__PURE__ */ jsx7("style", { children: `
        .rich-text-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        .rich-text-editor img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
        }
        
        .rich-text-editor img:hover {
          outline: 2px solid #3b82f6;
        }
        
        .rich-text-editor table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        .rich-text-editor table td,
        .rich-text-editor table th {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
        }
        
        .rich-text-editor table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        
        .rich-text-editor blockquote {
          border-left: 4px solid #e5e7eb;
          margin: 1em 0;
          padding-left: 1em;
          color: #6b7280;
        }
        
        .rich-text-editor pre {
          background-color: #f3f4f6;
          border-radius: 0.375rem;
          padding: 1em;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }
        
        .rich-text-editor code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
        }
      ` })
      ]
    }
  );
};
export {
  ColorPicker,
  EditorCommands,
  HTMLSanitizer,
  ImageHandler,
  LinkManager,
  RichTextEditor,
  TableManager,
  Toolbar,
  ToolbarButton
};
