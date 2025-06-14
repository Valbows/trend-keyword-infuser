const supabase = require('../config/supabaseClient');

async function testConnection() {
  console.log('Attempting to connect to Supabase and fetch script count...');
  try {
    // Attempt to count rows in the 'scripts' table
    // The .select() method with 'count' option is efficient for this.
    const { data, error, count } = await supabase
      .from('scripts')
      .select('*', { count: 'exact', head: true }); // head:true makes it faster as it doesn't return data

    if (error) {
      console.error(
        'Error connecting to Supabase or fetching data:',
        error.message
      );
      if (error.details) console.error('Details:', error.details);
      if (error.hint) console.error('Hint:', error.hint);
      return;
    }

    console.log('Successfully connected to Supabase!');
    console.log(
      `Current count of records in 'scripts' table: ${count === null ? 'N/A (head:true used)' : count}`
    );
    // Note: with head:true, `data` will be null. The count is what we're interested in.
    // If you used { count: 'exact' } without head:true, data would be an empty array and count would be populated.
    // If you need to verify the count is not null, you can remove head:true, but it's less efficient for just a count.
    console.log(
      'If count is a number (even 0), the connection and table access are working.'
    );
  } catch (err) {
    console.error('An unexpected error occurred during the test:', err);
  }
}

testConnection();
