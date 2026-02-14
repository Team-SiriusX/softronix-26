export type StoreInfo = {
    name: string;
    website: string;
    description: string;
    tagline: string;
    about: string;
    contact: {
        email: string;
        phone: string;
    };
    social_media: {
        facebook: string;
        instagram: string;
        tiktok: string;
        youtube: string;
    };
    shipping: {
        free_shipping_threshold: number;
        currency: string;
        delivery_time: string;
    };
};

export type Price = {
    current: number;
    original?: number;
    currency: string;
    formatted: string;
    discount_percentage?: number;
};

export type Reviews = {
    count: number | null;
    average_rating: number | null;
    summary: string;
};

export type Product = {
    id: string;
    name: string;
    brand: string;
    price: Price;
    category: string[];
    url: string;
    description: string;
    reviews: Reviews;
    stock_status: string;
    images: string[];
    extendedDescription?: string;
    // Optional fields that appear in some products
    key_features?: string[];
    ingredients?: string[];
    key_ingredients?: string[];
    finish?: string;
    hold?: string;
    fragrance?: string;
    how_to_use?: string[];
    whats_included?: string[];
    size?: string;
    application_time?: string;
    bundle_includes?: string[];
    key_benefits?: string[];
    suitable_for?: string;
    spf?: string;
};

export type Store = {
    store_info: StoreInfo;
    product_categories: string[];
    total_products: number;
    products: Product[];
};

