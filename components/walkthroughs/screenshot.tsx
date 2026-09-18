"use client";

import Image from "next/image";
import { useRef } from "react";

export function Screenshot({ src, original, alt, caption, width, height }: {
  src: string; original: string; alt: string; caption: string; width: number; height: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return <figure className="walkthrough-figure">
    <button className="walkthrough-image-button" type="button" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge screenshot: ${alt}`}>
      <Image src={src} alt={alt} width={width} height={height} unoptimized />
      <span>Enlarge screenshot ↗</span>
    </button>
    <figcaption>{caption} <a href={original} target="_blank" rel="noreferrer">View unmarked original</a></figcaption>
    <dialog ref={dialog} aria-label={alt} className="walkthrough-lightbox" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="walkthrough-lightbox-bar"><span>{alt}</span><button type="button" onClick={() => dialog.current?.close()} autoFocus>Close</button></div>
      <div className="walkthrough-lightbox-image"><Image src={src} alt={alt} width={width} height={height} unoptimized /></div>
    </dialog>
  </figure>;
}
