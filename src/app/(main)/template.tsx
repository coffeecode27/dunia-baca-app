export default function MainTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="container mx-auto flex-1 px-4 py-6">{children}</main>
  )
}
