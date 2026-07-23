// Deprecated – replaced by src/components/admin/page-builder.tsx
export default function VisualEditor({ slug }: { slug: string }) {
  return (
    <div className="p-8 text-center text-muted font-mono text-sm">
      This editor has been replaced by the new Page Builder.
      <br />
      Page: <strong>{slug}</strong>
    </div>
  );
}
