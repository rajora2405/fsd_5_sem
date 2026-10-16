import React from 'react';

const Product = ({ products }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', justifyContent: 'center' }}>
      {products && products.length > 0 ? (
        products.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', width: '220px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
            <h3 style={{ fontSize: '16px', margin: '10px 0' }}>{item.title}</h3>
            <p style={{ fontWeight: 'bold', color: '#2b78e4' }}>${item.price}</p>
          </div>
        ))
      ) : (
        <p>Loading products...</p>
      )}
    </div>
  );
};

export default Product;