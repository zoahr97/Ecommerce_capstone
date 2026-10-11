import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AIAssistant({
  onAddProductsToCart
}) {
  const [request, setRequest] =
    useState('');

  const [recipe, setRecipe] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedRequest =
      request.trim();

    if (!normalizedRequest) {
      toast.error(
        'Please describe what you would like to bake',
        {
          id: 'empty-ai-request'
        }
      );

      return;
    }

    const token = localStorage.getItem(
      'baking_corner_token'
    );

    if (!token) {
      toast.error(
        'Please log in before using the assistant',
        {
          id: 'ai-login-required'
        }
      );

      return;
    }

    setIsLoading(true);
    setRecipe(null);

    try {
      const response = await fetch(
        'http://localhost:5000/api/ai/recipe',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            request: normalizedRequest
          })
        }
      );

      const contentType =
        response.headers.get(
          'content-type'
        );

      const data =
        contentType?.includes(
          'application/json'
        )
          ? await response.json()
          : {
              error:
                await response.text()
            };

      if (!response.ok) {
        throw new Error(
          data.error ||
          'Failed to generate recipe'
        );
      }

      setRecipe(data);

      toast.success(
        'Recipe generated successfully',
        {
          id: 'recipe-generated'
        }
      );
    } catch (error) {
      console.error(
        'AI assistant error:',
        error
      );

      if (
        error.message ===
        'Failed to fetch'
      ) {
        toast.error(
          'Could not connect to the AI assistant. Make sure the server and Ollama are running.',
          {
            id: 'ai-connection-error'
          }
        );
      } else {
        toast.error(
          error.message,
          {
            id: 'ai-generation-error'
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProducts = async () => {
    if (
      !recipe?.selectedProducts?.length
    ) {
      return;
    }

    try {
      await onAddProductsToCart(
        recipe.selectedProducts
      );
    } catch (error) {
      console.error(
        'Adding recipe products failed:',
        error
      );

      toast.error(
        'Failed to add the recipe products to the cart',
        {
          id: 'recipe-cart-error'
        }
      );
    }
  };

  return (
    <main
      style={{
        width: '100%',
        maxWidth: '950px',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <section
        style={{
          border:
            '1px solid var(--border-light)',
          backgroundColor: '#fff',
          padding: '30px'
        }}
      >
        <h2
          style={{
            marginTop: 0
          }}
        >
          AI Baking Assistant
        </h2>

        <p
          style={{
            color:
              'var(--text-muted)',
            lineHeight: 1.6
          }}
        >
          Describe what you would like
          to bake. The assistant will
          create a recipe and match it
          with products currently
          available in the store.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="recipe-request"
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px'
            }}
          >
            What would you like to bake?
          </label>

          <textarea
            id="recipe-request"
            value={request}
            onChange={(event) =>
              setRequest(
                event.target.value
              )
            }
            maxLength={500}
            rows={5}
            placeholder="For example: A chocolate birthday cake for 12 people without nuts"
            disabled={isLoading}
            style={{
              width: '100%',
              resize: 'vertical',
              padding: '14px',
              font: 'inherit',
              border:
                '1px solid var(--border-light)',
              boxSizing: 'border-box'
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
              gap: '15px',
              marginTop: '8px'
            }}
          >
            <span
              style={{
                color:
                  'var(--text-muted)',
                fontSize: '0.85rem'
              }}
            >
              {request.length}/500
            </span>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{
                minWidth: '190px'
              }}
            >
              {isLoading
                ? 'Creating Recipe...'
                : 'Create Recipe'}
            </button>
          </div>
        </form>
      </section>

      {isLoading && (
        <p
          style={{
            textAlign: 'center',
            padding: '35px'
          }}
        >
          The local AI model is preparing
          your recipe. This may take a
          moment.
        </p>
      )}

      {recipe && (
        <section
          style={{
            marginTop: '30px',
            border:
              '1px solid var(--border-light)',
            backgroundColor: '#fff',
            padding: '30px'
          }}
        >
          <header
            style={{
              borderBottom:
                '1px solid var(--border-light)',
              paddingBottom: '20px'
            }}
          >
            <h2
              style={{
                margin: '0 0 12px'
              }}
            >
              {recipe.title}
            </h2>

            <p
              style={{
                color:
                  'var(--text-muted)',
                lineHeight: 1.6
              }}
            >
              {recipe.summary}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '30px',
                marginTop: '18px'
              }}
            >
              <span>
                <strong>
                  Servings:
                </strong>{' '}
                {recipe.servings}
              </span>

              <span>
                <strong>
                  Preparation:
                </strong>{' '}
                {recipe.preparationTime}
              </span>
            </div>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '35px',
              marginTop: '25px'
            }}
          >
            <div>
              <h3>Ingredients</h3>

              <ul
                style={{
                  paddingLeft: '22px',
                  lineHeight: 1.9
                }}
              >
                {recipe.ingredients.map(
                  (ingredient, index) => (
                    <li key={index}>
                      {ingredient.amount}{' '}
                      {ingredient.name}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3>Preparation Steps</h3>

              <ol
                style={{
                  paddingLeft: '22px',
                  lineHeight: 1.7
                }}
              >
                {recipe.steps.map(
                  (step, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom:
                          '12px'
                      }}
                    >
                      {step}
                    </li>
                  )
                )}
              </ol>
            </div>
          </div>

          {recipe.selectedProducts
            .length > 0 && (
            <div
              style={{
                marginTop: '30px',
                paddingTop: '20px',
                borderTop:
                  '1px solid var(--border-light)'
              }}
            >
              <h3>
                Matching Store Products
              </h3>

              {recipe.selectedProducts.map(
                (product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      padding: '12px 0',
                      borderBottom:
                        '1px solid var(--border-light)'
                    }}
                  >
                    <span>
                      {product.name} ×{' '}
                      {product.quantity}
                    </span>

                    <strong>
                      ₪
                      {Number(
                        product.itemTotal
                      ).toFixed(2)}
                    </strong>
                  </div>
                )
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  marginTop: '20px',
                  fontSize: '1.15rem'
                }}
              >
                <strong>
                  Estimated Store Total
                </strong>

                <strong>
                  ₪
                  {Number(
                    recipe.estimatedTotal
                  ).toFixed(2)}
                </strong>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={
                  handleAddProducts
                }
                style={{
                  width: '100%',
                  marginTop: '20px'
                }}
              >
                Add Recipe Products to Cart
              </button>
            </div>
          )}

          {recipe.missingIngredients
            .length > 0 && (
            <div
              style={{
                marginTop: '25px',
                padding: '18px',
                backgroundColor:
                  '#fff8e6',
                border:
                  '1px solid #f0d58c'
              }}
            >
              <h3
                style={{
                  marginTop: 0
                }}
              >
                Ingredients Not Available
                in the Store
              </h3>

              <ul>
                {recipe.missingIngredients.map(
                  (ingredient, index) => (
                    <li key={index}>
                      {ingredient}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}