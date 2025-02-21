if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Please set your STRIPE_SECRET_KEY environment variable');
  console.error('Example: STRIPE_SECRET_KEY=sk_test_... node scripts/update-stripe-products.js');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function main() {
  try {
    // List all existing products first
    console.log('Current products:');
    const existingProducts = await stripe.products.list();
    for (const product of existingProducts.data) {
      console.log(`- ${product.name} (${product.id})`);
    }

    const proceed = await askQuestion('\nDo you want to archive these products and create new ones? (y/n) ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Operation cancelled');
      process.exit(0);
    }

    // Archive all existing products
    for (const product of existingProducts.data) {
      console.log(`Archiving product: ${product.name}`);
      await stripe.products.update(product.id, { active: false });
    }

    // Create new products with correct pricing
    const newProducts = {
      premium: await stripe.products.create({
        name: 'Premium Core',
        description: 'Perfect for growing companies wanting to be in more control'
      }),
      enterprise: await stripe.products.create({
        name: 'Enterprise Core',
        description: 'Perfect for companies wanting advanced security and support'
      })
    };

    // Create prices for each product
    const prices = {
      premium: {
        monthly: await stripe.prices.create({
          product: newProducts.premium.id,
          unit_amount: 12499, // $124.99
          currency: 'usd',
          recurring: { interval: 'month' }
        }),
        annual: await stripe.prices.create({
          product: newProducts.premium.id,
          unit_amount: 119988, // $1,199.88
          currency: 'usd',
          recurring: { interval: 'year' }
        })
      },
      enterprise: {
        monthly: await stripe.prices.create({
          product: newProducts.enterprise.id,
          unit_amount: 49999, // $499.99
          currency: 'usd',
          recurring: { interval: 'month' }
        }),
        annual: await stripe.prices.create({
          product: newProducts.enterprise.id,
          unit_amount: 479988, // $4,799.88
          currency: 'usd',
          recurring: { interval: 'year' }
        })
      }
    };

    console.log('\nCreated products and prices:');
    const config = {
      premium: {
        product: newProducts.premium.id,
        monthly: prices.premium.monthly.id,
        annual: prices.premium.annual.id
      },
      enterprise: {
        product: newProducts.enterprise.id,
        monthly: prices.enterprise.monthly.id,
        annual: prices.enterprise.annual.id
      }
    };
    
    console.log(JSON.stringify(config, null, 2));
    console.log('\nUpdate your config/subscriptions.ts with these price IDs');

  } catch (error) {
    console.error('Error:', error);
  }
}

function askQuestion(query) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => readline.question(query, ans => {
    readline.close();
    resolve(ans);
  }));
}

main();
