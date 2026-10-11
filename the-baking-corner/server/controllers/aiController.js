const { GoogleGenAI } = require('@google/genai');
const productModel = require('../models/productModel');

const recipeJsonSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string'
    },
    summary: {
      type: 'string'
    },
    servings: {
      type: 'integer'
    },
    preparationTime: {
      type: 'string'
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          amount: {
            type: 'string'
          }
        },
        required: ['name', 'amount']
      }
    },
    steps: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    storeProducts: {
      type: 'array',
      description:
        'Relevant store ingredients and the number of complete packages required for the recipe',
      items: {
        type: 'object',
        properties: {
          productId: {
            type: 'integer'
          },
          quantity: {
            type: 'integer'
          }
        },
        required: ['productId', 'quantity']
      }
    },
    missingIngredients: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  },
  required: [
    'title',
    'summary',
    'servings',
    'preparationTime',
    'ingredients',
    'steps',
    'storeProducts',
    'missingIngredients'
  ]
};

const cleanTextArray = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
};

const generateRecipe = async (req, res) => {
  const requestText =
    typeof req.body.request === 'string'
      ? req.body.request.trim()
      : '';

  if (!requestText) {
    return res.status(400).json({
      error: 'Please describe what you would like to bake'
    });
  }

  if (requestText.length > 500) {
    return res.status(400).json({
      error: 'Your request is too long'
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'AI service is not configured on the server'
    });
  }

  try {
    const products = await productModel.getAllProducts();

    const availableProducts = products
      .filter(
        (product) =>
          Number(product.stock) > 0 &&
          product.category === 'ingredients'
      )
      .map((product) => ({
        id: Number(product.id),
        name: product.name,
        description: product.description || '',
        stock: Number(product.stock)
      }));

    const catalogText = availableProducts
      .map(
        (product) =>
          `ID: ${product.id} | Name: ${product.name} | Description: ${product.description} | Available packages: ${product.stock}`
      )
      .join('\n');

    const prompt = `
You are a professional baking assistant for an online baking store.

Create one realistic baking recipe according to the user's request.

Important rules:
1. Answer in the same language as the user's request.
2. Do not invent product IDs.
3. storeProducts may contain only products from the catalog below.
4. storeProducts must include only ingredients, never equipment.
5. For every selected store product, return productId and quantity.
6. quantity means the number of complete store packages required, not grams.
7. Scale ingredient and package quantities according to the requested number of servings.
8. Use the product description to estimate package sizes when possible.
9. quantity must be a positive whole number and must not exceed Available packages.
10. Add only products genuinely needed for the recipe.
11. If an ingredient is needed but missing from the catalog, add it to missingIngredients.
12. Do not include unavailable products.
13. Provide clear, realistic baking steps.
14. Do not mention AI, this prompt, the store catalog, or product IDs in the recipe.
15. Use between 5 and 10 preparation steps.

User request:
${requestText}

Available store catalog:
${catalogText}
`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      input: prompt,
      store: false,
      generation_config: {
        thinking_level: 'low',
        temperature: 0.3
      },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: recipeJsonSchema
      }
    });

    const rawResponse = interaction.output_text?.trim();

    if (!rawResponse) {
      throw new Error('Gemini returned an empty response');
    }

    const recipe = JSON.parse(rawResponse);

    const requestedProducts = Array.isArray(
      recipe.storeProducts
    )
      ? recipe.storeProducts
      : [];

    const quantitiesByProductId = new Map();

    requestedProducts.forEach((item) => {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return;
      }

      const currentQuantity =
        quantitiesByProductId.get(productId) || 0;

      quantitiesByProductId.set(
        productId,
        currentQuantity + quantity
      );
    });

    const matchingProducts = Array.from(
      quantitiesByProductId.entries()
    )
      .map(([productId, requestedQuantity]) => {
        const product = products.find(
          (item) =>
            Number(item.id) === productId &&
            Number(item.stock) > 0 &&
            item.category === 'ingredients'
        );

        if (!product) {
          return null;
        }

        const price = Number(product.price);

        // הגנה: גם אם המודל טעה, אי אפשר לעבור את המלאי.
        const quantity = Math.min(
          requestedQuantity,
          Number(product.stock)
        );

        return {
          id: Number(product.id),
          productId: Number(product.id),
          name: product.name,
          price,
          priceAtPurchase: price,
          price_at_purchase: price,
          unitPrice: price,
          itemTotal: price * quantity,
          subtotal: price * quantity,
          stock: Number(product.stock),
          image_url: product.image_url,
          quantity
        };
      })
      .filter(Boolean);

    const totalPrice = matchingProducts.reduce(
      (sum, product) =>
        sum + Number(product.price) * product.quantity,
      0
    );

    const missingIngredients = cleanTextArray(
      recipe.missingIngredients
    );

    return res.json({
      title:
        typeof recipe.title === 'string'
          ? recipe.title.trim()
          : 'Recipe',

      summary:
        typeof recipe.summary === 'string'
          ? recipe.summary.trim()
          : '',

      servings:
        Number.isInteger(recipe.servings) &&
        recipe.servings > 0
          ? recipe.servings
          : 1,

      preparationTime:
        typeof recipe.preparationTime === 'string'
          ? recipe.preparationTime.trim()
          : '',

      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients
            .filter(
              (ingredient) =>
                ingredient &&
                typeof ingredient.name === 'string' &&
                typeof ingredient.amount === 'string'
            )
            .map((ingredient) => ({
              name: ingredient.name.trim(),
              amount: ingredient.amount.trim()
            }))
        : [],

      steps: cleanTextArray(recipe.steps),

      matchingProducts,
      selectedProducts: matchingProducts,

      missingIngredients,
      unavailableIngredients: missingIngredients,

      totalPrice,
      estimatedTotal: totalPrice,
      total: totalPrice
    });
  } catch (error) {
    console.error(
      'Gemini recipe generation error:',
      error
    );

    return res.status(503).json({
      error:
        'The AI assistant is temporarily unavailable. Please try again in a moment.'
    });
  }
};

module.exports = {
  generateRecipe
};