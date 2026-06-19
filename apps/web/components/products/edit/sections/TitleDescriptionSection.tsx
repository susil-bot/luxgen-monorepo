import { SimpleRichTextEditor } from '../../SimpleRichTextEditor';
import { ProductEditSection } from '../ProductEditSection';

interface TitleDescriptionSectionProps {
  title: string;
  bodyHtml: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export function TitleDescriptionSection({
  title,
  bodyHtml,
  onTitleChange,
  onBodyChange,
}: TitleDescriptionSectionProps) {
  return (
    <ProductEditSection>
      <div className="ios-form-group">
        <label htmlFor="product-title">Title</label>
        <input
          id="product-title"
          className="ios-input text-base"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Short sleeve t-shirt"
        />
      </div>
      <div className="ios-form-group">
        <label>Description</label>
        <SimpleRichTextEditor value={bodyHtml} onChange={onBodyChange} minHeight={200} />
      </div>
    </ProductEditSection>
  );
}
