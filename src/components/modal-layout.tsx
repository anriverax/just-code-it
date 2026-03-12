"use client";

import { CircleCheck } from "@gravity-ui/icons";
import { Button, Modal } from "@heroui/react";
import React, { type Key } from "react";

import { Gallery } from "./gallery";
import type { PortfolioImage } from "./picture";
import { VIEW_KEYS, type ViewKey } from "./view-keys";

const VIEW_TITLES: Record<ViewKey, string> = {
  [VIEW_KEYS.GALLERY]: "Image Gallery"
};

type ModalLayoutProps = {
  isOpen: boolean;
  handleOpenChange: (nextOpen: boolean) => void;
  activeView: Key | null;
  portfolios: PortfolioImage[];
};

const ModalLayout = ({
  isOpen,
  handleOpenChange,
  activeView,
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
            <Modal.Heading>{VIEW_TITLES[activeView as ViewKey] ?? "Example"}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {activeView === VIEW_KEYS.GALLERY && <Gallery portfolios={portfolios} />}
          </Modal.Body>
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
