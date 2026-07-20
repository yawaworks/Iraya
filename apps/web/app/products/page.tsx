import { supabase } from '@iraya/supabase-client'

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    return <div>Error loading products: {error.message}</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Products</h1>
      {products?.length === 0 && <p>No products yet.</p>}
      <ul>
        {products?.map((product: any) => (
          <li key={product.id}>
            {product.title} - Rs.{product.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
