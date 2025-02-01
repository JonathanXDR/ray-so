export function ButtonGroup({
  children,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className="buttonGroup" {...props}>
      {children}
    </span>
  );
}
