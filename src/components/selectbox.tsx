"use client";

import { CircleXmark } from "@gravity-ui/icons";
import { type Key, ListBox, Select } from "@heroui/react";
import { useCallback, useState } from "react";

import ModalLayout from "@/components/modal-layout";
import type { PortfolioImage } from "./picture";
import { VIEW_KEYS } from "./view-keys";

const SELECT_OPTIONS = [
  { id: VIEW_KEYS.GALLERY, label: "Image Gallery" }
] as const;

type SelectboxProps = {
  portfolios: PortfolioImage[];
};

const Selectbox = ({ portfolios }: SelectboxProps): React.JSX.Element => {
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean): void => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      setSelectedKey(null);
    }
  };

  const handleSelectionChange = useCallback((key: Key | null): void => {
    setSelectedKey(key);
    setIsOpen(Boolean(key));
  }, []);

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          aria-label="Select an example"
          className="w-64"
          placeholder="Select an example"
          selectedKey={selectedKey}
          onSelectionChange={handleSelectionChange}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              {SELECT_OPTIONS.map((option) => (
                <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <CircleXmark
          aria-label="Clear selection"
          className="size-5 cursor-pointer text-border-secondary"
          role="button"
          tabIndex={0}
          onClick={() => handleOpenChange(false)}
        />
      </div>
      <ModalLayout
        activeView={selectedKey}
        isOpen={isOpen}
        portfolios={portfolios}
        handleOpenChange={handleOpenChange}
      />
    </>
  );
};

export default Selectbox;
