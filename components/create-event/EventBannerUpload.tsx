"use client";

import { cn } from "@/lib/utils";
import { FileText, ImageIcon, Link2, Upload } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type BannerTab = "url" | "image" | "pdf";

const TABS: { id: BannerTab; label: string }[] = [
  { id: "url", label: "URL" },
  { id: "image", label: "Image Upload" },
  { id: "pdf", label: "PDF Upload" },
];

const IMAGE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
const PDF_ACCEPT = ".pdf,application/pdf";

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)(\?.*)?$/i;

const inputClassName =
  "bg-dark-200 rounded-[6px] px-5 py-2.5 w-full text-foreground placeholder:text-light-200/60 border border-transparent transition-all duration-200 hover:border-primary/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const labelClassName = "text-light-100 text-sm font-medium";

const tabButtonClass = (active: boolean) =>
  cn(
    "flex-1 min-w-[88px] rounded-[4px] px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200",
    active
      ? "bg-dark-100 text-primary border border-primary/30 shadow-[0_0_12px_0_#5dfeca18]"
      : "text-light-200 hover:text-light-100 border border-transparent"
  );

const isImageFile = (file: File) => {
  const type = file.type.toLowerCase();
  const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (acceptedTypes.includes(type)) return true;
  return IMAGE_EXTENSIONS.test(file.name);
};

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const BannerPreviewContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "preview-enter mt-3 w-full min-w-0 overflow-hidden rounded-lg border border-dark-200 bg-dark-200/50",
      className
    )}
  >
    {children}
  </div>
);

const PdfUploadedCard = ({ fileName }: { fileName: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-primary/30 bg-dark-100">
      <FileText className="h-7 w-7 text-primary" aria-hidden />
    </div>
    <p className="text-light-100 text-sm font-medium break-all">{fileName}</p>
    <p className="text-primary text-xs font-medium">PDF uploaded successfully</p>
  </div>
);

const UrlImagePreview = ({ imageUrl }: { imageUrl: string }) => {
  const [hasError, setHasError] = useState(false);
  const trimmed = imageUrl.trim();

  useEffect(() => {
    setHasError(false);
  }, [trimmed]);

  if (!trimmed) return null;

  let isValidUrl = false;
  try {
    new URL(trimmed);
    isValidUrl = true;
  } catch {
    isValidUrl = false;
  }

  if (!isValidUrl) {
    return (
      <p className="text-light-200 text-sm mt-2" role="status">
        Enter a valid image URL (jpg, png, webp, gif).
      </p>
    );
  }

  if (hasError) {
    return (
      <p className="text-light-200 text-sm mt-2" role="status">
        Unable to preview this image. Check the URL and try again.
      </p>
    );
  }

  return (
    <BannerPreviewContainer>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trimmed}
        alt="Event banner preview"
        className="w-full max-h-[220px] sm:max-h-[280px] object-cover"
        onError={() => setHasError(true)}
      />
    </BannerPreviewContainer>
  );
};

const LocalImagePreview = ({ previewUrl }: { previewUrl: string }) => (
  <BannerPreviewContainer>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={previewUrl}
      alt="Uploaded event banner preview"
      className="w-full max-h-[220px] sm:max-h-[280px] object-cover"
    />
  </BannerPreviewContainer>
);

const PdfPreview = ({
  previewUrl,
  fileName,
}: {
  previewUrl: string;
  fileName: string;
}) => (
  <BannerPreviewContainer className="relative min-h-[200px] sm:min-h-[240px]">
    <object
      data={previewUrl}
      type="application/pdf"
      className="h-[220px] w-full sm:h-[280px]"
      aria-label={`PDF preview: ${fileName}`}
    >
      <PdfUploadedCard fileName={fileName} />
    </object>
  </BannerPreviewContainer>
);