export const store: Store = {
    "store_info": {
        "name": "Echo",
        "website": "https://www.echogrooming.com",
        "description": "Pakistan's #1 Men's Grooming Brand",
        "tagline": "Shop the finest men's grooming essentials in Pakistan",
        "about": "Echo is Pakistan's premier men's grooming brand, founded by two bearded buddies who wanted to solve age-old problems faced by men when growing facial hair",
        "contact": {
            "email": "support@echo.com",
            "phone": "+92 316 1115556"
        },
        "social_media": {
            "facebook": "https://www.facebook.com/echogrooming/",
            "instagram": "https://www.instagram.com/echogrooming/",
            "tiktok": "https://www.tiktok.com/@echogrooming",
            "youtube": "https://www.youtube.com/@echogrooming"
        },
        "shipping": {
            "free_shipping_threshold": 1999,
            "currency": "PKR",
            "delivery_time": "5-7 working days"
        }
    },
    "product_categories": [
        "Face",
        "Hair Care",
        "Hair Styling",
        "Beard Growth",
        "Beard Grooming",
        "Body",
        "Fragrance",
        "De-Tan Line",
        "Charcoal Line",
        "Glow Line",
        "Ice Blast Line",
        "Accessories",
        "Bundles"
    ],
    "total_products": 38,
    "products": [
        {
            "id": "hair-color-cream",
            "name": "Hair Color Cream",
            "brand": "Echo",
            "price": {
                "current": 1199,
                "currency": "PKR",
                "formatted": "Rs.1,199.00"
            },
            "category": [
                "Hair",
                "Hair Color",
                "New Launch"
            ],
            "url": "https://www.darimooch.com/products/hair-color-cream",
            "description": "Echo's first-ever hair color enriched with Ginseng Extract, combining rich dark brown color with advanced hair care. Delivers natural, lasting dark brown color in just 5 minutes.",
            "key_features": [
                "Full grey coverage in 5 minutes",
                "No-drip formula",
                "Enriched with Ginseng Extract",
                "Nourishes hair from root to tip",
                "Contains Argan Oil for deep nourishment",
                "Rich dark brown color",
                "Improves hair elasticity",
                "Reduces breakage during coloring"
            ],
            "ingredients": [
                "Ginseng Extract - boosts scalp vitality, keeps hair stronger and healthier",
                "Argan Oil - rich in fatty acids and antioxidants, deeply nourishes hair"
            ],
            "how_to_use": [
                "Perform a skin allergy test 48 hrs before use",
                "Put on gloves and wear an old shirt",
                "Mix color cream and developer (1:1) in a non-metal bowl",
                "Apply evenly to dry, unwashed hair with a brush, starting at roots",
                "Leave for 5-10 minutes (check for desired color)",
                "Rinse thoroughly until water runs clear, then use color-safe shampoo & conditioner"
            ],
            "whats_included": [
                "Color cream",
                "Developer"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product - no customer reviews yet. First-ever hair color from Echo designed specifically for men seeking quick grey coverage with hair nourishment."
            },
            "images": [
                "https://www.darimooch.com/cdn/shop/files/2_1.webp",
                "https://www.darimooch.com/cdn/shop/files/Benefit.webp",
                "https://www.darimooch.com/cdn/shop/files/1_4.webp"
            ],
            "stock_status": "in_stock",
            "size": "1 pack",
            "application_time": "5-10 minutes",
            "extendedDescription": "Professional salon-quality hair coloring at home in just 5 minutes. This advanced formula uses Ginseng Extract to boost scalp vitality while providing full grey coverage. The no-drip cream consistency with Argan Oil nourishes each strand from root to tip. Perfect for men seeking quick confidence-boosting transformation with natural dark brown results."
        },
        {
            "id": "surge-perfume",
            "name": "Surge Perfume",
            "brand": "Echo",
            "price": {
                "current": 2999,
                "currency": "PKR",
                "formatted": "Rs.2,999.00"
            },
            "category": [
                "Fragrance",
                "Body",
                "New Launch",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/surge-perfume",
            "description": "Premium perfume for men",
            "reviews": {
                "count": 14,
                "average_rating": 4.5,
                "summary": "Customers rate 4.5/5 stars (14 reviews). Users appreciate long-lasting fragrance and sophisticated scent profile working well for both casual and formal occasions."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/SurgeWebImagescopy5.webp",
                "https://www.darimooch.com/cdn/shop/files/WebImages2copy.webp",
                "https://www.darimooch.com/cdn/shop/files/Surge_2.webp"
            ],
            "extendedDescription": "Premium men's perfume designed to make lasting impressions. Sophisticated fragrance combining modern masculine notes that evolve throughout the day, providing long-lasting scent for confidence and presence. Perfect for daily wear or special occasions with contemporary yet timeless signature scent."
        },
        {
            "id": "glow-face-wash",
            "name": "Glow Face Wash",
            "brand": "Echo",
            "price": {
                "current": 899,
                "currency": "PKR",
                "formatted": "Rs.899.00"
            },
            "category": [
                "Face",
                "Glow Line",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/glow-face-wash",
            "description": "Glow face wash for brightening skin",
            "reviews": {
                "count": 68,
                "average_rating": 4.5,
                "summary": "Highly rated: 68 customers, 4.5/5 stars. Users report noticeable skin brightness and texture improvement. Gentle yet effective cleansing with visible glow enhancement within weeks."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/GlowLineFaceWash2.webp",
                "https://www.darimooch.com/cdn/shop/files/Glow_Line_Face_Wash_6_with_Text.webp",
                "https://www.darimooch.com/cdn/shop/files/Glow_Line_Face_Wash_1.webp"
            ],
            "extendedDescription": "Brightening face wash formulated to cleanse deeply while promoting even, radiant skin tone. Gently removes dirt, oil, and impurities without stripping natural moisture barrier. Reduces dullness and enhances natural glow for brighter, healthier-looking skin with regular use."
        },
        {
            "id": "glow-body-wash",
            "name": "Glow Body Wash",
            "brand": "Echo",
            "price": {
                "current": 799,
                "currency": "PKR",
                "formatted": "Rs.799.00"
            },
            "category": [
                "Body",
                "Glow Line",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/glow-body-wash",
            "description": "Glow body wash for skin brightening",
            "reviews": {
                "count": 15,
                "average_rating": 4.47,
                "summary": "Rated 4.47/5 by 15 customers. Users appreciate brightening effects and pleasant fragrance. Many note softer, more even-toned skin after consistent use."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/Glow_Line_Body_Wash_4.webp",
                "https://www.darimooch.com/cdn/shop/files/Glow_Line_Body_Wash_6_with_Text.webp",
                "https://www.darimooch.com/cdn/shop/files/Glow_Line_Body_Wash_2.webp"
            ],
            "extendedDescription": "Complete brightening routine body wash designed to enhance natural glow. Works on larger body areas, gently cleansing while evening skin tone and reducing dullness. Moisturizing formula keeps skin hydrated and smooth while revealing brighter, more radiant complexion."
        },
        {
            "id": "glow-bundle",
            "name": "Glow Bundle",
            "brand": "Echo",
            "price": {
                "current": 1528,
                "original": 1698,
                "currency": "PKR",
                "formatted": "Rs.1,528.00",
                "discount_percentage": 10
            },
            "category": [
                "Bundles",
                "Glow Line",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/glow-bundle",
            "description": "Bundle containing glow products for complete skin brightening",
            "bundle_includes": [
                "Glow Face Wash",
                "Glow Body Wash"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New bundle offering - combines two bestselling Glow Line products at discounted price. Individual products have excellent ratings."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/GlowLineBundle3.webp",
                "https://www.darimooch.com/cdn/shop/files/GlowLineBundle1.webp",
                "https://www.darimooch.com/cdn/shop/files/Glow_Bundle_2.webp"
            ],
            "extendedDescription": "Complete brightening experience combining Glow Face Wash and Glow Body Wash. Save 10% while addressing skin dullness comprehensively. Coordinated approach achieving radiant, even-toned skin by targeting both facial and body areas. Ideal starter kit for brighter, healthier-looking skin."
        },
        {
            "id": "de-tan-sunscreen-spf-50",
            "name": "De-Tan Sunscreen SPF 50+",
            "brand": "Echo",
            "price": {
                "current": 1199,
                "currency": "PKR",
                "formatted": "Rs.1,199.00"
            },
            "category": [
                "Face",
                "De-Tan Line"
            ],
            "url": "https://www.darimooch.com/products/de-tan-sunscreen-spf-50-by-dari-mooch-110ml-copy",
            "description": "Sunscreen with SPF 50+ for sun protection and de-tanning",
            "size": "110ml",
            "spf": "50+",
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product receiving positive feedback. Users report effective sun protection without white cast, non-greasy formula, and tan prevention. Quickly becoming customer favorite for outdoor activities."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/De-TanSunscreenWebImage3.webp",
                "https://www.darimooch.com/cdn/shop/files/De-TanSunscreenWebImage1.webp",
                "https://www.darimooch.com/cdn/shop/files/Sunscreen_Tube.webp"
            ],
            "extendedDescription": "Advanced SPF 50+ sunscreen offering comprehensive UV protection while preventing tanning. Enriched with Actipone Bengkoang reducing dark spots and hyperpigmentation, plus Vitamin E guarding against premature aging. Forms protective barrier preventing sunburn while helping revive natural skin tone. Perfect daily defense for outdoor activities."
        },
        {
            "id": "lip-lightener-balm",
            "name": "Lip Lightener Balm",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Face"
            ],
            "url": "https://www.darimooch.com/products/new-lip-lightener-balm",
            "description": "Lip lightener balm for dark lips",
            "reviews": {
                "count": 1,
                "average_rating": 5.0,
                "summary": "Rated 5.0/5 by 1 customer. Early user extremely satisfied with lightening results and moisturizing properties."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/LipLightenerBalmWebImage3.webp",
                "https://www.darimooch.com/cdn/shop/files/LipLightenerBalmWebImage1.webp",
                "https://www.darimooch.com/cdn/shop/files/Lip_Lightener_2.webp"
            ],
            "extendedDescription": "Specialized lip balm targeting dark lips with lightening formula. Nourishes while gradually reducing pigmentation for more even, natural lip tone. Moisturizes deeply preventing dryness and cracking while improving lip appearance over time."
        },
        {
            "id": "lip-balm",
            "name": "Lip Balm",
            "brand": "Echo",
            "price": {
                "current": 499,
                "currency": "PKR",
                "formatted": "Rs.499.00"
            },
            "category": [
                "Face"
            ],
            "url": "https://www.darimooch.com/products/lip-balm-copy-1",
            "description": "Lip balm for moisturization and protection",
            "reviews": {
                "count": 1,
                "average_rating": 5.0,
                "summary": "Rated 5.0/5 by 1 customer. User reports excellent moisturization and long-lasting protection."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/LipBalmWebImage3.webp",
                "https://www.darimooch.com/cdn/shop/files/LipBalmWebImage.webp",
                "https://www.darimooch.com/cdn/shop/files/Lip_Balm_Product.webp"
            ],
            "extendedDescription": "Essential lip moisturization and protection. Prevents dryness, cracking, and chapping while maintaining soft, healthy lips. Perfect daily use for harsh weather protection and maintaining optimal lip condition."
        },
        {
            "id": "under-eye-balm",
            "name": "Under Eye Balm",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Face"
            ],
            "url": "https://www.darimooch.com/products/new-under-eye-balm",
            "description": "Under eye balm for dark circles and puffiness",
            "reviews": {
                "count": 1,
                "average_rating": 5.0,
                "summary": "Rated 5.0/5 by 1 customer. User reports visible reduction in dark circles and puffiness with consistent use."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/UnderEyeBalmWebImagecopy2.webp",
                "https://www.darimooch.com/cdn/shop/files/Under_Eye_Balm_Web_Image_copy_1_1.webp",
                "https://www.darimooch.com/cdn/shop/files/Under_Eye_Product.webp"
            ],
            "extendedDescription": "Targeted treatment for dark circles and puffiness. Specially formulated for delicate under-eye skin, reduces appearance of tired eyes while hydrating and smoothing. Helps brighten under-eye area for more refreshed, youthful appearance."
        },
        {
            "id": "de-tan-face-wash",
            "name": "De-Tan Face Wash",
            "brand": "Echo",
            "price": {
                "current": 899,
                "currency": "PKR",
                "formatted": "Rs.899.00"
            },
            "category": [
                "Face",
                "De-Tan Line"
            ],
            "url": "https://www.darimooch.com/products/de-tan-face-wash",
            "description": "Face wash for tan removal and skin brightening, suitable for all skin types",
            "suitable_for": "All skin types",
            "reviews": {
                "count": 39,
                "average_rating": 4.36,
                "summary": "Rated 4.36/5 from 39 reviews. Users appreciate gradual tan reduction and skin brightening effects. Works well for daily cleansing while addressing sun damage."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/DetanbodywashWebcopy.webp",
                "https://www.darimooch.com/cdn/shop/files/DetanFacewashWebcopy.jpg",
                "https://www.darimooch.com/cdn/shop/files/De-Tan_Face_Wash_Product.webp"
            ],
            "extendedDescription": "Specialized face wash for tan removal and skin brightening suitable for all skin types. Gently cleanses while working to reduce tan, even skin tone, and restore natural complexion. Contains papaya extract and natural brightening agents for visible results over time."
        },
        {
            "id": "anti-hairfall-bundle",
            "name": "Anti-Hairfall Bundle | Complete Hair Loss Solution",
            "brand": "Echo",
            "price": {
                "current": 1978,
                "original": 2198,
                "currency": "PKR",
                "formatted": "Rs.1,978.00",
                "discount_percentage": 10
            },
            "category": [
                "Hair",
                "Hair Care",
                "Bundles",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/anti-hairfall-bundle-complete-hair-loss-solution",
            "description": "Complete hair loss solution bundle with anti-hairfall oil and shampoo to strengthen hair follicles and reduce hair fall",
            "bundle_includes": [
                "Anti-Hairfall Oil",
                "Anti-Hairfall Shampoo"
            ],
            "key_benefits": [
                "Reduces hair fall",
                "Strengthens hair follicles",
                "Promotes healthier growth",
                "Nourishes the scalp"
            ],
            "reviews": {
                "count": 164,
                "average_rating": 4.75,
                "summary": "Highly rated: 4.75/5 from 164 customers. Users report noticeable reduction in hair fall within 2-3 weeks. Significantly less hair in shower and on pillow. Oil praised for not being heavy or greasy."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Anti-Hairfall-Bundle.jpg",
                "https://www.darimooch.com/cdn/shop/files/Anti_Hairfall_Bundle_Set.webp"
            ],
            "extendedDescription": "Comprehensive two-product system for men experiencing thinning or excessive shedding. Anti-Hairfall Oil contains protein-rich natural oils penetrating deep to nourish follicles. Shampoo gently cleanses while strengthening and protecting. Together create complete defense reducing shedding and promoting healthier regrowth."
        },
        {
            "id": "ultimate-skin-hair-bundle",
            "name": "Ultimate Skin and Hair Care Bundle",
            "brand": "Echo",
            "price": {
                "current": 3299,
                "original": 3696,
                "currency": "PKR",
                "formatted": "Rs.3,299.00",
                "discount_percentage": 11
            },
            "category": [
                "Hair",
                "Bundles"
            ],
            "url": "https://www.darimooch.com/products/copy-of-anti-hairfall-bundle-complete-hair-loss-solution",
            "description": "Complete skin and hair care bundle combining multiple products for comprehensive grooming",
            "reviews": {
                "count": 114,
                "average_rating": 4.77,
                "summary": "Rated 4.77/5 from 114 reviews. Customers love comprehensive approach and value. Users report improvements across multiple grooming concerns with consistent use."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/Ultimate_Skin_and_Hair_Care_Bundle.webp",
                "https://www.darimooch.com/cdn/shop/files/Ultimate_Bundle_Set.webp"
            ],
            "extendedDescription": "Complete skin and hair care bundle combining multiple premium products for comprehensive grooming. Addresses hair fall, skin brightening, cleansing, and overall grooming needs. Perfect all-in-one solution for men serious about complete grooming regimen."
        },
        {
            "id": "anti-hairfall-oil",
            "name": "Anti-Hairfall Oil",
            "brand": "Echo",
            "price": {
                "current": 1499,
                "currency": "PKR",
                "formatted": "Rs.1,499.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/anti-hairfall-oil-1",
            "description": "Oil to prevent hair fall with protein-rich natural oils that nourish the scalp and provide essential nutrients for hair growth",
            "key_features": [
                "Prevents hair fall",
                "Protein-rich formula",
                "Natural oils",
                "Nourishes scalp",
                "Promotes hair growth"
            ],
            "reviews": {
                "count": 117,
                "average_rating": 4.68,
                "summary": "117 reviews, 4.68/5 rating. Users report reduced hair fall and stronger hair. Less shedding during shampooing and combing within weeks."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Anti-HairFall-Oil.jpg",
                "https://www.darimooch.com/cdn/shop/files/Anti-Hair_Fall_Oil_Daraz_copy.webp",
                "https://www.darimooch.com/cdn/shop/files/Anti_Hairfall_Oil_Product.webp"
            ],
            "extendedDescription": "Protein-rich natural oil preventing hair fall by nourishing scalp and providing essential nutrients. Strengthens follicles from roots, reduces breakage, promotes healthier thicker growth. Suitable for all hair types experiencing thinning or excessive shedding."
        },
        {
            "id": "hair-clay-wax",
            "name": "Hair Clay Wax",
            "brand": "Echo",
            "price": {
                "current": 1199,
                "currency": "PKR",
                "formatted": "Rs.1,199.00"
            },
            "category": [
                "Hair",
                "Hair Styling"
            ],
            "url": "https://www.darimooch.com/products/hair-clay-wax-copy-1",
            "description": "Hair clay wax for styling with natural matte finish. Offers strong hold without making hair stiff or greasy, ideal for creating textured, voluminous hairstyles",
            "key_features": [
                "Strong hold",
                "Natural matte finish",
                "Non-greasy",
                "Creates textured hairstyles",
                "All-day hold",
                "Adds volume"
            ],
            "finish": "Matte",
            "hold": "Strong",
            "reviews": {
                "count": 19,
                "average_rating": 4.16,
                "summary": "19 reviews, 4.16/5 rating. Users appreciate strong hold and matte finish. Some note learning curve for proper amount and application technique."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/WebImagesHairclaywaxcopy2.webp",
                "https://www.darimooch.com/cdn/shop/files/WebImagesHairclaywaxcopy1.webp",
                "https://www.darimooch.com/cdn/shop/files/Hair_Clay_Wax_Jar.webp"
            ],
            "extendedDescription": "Hair clay wax offering strong hold with natural matte finish. Non-greasy formula creates textured, voluminous hairstyles without stiffness. Perfect for modern messy styles, pompadours, and textured looks requiring all-day hold and natural appearance."
        },
        {
            "id": "hair-wax",
            "name": "Hair Wax",
            "brand": "Echo",
            "price": {
                "current": 1199,
                "currency": "PKR",
                "formatted": "Rs.1,199.00"
            },
            "category": [
                "Hair",
                "Hair Styling"
            ],
            "url": "https://www.darimooch.com/products/new-hair-wax",
            "description": "Versatile hair wax with medium hold and shiny finish, infused with castor oil for hair nourishment",
            "key_features": [
                "Medium hold",
                "Shiny finish",
                "Infused with castor oil",
                "Versatile styling"
            ],
            "finish": "Shiny",
            "hold": "Medium",
            "ingredients": [
                "Castor Oil"
            ],
            "reviews": {
                "count": 15,
                "average_rating": 4.53,
                "summary": "15 reviews, 4.53/5 rating. Users love shiny finish and medium hold allowing restyling throughout day. Castor oil adds nice conditioning benefit."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/WebImagesHairWaxcopy2.webp",
                "https://www.darimooch.com/cdn/shop/files/WebImagesHairWaxcopy1.webp",
                "https://www.darimooch.com/cdn/shop/files/Hair_Wax_Container.webp"
            ],
            "extendedDescription": "Versatile hair wax with medium hold and shiny finish, infused with castor oil. Provides flexible styling with natural shine, perfect for polished looks requiring some movement. Nourishes hair while styling, suitable for various hairstyles from slicked-back to textured styles."
        },
        {
            "id": "hair-clay-wax-hair-wax",
            "name": "Hair Clay Wax + Hair Wax",
            "brand": "Echo",
            "price": {
                "current": 1999,
                "original": 2398,
                "currency": "PKR",
                "formatted": "Rs.1,999.00",
                "discount_percentage": 17
            },
            "category": [
                "Hair",
                "Hair Styling",
                "Bundles"
            ],
            "url": "https://www.darimooch.com/products/hair-clay-wax-hair-wax",
            "description": "Bundle with hair clay wax and hair wax for versatile styling options",
            "bundle_includes": [
                "Hair Clay Wax",
                "Hair Wax"
            ],
            "reviews": {
                "count": 79,
                "average_rating": 4.59,
                "summary": "79 reviews, 4.59/5 rating. Customers love having both options for different occasions. Great value bundle for complete styling versatility."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/Hair_Clay_Hair_Wax_Bundle.webp",
                "https://www.darimooch.com/cdn/shop/files/HairClayWax_HairWax.webp"
            ],
            "extendedDescription": "Complete styling bundle offering both matte and shiny finish options. Hair Clay Wax provides strong hold with matte finish for textured styles; Hair Wax offers medium hold with shine for polished looks. Perfect combo for versatile styling needs and significant savings."
        },
        {
            "id": "glow-bundle-hair-clay-wax",
            "name": "Glow Bundle + Hair Clay Wax",
            "brand": "Echo",
            "price": {
                "current": 2549,
                "original": 2897,
                "currency": "PKR",
                "formatted": "Rs.2,549.00",
                "discount_percentage": 12
            },
            "category": [
                "Hair",
                "Bundles"
            ],
            "url": "https://www.darimooch.com/products/glow-bundle-hair-clay-wax",
            "description": "Complete bundle with glow products and hair clay wax",
            "bundle_includes": [
                "Glow Face Wash",
                "Glow Body Wash",
                "Hair Clay Wax"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New bundle combining bestselling products. Individual items have excellent ratings. Perfect starter for men wanting complete grooming routine."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/Glow_Bundle_Hair_Clay_Wax.webp",
                "https://www.darimooch.com/cdn/shop/files/Complete_Glow_Hair_Set.webp"
            ],
            "extendedDescription": "Ultimate grooming bundle combining skin brightening (Glow Face Wash, Glow Body Wash) with premium hair styling (Hair Clay Wax). Complete head-to-toe grooming solution addressing brightening and styling needs in one value package."
        },
        {
            "id": "beard-growth-kit",
            "name": "Beard Growth Kit",
            "brand": "Echo",
            "price": {
                "current": 3799,
                "original": 4097,
                "currency": "PKR",
                "formatted": "Rs.3,799.00",
                "discount_percentage": 7
            },
            "category": [
                "Beard",
                "Beard Growth",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/growth-kit",
            "description": "Complete beard growth kit with growth oil, biotin spray, and shampoo to promote fuller, healthier beard growth",
            "bundle_includes": [
                "Beard Growth Oil",
                "Beard Growth Biotin Spray",
                "Beard Growth Shampoo"
            ],
            "key_benefits": [
                "Promotes beard growth",
                "Fuller, healthier beard",
                "Complete growth solution",
                "Nourishes facial hair"
            ],
            "reviews": {
                "count": 528,
                "average_rating": 4.56,
                "summary": "Extremely popular: 528 reviews, 4.56/5 stars. Customers report visible improvements in thickness and patchy area filling within 4-8 weeks. First product delivering on growth promises. Best results using all three consistently."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/Beard_Growth_Biotin_Spray_Web_Image_copy_2.webp",
                "https://www.darimooch.com/cdn/shop/files/Beard_Growth_Kit_Web_Images_copy_1.webp",
                "https://www.darimooch.com/cdn/shop/files/Complete_Growth_Kit.webp"
            ],
            "extendedDescription": "Ultimate solution for patchy beards or slow growth. Comprehensive 3-step system: Growth Oil nourishes with castor and avocado oils strengthening follicles; Biotin Spray delivers nutrients stimulating dormant follicles; Growth Shampoo cleanses while energizing roots with caffeine. Creates optimal conditions for fuller, faster, healthier beard growth."
        },
        {
            "id": "beard-growth-oil",
            "name": "Beard Growth Oil",
            "brand": "Echo",
            "price": {
                "current": 1499,
                "currency": "PKR",
                "formatted": "Rs.1,499.00"
            },
            "category": [
                "Beard",
                "Beard Growth"
            ],
            "url": "https://www.darimooch.com/products/new-beard-growth-oil",
            "description": "Oil to promote beard growth with castor and avocado oils for nourishment and stimulation",
            "ingredients": [
                "Castor Oil",
                "Avocado Oil"
            ],
            "key_features": [
                "Promotes beard growth",
                "Nourishes facial hair",
                "Natural ingredients"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product in Growth Kit line. Based on kit success, users expect effective growth promotion and follicle nourishment."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthOilWebImagecopy3.webp",
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthOilWebImagecopy1.webp",
                "https://www.darimooch.com/cdn/shop/files/Beard_Growth_Oil_Bottle.webp"
            ],
            "extendedDescription": "Promotes beard growth with castor and avocado oils for deep nourishment and follicle stimulation. Strengthens existing facial hair while encouraging new growth in patchy areas. Natural formula penetrates deeply to nourish skin and hair from root to tip."
        },
        {
            "id": "beard-growth-biotin-spray",
            "name": "Beard Growth Biotin Spray",
            "brand": "Echo",
            "price": {
                "current": 1499,
                "currency": "PKR",
                "formatted": "Rs.1,499.00"
            },
            "category": [
                "Beard",
                "Beard Growth"
            ],
            "url": "https://www.darimooch.com/products/new-beard-growth-biotin-spray",
            "description": "Fast-absorbing biotin spray for beard growth that promotes healthier, fuller facial hair",
            "key_ingredients": [
                "Biotin"
            ],
            "key_features": [
                "Fast-absorbing",
                "Promotes beard growth",
                "Contains biotin",
                "Fuller facial hair"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product in Growth Kit line. Part of highly-rated growth system. Users appreciate fast-absorbing formula and visible growth results."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthBiotinSprayWebImagecopy4.webp",
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthBiotinSprayWebImagecopy1.webp",
                "https://www.darimooch.com/cdn/shop/files/Biotin_Spray_Product.webp"
            ],
            "extendedDescription": "Fast-absorbing biotin spray promoting healthier, fuller facial hair. Delivers essential B vitamins directly to follicles stimulating growth and strengthening existing beard. Lightweight formula absorbs quickly without greasiness, perfect for daily use."
        },
        {
            "id": "beard-growth-shampoo",
            "name": "Beard Growth Shampoo",
            "brand": "Echo",
            "price": {
                "current": 1099,
                "currency": "PKR",
                "formatted": "Rs.1,099.00"
            },
            "category": [
                "Beard",
                "Beard Growth"
            ],
            "url": "https://www.darimooch.com/products/new-beard-growth-shampoo",
            "description": "Shampoo to promote beard growth with caffeine for stimulation and strengthening",
            "key_ingredients": [
                "Caffeine"
            ],
            "key_features": [
                "Promotes beard growth",
                "Contains caffeine",
                "Cleanses and strengthens",
                "Stimulates follicles"
            ],
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product in Growth Kit line. Part of comprehensive growth system. Users appreciate cleansing without dryness and growth-promoting benefits."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthShampooWebImagecopy3.webp",
                "https://www.darimooch.com/cdn/shop/files/BeardGrowthShampooWebImagecopy.webp",
                "https://www.darimooch.com/cdn/shop/files/Growth_Shampoo_Bottle.webp"
            ],
            "extendedDescription": "Promotes beard growth with caffeine for follicle stimulation and strengthening. Cleanses facial hair and skin while energizing roots to encourage growth. Gentle formula removes dirt and oil without stripping natural protective oils."
        },
        {
            "id": "beard-shampoo",
            "name": "Beard Shampoo",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Beard",
                "Beard Grooming"
            ],
            "url": "https://www.darimooch.com/products/beard-shampoo-copy-1",
            "description": "Shampoo for beard cleaning and care, keeping facial hair soft and manageable",
            "reviews": {
                "count": 7,
                "average_rating": 4.71,
                "summary": "7 reviews, 4.71/5 rating. Users love how soft and manageable their beards become. Cleans effectively without harsh stripping."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/WebImagesBeardShampoocopy2.webp",
                "https://www.darimooch.com/cdn/shop/files/Web_Images_Beard_Shampoo_copy_1.webp",
                "https://www.darimooch.com/cdn/shop/files/Beard_Shampoo_Product.webp"
            ],
            "extendedDescription": "Specialized shampoo for beard cleaning and care keeping facial hair soft and manageable. Cleanses thoroughly removing dirt, oil, and debris while maintaining natural moisture. Leaves beard fresh, clean, and easy to style without dryness or irritation."
        },
        {
            "id": "beard-brush",
            "name": "Beard Brush",
            "brand": "Echo",
            "price": {
                "current": 899,
                "currency": "PKR",
                "formatted": "Rs.899.00"
            },
            "category": [
                "Beard",
                "Beard Grooming",
                "Accessories"
            ],
            "url": "https://www.darimooch.com/products/beard-brush",
            "description": "Beard brush for grooming and styling, helps distribute oils and tame facial hair",
            "key_features": [
                "Grooming tool",
                "Distributes oils evenly",
                "Tames facial hair",
                "Styling aid"
            ],
            "reviews": {
                "count": 185,
                "average_rating": 4.67,
                "summary": "185 reviews, 4.67/5 rating. Customers love how it tames wild beards and distributes oils perfectly. Essential daily grooming tool."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Beard-Brush.jpg",
                "https://www.darimooch.com/cdn/shop/files/Beard_Brush_Daraz_copy.webp",
                "https://www.darimooch.com/cdn/shop/files/Brush_Product_Shot.webp"
            ],
            "extendedDescription": "Essential grooming tool distributing oils evenly and taming facial hair. Natural bristles exfoliate skin underneath preventing ingrown hairs and beard ruff. Trains beard hairs to grow in desired direction while removing loose hairs and debris. Makes beard look fuller and more polished."
        },
        {
            "id": "moustache-wax",
            "name": "Moustache Wax",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Beard",
                "Beard Grooming"
            ],
            "url": "https://www.darimooch.com/products/new-moustache-wax",
            "description": "Moustache wax for styling and holding your moustache in place",
            "reviews": {
                "count": 0,
                "average_rating": null,
                "summary": "New product for moustache enthusiasts. Designed for strong hold and all-day styling control."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/MoustacheWaxWebImage3.webp",
                "https://www.darimooch.com/cdn/shop/files/MoustacheWaxWebImage1.webp",
                "https://www.darimooch.com/cdn/shop/files/Moustache_Wax_Tin.webp"
            ],
            "extendedDescription": "Strong-hold moustache wax for styling and shaping. Provides firm control allowing various styles from handlebar to natural curves. Long-lasting hold withstanding daily activities while adding slight shine and conditioning benefits."
        },
        {
            "id": "beard-balm",
            "name": "Beard Balm",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Beard",
                "Beard Grooming"
            ],
            "url": "https://www.darimooch.com/products/new-beard-balm",
            "description": "Beard balm for conditioning and styling, provides hold and nourishment",
            "key_features": [
                "Conditions beard",
                "Styling hold",
                "Nourishes facial hair",
                "Tames flyaways"
            ],
            "reviews": {
                "count": 2,
                "average_rating": 5.0,
                "summary": "2 reviews, 5.0/5 rating. Early users extremely satisfied with conditioning and light hold properties."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/BeardBalmWebImage3.webp",
                "https://www.darimooch.com/cdn/shop/files/BeardBalmWebImage1.webp",
                "https://www.darimooch.com/cdn/shop/files/Beard_Balm_Container.webp"
            ],
            "extendedDescription": "Conditioning beard balm providing hold and nourishment. Butter-based formula moisturizes deeply while offering light styling control. Tames flyaways, adds shine, and keeps beard looking groomed all day. Perfect for daily maintenance and styling."
        },
        {
            "id": "de-tan-body-wash",
            "name": "De-Tan Body Wash",
            "brand": "Echo",
            "price": {
                "current": 899,
                "currency": "PKR",
                "formatted": "Rs.899.00"
            },
            "category": [
                "Body",
                "De-Tan Line"
            ],
            "url": "https://www.darimooch.com/products/de-tan-body-wash-by-dari-mooch-tan-removal-skin-brightening-300ml-copy",
            "description": "Body wash with papaya extract for tan removal and skin brightening",
            "size": "300ml",
            "key_ingredients": [
                "Papaya Extract"
            ],
            "key_features": [
                "Tan removal",
                "Skin brightening",
                "Contains papaya extract",
                "Gentle cleansing"
            ],
            "reviews": {
                "count": 12,
                "average_rating": 4.67,
                "summary": "12 reviews, 4.67/5 rating. Users appreciate gradual tan reduction and overall skin brightening. Pleasant fragrance and moisturizing feel."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/De-Tan_Body_Wash_Product.webp",
                "https://www.darimooch.com/cdn/shop/files/Body_Wash_Bottle_Front.webp"
            ],
            "extendedDescription": "Body wash with papaya extract for tan removal and skin brightening. Works on larger body areas to even skin tone and reduce sun damage appearance. Gentle cleansing formula hydrates while gradually revealing brighter, more radiant skin."
        },
        {
            "id": "charcoal-body-wash",
            "name": "Charcoal Body Wash",
            "brand": "Echo",
            "price": {
                "current": 699,
                "currency": "PKR",
                "formatted": "Rs.699.00"
            },
            "category": [
                "Body",
                "Charcoal Line"
            ],
            "url": "https://www.darimooch.com/products/new-charcoal-body-wash",
            "description": "Charcoal body wash for deep cleansing and detoxification",
            "key_ingredients": [
                "Activated Charcoal"
            ],
            "key_features": [
                "Deep cleansing",
                "Detoxifies skin",
                "Removes impurities",
                "Activated charcoal"
            ],
            "reviews": {
                "count": 6,
                "average_rating": 4.83,
                "summary": "6 reviews, 4.83/5 rating. Users love deep cleaning feeling and how fresh skin feels after. Doesn't dry out skin despite thorough cleansing."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/files/ProductImagesBodyWashcopy2.webp",
                "https://www.darimooch.com/cdn/shop/files/Product_Images_Body_Wash_copy_1.webp",
                "https://www.darimooch.com/cdn/shop/files/Charcoal_Body_Wash_Product.webp"
            ],
            "extendedDescription": "Activated charcoal body wash for deep cleansing and detoxification. Draws out impurities, excess oil, and pollution from pores. Leaves skin feeling exceptionally clean and refreshed without dryness. Perfect for men exposed to pollution or with active lifestyles."
        },
        {
            "id": "cocoa-butter-beard-conditioner",
            "name": "Cocoa Butter Beard Conditioner",
            "brand": "Echo",
            "price": {
                "current": 799,
                "currency": "PKR",
                "formatted": "Rs.799.00"
            },
            "category": [
                "Beard",
                "Beard Grooming"
            ],
            "url": "https://www.darimooch.com/products/cocoa-butter-beard-conditioner",
            "description": "Beard conditioner with cocoa butter for deep moisturization",
            "size": "120ml",
            "key_ingredients": [
                "Cocoa Butter"
            ],
            "reviews": {
                "count": null,
                "average_rating": null,
                "summary": "Classic product with cocoa butter benefits. Users appreciate deep conditioning and softening effects on tough beards."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Cocoa-Butter-Beard-Conditioner.jpg",
                "https://www.darimooch.com/cdn/shop/files/Cocoa_Conditioner_Product.webp"
            ],
            "extendedDescription": "Rich cocoa butter beard conditioner for deep moisturization. Softens coarse facial hair making it more manageable. Conditions both hair and skin underneath preventing dryness and flaking. Leaves beard feeling silky smooth with subtle cocoa scent."
        },
        {
            "id": "urban-beard-oil",
            "name": "Urban Beard Oil",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Beard",
                "Beard Grooming",
                "Best Sellers"
            ],
            "url": "https://www.darimooch.com/products/urban-beard-oil",
            "description": "Premium beard oil for nourishment and styling. Pakistan's first world-class beard oil created to moisturize skin and tame wild beards",
            "size": "30ml",
            "key_features": [
                "Moisturizes skin",
                "Tames wild beards",
                "Premium formula",
                "Works on light stubble to full beards",
                "Eliminates beard itch",
                "Prevents beard ruff (dandruff of the face)"
            ],
            "reviews": {
                "count": 541,
                "average_rating": 4.53,
                "summary": "Flagship product: 541 reviews, 4.53/5 stars. Customers praise pleasant fragrance, beard itch elimination, and softening effects. Only beard oil that doesn't leave greasy residue. Scent described as masculine yet not overpowering."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Urban-Beard-Oil.jpg",
                "https://www.darimooch.com/cdn/shop/files/Urban_Beard_Oil_Daraz_copy.webp",
                "https://www.darimooch.com/cdn/shop/files/Urban_Oil_Bottle.webp"
            ],
            "extendedDescription": "Pakistan's original premium beard oil created by beard enthusiasts. Features citrus, sweet, woody, and musky fragrance notes. 100% natural formula with 15+ premium oils works on light stubble to full beards. Eliminates beard itch, prevents beard ruff, makes facial hair softer and more manageable. Moisturizes skin underneath while taming wild hairs."
        },
        {
            "id": "oud-wood-beard-oil",
            "name": "Oud Wood Beard Oil",
            "brand": "Echo",
            "price": {
                "current": 999,
                "currency": "PKR",
                "formatted": "Rs.999.00"
            },
            "category": [
                "Beard",
                "Beard Grooming"
            ],
            "url": "https://www.darimooch.com/products/oud-wood-beard-oil",
            "description": "Oud wood beard oil with exotic fragrance for premium grooming",
            "size": "30ml",
            "fragrance": "Oud Wood",
            "reviews": {
                "count": null,
                "average_rating": null,
                "summary": "Premium variant for oud fragrance lovers. Offers same nourishing benefits as Urban Oil with exotic woody scent profile."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Oud-Wood-Beard-Oil.jpg",
                "https://www.darimooch.com/cdn/shop/files/Oud_Wood_Oil_Product.webp"
            ],
            "extendedDescription": "Premium oud wood scented beard oil with exotic fragrance. Same nourishing benefits as Urban Beard Oil with sophisticated woody fragrance profile. 100% natural formula moisturizes, tames, and conditions while providing distinctive signature scent."
        },
        {
            "id": "charcoal-facewash",
            "name": "Charcoal Face Wash",
            "brand": "Echo",
            "price": {
                "current": 799,
                "currency": "PKR",
                "formatted": "Rs.799.00"
            },
            "category": [
                "Face",
                "Charcoal Line"
            ],
            "url": "https://www.darimooch.com/products/charcoal-facewash",
            "description": "Charcoal face wash for deep cleansing and removing impurities",
            "size": "100ml",
            "key_ingredients": [
                "Activated Charcoal"
            ],
            "reviews": {
                "count": null,
                "average_rating": null,
                "summary": "Popular charcoal line product. Users appreciate deep cleaning action and how it helps control oil and prevent breakouts."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Charcoal-Facewash.jpg",
                "https://www.darimooch.com/cdn/shop/files/Charcoal_Face_Wash_Tube.webp"
            ],
            "extendedDescription": "Activated charcoal face wash for deep pore cleansing and impurity removal. Draws out dirt, oil, and pollution from deep within pores. Ideal for oily or acne-prone skin, helps prevent breakouts while maintaining skin balance. Leaves face feeling clean and refreshed."
        },
        {
            "id": "charcoal-face-scrub",
            "name": "Charcoal Face Scrub",
            "brand": "Echo",
            "price": {
                "current": 799,
                "currency": "PKR",
                "formatted": "Rs.799.00"
            },
            "category": [
                "Face",
                "Charcoal Line"
            ],
            "url": "https://www.darimooch.com/products/charcoal-face-scrub",
            "description": "Charcoal face scrub for exfoliation and deep cleansing",
            "size": "100g",
            "key_ingredients": [
                "Activated Charcoal"
            ],
            "key_features": [
                "Exfoliates skin",
                "Deep cleansing",
                "Removes dead skin cells",
                "Unclogs pores"
            ],
            "reviews": {
                "count": null,
                "average_rating": null,
                "summary": "Effective exfoliating product. Users report smoother skin and reduced blackheads with regular use. Charcoal provides extra deep cleansing benefit."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Charcoal-Face-Scrub.jpg",
                "https://www.darimooch.com/cdn/shop/files/Charcoal_Scrub_Jar.webp"
            ],
            "extendedDescription": "Exfoliating charcoal face scrub removing dead skin cells and unclogging pores. Dual action: physical exfoliation from scrubbing particles plus charcoal's deep cleansing. Reveals smoother, brighter skin while preventing blackheads and breakouts. Use 2-3 times weekly for optimal results."
        },
        {
            "id": "anti-hairfall-shampoo",
            "name": "Anti-Hairfall Shampoo",
            "brand": "Echo",
            "price": {
                "current": 699,
                "currency": "PKR",
                "formatted": "Rs.699.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/anti-hairfall-shampoo",
            "description": "Anti-hairfall shampoo that gently cleanses scalp and strengthens hair follicles to reduce hair fall",
            "size": "180ml",
            "key_benefits": [
                "Reduces hair fall",
                "Strengthens hair follicles",
                "Gentle cleansing",
                "Protects from damage"
            ],
            "reviews": {
                "count": 240,
                "average_rating": 4.6,
                "summary": "240 reviews, 4.6/5 stars. Customers appreciate gentle cleansing and noticeable hair loss reduction. Many use with Anti-Hairfall Oil for best results."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Anti-Hairfall-Shampoo.jpg",
                "https://www.darimooch.com/cdn/shop/files/Anti_Hairfall_Shampoo_Bottle.webp"
            ],
            "extendedDescription": "Gently cleanses scalp while strengthening follicles to reduce hair fall. Protects existing hair from damage while creating optimal scalp conditions for new growth. Gentle formula cleanses effectively without stripping natural protective oils."
        },
        {
            "id": "keratin-smooth-shampoo",
            "name": "Keratin Smooth Shampoo",
            "brand": "Echo",
            "price": {
                "current": 699,
                "currency": "PKR",
                "formatted": "Rs.699.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/keratin-smooth-shampoo",
            "description": "Keratin shampoo for smooth hair with sleek, smooth finish",
            "size": "180ml",
            "key_ingredients": [
                "Keratin"
            ],
            "key_benefits": [
                "Sleek, smooth finish",
                "Strengthens hair",
                "Adds shine",
                "Reduces frizz"
            ],
            "reviews": {
                "count": 184,
                "average_rating": 4.6,
                "summary": "184 reviews, 4.6/5 rating. Users love smooth results and frizz control. Hair feels stronger and looks shinier with continued use."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Keratin-Smooth-Shampoo.jpg",
                "https://www.darimooch.com/cdn/shop/files/Keratin_Shampoo_Product.webp"
            ],
            "extendedDescription": "Keratin-infused shampoo for sleek, smooth hair. Strengthens hair structure while reducing frizz and adding shine. Protein-rich formula repairs damage and makes hair more manageable. Perfect for men wanting smooth, polished look without salon treatments."
        },
        {
            "id": "2in1-shampoo-conditioner",
            "name": "2-in-1 Shampoo + Conditioner",
            "brand": "Echo",
            "price": {
                "current": 699,
                "currency": "PKR",
                "formatted": "Rs.699.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/2in1-shampoo-conditioner",
            "description": "2-in-1 shampoo and conditioner for convenient cleansing and conditioning",
            "size": "180ml",
            "key_benefits": [
                "Cleanses and conditions",
                "Time-saving",
                "Convenient",
                "Soft, manageable hair"
            ],
            "reviews": {
                "count": 422,
                "average_rating": 4.64,
                "summary": "Very popular: 422 reviews, 4.64/5 rating. Users love convenience and time-saving. Hair feels soft and manageable without separate conditioning."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/2in1-Shampoo-Conditioner.jpg",
                "https://www.darimooch.com/cdn/shop/files/2in1_Product_Bottle.webp"
            ],
            "extendedDescription": "Time-saving 2-in-1 formula cleansing and conditioning in one step. Perfect for busy men wanting healthy, manageable hair without multi-step routine. Cleanses thoroughly while conditioning strands, leaving hair soft, smooth, and easy to style."
        },
        {
            "id": "bamboo-toothbrush",
            "name": "Bamboo Toothbrush",
            "brand": "Echo",
            "price": {
                "current": 350,
                "currency": "PKR",
                "formatted": "Rs.350.00"
            },
            "category": [
                "Accessories"
            ],
            "url": "https://www.darimooch.com/products/bamboo-toothbrush",
            "description": "Eco-friendly bamboo toothbrush for sustainable oral care",
            "key_features": [
                "Eco-friendly",
                "Biodegradable",
                "Sustainable",
                "Natural bamboo handle"
            ],
            "reviews": {
                "count": null,
                "average_rating": null,
                "summary": "Eco-friendly option gaining popularity. Users appreciate sustainable alternative without compromising cleaning effectiveness."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Bamboo-Toothbrush.jpg",
                "https://www.darimooch.com/cdn/shop/files/Bamboo_Brush_Product.webp"
            ],
            "extendedDescription": "Eco-friendly bamboo toothbrush for sustainable oral care. Biodegradable bamboo handle with soft bristles providing effective cleaning. Reduces plastic waste while maintaining excellent dental hygiene. Perfect for environmentally-conscious men."
        },
        {
            "id": "anti-dandruff-shampoo",
            "name": "Anti-Dandruff Shampoo – Clear Scalp & Healthy Hair",
            "brand": "Echo",
            "price": {
                "current": 699,
                "currency": "PKR",
                "formatted": "Rs.699.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/anti-dandruff-shampoo",
            "description": "Specially formulated shampoo targets dandruff at its root, providing relief from itchiness and flakiness while promoting a healthy scalp",
            "size": "180ml",
            "key_benefits": [
                "Eliminates dandruff",
                "Relieves itchiness",
                "Reduces flakiness",
                "Promotes healthy scalp",
                "Deep cleansing"
            ],
            "reviews": {
                "count": 336,
                "average_rating": 4.59,
                "summary": "336 reviews, 4.59/5 stars. Customers report significant dandruff and itching reduction within first washes. First dandruff shampoo actually working long-term for many."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Anti-Dandruff-Shampoo.jpg",
                "https://www.darimooch.com/cdn/shop/files/Anti_Dandruff_Product.webp"
            ],
            "extendedDescription": "Targets dandruff at root, providing relief from itchiness and flakiness while promoting healthy scalp. Specialized formula deep cleanses removing buildup and dead skin cells while treating underlying causes. Regular use maintains clear, healthy, flake-free scalp."
        },
        {
            "id": "hair-thickening-shampoo",
            "name": "Hair Thickening Shampoo",
            "brand": "Echo",
            "price": {
                "current": 799,
                "currency": "PKR",
                "formatted": "Rs.799.00"
            },
            "category": [
                "Hair",
                "Hair Care"
            ],
            "url": "https://www.darimooch.com/products/hair-thickening-shampoo",
            "description": "Perfect for adding volume and thickness to hair. Cleanses scalp while promoting thicker hair growth by strengthening each strand",
            "key_benefits": [
                "Adds volume",
                "Increases thickness",
                "Strengthens strands",
                "Stimulates hair growth",
                "Fuller, voluminous look"
            ],
            "reviews": {
                "count": 33,
                "average_rating": 4.58,
                "summary": "33 reviews, 4.58/5 rating. Users notice increased volume and thicker-feeling hair. Strengthens strands making hair appear fuller over time."
            },
            "stock_status": "in_stock",
            "images": [
                "https://www.darimooch.com/cdn/shop/products/Hair-Thickening-Shampoo.jpg",
                "https://www.darimooch.com/cdn/shop/files/Thickening_Shampoo_Bottle.webp"
            ],
            "extendedDescription": "Adds volume and thickness to hair. Cleanses scalp while promoting thicker growth by strengthening each strand. Volumizing formula creates fuller, more substantial appearance. Perfect for fine or thinning hair needing extra body."
        }
    ],
}
