import MainContent from './main-content';
import ProductDetailTab from './ProductDetailTab';
import { MarkdownItem } from '../../../types';

interface ProductDetailsProps {
    product: MarkdownItem;
    productDetailTabItems: MarkdownItem[];
    productFilterPath?: string;
}

function ProductDetails({ product, productDetailTabItems }: ProductDetailsProps) {
    return (
        <main>
            <MainContent product={product} />
            <ProductDetailTab
                product={product}
                productDetailTabItems={productDetailTabItems}
            />
        </main>
    );
}

export default ProductDetails;
