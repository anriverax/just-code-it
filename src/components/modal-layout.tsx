"use client";

import { CircleCheck } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import React, { Key } from "react";
import { Gallery } from "./gallery";
import type { Image } from "./picture/picture-grid/picture-grid.type";

type ModalLayoutProps = {
  isOpen: boolean;
  handleOpenChange: (nextOpen: boolean) => void;
  component: Key | null;
  portfolios: Image[];
};

const ModalLayout = ({
  isOpen,
  handleOpenChange,
  component,
  portfolios
}: ModalLayoutProps): React.JSX.Element => {
  return (
    <Modal.Backdrop isDismissable={false} isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Container size="cover">
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
              <CircleCheck className="size-5" />
            </Modal.Icon>
            <Modal.Heading>Example</Modal.Heading>
          </Modal.Header>
          <Modal.Body>{component === "gallery" && <Gallery portfolios={portfolios} />}</Modal.Body>
          <Modal.Footer>
            <Button slot="close" variant="secondary">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default ModalLayout;
