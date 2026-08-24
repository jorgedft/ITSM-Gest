export function Spinner({ size = "md" }) {
  const s = { sm: "h-5 w-5 border-2", md: "h-8 w-8 border-4", lg: "h-12 w-12 border-4" };
  return (
    <div className="flex justify-center items-center py-12">
      <div className={`${s[size]} animate-spin rounded-full border-brand-500 border-t-transparent`} />
    </div>
  );
}