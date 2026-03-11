"use client";

import ModalLayout from "@/components/modal-layout";
import { Key, ListBox, Select } from "@heroui/react";
import { useState } from "react";
import type { Image } from "./picture/picture-grid/picture-grid.type";
import { CircleXmark } from "@gravity-ui/icons";

const states = [
  {
    id: "gallery",
    name: "Galeria de imagenes"
  }
] as const;

type SelectboxProps = {
  portfolios: Image[];
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

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          aria-label="Select an example"
          className="w-64"
          placeholder="Select an example"
          selectedKey={selectedKey}
          onSelectionChange={(key) => {
            setSelectedKey(key);
            setIsOpen(Boolean(key));
          }}
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>

          <Select.Popover>
            <ListBox>
              {states.map((state) => (
                <ListBox.Item key={state.id} id={state.id} textValue={state.name}>
                  {state.name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <CircleXmark
          className="size-5 cursor-pointer text-border-secondary"
          onClick={() => {
            setSelectedKey(null);
            setIsOpen(false);
          }}
        />
      </div>
      <ModalLayout
        component={selectedKey}
        isOpen={isOpen}
        portfolios={portfolios}
        handleOpenChange={handleOpenChange}
      />
    </>
  );
};

export default Selectbox;
