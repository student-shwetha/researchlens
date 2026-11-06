// Minimal stroke icons (24×24, inherit currentColor) so the component has no
// icon-library dependency. Swap for lucide-react if your project already uses it.

function Icon({ children, className = 'h-4 w-4', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
export const FolderIcon = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></Icon>;
export const UploadIcon = (p) => <Icon {...p}><path d="M12 15V4" /><path d="m7 9 5-5 5 5" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></Icon>;
export const LayersIcon = (p) => <Icon {...p}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></Icon>;
export const TemplateIcon = (p) => <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></Icon>;
export const InfoIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></Icon>;
export const DownloadIcon = (p) => <Icon {...p}><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M4 19h16" /></Icon>;
export const ChevronDownIcon = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const PanelRightIcon = (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M15 4v16" /></Icon>;
export const SendIcon = (p) => <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>;
export const CloseIcon = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const MenuIcon = (p) => <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>;
export const SparkleIcon = (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="m6.5 6.5 2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" /></Icon>;
export const ExternalIcon = (p) => <Icon {...p}><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></Icon>;
// ResearchLens mark: lens rings around a focal point
export const LogoMark = ({ className = 'h-7 w-7' }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
    <rect width="32" height="32" rx="8" fill="#1E3A8A" />
    <circle cx="16" cy="16" r="10" fill="none" stroke="#F9FAFB" strokeWidth="1.8" opacity="0.55" />
    <circle cx="16" cy="16" r="6.5" fill="none" stroke="#F9FAFB" strokeWidth="1.8" opacity="0.8" />
    <circle cx="16" cy="16" r="2.6" fill="#F9FAFB" />
  </svg>
);
export const ArrowLeftIcon = (p) => <Icon {...p}><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></Icon>;