const EventBannerUpload = () => {
  const baseId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<BannerTab>("url");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const revokeUrl = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeUrl(imagePreviewUrl);
      revokeUrl(pdfPreviewUrl);
    };
  }, [imagePreviewUrl, pdfPreviewUrl, revokeUrl]);

  const switchTab = (tab: BannerTab) => {
    setActiveTab(tab);
    setFileError(null);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    if (!isImageFile(file)) {
      setFileError("Please upload a jpg, jpeg, png, webp, or gif image.");
      e.target.value = "";
      return;
    }

    revokeUrl(imagePreviewUrl);
    const nextUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreviewUrl(nextUrl);
    e.target.value = "";
  };

  const handlePdfUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (!file) return;

    if (!isPdfFile(file)) {
      setFileError("Please upload a valid PDF file.");
      e.target.value = "";
      return;
    }

    revokeUrl(pdfPreviewUrl);
    const nextUrl = URL.createObjectURL(file);
    setPdfFile(file);
    setPdfPreviewUrl(nextUrl);
    e.target.value = "";
  };

  const bannerValue =
    activeTab === "url"
      ? imageUrl.trim()
      : activeTab === "image"
        ? imageFile?.name ?? ""
        : pdfFile?.name ?? "";

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <label className={labelClassName}>Event Banner</label>

      <div
        role="tablist"
        aria-label="Banner upload method"
        className="flex flex-wrap gap-1 rounded-[6px] bg-dark-200 p-1"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${baseId}-${tab.id}-panel`}
            onClick={() => switchTab(tab.id)}
            className={tabButtonClass(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="banner" value={bannerValue} required />

      {activeTab === "url" && (
        <div
          id={`${baseId}-url-panel`}
          role="tabpanel"
          className="flex flex-col gap-2 min-w-0"
        >
          <label htmlFor={`${baseId}-image-url`} className="sr-only">
            Image URL
          </label>
          <div className="relative">
            <Link2
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-light-200"
              aria-hidden
            />
            <input
              id={`${baseId}-image-url`}
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/event-banner.png"
              className={`${inputClassName} pl-11`}
            />
          </div>
          <p className="text-light-200 text-xs">
            Supports direct image links: jpg, jpeg, png, webp, gif
          </p>
          <UrlImagePreview imageUrl={imageUrl} />
        </div>
      )}

      {activeTab === "image" && (
        <div
          id={`${baseId}-image-panel`}
          role="tabpanel"
          className="flex flex-col gap-3 min-w-0"
        >
          <input
            ref={imageInputRef}
            id={`${baseId}-image-file`}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleImageUpload}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              inputClassName,
              "flex cursor-pointer items-center justify-center gap-2 border-dashed border-dark-200 py-8 hover:border-primary/40"
            )}
          >
            <Upload className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-light-100 text-sm">
              Choose image from computer
            </span>
          </button>
          <p className="text-light-200 text-xs">jpg, jpeg, png, webp, gif</p>
          {imagePreviewUrl && imageFile && (
            <LocalImagePreview previewUrl={imagePreviewUrl} />
          )}
          {imageFile && (
            <p className="text-light-200 text-xs break-all">{imageFile.name}</p>
          )}
        </div>
      )}

      {activeTab === "pdf" && (
        <div
          id={`${baseId}-pdf-panel`}
          role="tabpanel"
          className="flex flex-col gap-3 min-w-0"
        >
          <input
            ref={pdfInputRef}
            id={`${baseId}-pdf-file`}
            type="file"
            accept={PDF_ACCEPT}
            onChange={handlePdfUpload}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            className={cn(
              inputClassName,
              "flex cursor-pointer items-center justify-center gap-2 border-dashed border-dark-200 py-8 hover:border-primary/40"
            )}
          >
            <FileText className="h-4 w-4 text-primary" aria-hidden />
            <span className="text-light-100 text-sm">
              Choose PDF from computer
            </span>
          </button>
          {pdfPreviewUrl && pdfFile && (
            <PdfPreview previewUrl={pdfPreviewUrl} fileName={pdfFile.name} />
          )}
        </div>
      )}

      {fileError && (
        <p className="text-light-200 text-sm" role="alert">
          {fileError}
        </p>
      )}

      {!fileError && activeTab === "image" && !imageFile && (
        <div className="flex items-center gap-2 text-light-200 text-xs">
          <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Upload an image to preview your event banner</span>
        </div>
      )}
    </div>
  );
};

export default EventBannerUpload;
