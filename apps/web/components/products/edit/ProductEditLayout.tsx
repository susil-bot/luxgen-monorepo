interface ProductEditLayoutProps {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}

/** Shopify-style two-column product edit grid */
export function ProductEditLayout({ header, main, sidebar }: ProductEditLayoutProps) {
  return (
    <div className="product-edit-page px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-4">
      {header}
      <div className="product-edit-layout">
        <div className="product-edit-main space-y-4">{main}</div>
        <aside className="product-edit-sidebar space-y-4">{sidebar}</aside>
      </div>
    </div>
  );
}
