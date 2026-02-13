import { Index } from "@upstash/vector";
import { store } from "../src/constants/store";
import "dotenv/config";

// Initialize Upstash Vector with environment variables
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

/**
 * Convert product to searchable text representation
 */
function productToText(product: typeof store.products[0]): string {
    const parts = [
        // Basic info
        `Product: ${product.name}`,
        `Brand: ${product.brand}`,
        `Price: ${product.price.formatted}`,

        // Category
        product.category ? `Category: ${Array.isArray(product.category) ? product.category.join(", ") : product.category}` : "",

        // Description
        product.description ? `Description: ${product.description}` : "",

        // Extended description
        product.extendedDescription ? `Details: ${product.extendedDescription}` : "",

        // Key features
        product.key_features && product.key_features.length > 0
            ? `Features: ${product.key_features.join(", ")}`
            : "",

        // Key benefits
        product.key_benefits && product.key_benefits.length > 0
            ? `Benefits: ${product.key_benefits.join(", ")}`
            : "",

        // Ingredients
        product.ingredients && product.ingredients.length > 0
            ? `Ingredients: ${product.ingredients.join(", ")}`
            : "",

        product.key_ingredients && product.key_ingredients.length > 0
            ? `Key Ingredients: ${product.key_ingredients.join(", ")}`
            : "",

        // Reviews
        product.reviews && product.reviews.count && product.reviews.count > 0
            ? `Customer Rating: ${product.reviews.average_rating}/5 stars from ${product.reviews.count} reviews. ${product.reviews.summary}`
            : "",

        // Bundle info
        product.bundle_includes && product.bundle_includes.length > 0
            ? `Bundle Includes: ${product.bundle_includes.join(", ")}`
            : "",

        // Additional attributes
        product.size ? `Size: ${product.size}` : "",
        product.spf ? `SPF: ${product.spf}` : "",
        product.finish ? `Finish: ${product.finish}` : "",
        product.hold ? `Hold: ${product.hold}` : "",
        product.fragrance ? `Fragrance: ${product.fragrance}` : "",
        product.suitable_for ? `Suitable For: ${product.suitable_for}` : "",
        product.application_time ? `Application Time: ${product.application_time}` : "",

        // Stock status
        `Stock Status: ${product.stock_status}`,
    ];

    // Filter out empty strings and join
    return parts.filter(p => p.trim() !== "").join(". ");
}

/**
 * Prepare metadata for vector storage
 */
function prepareMetadata(product: typeof store.products[0]) {
    return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.current,
        currency: product.price.currency,
        formatted_price: product.price.formatted,
        discount_percentage: product.price.discount_percentage || 0,
        category: Array.isArray(product.category) ? product.category.join(", ") : product.category || "",
        url: product.url,
        stock_status: product.stock_status,
        rating: product.reviews?.average_rating || 0,
        review_count: product.reviews?.count || 0,
        image: product.images && product.images.length > 0 ? product.images[0] : "",
    };
}

/**
 * Add all products to vector database
 */
async function addProductsToVectorDB() {
    console.log(`🚀 Starting to add ${store.total_products} products to vector database...`);
    console.log(`📦 Store: ${store.store_info.name}`);
    console.log(`🔗 Website: ${store.store_info.website}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const product of store.products) {
        try {
            const textData = productToText(product);
            const metadata = prepareMetadata(product);

            await index.upsert({
                id: product.id,
                data: textData,
                metadata: metadata,
            });

            successCount++;
            console.log(`✅ [${successCount}/${store.total_products}] Added: ${product.name}`);
        } catch (error) {
            errorCount++;
            console.error(`❌ Error adding ${product.name}:`, error);
        }
    }

    console.log(`\n✨ Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${store.total_products}`);
}

/**
 * Test query to verify products were added
 */
async function testQuery(query: string, topK: number = 3) {
    console.log(`\n🔍 Testing query: "${query}"`);
    console.log(`   Top ${topK} results:\n`);

    try {
        const results = await index.query({
            data: query,
            topK: topK,
            includeVectors: false,
            includeMetadata: true,
        });

        if (results && results.length > 0) {
            results.forEach((result, idx) => {
                console.log(`   ${idx + 1}. ${result.metadata?.name}`);
                console.log(`      Price: ${result.metadata?.formatted_price}`);
                console.log(`      Rating: ${result.metadata?.rating}/5 (${result.metadata?.review_count} reviews)`);
                console.log(`      Score: ${result.score?.toFixed(4)}`);
                console.log(`      URL: ${result.metadata?.url}\n`);
            });
        } else {
            console.log("   No results found.");
        }
    } catch (error) {
        console.error("   Error querying:", error);
    }
}

// Main execution
async function main() {
    try {
        // Add all products
        await addProductsToVectorDB();

        // Test queries
        console.log("\n" + "=".repeat(60));
        console.log("Testing Vector Search");
        console.log("=".repeat(60));

        await testQuery("best oil for hair loss and hair fall", 3);
        await testQuery("face wash for brightening skin", 3);
        await testQuery("beard growth products", 3);
        await testQuery("styling products for hair", 3);

    } catch (error) {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    }
}

// Run the script
main();
