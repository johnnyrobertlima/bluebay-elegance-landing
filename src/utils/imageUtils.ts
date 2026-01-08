
const SUPABASE_URL = "https://zoenzhdzkurdzkjpbgkf.supabase.co";

export const getStorageUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${path}`;
};

export const getAvatarUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
};

export const getProductImageUrl = (path: string | null | undefined): string => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/products/${path}`;
};
