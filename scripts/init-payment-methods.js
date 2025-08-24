const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initPaymentMethods() {
  try {
    console.log('Initializing payment methods table...')

    // Check if table exists and has data
    const { data: existingMethods, error: checkError } = await supabase
      .from('payment_methods')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking payment methods table:', checkError.message)
      
      // If table doesn't exist, we need to create it
      console.log('Creating payment methods table...')
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.payment_methods (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'ewallet')),
            name VARCHAR(100) NOT NULL,
            account_number VARCHAR(50),
            account_name VARCHAR(100),
            instructions TEXT,
            is_active BOOLEAN DEFAULT true,
            display_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (createError) {
        console.error('Error creating table:', createError.message)
        return
      }
    }

    // Insert default payment methods if none exist
    if (!existingMethods || existingMethods.length === 0) {
      console.log('Inserting default payment methods...')

      const defaultMethods = [
        {
          type: 'bank',
          name: 'Bank BCA',
          account_number: '1234567890',
          account_name: 'Toko Ebook Store',
          instructions: 'Transfer ke rekening BCA di atas, lalu upload bukti transfer',
          display_order: 1
        },
        {
          type: 'bank',
          name: 'Bank Mandiri',
          account_number: '9876543210',
          account_name: 'Toko Ebook Store',
          instructions: 'Transfer ke rekening Mandiri di atas, lalu upload bukti transfer',
          display_order: 2
        },
        {
          type: 'ewallet',
          name: 'OVO',
          account_number: '081234567890',
          account_name: 'Toko Ebook Store',
          instructions: 'Transfer ke OVO dengan nomor di atas, lalu screenshot bukti transfer',
          display_order: 3
        },
        {
          type: 'ewallet',
          name: 'Dana',
          account_number: '081234567890',
          account_name: 'Toko Ebook Store',
          instructions: 'Transfer ke Dana dengan nomor di atas, lalu screenshot bukti transfer',
          display_order: 4
        },
        {
          type: 'ewallet',
          name: 'GoPay',
          account_number: '081234567890',
          account_name: 'Toko Ebook Store',
          instructions: 'Transfer ke GoPay dengan nomor di atas, lalu screenshot bukti transfer',
          display_order: 5
        }
      ]

      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert(defaultMethods)

      if (insertError) {
        console.error('Error inserting default payment methods:', insertError.message)
        return
      }

      console.log('✅ Default payment methods inserted successfully!')
    } else {
      console.log('✅ Payment methods table already has data')
    }

    console.log('✅ Payment methods initialization completed!')

  } catch (error) {
    console.error('❌ Error initializing payment methods:', error.message)
  }
}

// Run the initialization
initPaymentMethods()