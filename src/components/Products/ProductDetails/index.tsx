import MainContent from './main-content';
import ProductDetailTab from './ProductDetailTab';
import { MarkdownItem } from '../../../types';

interface ProductDetailsProps {
    product: MarkdownItem;
    productFilterPath?: string;
}

function ProductDetails({ product }: ProductDetailsProps) {
    return (
        <main>
            <MainContent product={product} />
            <ProductDetailTab product={product} />
        </main>
    );
}

export default ProductDetails;
