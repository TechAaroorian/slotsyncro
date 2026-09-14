"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Screenshot = {
  src: string;
  alt: string;
  title: string;
  description: string;
  wide?: boolean;
};

const screenshots: Screenshot[] = [
  {
    src: "/screenshots/dashboard.png",
    alt: "SlotSyncro dashboard showing scheduling totals and a completed readiness checklist",
    title: "Start with a clear overview.",
    description: "See scheduling activity and what is ready to share.",
    wide: true,
  },
  {
    src: "/screenshots/create-poll.png",
    alt: "Create Poll page with poll details, quick time choices, and an explanation panel",
    title: "Offer practical choices.",
    description: "Combine quick picks with an exact time when needed.",
  },
  {
    src: "/screenshots/voting-poll.png",
    alt: "Public SlotSyncro poll showing group availability and an accountless participant response form",
    title: "Make the group visible.",
    description: "Compare consensus and respond with or without an account.",
  },
];

export function ScreenshotGallery({ basePath }: { basePath: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Screenshot | null>(null);

  function openScreenshot(screenshot: Screenshot) {
    setSelected(screenshot);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  function closeScreenshot() {
    dialogRef.current?.close();
  }

  return (
    <>
      <div className="screenshot-grid">
        {screenshots.map((screenshot) => (
          <figure
            className={`screenshot-card${screenshot.wide ? " screenshot-card-wide" : ""}`}
            key={screenshot.src}
          >
            <button
              className="screenshot-trigger"
              type="button"
              onClick={() => openScreenshot(screenshot)}
              aria-label={`View ${screenshot.title} screenshot at full size`}
            >
              <span className="screenshot-frame">
                <Image
                  src={`${basePath}${screenshot.src}`}
                  alt={screenshot.alt}
                  width={1920}
                  height={960}
                  sizes={screenshot.wide ? "(max-width: 800px) 100vw, 1120px" : "(max-width: 800px) 100vw, 550px"}
                />
                <span className="screenshot-zoom" aria-hidden="true">
                  View larger
                </span>
              </span>
            </button>
            <figcaption>
              <strong>{screenshot.title}</strong>
              <span>{screenshot.description}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        className="screenshot-dialog"
        ref={dialogRef}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeScreenshot();
        }}
        aria-labelledby="screenshot-dialog-title"
      >
        {selected && (
          <div className="screenshot-dialog-content">
            <div className="screenshot-dialog-header">
              <div>
                <strong id="screenshot-dialog-title">{selected.title}</strong>
                <span>{selected.description}</span>
              </div>
              <button
                className="screenshot-close"
                type="button"
                onClick={closeScreenshot}
                aria-label="Close enlarged screenshot"
              >
                ×
              </button>
            </div>
            <Image
              src={`${basePath}${selected.src}`}
              alt={selected.alt}
              width={1920}
              height={960}
              sizes="95vw"
              priority
            />
          </div>
        )}
      </dialog>
    </>
  );
}
