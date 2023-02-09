import React, { useEffect } from "react";
import { Palette } from "../../utils";
import { t } from "../../i18n";

import { ExcalidrawElement } from "../../element/types";
import { ShadeList } from "./ShadeList";

import { ColorInput } from "./ColorInput";
import PickerColorList from "./PickerColorList";
import { atom, useAtom } from "jotai";
import { CustomColorList } from "./CustomColorList";
import { colorPickerKeyNavHandler } from "./keyboardNavHandlers";

export const isCustomColor = ({
  color,
  palette,
}: {
  color: string | null;
  palette: Palette;
}) => {
  if (!color) {
    return false;
  }
  const paletteValues = Object.values(palette).flat();
  return !paletteValues.includes(color);
};

export const getMostUsedCustomColors = (
  elements: readonly ExcalidrawElement[],
  type: "elementBackground" | "elementStroke",
  palette: Palette,
) => {
  const elementColorTypeMap = {
    elementBackground: "backgroundColor",
    elementStroke: "strokeColor",
  };

  const colors = elements.filter((element) => {
    if (element.isDeleted) {
      return false;
    }

    const color =
      element[elementColorTypeMap[type] as "backgroundColor" | "strokeColor"];

    return isCustomColor({ color, palette });
  });

  return [
    ...new Set(
      colors.map(
        (c) =>
          c[elementColorTypeMap[type] as "backgroundColor" | "strokeColor"],
      ),
    ),
  ].slice(0, 5);
};

export interface CustomColorListProps {
  colors: string[];
  color: string | null;
  onChange: (color: string) => void;
  label: string;
}

export type activeColorPickerSectionAtomType =
  | "custom"
  | "default"
  | "shades"
  | "hex"
  | null;
export const activeColorPickerSectionAtom =
  atom<activeColorPickerSectionAtomType>(null);

export const Picker = ({
  color,
  onChange,
  label,
  showInput = true,
  type,
  elements,
  palette,
}: {
  colors: string[];
  color: string | null;
  onChange: (color: string) => void;
  label: string;
  showInput: boolean;
  type: "canvasBackground" | "elementBackground" | "elementStroke";
  elements: readonly ExcalidrawElement[];
  palette: Palette;
}) => {
  const [customColors] = React.useState(() => {
    if (type === "canvasBackground") {
      return [];
    }
    return getMostUsedCustomColors(elements, type, palette);
  });

  const [activeColorPickerSection, setActiveColorPickerSection] = useAtom(
    activeColorPickerSectionAtom,
  );

  useEffect(() => {
    if (!activeColorPickerSection) {
      setActiveColorPickerSection(
        isCustomColor({ color, palette }) ? "custom" : "shades",
      );
    }
  }, [activeColorPickerSection, color, palette, setActiveColorPickerSection]);

  return (
    <div role="dialog" aria-modal="true" aria-label={t("labels.colorPicker")}>
      <div
        onKeyDown={(e) => {
          colorPickerKeyNavHandler(
            e,
            activeColorPickerSection,
            palette,
            color,
            onChange,
            customColors,
            setActiveColorPickerSection,
          );
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
        className="color-picker-content"
        // to allow focusing by clicking but not by tabbing
        tabIndex={-1}
      >
        {!!customColors.length && (
          <div>
            <div style={{ padding: "0 .5rem", fontSize: ".75rem" }}>
              Most used custom colors
            </div>
            <CustomColorList
              colors={customColors}
              color={color}
              label="Most used custom colors"
              onChange={onChange}
            />
          </div>
        )}

        <div>
          <div style={{ padding: "0 .5rem", fontSize: ".75rem" }}>Colors</div>
          <PickerColorList
            color={color}
            label={label}
            palette={palette}
            onChange={onChange}
          />
        </div>

        <div>
          <div style={{ padding: "0 .5rem", fontSize: ".75rem" }}>Shades</div>
          <ShadeList hex={color} onChange={onChange} palette={palette} />
        </div>

        {showInput && (
          <div>
            <div style={{ padding: "0 .5rem", fontSize: ".75rem" }}>
              Hex code
            </div>
            <ColorInput
              color={color}
              label={label}
              onChange={(color) => {
                onChange(color);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
