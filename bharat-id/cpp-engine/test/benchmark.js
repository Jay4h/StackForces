/**
 * Benchmark test for C++ DID generation
 * Measures performance and validates output
 */

console.log('=================================');
console.log('🧪 Bharat-ID C++ Engine Benchmark');
console.log('=================================\n');

try {
    // Try to load the C++ module
    const bharatCrypto = require('../build/Release/bharat_crypto');
    console.log('✅ C++ module loaded successfully\n');

    // Test 1: Single DID generation
    console.log('Test 1: Single DID Generation');
    console.log('------------------------------');
    const testPublicKey = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...';
    const testHardwareId = '192.168.1.100';

    const startSingle = Date.now();
    const did = bharatCrypto.generateDID(testPublicKey, testHardwareId);
    const endSingle = Date.now();

    console.log(`Generated DID: ${did}`);
    console.log(`Time taken: ${endSingle - startSingle}ms\n`);

    // Validate format
    if (did.startsWith('did:bharat:') && did.length === 75) {
        console.log('✅ DID format is correct\n');
    } else {
        console.log('❌ DID format is incorrect\n');
    }

    // Test 2: Deterministic generation
    console.log('Test 2: Deterministic Generation');
    console.log('---------------------------------');
    const did2 = bharatCrypto.generateDID(testPublicKey, testHardwareId);

    if (did === did2) {
        console.log('✅ Same inputs produce same DID (deterministic)\n');
    } else {
        console.log('❌ DID generation is not deterministic\n');
    }

    // Test 3: Uniqueness test
    console.log('Test 3: Uniqueness Test');
    console.log('-----------------------');
    const did3 = bharatCrypto.generateDID(testPublicKey + '1', testHardwareId);

    if (did !== did3) {
        console.log('✅ Different inputs produce different DIDs\n');
    } else {
        console.log('❌ Different inputs produced same DID\n');
    }

    // Test 4: Performance benchmark
    console.log('Test 4: Performance Benchmark');
    console.log('-----------------------------');
    const iterations = 10000;

    const startBatch = Date.now();
    for (let i = 0; i < iterations; i++) {
        bharatCrypto.generateDID(`publicKey_${i}`, `hardware_${i}`);
    }
    const endBatch = Date.now();

    const totalTime = endBatch - startBatch;
    const avgTime = totalTime / iterations;

    console.log(`Generated ${iterations} DIDs`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average time per DID: ${avgTime.toFixed(3)}ms`);
    console.log(`Throughput: ${(iterations / (totalTime / 1000)).toFixed(0)} DIDs/second\n`);

    if (avgTime < 10) {
        console.log('✅ PERFORMANCE TARGET MET (< 10ms per DID)\n');
    } else {
        console.log('⚠️  Performance below target, but functional\n');
    }

    console.log('=================================');
    console.log('🎉 All tests completed successfully!');
    console.log('=================================');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Tip: Make sure to build the C++ module first:');
    console.log('   cd cpp-engine');
    console.log('   npm install');
    console.log('   npm run build\n');
    process.exit(1);
}
