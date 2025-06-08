import React from 'react';

interface RichTextEditorProps {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    apiKey?: string;
    theme?: "light" | "dark" | "auto";
}
interface ToolbarButtonProps {
    command: string;
    icon: React.ReactNode;
    title: string;
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}
interface ImageData {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
}
interface TableData {
    rows: number;
    cols: number;
}
interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    type: "text" | "background";
}

declare const RichTextEditor: React.FC<RichTextEditorProps>;

interface ToolbarProps {
    onSelectionChange?: () => void;
}
declare const Toolbar: React.FC<ToolbarProps>;

declare const ToolbarButton: React.FC<ToolbarButtonProps>;

declare const ColorPicker: React.FC<ColorPickerProps>;

declare const ImageHandler: React.FC;

declare const TableManager: React.FC;

declare const LinkManager: React.FC;

declare class EditorCommands {
    static execCommand(command: string, value?: string): boolean;
    static queryCommandState(command: string): boolean;
    static queryCommandValue(command: string): string;
    static insertHTML(html: string): void;
    static insertImage(src: string, alt?: string): void;
    static insertTable(rows: number, cols: number): void;
    static createLink(url: string, text?: string): void;
    static setFontSize(size: string): void;
    static setForeColor(color: string): void;
    static setBackColor(color: string): void;
}

declare class HTMLSanitizer {
    private static allowedTags;
    private static allowedAttributes;
    static sanitize(html: string): string;
    private static cleanNode;
    static extractText(html: string): string;
}

export { ColorPicker, type ColorPickerProps, EditorCommands, HTMLSanitizer, type ImageData, ImageHandler, LinkManager, RichTextEditor, type RichTextEditorProps, type TableData, TableManager, Toolbar, ToolbarButton, type ToolbarButtonProps };
