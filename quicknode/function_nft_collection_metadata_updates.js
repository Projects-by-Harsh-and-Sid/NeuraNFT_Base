const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: 'your_username',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

async function main(request, context) {
  const streamData = request.body;
  const streamId = request.headers['x-stream-id'];

  // Route handling based on stream ID
  switch(streamId) {
    case 'collection_update':
      return await handleStream1Data(streamData);
    case 'nft_update':
      return await handleStream2Data(streamData);
    case 'nft_metadata_update':
      return await handleStream3Data(streamData);
  }
}

async function handleStream1Data(data) {
  const query = `
    INSERT INTO stream1_table (data_field1, data_field2, timestamp)
    VALUES ($1, $2, $3)
  `;
  
  try {
    await pool.query(query, [
      data.field1,
      data.field2,
      new Date()
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function handleStream2Data(data) {
  const query = `
    INSERT INTO stream2_table (data_field1, data_field2, timestamp)
    VALUES ($1, $2, $3)
  `;
  
  try {

    await pool.query(query, [
      data.field1,
      data.field2,
      new Date()
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };

  }


}

async function handleStream3Data(data) {
  const query = `
    INSERT INTO stream3_table (data_field1, data_field2, timestamp)
    VALUES ($1, $2, $3)
  `;
  
  try {

    await pool.query(query, [

      data.field1,
      data.field2,
      new Date()
    ]);
    return { success: true };

  } catch (error) {

    return { success: false, error: error.message };

  }
}


module.exports = { main };