import 'dotenv/config';
import { productUtils } from "../utils/supabase-admin.ts";

const nicheBrands = [
  {
    name: "Amouage",
    products: [
      {
        name: "Reflection Man",
        description: "Un parfum floral-oriental modern care combină note de iris cu accente lemnoase și aromatice.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Rozmarin", "Iasomie"],
        notes_mid: ["Iris", "Iasomie", "Liliac"],
        notes_base: ["Cedru", "Vetiver", "Ambră"],
        concentration: "EDP",
        family: "Floral Oriental",
        gender_neutral: true,
        launch_year: 2007,
        rating: 4.8,
        review_count: 1250
      },
      {
        name: "Interlude Man",
        description: "Un parfum oriental intens cu note de oregano și ambră, creând o experiență olfactivă complexă.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Oregano", "Bergamotă", "Lavandă"],
        notes_mid: ["Ambră", "Vanilie", "Tonka"],
        notes_base: ["Oud", "Cedru", "Vetiver"],
        concentration: "EDP",
        family: "Oriental",
        gender_neutral: true,
        launch_year: 2012,
        rating: 4.7,
        review_count: 980
      }
    ]
  },
  {
    name: "Xerjoff",
    products: [
      {
        name: "Naxos",
        description: "Un parfum oriental-gourmand care combină note de lavandă cu vanilie și miere.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Lavandă", "Rozmarin"],
        notes_mid: ["Miere", "Tonka", "Vanilie"],
        notes_base: ["Tutun", "Cedru", "Vetiver"],
        concentration: "EDP",
        family: "Oriental Gourmand",
        gender_neutral: true,
        launch_year: 2015,
        rating: 4.9,
        review_count: 1500
      },
      {
        name: "Erba Pura",
        description: "Un parfum fructat și floral care evocă aroma unui grădin mediteraneană.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Portocală", "Lămâie"],
        notes_mid: ["Iasomie", "Fructe de Pădure", "Mango"],
        notes_base: ["Vanilie", "Mosc", "Ambră"],
        concentration: "EDP",
        family: "Fructat Floral",
        gender_neutral: true,
        launch_year: 2014,
        rating: 4.6,
        review_count: 1200
      }
    ]
  },
  {
    name: "Parfums de Marly",
    products: [
      {
        name: "Layton",
        description: "Un parfum oriental modern cu note de vanilie și mentă, creând un contrast interesant.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Mentă", "Lavandă", "Bergamotă"],
        notes_mid: ["Vanilie", "Tonka", "Cardamom"],
        notes_base: ["Cedru", "Vetiver", "Ambră"],
        concentration: "EDP",
        family: "Oriental",
        gender_neutral: true,
        launch_year: 2016,
        rating: 4.8,
        review_count: 2000
      },
      {
        name: "Pegasus",
        description: "Un parfum oriental cu note de migdale și vanilie, creând o aromă plăcută și sofisticată.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Migdale", "Lavandă"],
        notes_mid: ["Vanilie", "Tonka", "Iasomie"],
        notes_base: ["Cedru", "Vetiver", "Ambră"],
        concentration: "EDP",
        family: "Oriental",
        gender_neutral: true,
        launch_year: 2017,
        rating: 4.7,
        review_count: 1800
      }
    ]
  },
  {
    name: "Initio Parfums",
    products: [
      {
        name: "Oud for Greatness",
        description: "Un parfum oriental intens cu note de oud și vanilie, creând o experiență olfactivă puternică.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Rozmarin", "Cardamom"],
        notes_mid: ["Oud", "Vanilie", "Tonka"],
        notes_base: ["Cedru", "Vetiver", "Ambră"],
        concentration: "EDP",
        family: "Oriental",
        gender_neutral: true,
        launch_year: 2018,
        rating: 4.9,
        review_count: 1600
      },
      {
        name: "Side Effect",
        description: "Un parfum oriental-gourmand cu note de tutun și vanilie, creând o aromă adictivă.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Tutun", "Vanilie"],
        notes_mid: ["Tonka", "Ambră", "Cedru"],
        notes_base: ["Vetiver", "Mosc", "Vanilie"],
        concentration: "EDP",
        family: "Oriental Gourmand",
        gender_neutral: true,
        launch_year: 2019,
        rating: 4.8,
        review_count: 1400
      }
    ]
  },
  {
    name: "Maison Francis Kurkdjian",
    products: [
      {
        name: "Baccarat Rouge 540",
        description: "Un parfum oriental floral cu note de iasomie și ambră, creând o aromă sofisticată și modernă.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Iasomie", "Azafran", "Ambră"],
        notes_mid: ["Cedru", "Ambră", "Iasomie"],
        notes_base: ["Ambră", "Cedru", "Vetiver"],
        concentration: "EDP",
        family: "Oriental Floral",
        gender_neutral: true,
        launch_year: 2015,
        rating: 4.9,
        review_count: 2500
      },
      {
        name: "Grand Soir",
        description: "Un parfum oriental intens cu note de vanilie și ambră, creând o aromă luxoasă și plăcută.",
        image_url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
        notes_top: ["Bergamotă", "Vanilie", "Ambră"],
        notes_mid: ["Tonka", "Ambră", "Vanilie"],
        notes_base: ["Cedru", "Vetiver", "Ambră"],
        concentration: "EDP",
        family: "Oriental",
        gender_neutral: true,
        launch_year: 2016,
        rating: 4.8,
        review_count: 1800
      }
    ]
  },
  {
    name: "Creed",
    description: "Casa regală de parfumuri cu tradiție de peste 260 de ani",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80",
    products: [
      {
        name: "Aventus",
        description: "Un parfum iconic, Aventus de la Creed este celebrat pentru notele sale fructate și lemnoase, simbolizând puterea și succesul.",
        image_url: "https://creedboutique.com/cdn/shop/products/Aventus_100ml_1.jpg?v=1677602282",
        notes_top: ["Ananas", "Măr", "Coacăze negre", "Bergamotă"],
        notes_mid: ["Iasomie", "Patchouli", "Mesteacăn", "Trandafir"],
        notes_base: ["Mosc", "Moss de stejar", "Ambergris", "Vanilie"],
        concentration: "Eau de Parfum",
        family: "Fructat Lemnos",
        gender_neutral: true,
        launch_year: 2010,
        rating: 4.8,
        review_count: 3200
      },
      {
        name: "Green Irish Tweed",
        description: "O aromă proaspătă, inspirată de peisajele verzi ale Irlandei, perfectă pentru orice ocazie.",
        image_url: "https://creedboutique.com/cdn/shop/products/GIT_100ml_1.jpg?v=1677602282",
        notes_top: ["Lămâie", "Verdeață"],
        notes_mid: ["Violetă", "Iris"],
        notes_base: ["Ambergris", "Lemn de santal"],
        concentration: "Eau de Parfum",
        family: "Aromatic Fougère",
        gender_neutral: true,
        launch_year: 1985,
        rating: 4.7,
        review_count: 2100
      },
      {
        name: "Silver Mountain Water",
        description: "O compoziție revigorantă, inspirată de prospețimea munților elvețieni, cu note de ceai verde și coacăze negre.",
        image_url: "https://creedboutique.com/cdn/shop/products/SMW_100ml_1.jpg?v=1677602282",
        notes_top: ["Mandarină", "Bergamotă"],
        notes_mid: ["Ceai verde", "Coacăze negre"],
        notes_base: ["Mosc", "Santal", "Galbanum"],
        concentration: "Eau de Parfum",
        family: "Aromatic Acvatic",
        gender_neutral: true,
        launch_year: 1995,
        rating: 4.6,
        review_count: 1800
      }
    ]
  }
];

async function addNicheBrands() {
  console.log("Starting to add niche brands and products...");
  
  for (const brand of nicheBrands) {
    console.log(`Adding products for brand: ${brand.name}`);
    
    for (const product of brand.products) {
      try {
        const { data, error } = await productUtils.createProduct({
          ...product,
          brand: brand.name
        });
        
        if (error) {
          console.error(`Error adding product ${product.name}:`, error);
        } else {
          console.log(`Successfully added product: ${product.name}`);
        }
      } catch (err) {
        console.error(`Error adding product ${product.name}:`, err);
      }
    }
  }
  
  console.log("Finished adding niche brands and products.");
}

// Run the script
addNicheBrands().catch(console.error); 