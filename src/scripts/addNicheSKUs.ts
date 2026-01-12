import 'dotenv/config';
import { productUtils, skuUtils } from "../utils/supabase-admin.ts";

async function addSKUsForProducts() {
  console.log("Starting to add SKUs for products...");
  
  // Get all products
  const { data: products, error: productsError } = await productUtils.getAllProducts();
  
  if (productsError) {
    console.error("Error fetching products:", productsError);
    return;
  }
  
  if (!products) {
    console.error("No products found");
    return;
  }
  
  // Add SKUs for each product
  for (const product of products) {
    console.log(`Adding SKUs for product: ${product.name}`);
    
    // Add all required SKUs
    const allSKUs = [
      {
        product_id: product.id,
        size_ml: 1,
        price: 3000, // 30 Lei
        stock: 30,
        label: "1ml Sample"
      },
      {
        product_id: product.id,
        size_ml: 2,
        price: 5000, // 50 Lei
        stock: 50,
        label: "2ml Sample"
      },
      {
        product_id: product.id,
        size_ml: 5,
        price: 12000, // 120 Lei
        stock: 20,
        label: "5ml Sample"
      },
      {
        product_id: product.id,
        size_ml: 10,
        price: 20000, // 200 Lei
        stock: 10,
        label: "10ml Travel"
      },
      {
        product_id: product.id,
        size_ml: 50,
        price: 250000, // 2500 Lei
        stock: 10,
        label: "50ml Sticlă Completă"
      },
      {
        product_id: product.id,
        size_ml: 100,
        price: 400000, // 4000 Lei
        stock: 15,
        label: "100ml Sticlă Completă"
      }
    ];
    
    for (const sku of allSKUs) {
      try {
        const { data, error } = await skuUtils.createSKU(sku);
        if (error) {
          console.error(`Error adding SKU for ${product.name} (${sku.size_ml}ml):`, error);
        } else {
          console.log(`Successfully added SKU: ${sku.size_ml}ml for ${product.name}`);
        }
      } catch (err) {
        console.error(`Error adding SKU for ${product.name} (${sku.size_ml}ml):`, err);
      }
    }
  }
  
  console.log("Finished adding SKUs for products.");
}

// Run the script
addSKUsForProducts().catch(console.error); 