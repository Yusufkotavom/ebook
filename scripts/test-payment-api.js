// Simple test script for payment methods API
const BASE_URL = 'http://localhost:3000'

async function testPaymentMethodsAPI() {
  console.log('Testing Payment Methods API...\n')

  try {
    // Test GET /api/payment-methods
    console.log('1. Testing GET /api/payment-methods')
    const getResponse = await fetch(`${BASE_URL}/api/payment-methods`)
    
    if (getResponse.ok) {
      const methods = await getResponse.json()
      console.log(`✅ GET request successful - Found ${methods.length} payment methods`)
      
      if (methods.length > 0) {
        const testMethod = methods[0]
        console.log(`   Sample method: ${testMethod.name} (${testMethod.type})`)
        
        // Test GET /api/payment-methods/[id]
        console.log('\n2. Testing GET /api/payment-methods/[id]')
        const getByIdResponse = await fetch(`${BASE_URL}/api/payment-methods/${testMethod.id}`)
        
        if (getByIdResponse.ok) {
          const method = await getByIdResponse.json()
          console.log(`✅ GET by ID successful - Retrieved: ${method.name}`)
        } else {
          console.log(`❌ GET by ID failed - Status: ${getByIdResponse.status}`)
        }
        
        // Test PUT /api/payment-methods/[id] (toggle status)
        console.log('\n3. Testing PUT /api/payment-methods/[id] (toggle status)')
        const newStatus = !testMethod.is_active
        const putResponse = await fetch(`${BASE_URL}/api/payment-methods/${testMethod.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_active: newStatus
          })
        })
        
        if (putResponse.ok) {
          const updatedMethod = await putResponse.json()
          console.log(`✅ PUT request successful - Status changed to: ${updatedMethod.is_active}`)
          
          // Revert the change
          await fetch(`${BASE_URL}/api/payment-methods/${testMethod.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              is_active: testMethod.is_active
            })
          })
          console.log(`   Status reverted to original: ${testMethod.is_active}`)
        } else {
          console.log(`❌ PUT request failed - Status: ${putResponse.status}`)
        }
      }
    } else {
      console.log(`❌ GET request failed - Status: ${getResponse.status}`)
    }
    
    // Test POST /api/payment-methods
    console.log('\n4. Testing POST /api/payment-methods')
    const newMethod = {
      type: 'bank',
      name: 'Test Bank',
      account_number: '1111111111',
      account_name: 'Test Account',
      instructions: 'Test instructions',
      is_active: false,
      display_order: 999
    }
    
    const postResponse = await fetch(`${BASE_URL}/api/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newMethod)
    })
    
    if (postResponse.ok) {
      const createdMethod = await postResponse.json()
      console.log(`✅ POST request successful - Created: ${createdMethod.name}`)
      
      // Test DELETE /api/payment-methods/[id]
      console.log('\n5. Testing DELETE /api/payment-methods/[id]')
      const deleteResponse = await fetch(`${BASE_URL}/api/payment-methods/${createdMethod.id}`, {
        method: 'DELETE'
      })
      
      if (deleteResponse.ok) {
        console.log(`✅ DELETE request successful - Removed test method`)
      } else {
        console.log(`❌ DELETE request failed - Status: ${deleteResponse.status}`)
      }
    } else {
      console.log(`❌ POST request failed - Status: ${postResponse.status}`)
    }
    
    console.log('\n🎉 Payment Methods API test completed!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    console.log('\n💡 Make sure the development server is running with: npm run dev')
  }
}

// Run the test
testPaymentMethodsAPI()